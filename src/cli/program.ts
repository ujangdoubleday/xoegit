import { Command } from 'commander';
import { VERSION } from '../config/version.js';

export const program = new Command();

program
  .name('xoegit')
  .description('AI-powered git commit generator')
  .version(VERSION)
  .option('-k, --api-key <key>', 'Gemini API Key')
  .option(
    '-c, --context <context>',
    'Context for the changes (e.g., "refactoring folder structure")'
  )
  .option('-s, --set-key <key>', 'Save Gemini API Key to config (overwrites existing)')
  .option('-d, --delete-key', 'Delete saved API Key from config')
  .option('-e, --execute', 'Execute commit after confirmation prompt')
  .option('--explain', 'Show explanation for each commit grouping (verbose mode)');
