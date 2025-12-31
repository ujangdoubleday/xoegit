import { simpleGit, SimpleGit } from 'simple-git';

const git: SimpleGit = simpleGit();

/**
 * Checks if the current directory is a git repository
 */
export async function isGitRepository(): Promise<boolean> {
  try {
    return await git.checkIsRepo();
  } catch (error) {
    return false;
  }
}

/**
 * Gets the current git status
 */
export async function getGitStatus(): Promise<string> {
  const status = await git.status();
  return JSON.stringify(status, null, 2);
}

/**
 * Gets the diff of staged and unstaged changes
 */
export async function getGitDiff(): Promise<string> {
  // Get diff of everything (staged and unstaged)
  const diff = await git.diff();
  // Also get staged diff to be thorough, if needed, but 'git diff' usually shows unstaged.
  // 'git diff --cached' shows staged.
  // For the AI to know full context, sending both might be useful, or a combined view.
  // Let's allow the caller to decide or just fetch both.
  const diffCached = await git.diff(['--cached']);
  
  return `Unstaged Changes:\n${diff}\n\nStaged Changes:\n${diffCached}`;
}

/**
 * Gets the git log (recent commits)
 */
export async function getGitLog(maxCount: number = 5): Promise<string> {
  try {
    const log = await git.log({ maxCount });
    return JSON.stringify(log.all, null, 2);
  } catch (error) {
    return "No commits yet.";
  }
}
