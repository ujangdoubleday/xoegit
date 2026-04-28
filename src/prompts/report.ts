export interface ReportPromptInput {
  periodLabel: string;
  rawGitLog: string;
  language: string;
}

function getLanguageInstruction(language: string): string {
  const normalized = language.trim().toLowerCase();

  const langMap: Record<string, string> = {
    en: 'English',
    id: 'Bahasa Indonesia',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    de: 'German',
    fr: 'French',
    es: 'Spanish',
    pt: 'Portuguese',
    ru: 'Russian',
    ar: 'Arabic',
    hi: 'Hindi',
    th: 'Thai',
    vi: 'Vietnamese',
  };

  const langName = langMap[normalized] || normalized;
  return `Generate the entire report in ${langName}.`;
}

/**
 * Generate system prompt for weekly progress report analysis
 */
export function generateReportSystemPrompt(language: string = 'en'): string {
  const langInstruction = getLanguageInstruction(language);

  return `You are an expert Technical Project Manager specializing in analyzing software development activities.
Your task is to analyze raw git log data and summarize it into a human-readable weekly progress report (suitable for both technical and non-technical stakeholders).

Strict Report Rules:
1. WEEKLY GROUPING: The report MUST be grouped and separated by week. If the time range covers 4 weeks, there must be 4 main sections (Week 1, Week 2, Week 3, Week 4). For shorter ranges (like 1 week or 1 day), group by the days available or present as a single period summary.
2. HUMAN LANGUAGE: Translate technical commit messages (e.g., "fix: null ptr in auth controller") into understandable achievements (e.g., "Fixed a bug in the login system that caused the application to crash").
3. FILTER NOISE: Ignore insignificant commits (like "typo", "wip", "test", or "merge branch") unless they have a major impact.
4. TONE: Professional, concise, and to-the-point.
5. FORMAT: Use clean Markdown format with bullet points for each achievement within that week.
6. LANGUAGE: ${langInstruction}`;
}

/**
 * Generate user prompt for report analysis
 */
export function generateReportUserPrompt(input: ReportPromptInput): string {
  return `Report Context:
- Time range: ${input.periodLabel}

Git Log Data:
${input.rawGitLog}

Generate a weekly progress report based on the data above.`;
}
