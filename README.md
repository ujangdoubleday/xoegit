# xoegit

[![Node.js](https://img.shields.io/badge/Node.js-20.19.5+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/Gemini-AI-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![npm](https://img.shields.io/npm/v/xoegit?color=cb3837&logo=npm&logoColor=white)](https://www.npmjs.com/package/xoegit)
[![License](https://img.shields.io/badge/License-MIT-green)](https://github.com/ujangdoubleday/xoegit/blob/main/LICENSE.md)

<img src="docs/xoegit-banner.png" alt="xoegit banner" width="100%">

**xoegit** is an AI-powered CLI tool that generates concise, semantic, and atomic git commit messages and PR descriptions. It analyzes your `git diff`, `git status`, and `git log` to provide context-aware suggestions powered by Google's Gemini models.

> **Philosophy:** "Craft, Don't Code" — `xoegit` suggests commands; YOU execute them. You stay in control.

## Features

- **Atomic Commits** — Automatically suggests splitting large changes into multiple logical commits
- **Execute Mode** — Optionally execute commits with confirmation using `--execute`
- **Context Aware** — Provide context with `--context` for more accurate commit messages
- **Smart Fallback** — Automatically switches between Gemini models when rate limits are hit
- **Semantic Commits** — Strictly follows [Conventional Commits](https://www.conventionalcommits.org/)
- **PR Ready** — Generates ready-to-use PR title and description

## How It Works

> **Important:** By default, `xoegit` **never** stages your files, commits your changes, or modifies your repository in any way. It only analyzes your changes and provides recommendations that you can review and execute yourself.
>
> With the `--execute` flag, you can optionally let `xoegit` execute the suggested commits after your explicit confirmation.

You remain in full control of your git workflow.

## Installation

### Prerequisites

- **Node.js**: Minimum version 20.19.5 or higher
- **Git**: Must be installed and available in your PATH
- **API Key**: A Google Gemini API key ([get one here](https://aistudio.google.com/))

### Install

```bash
npm install -g xoegit
```

**or** install from source:

```bash
git clone git@github.com:ujangdoubleday/xoegit.git
cd xoegit
make
```

## Configuration

Simply run `xoegit` for the first time. It will prompt you for your API Key securely and save it locally.

> **Security Note:** Your API key is stored locally on your device only. We do not collect, store, or have access to your API key. See [Security Policy](SECURITY.md) for details.

## Usage

Then, from whatever project you're working on, just run:

```bash
xoegit
```

![xoegit](docs/xoegit-screenshoot.png)

### Options

| Option                 | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `-k, --api-key <key>`  | Use specific API key for this session               |
| `-c, --context <text>` | Provide context for more accurate suggestions       |
| `-e, --execute`        | Execute commits after confirmation prompt           |
| `-s, --set-key <key>`  | Save API key to config                              |
| `-d, --delete-key`     | Delete saved API key from config                    |
| `-V, --version`        | Show version                                        |
| `-h, --help`           | Show help                                           |

### Examples

**Basic usage:**

```bash
xoegit
```

**With context for better commit type detection:**

```bash
xoegit --context "refactoring folder structure"
xoegit -c "fixing authentication bug"
xoegit -c "adding new payment feature"
```

**Use API key for this session only (not saved):**

```bash
xoegit --api-key "YOUR_GEMINI_API_KEY"
```

**Manage API key:**

```bash
xoegit --set-key "YOUR_GEMINI_API_KEY"
xoegit --delete-key
```

**Execute mode (auto-commit with confirmation):**

```bash
xoegit --execute
xoegit -e
xoegit -e -c "fixing critical bug"
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

### Execute Mode Output

```
ℹ Execute mode enabled. 2 commit(s) will be created.
Do you want to execute these commands? (y/n): y
✔ [1/2] a1b2c3d feat(auth): add login validation
└─ src/
   └─ auth/
      └─ login.ts
✔ [2/2] e4f5g6h refactor(utils): improve error logging
└─ src/
   └─ utils/
      └─ logger.ts

✓ All 2 commit(s) executed successfully!
```

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
```

**or** use `make`:

```bash
make
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

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

- [Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)

## License

[MIT](LICENSE.md)
