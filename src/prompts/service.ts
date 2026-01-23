import fs from 'fs/promises';
import path from 'path';
import url from 'url';

/**
 * Options for generating system prompt
 */
export interface SystemPromptOptions {
  explain?: boolean;
}

/**
 * Generates the system prompt for the AI
 */
export async function generateSystemPrompt(options: SystemPromptOptions = {}): Promise<string> {
  let rulesContent = '';
  try {
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const rulesPath = path.resolve(__dirname, './templates/RULES.md');
    rulesContent = await fs.readFile(rulesPath, 'utf-8');
  } catch (_error) {
    console.warn('Could not read RULES.md, using default rules.');
    rulesContent = 'Follow conventional commits.';
  }

  // Build explain mode instructions
  const explainInstructions = options.explain
    ? `
EXPLAIN MODE ENABLED:
For each commit, you MUST add a "why:" line directly after the git commit command (no blank line in between).
This line should explain the logical reasoning behind grouping these specific files together.

Format:
commit N
git add <files>
git commit -m "<message>"
why: <one sentence explaining why these files are grouped together>

Example:
commit 1
git add src/auth/login.ts src/auth/utils.ts
git commit -m "feat(auth): add login validation"
why: I grouped these files because they both handle authentication logic and the validation directly depends on the auth utilities.

commit 2
git add package.json package-lock.json
git commit -m "chore: update dependencies"
why: I separated dependency updates from code changes to keep the commit atomic and make it easy to revert if needed.

The explanation should help developers understand your commit crafting logic for educational purposes.
`
    : '';

  return `
You are a Git Commit Assistant for the 'xoegit' CLI.
Your goal is to suggest git commands and commit messages based on the provided changes.

1.  Analyze the provided "Git Diff", "Git Status", and "Git Log".
2.  Generate a valid 'git add' command.
3.  Generate a valid 'git commit' command following Conventional Commits.
4.  Strictly follow the rules defined below.

---
RULES FROM USER:
${rulesContent}
---
${explainInstructions}
IMPORTANT:
- You definitely MUST NOT execute commands. You only suggest them.
- Output MUST be strictly valid shell commands or clear instructions as per the examples in RULES.md.
- If the changes are huge, suggest splitting them if instructed by the Rules, or just one big commit if not specified.
- The user is using a CLI. Return the response in a way that is easy to read.
`;
}
