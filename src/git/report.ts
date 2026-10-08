import { simpleGit, SimpleGit } from 'simple-git';

const git: SimpleGit = simpleGit();

export interface ReportPeriod {
  value: number;
  unit: 'weeks' | 'days' | 'months';
  raw: string;
  isNow: boolean;
  /** Date range bounds (YYYY-MM-DD), set only for DD-MM-YYYY:DD-MM-YYYY input */
  since?: string;
  until?: string;
}

/**
 * Convert DD-MM-YYYY to YYYY-MM-DD, throwing if the date does not exist
 */
function toIsoDate(dmy: string): string {
  const [d, m, y] = dmy.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    throw new Error(`Invalid date: "${dmy}".`);
  }
  return date.toISOString().slice(0, 10);
}

/**
 * Parse period string like NOW, 4W, 3D, 2M or DD-MM-YYYY:DD-MM-YYYY into structured object
 */
export function parsePeriod(period: string): ReportPeriod {
  const trimmed = period.trim();

  if (trimmed.toUpperCase() === 'NOW') {
    return { value: 0, unit: 'days', raw: trimmed, isNow: true };
  }

  const range = trimmed.match(/^(\d{2}-\d{2}-\d{4}):(\d{2}-\d{2}-\d{4})$/);
  if (range) {
    const since = toIsoDate(range[1]);
    const until = toIsoDate(range[2]);
    if (since > until) {
      throw new Error(`Start date "${range[1]}" is after end date "${range[2]}".`);
    }
    return { value: 0, unit: 'days', raw: trimmed, isNow: false, since, until };
  }

  const match = trimmed.match(/^(\d+)([WDM])$/i);
  if (!match) {
    throw new Error(
      `Invalid period format: "${period}". Use format like NOW (today), 4W (weeks), 3D (days), 2M (months), or DD-MM-YYYY:DD-MM-YYYY (date range).`
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

  if (period.since && period.until) {
    const [from, to] = period.raw.split(':');
    return `${from} to ${to}`;
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
  const rangeArgs =
    period.since && period.until
      ? [`--since=${period.since} 00:00:00`, `--until=${period.until} 23:59:59`]
      : [`--since=${period.isNow ? 'midnight' : `${period.value} ${period.unit} ago`}`];

  const result = await git.raw(['log', ...rangeArgs, '--pretty=format:%ad | %s', '--date=short']);

  return result?.trim() || '';
}
