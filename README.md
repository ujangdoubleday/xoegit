# xoegit

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-AI-8E75B2?logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

**xoegit** is an AI-powered CLI tool that generates concise, semantic, and atomic git commit messages and PR descriptions. It analyzes your `git diff`, `git status`, and `git log` to provide context-aware suggestions powered by Google's Gemini models.

> **Philosophy:** "Craft, Don't Code" — `xoegit` suggests commands; YOU execute them. You stay in control.

## Features

- **Atomic Commits** — Automatically suggests splitting large changes into multiple logical commits
- **Context Aware** — Provide context with `--context` for more accurate commit messages
- **Smart Fallback** — Automatically switches between Gemini models when rate limits are hit
- **Semantic Commits** — Strictly follows [Conventional Commits](https://www.conventionalcommits.org/)
- **PR Ready** — Generates ready-to-use PR title and description

## Installation

### Prerequisites

- **Node.js**: Version 18 or higher
- **Git**: Must be installed and available in your PATH
- **API Key**: A Google Gemini API key ([get one here](https://aistudio.google.com/))

### Quick Install

```bash
git clone git@github.com:ujangdoubleday/xoegit.git
cd xoegit
make
```

> **Note:** If you encounter permission errors, run `sudo make global`

## Configuration

### First Run

Simply run `xoegit` for the first time. It will prompt you for your API Key securely and save it.

### Manual Configuration

**Option 1: Environment Variable**

```bash
export XOEGIT_GEMINI_API_KEY="your-key-here"
```

**Option 2: Config File**

- Linux: `~/.config/xoegit/config.json`
- macOS: `~/Library/Application Support/xoegit/config.json`
- Windows: `%APPDATA%\xoegit\config.json`

```json
{
  "XOEGIT_GEMINI_API_KEY": "your-key-here"
}
```

## Usage

```bash
xoegit
```

### Options

| Option                 | Description                                   |
| ---------------------- | --------------------------------------------- |
| `-k, --api-key <key>`  | Use specific API key for this session         |
| `-c, --context <text>` | Provide context for more accurate suggestions |
| `-V, --version`        | Show version                                  |
| `-h, --help`           | Show help                                     |

### Examples

```bash
# Basic usage
xoegit

# With context for better commit type detection
xoegit --context "refactoring folder structure"
xoegit -c "fixing authentication bug"
xoegit -c "adding new payment feature"
```

### Sample Output

```
xoegit — AI-powered commit generator

Suggestion generated!

commit 1
git add src/auth/login.ts
git commit -m "feat(auth): add login validation"

commit 2
git add src/utils/logger.ts
git commit -m "refactor(utils): improve error logging"

pr title: feat(auth): implement secure login
pr description: feat(auth): implement secure login
- feat(auth): add login validation
- refactor(utils): improve error logging
```

## Smart Model Fallback

xoegit uses multiple Gemini models with automatic fallback:

| Model                   | Priority      |
| ----------------------- | ------------- |
| `gemini-2.5-flash-lite` | 1st (default) |
| `gemini-2.5-flash`      | 2nd           |
| `gemini-3-flash`        | 3rd           |

When one model hits its rate limit, xoegit automatically tries the next one.

## Troubleshooting

### "Current directory is not a git repository"

- Ensure you're inside a valid git repo (`git init`)

### "No changes detected"

- Make sure you have modified, staged, or untracked files

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode for tests
npm run test:watch
```

## Project Structure

```
src/
├── cli/           # CLI program and actions
├── config/        # Configuration management
├── git/           # Git operations
├── prompts/       # AI prompt templates
├── providers/     # Gemini AI integration
├── types/         # TypeScript types
└── utils/         # Utilities (input, UI)
```

## License

[MIT](LICENSE.md)
