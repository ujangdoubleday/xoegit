import readline from 'readline';
import chalk from 'chalk';
import { ProviderName } from '../types/index.js';
import { getProviderLabel } from '../providers/registry.js';

/**
 * Validates if a string is a valid API key format
 */
export function isValidApiKey(key: string): boolean {
  if (!key || key.length < 10) return false;
  const asciiRegex = /^[\x21-\x7E]+$/;
  return asciiRegex.test(key);
}

/**
 * Get provider-specific prompt message
 */
function getApiKeyPrompt(provider: ProviderName): string {
  const label = getProviderLabel(provider);
  return `Please enter your ${label} API Key: `;
}

/**
 * Prompts user for API key input via stdin with hidden input
 */
export async function promptApiKey(provider: ProviderName = 'gemini'): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(getApiKeyPrompt(provider));

    if (process.stdin.setRawMode && process.stdout.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();

      let input = '';

      const onData = (char: Buffer) => {
        const charStr = char.toString('utf-8');

        // Enter key
        if (charStr === '\r' || charStr === '\n' || charStr === '\r\n') {
          process.stdin.setRawMode(false);
          process.stdin.removeListener('data', onData);
          process.stdin.pause();
          process.stdout.write('\n');
          const trimmedInput = input.trim();
          if (isValidApiKey(trimmedInput)) {
            resolve(trimmedInput);
          } else {
            console.error('Invalid API Key format. Please try again.');
            process.exit(1);
          }
          return;
        }

        // Ctrl+C
        if (charStr === '\u0003') {
          process.exit(1);
        }

        // Backspace
        if (charStr === '\u007f' || charStr === '\b') {
          if (input.length > 0) {
            input = input.slice(0, -1);
          }
          return;
        }

        input += charStr;
      };

      process.stdin.on('data', onData);
    } else {
      // Fallback for non-TTY environments
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
      });

      rl.question('', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

/**
 * A single selectable option for {@link promptSelect}.
 */
export interface SelectChoice<T extends string> {
  label: string;
  value: T;
  hint?: string;
}

/**
 * Prompts the user to pick one option from a numbered list.
 * Pressing Enter with no input selects the first option (the default).
 */
export async function promptSelect<T extends string>(
  message: string,
  choices: SelectChoice<T>[]
): Promise<T> {
  return new Promise((resolve) => {
    console.log(message);
    choices.forEach((choice, index) => {
      const number = chalk.cyan(`${index + 1})`);
      const hint = choice.hint ? chalk.gray(`  ${choice.hint}`) : '';
      console.log(`  ${number} ${choice.label}${hint}`);
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const ask = (): void => {
      rl.question(chalk.gray(`Select [1-${choices.length}] (default 1): `), (answer) => {
        const trimmed = answer.trim();

        if (trimmed === '') {
          rl.close();
          resolve(choices[0].value);
          return;
        }

        const choice = Number.parseInt(trimmed, 10);
        if (!Number.isNaN(choice) && choice >= 1 && choice <= choices.length) {
          rl.close();
          resolve(choices[choice - 1].value);
          return;
        }

        console.log(chalk.yellow('Invalid selection. Please try again.'));
        ask();
      });
    };

    ask();
  });
}

/**
 * Prompts the user for a free-text value. Returns `defaultValue` when the
 * input is left empty (used for optional custom endpoints).
 */
export async function promptText(message: string, defaultValue?: string): Promise<string> {
  return new Promise((resolve) => {
    const suffix = defaultValue ? chalk.gray(` (default: ${defaultValue})`) : '';

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`${message}${suffix}: `, (answer) => {
      rl.close();
      const trimmed = answer.trim();
      resolve(trimmed === '' ? (defaultValue ?? '') : trimmed);
    });
  });
}

/**
 * Prompts user for yes/no confirmation
 */
export async function promptConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    process.stdout.write(`${message} (y/n): `);

    if (process.stdin.setRawMode && process.stdout.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();

      const onData = (char: Buffer) => {
        const charStr = char.toString('utf-8').toLowerCase();

        // Ctrl+C
        if (charStr === '\u0003') {
          process.stdout.write('\n');
          process.stdin.setRawMode(false);
          process.stdin.removeListener('data', onData);
          process.stdin.pause();
          resolve(false);
          return;
        }

        if (charStr === 'y' || charStr === 'n') {
          process.stdout.write(charStr + '\n');
          process.stdin.setRawMode(false);
          process.stdin.removeListener('data', onData);
          process.stdin.pause();
          resolve(charStr === 'y');
          return;
        }
      };

      process.stdin.on('data', onData);
    } else {
      // Fallback for non-TTY environments
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
      });

      rl.question('', (answer) => {
        rl.close();
        const normalized = answer.trim().toLowerCase();
        resolve(normalized === 'y' || normalized === 'yes');
      });
    }
  });
}
