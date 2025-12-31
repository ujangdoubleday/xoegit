import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import readline from 'readline';

interface XoegitConfig {
  XOEGIT_GEMINI_API_KEY?: string;
}

export class ConfigService {
  private configPath: string;

  constructor() {
    this.configPath = this.getConfigPath();
  }

  private getConfigPath(): string {
    const homeDir = os.homedir();
    switch (process.platform) {
      case 'win32':
        return path.join(process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming'), 'xoegit', 'config.json');
      case 'darwin':
        return path.join(homeDir, 'Library', 'Application Support', 'xoegit', 'config.json');
      default: // Linux and others
        return path.join(homeDir, '.config', 'xoegit', 'config.json');
    }
  }

  async getApiKey(): Promise<string | undefined> {
    // 1. Check environment variable
    if (process.env.XOEGIT_GEMINI_API_KEY) {
      return process.env.XOEGIT_GEMINI_API_KEY;
    }

    // 2. Check config file
    try {
      const configStr = await fs.readFile(this.configPath, 'utf-8');
      const config = JSON.parse(configStr) as XoegitConfig;
      if (config.XOEGIT_GEMINI_API_KEY && this.isValidApiKey(config.XOEGIT_GEMINI_API_KEY)) {
        return config.XOEGIT_GEMINI_API_KEY;
      }
    } catch (error) {
      // Config file doesn't exist or is invalid, ignore
    }

    return undefined;
  }

  private isValidApiKey(key: string): boolean {
    // Basic validation: length > 10, no spaces, allowed chars
    // Gemini keys are typically AIza... (39 chars)
    // We allow A-Z, a-z, 0-9, -, _
    if (!key || key.length < 10) return false;
    // Check for non-ASCII characters which cause the ByteString error in headers
    // 9881 is '⚙', checking for ASCII range 33-126
    const asciiRegex = /^[\x21-\x7E]+$/;
    return asciiRegex.test(key);
  }

  async saveApiKey(apiKey: string): Promise<void> {
    try {
      const dir = path.dirname(this.configPath);
      await fs.mkdir(dir, { recursive: true });

      let config: XoegitConfig = {};
      try {
        const existing = await fs.readFile(this.configPath, 'utf-8');
        config = JSON.parse(existing);
      } catch (e) {
        // ignore
      }

      config.XOEGIT_GEMINI_API_KEY = apiKey;
      await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), { mode: 0o600 }); // Secure permissions
    } catch (error) {
      throw new Error(`Failed to save configuration: ${(error as any).message}`);
    }
  }

  async promptApiKey(): Promise<string> {
    return new Promise((resolve) => {
      process.stdout.write('Please enter your Google Gemini API Key: ');

      // Use raw mode for hidden input if available
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
             process.stdin.pause(); // Pause stdin to allow program to exit naturally if needed
             process.stdout.write('\n');
             const trimmedInput = input.trim();
             if (this.isValidApiKey(trimmedInput)) {
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
        // Fallback for non-TTY environments (or if hidden input not supported)
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          terminal: false // Treat as non-terminal to avoid echoing if possible, though rl.question usually echoes. 
        });

        rl.question('', (answer) => {
             rl.close();
             resolve(answer.trim());
        });
      }
    });
  }
}
