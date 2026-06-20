import { Command } from 'commander';
import { VERSION } from '../config/version.js';

export const program = new Command();

program
  .name('xoegit')
  .description('AI-powered git commit generator')
  .version(VERSION)
  .option('-k, --api-key <key>', 'API Key for the selected provider')
  .option(
    '-p, --provider <name>',
    'AI provider to use (gemini, openai, anthropic, ollama, openrouter)',
    'gemini'
  )
  .option('-m, --model <model>', 'Model to use for the selected provider')
  .option(
    '-c, --context <context>',
    'Context for the changes (e.g., "refactoring folder structure")'
  )
  .option(
    '-s, --set-key <key>',
    'Save API Key to config for the current provider (overwrites existing)'
  )
  .option('-d, --delete-key', 'Delete saved API Key from config for the current provider')
  .option('-e, --execute', 'Execute commit after confirmation prompt')
  .option('--explain', 'Show explanation for each commit grouping (verbose mode)')
  .option(
    '--report <period>',
    'Generate weekly progress report from git log (e.g., NOW, 4W, 3D, 2M)'
  )
  .option(
    '--lang <code>',
    'Output language for the report (e.g., en, id, ja). Defaults to en',
    'en'
  )
  .option('--ollama-url <url>', 'Base URL for Ollama API (default: http://localhost:11434)')
  .option(
    '--openrouter-url <url>',
    'Endpoint for OpenRouter API (default: https://openrouter.ai/api/v1/chat/completions)'
  );
