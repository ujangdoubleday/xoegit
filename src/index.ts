#!/usr/bin/env node

import { program, analyzeAction } from './cli/index.js';

program.action(analyzeAction);
program.parse(process.argv);
