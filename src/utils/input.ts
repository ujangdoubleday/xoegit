import readline from 'readline';

/**
 * Validates if a string is a valid API key format
 */
export function isValidApiKey(key: string): boolean {
  if (!key || key.length < 10) return false;
  const asciiRegex = /^[\x21-\x7E]+$/;
  return asciiRegex.test(key);
}

/**
 * Prompts user for API key input via stdin with hidden input
 */
export async function promptApiKey(): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write('Please enter your Google Gemini API Key: ');

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
        terminal: false
      });

      rl.question('', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}
