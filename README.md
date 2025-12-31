# xoegit

**xoegit** is an AI-powered CLI tool that helps you generate concise, semantic, and atomic git commit messages and PR descriptions. It analyzes your `git diff`, `git status`, and `git log` to provide context-aware suggestions powered by Google's Gemini models.

> **Philosophy:** "Craft, Don't Code" — `xoegit` suggests commands; YOU execute them. You stay in control.

## Features

- **Atomic Commits:** Automatically suggests splitting large changes into multiple logical commits.
- **Context Aware:** Reads your staged/unstaged changes and recent commit history.
- **Semantic Commits:** strictly follows [Conventional Commits](https://www.conventionalcommits.org/).
- **PR Ready:** Generates a ready-to-use PR title and description based on the suggested commits.

## Installation

### Prerequisites

- **Node.js**: Version 18 or higher is required.
- **Git**: Must be installed and available in your PATH.
- **API Key**: A Google Gemini API key is required (get one [here](https://aistudio.google.com/)).

### Quick Install

1.  Clone the repository:

    ```bash
    git clone git@github.com:ujangdoubleday/xoegit.git
    cd xoegit
    ```

2.  Run the automated install script:

    ```bash
    make
    ```

    _This command will install dependencies, build the project, and link the binary globally._

    > **Note:** If you encounter permission errors during the global link step, run:
    >
    > ```bash
    > sudo make global
    > ```

---

## Configuration

**xoegit** is designed to be "Zero Config".

### First Run

Simply run `xoegit` for the first time. It will prompt you for your Google Gemini API Key securely and save it for future use.

### Manual Configuration

If you prefer to configure it manually, you can set the API key in two ways:

1.  **Environment Variable:**
    Set `XOEGIT_GEMINI_API_KEY` in your shell or `.env` file.

2.  **Config File:**
    Manually create the config file at:

    - **Linux/macOS:** `~/.config/xoegit/config.json`
    - **Windows:** `%APPDATA%\xoegit\config.json`

    Content:

    ```json
    {
      "XOEGIT_GEMINI_API_KEY": "your-key-here"
    }
    ```

---

## Usage

Navigate to any directory that is a Git repository and run:

```bash
xoegit
```

**Options:**

- `-k, --api-key <key>`: Skip configuration check and use the provided API key for this session.

Example:

```bash
xoegit --api-key AIzaSyYourSecretKey...
```

### Process Flow

1.  **Analysis**: `xoegit` runs `git diff`, `git status`, and `git log` to understand your changes.
2.  **Reasoning**: It sends this context to the AI model.
3.  **Suggestion**: The AI generates a set of git commands.
4.  **Output**: You see the suggested commands in your terminal.

### The "Craft, Don't Code" Philosophy

`xoegit` will **never** execute commands for you. It strictly provides suggestions.
You must copy the commands and execute them yourself. This ensures you review every commit before it happens.

---

## Workflow Examples

### Scenario 1: Feature + Housekeeping

**You Changed:**

- `src/auth.ts` (Implemented login)
- `package.json` (Updated dependencies)

**Output:**

```text
commit 1
git add src/auth.ts
git commit -m "feat(auth): implement login logic"

commit 2
git add package.json
git commit -m "chore: update dependencies"

pr title: feat(auth): implement login and update deps
pr description: feat(auth): implement login and update deps
```

### Scenario 2: New Untracked Files

**You Created:**

- `src/new-component.ts` (Untracked)

**Output:**

```text
commit 1
git add src/new-component.ts
git commit -m "feat(ui): add new component"
...
```

---

## Troubleshooting

### "Error: Current directory is not a git repository"

- Ensure you have run `git init` or are inside a valid git repo.

### "Gemini Provider Error: [404] ..."

- Your API key might be invalid, or the configured model `gemini-2.5-flash-lite` is not available to your account.
- Check your `~/.config/xoegit/config.json` or environment variables.

### "No changes detected"

- Make sure you have either modified files (`git diff`), staged files, or untracked files (`git status`).

---

## Development

- **Build:** `make build`
- **Watch Mode:** `tsc -w`

## License

[MIT](LICENSE.md)
