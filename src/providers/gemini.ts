import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_MODELS, GeminiModelName, getModelList } from './models.js';

/**
 * Check if error is a rate limit error (429)
 */
function isRateLimitError(error: any): boolean {
  const message = error?.message || '';
  return message.includes('429') || message.includes('Too Many Requests') || message.includes('quota');
}

/**
 * Generate content with a specific model
 */
async function tryGenerateWithModel(
  genAI: GoogleGenerativeAI,
  modelName: GeminiModelName,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent([
    { text: systemPrompt },
    { text: userMessage }
  ]);
  const response = await result.response;
  return response.text();
}

/**
 * Generates a commit suggestion using the Google Generative AI SDK (Gemini)
 * Automatically falls back to other models when rate limit is hit
 */
export async function generateCommitSuggestion(
  apiKey: string,
  systemPrompt: string,
  diff: string,
  status: string,
  log: string,
  context: string = ''
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);

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

  // Build context section if provided
  const contextSection = context ? `
USER CONTEXT (IMPORTANT - This describes the overall purpose of these changes):
"${context}"

Use this context to determine the appropriate commit type (feat, fix, refactor, chore, etc.) and to write more accurate commit messages.
` : '';

  const userMessage = `
${contextSection}
Git Status:
${status}

${untrackedMsg}

Git Log (Last 5 commits):
${log}

Git Diff:
${diff}

Please suggest the git add command and the git commit message.
`;

  // Get ordered list of models to try
  const modelsToTry = getModelList();
  const errors: string[] = [];

  // Try each model in order, fallback on rate limit
  for (const modelName of modelsToTry) {
    try {
      const result = await tryGenerateWithModel(genAI, modelName, systemPrompt, userMessage);
      return result;
    } catch (error: any) {
      if (isRateLimitError(error)) {
        errors.push(`${modelName}: rate limited`);
        // Continue to next model
        continue;
      }
      // Non-rate-limit error, throw immediately
      throw new Error(`Gemini Provider Error: ${error.message}`);
    }
  }

  // All models exhausted
  throw new Error(`All models rate limited. Tried: ${errors.join(', ')}. Please try again later.`);
}
