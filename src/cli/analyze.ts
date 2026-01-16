import ora from 'ora';
import { program } from './program.js';
import { ConfigService } from '../config/index.js';
import {
  isValidApiKey,
  promptApiKey,
  promptConfirm,
  showBanner,
  showSuggestion,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showTip,
  spinnerText,
} from '../utils/index.js';
import {
  getGitDiff,
  getGitLog,
  getGitStatus,
  isGitRepository,
  executeGitAdd,
  executeGitCommit,
} from '../git/index.js';
import { generateSystemPrompt } from '../prompts/index.js';
import { generateCommitSuggestion } from '../providers/index.js';

/**
 * Main analyze action - orchestrates the commit suggestion flow
 */
export async function analyzeAction(): Promise<void> {
  // Show beautiful banner
  showBanner();

  try {
    // 0. Check API Key Config
    const options = program.opts();
    let apiKey = options.apiKey;

    const configService = new ConfigService();

    // Handle --set-key flag (save and exit)
    if (options.setKey) {
      if (!isValidApiKey(options.setKey)) {
        showError('Invalid API Key', 'Please provide a valid API key.');
        process.exit(1);
      }
      await configService.saveApiKey(options.setKey);
      showSuccess('API Key saved successfully!');
      return;
    }

    // Handle --delete-key flag (delete and exit)
    if (options.deleteKey) {
      await configService.deleteApiKey();
      showSuccess('API Key deleted successfully!');
      return;
    }

    if (!apiKey) {
      apiKey = await configService.getApiKey();
    }

    if (!apiKey) {
      showWarning('Gemini API Key not found.');
      showInfo('Get one at https://aistudio.google.com/');

      try {
        apiKey = await promptApiKey();
      } catch (_err) {
        showError('Input Error', 'Failed to read input.');
        process.exit(1);
      }

      if (!apiKey || !isValidApiKey(apiKey)) {
        showError('Configuration Error', 'API Key is required to use xoegit.');
        process.exit(1);
      }

      await configService.saveApiKey(apiKey);
      showSuccess('API Key saved successfully!');
    }

    // 1. Check if git repo
    const isRepo = await isGitRepository();
    if (!isRepo) {
      showError('Git Error', 'Current directory is not a git repository.');
      process.exit(1);
    }

    // 2. Fetch Git Info
    const spinner = ora({
      text: spinnerText.analyzing,
      spinner: 'dots12',
    }).start();

    const [diff, status, log] = await Promise.all([getGitDiff(), getGitStatus(), getGitLog()]);

    // Check if there are any changes
    const hasDiff = diff && diff.trim() !== 'Unstaged Changes:\n\n\nStaged Changes:';

    let hasUntracked = false;
    try {
      const statusObj = JSON.parse(status);
      hasUntracked = statusObj.not_added && statusObj.not_added.length > 0;
    } catch (_e) {
      // failed to parse
    }

    if (!hasDiff && !hasUntracked) {
      spinner.stop();
      showWarning('No changes detected (staged, unstaged, or untracked).');
      return;
    }

    // 3. Generate Prompt
    const systemPrompt = await generateSystemPrompt();

    // Get user context if provided
    const userContext = options.context || '';
    if (userContext) {
      spinner.text = spinnerText.generatingWithContext(userContext);
    } else {
      spinner.text = spinnerText.generating;
    }

    // 4. Call AI (automatic model fallback on rate limit)
    try {
      const suggestion = await generateCommitSuggestion(
        apiKey,
        systemPrompt,
        diff,
        status,
        log,
        userContext
      );
      spinner.stop();

      showSuccess('Suggestion generated!');
      showSuggestion(suggestion);

      // Handle -e (execute) flag
      if (options.execute) {
        await handleExecuteMode(suggestion);
      } else {
        showTip('Copy and execute the commands above. xoegit never runs commands automatically.');
      }
    } catch (error: unknown) {
      spinner.stop();
      showError('Generation Failed', (error as Error).message);
    }
  } catch (error: unknown) {
    showError('Unexpected Error', (error as Error).message);
    process.exit(1);
  }
}

/**
 * Represents a single commit operation with files to add and commit message
 */
interface CommitOperation {
  files: string[];
  message: string;
}

/**
 * Parse all commit operations from suggestion
 * Each "commit N" section contains git add and git commit commands
 */
function parseCommitOperations(suggestion: string): CommitOperation[] {
  const operations: CommitOperation[] = [];
  const lines = suggestion.split('\n');

  let currentFiles: string[] = [];
  let currentMessage: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for commit section header (e.g., "commit 1", "commit 2")
    if (trimmed.match(/^commit\s+\d+$/i)) {
      // Save previous operation if complete
      if (currentFiles.length > 0 && currentMessage) {
        operations.push({ files: [...currentFiles], message: currentMessage });
      }
      // Reset for new commit
      currentFiles = [];
      currentMessage = null;
      continue;
    }

    // Parse git add command
    if (trimmed.startsWith('git add ')) {
      const filesStr = trimmed.slice(8).trim();
      const matches = filesStr.match(/(?:[^\s"]+|"[^"]*")+/g);
      if (matches) {
        currentFiles.push(...matches.map((f) => f.replace(/^"|"$/g, '')));
      }
      continue;
    }

    // Parse git commit command
    if (trimmed.startsWith('git commit -m ')) {
      const match = trimmed.match(/git commit -m ["'](.+)["']/);
      if (match) {
        currentMessage = match[1];
      }
      continue;
    }
  }

  // Don't forget the last operation
  if (currentFiles.length > 0 && currentMessage) {
    operations.push({ files: [...currentFiles], message: currentMessage });
  }

  return operations;
}

/**
 * Handle execute mode - prompt user and execute git commands for all commits
 */
async function handleExecuteMode(suggestion: string): Promise<void> {
  const operations = parseCommitOperations(suggestion);

  if (operations.length === 0) {
    showWarning('Could not parse git commands from suggestion.');
    showTip('Copy and execute the commands manually.');
    return;
  }

  console.log('');
  showInfo(`Execute mode enabled. ${operations.length} commit(s) will be created:`);
  console.log('');

  operations.forEach((op, index) => {
    console.log(`  Commit ${index + 1}:`);
    console.log(`    git add ${op.files.join(' ')}`);
    console.log(`    git commit -m "${op.message}"`);
    console.log('');
  });

  const confirmed = await promptConfirm('Do you want to execute these commands?');

  if (!confirmed) {
    showInfo('Execution cancelled.');
    return;
  }

  try {
    for (let i = 0; i < operations.length; i++) {
      const op = operations[i];
      const commitNum = i + 1;

      // Add files
      const addSpinner = ora({
        text: `[${commitNum}/${operations.length}] Adding files...`,
        spinner: 'dots12',
      }).start();

      await executeGitAdd(op.files);
      addSpinner.succeed(`[${commitNum}/${operations.length}] Files added: ${op.files.join(', ')}`);

      // Create commit
      const commitSpinner = ora({
        text: `[${commitNum}/${operations.length}] Creating commit...`,
        spinner: 'dots12',
      }).start();

      const commitHash = await executeGitCommit(op.message);
      commitSpinner.succeed(`[${commitNum}/${operations.length}] Commit created: ${commitHash}`);
    }

    showSuccess(`\n🎉 All ${operations.length} commit(s) executed successfully!`);
  } catch (error: unknown) {
    showError('Execution Failed', (error as Error).message);
  }
}
