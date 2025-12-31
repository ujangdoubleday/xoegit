#!/usr/bin/env node

// Load dotenv if available (optional dependency)
try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch (e) {
  // dotenv not installed, ignore
}

import { program, analyzeAction } from './cli/index.js';

program.action(analyzeAction);
program.parse(process.argv);
