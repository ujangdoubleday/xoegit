import { Command } from 'commander';

export const program = new Command();

program
  .name('xoegit')
  .description('AI-powered git commit generator')
  .version('0.1.0')
  .option('-k, --api-key <key>', 'Gemini API Key');
