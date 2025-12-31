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
  const diff = await git.diff();
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
