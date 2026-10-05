import { VAULT_CONFIG } from './config.ts';

export interface VaultPhoto {
  name: string;
  url: string;
  size?: number;
  sha?: string;
}

interface GitHubContentItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: string;
}

const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

/**
 * Fetches vault photos from the GitHub repository.
 * Employs a concurrency-limited worker pool and exponential backoff retry to prevent
 * browser network socket exhaustion and GitHub secondary rate limiting ("Failed to fetch").
 * Optionally supports an onProgress callback to render photos progressively.
 */
export async function fetchVaultPhotos(
  onProgress?: (photos: VaultPhoto[]) => void
): Promise<VaultPhoto[]> {
  const cleanFolderPath = VAULT_CONFIG.folderPath.replace(/^\/+|\/+$/g, '');
  const contentsUrl = `https://api.github.com/repos/${VAULT_CONFIG.githubUsername}/${VAULT_CONFIG.repoName}/contents/${cleanFolderPath}?ref=${VAULT_CONFIG.branch}`;

  const response = await fetch(contentsUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${VAULT_CONFIG.githubToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    let errorDetail = `GitHub API error: ${response.status} ${response.statusText}`;
    try {
      const errBody = await response.json();
      if (errBody?.message) {
        errorDetail += ` - ${errBody.message}`;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorDetail);
  }

  const items = (await response.json()) as GitHubContentItem[];

  if (!Array.isArray(items)) {
    throw new Error('Unexpected response format from GitHub repository contents API.');
  }

  // Filter files by supported image extensions
  const imageFiles = items.filter((item) => {
    if (item.type !== 'file') return false;
    const lower = item.name.toLowerCase();
    return SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
  });

  // Concurrency pool with retry mechanism
  const results: (VaultPhoto | null)[] = new Array(imageFiles.length).fill(null);
  const queue = imageFiles.map((file, index) => ({ file, index }));
  const CONCURRENCY_LIMIT = 5;

  let lastProgressReportTime = 0;
  const reportProgress = () => {
    if (!onProgress) return;
    const now = Date.now();
    if (now - lastProgressReportTime > 300) {
      lastProgressReportTime = now;
      const valid = results.filter((item): item is VaultPhoto => item !== null);
      if (valid.length > 0) {
        onProgress([...valid]);
      }
    }
  };

  async function fetchFileWithRetry(file: GitHubContentItem, retries = 2): Promise<VaultPhoto | null> {
    const encodedFileName = encodeURIComponent(file.name);
    const rawApiUrl = `https://api.github.com/repos/${VAULT_CONFIG.githubUsername}/${VAULT_CONFIG.repoName}/contents/${cleanFolderPath}/${encodedFileName}?ref=${VAULT_CONFIG.branch}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const rawRes = await fetch(rawApiUrl, {
          headers: {
            Authorization: `Bearer ${VAULT_CONFIG.githubToken}`,
            Accept: 'application/vnd.github.raw',
          },
        });

        if (!rawRes.ok) {
          if (attempt === retries) {
            console.warn(`Failed to fetch raw content for ${file.name}: ${rawRes.status} ${rawRes.statusText}`);
            return null;
          }
          await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
          continue;
        }

        const blob = await rawRes.blob();
        const blobUrl = URL.createObjectURL(blob);

        return {
          name: file.name,
          url: blobUrl,
          size: file.size,
          sha: file.sha,
        };
      } catch (err) {
        if (attempt === retries) {
          console.warn(`Network retry exhausted for ${file.name}:`, err);
          return null;
        }
        await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
      }
    }
    return null;
  }

  // Run workers in parallel
  const workers = Array.from({ length: Math.min(CONCURRENCY_LIMIT, queue.length) }).map(async () => {
    while (queue.length > 0) {
      const task = queue.shift();
      if (!task) break;
      const photo = await fetchFileWithRetry(task.file);
      results[task.index] = photo;
      reportProgress();
    }
  });

  await Promise.all(workers);

  const validPhotos = results.filter((item): item is VaultPhoto => item !== null);
  if (onProgress && validPhotos.length > 0) {
    onProgress([...validPhotos]);
  }

  return validPhotos;
}
