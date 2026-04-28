import ora from 'ora';
import chalk from 'chalk';
import { program } from './program.js';
import { ConfigService } from '../config/index.js';
import {
  isValidApiKey,
  promptApiKey,
  showBanner,
  showError,
  showSuccess,
  showWarning,
  showInfo,
} from '../utils/index.js';
import { generateContent } from '../providers/index.js';
import { isGitRepository } from '../git/index.js';
import { parsePeriod, getGitLogForReport, getPeriodLabel } from '../git/report.js';
import { generateReportSystemPrompt, generateReportUserPrompt } from '../prompts/report.js';

/**
 * Report action - generates weekly progress report from git log
 */
export async function reportAction(): Promise<void> {
  showBanner();

  try {
    const options = program.opts();
    const periodInput = options.report as string;
    const language = (options.lang as string) || 'en';

    // 1. Validate period format
    let period;
    try {
      period = parsePeriod(periodInput);
    } catch (err) {
      showError('Invalid Period', (err as Error).message);
      process.exit(1);
    }

    // 2. Resolve API Key
    let apiKey = options.apiKey as string | undefined;
    const configService = new ConfigService();

    if (!apiKey) {
      apiKey = await configService.getApiKey();
    }

    if (!apiKey) {
      showWarning('Gemini API Key not found.');
      showInfo('Get one at https://aistudio.google.com/');

      try {
        apiKey = await promptApiKey();
      } catch (_err) {
        showError('Input Error', 'Failed to read input.');
        process.exit(1);
      }

      if (!apiKey || !isValidApiKey(apiKey)) {
        showError('Configuration Error', 'API Key is required to use xoegit.');
        process.exit(1);
      }

      await configService.saveApiKey(apiKey);
      showSuccess('API Key saved successfully!');
    }

    // 3. Check if inside a git repository
    const isRepo = await isGitRepository();
    if (!isRepo) {
      showError('Git Error', 'Current directory is not a git repository.');
      process.exit(1);
    }

    // 4. Fetch git log
    const periodLabel = getPeriodLabel(period);
    const spinnerText = period.isNow
      ? `Fetching git log for today...`
      : `Fetching git log for the last ${periodLabel}...`;

    const spinner = ora({
      text: chalk.gray(spinnerText),
      spinner: 'dots12',
    }).start();

    const rawGitLog = await getGitLogForReport(period);

    if (!rawGitLog || rawGitLog.trim() === '') {
      spinner.stop();
      const warningText = period.isNow
        ? 'No commits found today.'
        : `No commits found in the last ${periodLabel}.`;
      showWarning(warningText);
      return;
    }

    spinner.text = chalk.gray('Generating report with AI...');

    // 5. Build prompts
    const systemPrompt = generateReportSystemPrompt(language);
    const userPrompt = generateReportUserPrompt({
      periodLabel,
      rawGitLog,
      language,
    });

    // 6. Call AI provider
    try {
      const report = await generateContent(apiKey, systemPrompt, userPrompt);
      spinner.stop();

      showSuccess('Report generated!');
      console.log('');
      console.log(report);
    } catch (error: unknown) {
      spinner.stop();
      showError('Report Generation Failed', (error as Error).message);
    }
  } catch (error: unknown) {
    showError('Unexpected Error', (error as Error).message);
    process.exit(1);
  }
}
