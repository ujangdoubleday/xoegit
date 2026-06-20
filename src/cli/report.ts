import ora from 'ora';
import chalk from 'chalk';
import { program } from './program.js';
import { ConfigService } from '../config/index.js';
import { showBanner, showError, showSuccess, showWarning } from '../utils/index.js';
import { createProvider, requiresApiKey } from '../providers/index.js';
import { resolveProviderRuntime } from './providerRuntime.js';
import { runSetupWizard } from './setup.js';
import { isGitRepository } from '../git/index.js';
import { parsePeriod, getGitLogForReport, getPeriodLabel } from '../git/report.js';
import { generateReportSystemPrompt, generateReportUserPrompt } from '../prompts/report.js';
import { ProviderName } from '../types/index.js';

/**
 * Report action - generates weekly progress report from git log
 */
export async function reportAction(): Promise<void> {
  showBanner();

  try {
    const options = program.opts();
    const periodInput = options.report as string;
    const language = (options.lang as string) || 'en';
    let providerName = (options.provider as ProviderName) || 'gemini';

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

    if (!apiKey && requiresApiKey(providerName)) {
      apiKey = await configService.getApiKey(providerName);
    }

    // No API key yet -> run the interactive setup wizard
    if (requiresApiKey(providerName) && !apiKey) {
      const providerWasExplicit = program.getOptionValueSource('provider') !== 'default';
      const setup = await runSetupWizard(configService, {
        preselectedProvider: providerWasExplicit ? providerName : undefined,
      });
      providerName = setup.provider;
      apiKey = setup.apiKey;
    }

    // Save provider preference if explicitly set via flag
    if (options.provider) {
      await configService.saveProvider(providerName);
    }

    // Save Ollama URL if explicitly set
    if (options.ollamaUrl) {
      await configService.saveOllamaBaseUrl(options.ollamaUrl);
    }

    // Save OpenRouter URL if explicitly set
    if (options.openrouterUrl) {
      await configService.saveOpenRouterBaseUrl(options.openrouterUrl);
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
      const { model, baseUrl } = await resolveProviderRuntime(configService, providerName, options);

      const provider = createProvider(providerName, {
        apiKey,
        model,
        baseUrl,
      });

      const report = await provider.generateContent(systemPrompt, userPrompt);
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
