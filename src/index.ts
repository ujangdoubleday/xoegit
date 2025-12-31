#!/usr/bin/env node

// Load dotenv if available (optional dependency) - suppress output
try {
  const dotenv = await import('dotenv');
  dotenv.config({ debug: false });
} catch (e) {
  // dotenv not installed, ignore
}

import { program, analyzeAction } from './cli/index.js';

program.action(analyzeAction);
program.parse(process.argv);
