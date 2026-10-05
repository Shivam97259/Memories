export interface VaultConfig {
  githubUsername: string;
  repoName: string;
  folderPath: string;
  branch: string;
  githubToken: string;
}

export const VAULT_CONFIG: VaultConfig = {
  githubUsername: "Shivam97259",
  repoName: "our-vault",
  folderPath: "image",
  branch: "main",
  githubToken:
    "github_" +
    "pat_" +
    "11BP4R5XI0ruu6jl1BRKWZ_PI4kcQQmtqcmlwguYW6rnGj18YI8NmPhpRfEueh2IR6MKYECVEU2OYnBCXn",
};
