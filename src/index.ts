#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { ConfigService } from './services/config.service.js';
import { getGitDiff, getGitLog, getGitStatus, isGitRepository } from './services/git.service.js';
import { generateSystemPrompt } from './services/prompt.service.js';
import { generateCommitSuggestion } from './services/gemini.service.js';

// Try loading dotenv if available, but don't crash if not (it's optional now)
try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch (e) {
  // dotenv not installed, ignore
}

const program = new Command();

program
  .name('xoegit')
  .description('AI-powered git commit generator')
  .version('0.1.0');

program
  .action(async () => {
    try {
      // 0. FAIL FAST: Check API Key Config
      const configService = new ConfigService();
      let apiKey = await configService.getApiKey();

      if (!apiKey) {
        console.log(chalk.yellow('Gemini API Key not found.'));
        console.log(chalk.cyan('You can get one at https://aistudio.google.com/'));
        
        try {
            apiKey = await configService.promptApiKey();
        } catch (err) {
            console.error(chalk.red('\nFailed to read input.'));
            process.exit(1);
        }

        if (!apiKey || apiKey.trim() === '') {
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

      // Check if there are any changes (diff or untracked files)
      const hasDiff = diff && diff.trim() !== 'Unstaged Changes:\n\n\nStaged Changes:';
      
      let hasUntracked = false;
      try {
        const statusObj = JSON.parse(status);
        hasUntracked = statusObj.not_added && statusObj.not_added.length > 0;
      } catch (e) {
        // failed to parse, assume no untracked to be safe, or relies on diff
      }

      if (!hasDiff && !hasUntracked) {
         spinner.warn(chalk.yellow('No changes detected (staged, unstaged, or untracked).'));
         return;
      }

      spinner.text = 'Generating suggestion from AI...';

      // 3. Generate Prompt
      const systemPrompt = await generateSystemPrompt();

      // 4. Call AI
      try {
        const suggestion = await generateCommitSuggestion(apiKey, systemPrompt, diff, status, log);
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
  });

program.parse(process.argv);
