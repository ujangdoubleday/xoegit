import chalk from 'chalk';
import ora from 'ora';
import { program } from './program.js';
import { ConfigService } from '../config/index.js';
import { isValidApiKey, promptApiKey } from '../utils/index.js';
import { getGitDiff, getGitLog, getGitStatus, isGitRepository } from '../git/index.js';
import { generateSystemPrompt } from '../prompts/index.js';
import { generateCommitSuggestion } from '../providers/index.js';

/**
 * Main analyze action - orchestrates the commit suggestion flow
 */
export async function analyzeAction(): Promise<void> {
  try {
    // 0. Check API Key Config
    const options = program.opts();
    let apiKey = options.apiKey;
    
    const configService = new ConfigService();
    
    if (!apiKey) {
      apiKey = await configService.getApiKey();
    }

    if (!apiKey) {
      console.log(chalk.yellow('Gemini API Key not found.'));
      console.log(chalk.cyan('You can get one at https://aistudio.google.com/'));
      
      try {
        apiKey = await promptApiKey();
      } catch (err) {
        console.error(chalk.red('\nFailed to read input.'));
        process.exit(1);
      }

      if (!apiKey || !isValidApiKey(apiKey)) {
        console.error(chalk.red('API Key is required to use xoegit.'));
        process.exit(1);
      }
      
      await configService.saveApiKey(apiKey);
      console.log(chalk.green('\nAPI Key saved successfully!'));
    }

    // 1. Check if git repo
    const isRepo = await isGitRepository();
    if (!isRepo) {
      console.error(chalk.red('Error: Current directory is not a git repository.'));
      process.exit(1);
    }

    // 2. Fetch Git Info
    const spinner = ora('Analyzing git repository...').start();
    
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
      spinner.warn(chalk.yellow('No changes detected (staged, unstaged, or untracked).'));
      return;
    }

    spinner.text = 'Generating suggestion from AI...';

    // 3. Generate Prompt
    const systemPrompt = await generateSystemPrompt();

    // Get user context if provided
    const userContext = options.context || '';
    if (userContext) {
      spinner.text = `Generating suggestion with context: "${userContext}"...`;
    } else {
      spinner.text = 'Generating suggestion from AI...';
    }

    // 4. Call AI (automatic model fallback on rate limit)
    try {
      const suggestion = await generateCommitSuggestion(apiKey, systemPrompt, diff, status, log, userContext);
      spinner.succeed(chalk.green('Suggestion generated!'));
      
      console.log('\n' + chalk.bold('--------------------------------------------------'));
      console.log(suggestion);
      console.log(chalk.bold('--------------------------------------------------') + '\n');
      console.log(chalk.gray('Reminder: I only suggest commands. Please copy and execute them manually.'));
      
    } catch (error: any) {
      spinner.fail(chalk.red('Failed to generate suggestion.'));
      console.error(chalk.red('\nError Details:'), error.message);
    }

  } catch (error: any) {
    console.error(chalk.red('An unexpected error occurred:'), error.message);
    process.exit(1);
  }
}
