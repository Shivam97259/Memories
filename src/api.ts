import { VAULT_CONFIG } from './config';

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
 * Each returned VaultPhoto includes the GitHub commit SHA for accurate file operations.
 */
export async function fetchVaultPhotos(
  onProgress?: (photos: VaultPhoto[]) => void
): Promise<VaultPhoto[]> {
  const cleanFolderPath = VAULT_CONFIG.folderPath.replace(/^\/+|\/+$/g, '');
  const contentsUrl = `https://api.github.com/repos/${VAULT_CONFIG.githubUsername}/${VAULT_CONFIG.repoName}/contents/${cleanFolderPath}?ref=${VAULT_CONFIG.branch}`;

  // Robust fetch for contents list with automatic retry on transient failure
  let response: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await fetch(contentsUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${VAULT_CONFIG.githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (response.ok) break;
      if (response.status === 403 || response.status === 429) {
        // Rate limit hit - pause before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    } catch (networkErr) {
      if (attempt === 2) throw networkErr;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }

  if (!response || !response.ok) {
    let errorDetail = `GitHub API error: ${response?.status ?? 'Unknown'} ${response?.statusText ?? ''}`;
    try {
      const errBody = await response?.json();
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

  // Run workers in parallel with controlled concurrency
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

/**
 * Uploads a new photo to the GitHub vault repository.
 * Converts the file to Base64 and commits it via the GitHub Contents API.
 */
export async function uploadVaultPhoto(file: File): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        // Base64 data extraction
        const result = reader.result as string;
        const base64Data = result.includes(',') ? result.split(',')[1] : result;

        // Clean filename (replace spaces with underscores and timestamp)
        const cleanFileName = `memory_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const cleanFolderPath = VAULT_CONFIG.folderPath.replace(/^\/+|\/+$/g, '');
        const uploadUrl = `https://api.github.com/repos/${VAULT_CONFIG.githubUsername}/${VAULT_CONFIG.repoName}/contents/${cleanFolderPath}/${cleanFileName}?ref=${VAULT_CONFIG.branch}`;

        const response = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${VAULT_CONFIG.githubToken}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Add memory: ${cleanFileName}`,
            content: base64Data,
            branch: VAULT_CONFIG.branch,
          }),
        });

        if (!response.ok) {
          let errorText = `Upload failed: ${response.status} ${response.statusText}`;
          try {
            const errJson = await response.json();
            if (errJson?.message) errorText += ` - ${errJson.message}`;
          } catch {
            // ignore
          }
          throw new Error(errorText);
        }

        resolve(true);
      } catch (error) {
        console.error('Upload error:', error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Deletes a photo from the GitHub vault repository.
 * Requires the file name and its GitHub file SHA. If the SHA is omitted,
 * it fetches the latest commit SHA from the Contents API before deleting.
 */
export async function deleteVaultPhoto(fileName: string, fileSha?: string): Promise<boolean> {
  const cleanFolderPath = VAULT_CONFIG.folderPath.replace(/^\/+|\/+$/g, '');
  let shaToUse = fileSha;

  // Retrieve SHA if not provided
  if (!shaToUse) {
    const getUrl = `https://api.github.com/repos/${VAULT_CONFIG.githubUsername}/${VAULT_CONFIG.repoName}/contents/${cleanFolderPath}/${encodeURIComponent(fileName)}?ref=${VAULT_CONFIG.branch}`;
    const getRes = await fetch(getUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${VAULT_CONFIG.githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (getRes.ok) {
      const data = await getRes.json();
      shaToUse = data.sha;
    }
  }

  if (!shaToUse) {
    throw new Error(`Unable to resolve GitHub SHA for ${fileName}`);
  }

  const deleteUrl = `https://api.github.com/repos/${VAULT_CONFIG.githubUsername}/${VAULT_CONFIG.repoName}/contents/${cleanFolderPath}/${encodeURIComponent(fileName)}?ref=${VAULT_CONFIG.branch}`;

  const response = await fetch(deleteUrl, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${VAULT_CONFIG.githubToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Delete memory: ${fileName}`,
      sha: shaToUse,
      branch: VAULT_CONFIG.branch,
    }),
  });

  if (!response.ok) {
    let errorDetail = `Delete failed with status: ${response.status} ${response.statusText}`;
    try {
      const errBody = await response.json();
      if (errBody?.message) {
        errorDetail += ` - ${errBody.message}`;
      }
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return true;
}
