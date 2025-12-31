import path from 'path';
import os from 'os';

/**
 * Gets the platform-specific config file path
 */
export function getConfigPath(): string {
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
