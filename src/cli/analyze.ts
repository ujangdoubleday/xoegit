import ora from 'ora';
import { program } from './program.js';
import { ConfigService } from '../config/index.js';
import { 
  isValidApiKey, 
  promptApiKey,
  showBanner,
  showSuggestion,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showTip,
  spinnerText
} from '../utils/index.js';
import { getGitDiff, getGitLog, getGitStatus, isGitRepository } from '../git/index.js';
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
    
    if (!apiKey) {
      apiKey = await configService.getApiKey();
    }

    if (!apiKey) {
      showWarning('Gemini API Key not found.');
      showInfo('Get one at https://aistudio.google.com/');
      
      try {
        apiKey = await promptApiKey();
      } catch (err) {
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
      spinner: 'dots12'
    }).start();
    
    const [diff, status, log] = await Promise.all([
      getGitDiff(),
      getGitStatus(),
      getGitLog()
    ]);

    // Check if there are any changes
    const hasDiff = diff && diff.trim() !== 'Unstaged Changes:\n\n\nStaged Changes:';
    
    let hasUntracked = false;
    try {
      const statusObj = JSON.parse(status);
      hasUntracked = statusObj.not_added && statusObj.not_added.length > 0;
    } catch (e) {
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
      const suggestion = await generateCommitSuggestion(apiKey, systemPrompt, diff, status, log, userContext);
      spinner.stop();
      
      showSuccess('Suggestion generated!');
      showSuggestion(suggestion);
      showTip('Copy and execute the commands above. xoegit never runs commands automatically.');
      
    } catch (error: any) {
      spinner.stop();
      showError('Generation Failed', error.message);
    }

  } catch (error: any) {
    showError('Unexpected Error', error.message);
    process.exit(1);
  }
}
