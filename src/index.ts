#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';
import { getGitDiff, getGitLog, getGitStatus, isGitRepository } from './services/git.service.js';
import { generateSystemPrompt } from './services/prompt.service.js';
import { generateCommitSuggestion } from './services/gemini.service.js';

dotenv.config();

const program = new Command();

program
  .name('xoegit')
  .description('AI-powered git commit generator')
  .version('1.0.0');

program
  .action(async () => {
    try {
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
        const suggestion = await generateCommitSuggestion(systemPrompt, diff, status, log);
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
