#!/usr/bin/env node

import { program } from './cli/program.js';
import { analyzeAction } from './cli/analyze.js';
import { reportAction } from './cli/report.js';

program.action(async () => {
  const options = program.opts();
  if (options.report) {
    await reportAction();
  } else {
    await analyzeAction();
  }
});

program.parse(process.argv);
