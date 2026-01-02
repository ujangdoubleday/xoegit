import { Command } from 'commander';

export const program = new Command();

program
  .name('xoegit')
  .description('AI-powered git commit generator')
  .version('0.1.0')
  .option('-k, --api-key <key>', 'Gemini API Key')
  .option(
    '-c, --context <context>',
    'Context for the changes (e.g., "refactoring folder structure")'
  )
  .option('-s, --set-key <key>', 'Save Gemini API Key to config')
  .option('-d, --delete-key', 'Delete saved API Key from config');
