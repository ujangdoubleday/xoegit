import { simpleGit, SimpleGit } from 'simple-git';

const git: SimpleGit = simpleGit();

export interface ReportPeriod {
  value: number;
  unit: 'weeks' | 'days' | 'months';
  raw: string;
  isNow: boolean;
}

/**
 * Parse period string like NOW, 4W, 3D, 2M into structured object
 */
export function parsePeriod(period: string): ReportPeriod {
  const trimmed = period.trim();

  if (trimmed.toUpperCase() === 'NOW') {
    return { value: 0, unit: 'days', raw: trimmed, isNow: true };
  }

  const match = trimmed.match(/^(\d+)([WDM])$/i);
  if (!match) {
    throw new Error(
      `Invalid period format: "${period}". Use format like NOW (today), 4W (weeks), 3D (days), or 2M (months).`
    );
  }

  const value = parseInt(match[1], 10);
  const unitRaw = match[2].toUpperCase();

  let unit: 'weeks' | 'days' | 'months';
  switch (unitRaw) {
    case 'W':
      unit = 'weeks';
      break;
    case 'D':
      unit = 'days';
      break;
    case 'M':
      unit = 'months';
      break;
    default:
      throw new Error(`Unknown period unit: ${unitRaw}`);
  }

  return { value, unit, raw: trimmed, isNow: false };
}

/**
 * Get human-readable label for a period
 */
export function getPeriodLabel(period: ReportPeriod): string {
  if (period.isNow) {
    return 'today';
  }

  const unitMap: Record<string, string> = {
    weeks: 'week',
    days: 'day',
    months: 'month',
  };

  const unitLabel = unitMap[period.unit];
  return `${period.value} ${unitLabel}${period.value > 1 ? 's' : ''}`;
}

/**
 * Get git log for report generation
 */
export async function getGitLogForReport(period: ReportPeriod): Promise<string> {
  const sinceArg = period.isNow ? 'midnight' : `${period.value} ${period.unit} ago`;

  const result = await git.raw([
    'log',
    `--since=${sinceArg}`,
    '--pretty=format:%ad | %s',
    '--date=short',
  ]);

  return result?.trim() || '';
}
