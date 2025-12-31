import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generates a commit suggestion using the Google Generative AI SDK (Gemini)
 */
export async function generateCommitSuggestion(
  apiKey: string,
  systemPrompt: string,
  diff: string,
  status: string,
  log: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

  // Parse status to find untracked files
  let untrackedMsg = '';
  try {
    const statusObj = JSON.parse(status);
    if (statusObj.not_added && statusObj.not_added.length > 0) {
      untrackedMsg = `
Untracked Files (New Files):
${statusObj.not_added.join('\n')}

IMPORTANT: The above files are NEW and untracked. You MUST suggest 'git add' for them and include them in commits based on their names/purpose.
`;
    }
  } catch (e) {
    // metadata parsing failed, just ignore
  }

  const userMessage = `
Git Status:
${status}

${untrackedMsg}

Git Log (Last 5 commits):
${log}

Git Diff:
${diff}

Please suggest the git add command and the git commit message.
`;

  try {
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userMessage }
    ]);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    throw new Error(`Gemini Provider Error: ${error.message}`);
  }
}
