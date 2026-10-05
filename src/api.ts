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
 * Fetches vault photos from the private or public GitHub repository.
 * Downloads raw image data with token authorization and constructs Blob URLs
 * to ensure images render seamlessly without auth token leaks or CORS/raw access blocks.
 */
export async function fetchVaultPhotos(): Promise<VaultPhoto[]> {
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

  // Filter files by image extensions
  const imageFiles = items.filter((item) => {
    if (item.type !== 'file') return false;
    const lower = item.name.toLowerCase();
    return SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
  });

  // Fetch image content directly via GitHub REST API contents endpoint with raw media type
  const photoPromises = imageFiles.map(async (file): Promise<VaultPhoto | null> => {
    try {
      const encodedFileName = encodeURIComponent(file.name);
      const rawApiUrl = `https://api.github.com/repos/${VAULT_CONFIG.githubUsername}/${VAULT_CONFIG.repoName}/contents/${cleanFolderPath}/${encodedFileName}?ref=${VAULT_CONFIG.branch}`;

      const rawRes = await fetch(rawApiUrl, {
        headers: {
          Authorization: `Bearer ${VAULT_CONFIG.githubToken}`,
          Accept: 'application/vnd.github.raw',
        },
      });

      if (!rawRes.ok) {
        console.warn(`Failed to fetch raw content for ${file.name}: ${rawRes.status} ${rawRes.statusText}`);
        return null;
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
      console.error(`Error loading image blob for ${file.name}:`, err);
      return null;
    }
  });

  const settled = await Promise.all(photoPromises);
  const validPhotos = settled.filter((item): item is VaultPhoto => item !== null);

  return validPhotos;
}
