import chalk from 'chalk';

/**
 * CLI UI Components
 */

// Brand colors
const brand = {
  primary: chalk.hex('#6366F1'), // Indigo
  secondary: chalk.hex('#8B5CF6'), // Violet
  accent: chalk.hex('#06B6D4'), // Cyan
  success: chalk.hex('#10B981'), // Emerald
  warning: chalk.hex('#F59E0B'), // Amber
  error: chalk.hex('#EF4444'), // Red
  muted: chalk.hex('#6B7280'), // Gray
};

/**
 * App banner
 */
export function showBanner(): void {
  const banner = `
██╗      ██╗  ██╗ ██████╗ ███████╗ ██████╗ ██╗████████╗
╚██╗     ╚██╗██╔╝██╔═══██╗██╔════╝██╔════╝ ██║╚══██╔══╝
 ╚██╗     ╚███╔╝ ██║   ██║█████╗  ██║  ███╗██║   ██║   
 ██╔╝     ██╔██╗ ██║   ██║██╔══╝  ██║   ██║██║   ██║   
██╔╝     ██╔╝ ██╗╚██████╔╝███████╗╚██████╔╝██║   ██║   
╚═╝      ╚═╝  ╚═╝ ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝   ╚═╝   
`;
  console.log(banner);
  console.log(brand.muted('by https://github.com/ujangdoubleday\n'));
}

/**
 * Display the AI suggestion
 */
export function showSuggestion(suggestion: string): void {
  const lines = suggestion.split('\n');

  console.log(brand.accent.bold('\n📝 Suggestion\n'));

  for (const line of lines) {
    console.log(formatSuggestionLine(line));
  }
}

/**
 * Format individual suggestion lines with subtle highlighting
 */
function formatSuggestionLine(line: string): string {
  if (line.startsWith('git add')) {
    return chalk.cyan(line);
  }
  if (line.startsWith('git commit')) {
    return chalk.green(line);
  }
  if (line.match(/^commit \d+$/i)) {
    return brand.secondary.bold(line);
  }
  if (line.startsWith('pr title:') || line.startsWith('pr description:')) {
    return chalk.yellow(line);
  }
  // Format explanation lines from --explain mode
  if (line.startsWith('why:')) {
    return brand.muted('   ') + chalk.italic.hex('#A78BFA')(line);
  }
  return line;
}

/**
 * Show success message
 */
export function showSuccess(message: string): void {
  console.log(`${brand.success('✓')} ${message}`);
}

/**
 * Show error message
 */
export function showError(title: string, message: string): void {
  console.log(`${brand.error('✗')} ${brand.error.bold(title)}: ${message}`);
}

/**
 * Show warning message
 */
export function showWarning(message: string): void {
  console.log(`${brand.warning('⚠')} ${message}`);
}

/**
 * Show info message
 */
export function showInfo(message: string): void {
  console.log(`${brand.accent('ℹ')} ${brand.muted(message)}`);
}

/**
 * Show tip/reminder
 */
export function showTip(message: string): void {
  console.log(`\n${brand.muted('💡 ' + message)}`);
}

/**
 * Spinner text for different stages
 */
export const spinnerText = {
  analyzing: brand.muted('Analyzing repository...'),
  generating: brand.muted('Generating suggestion...'),
  generatingWithContext: (ctx: string) => brand.muted(`Generating with context: "${ctx}"...`),
};
