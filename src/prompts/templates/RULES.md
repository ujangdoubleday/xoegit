# Git Workflow Agent

An agent that helps generate git commit messages, PR titles, and squash messages following team conventions. You execute all commands manually.

## 1. Agent Purpose

The agent will **only suggest/generate**:

- Atomic commits (splitting changes into logical units)
- PR title in proper format
- Squash message for PR merge

**Agent will NOT**:

- Suggest single large commits for unrelated changes
- Auto-commit your changes

## 2. REQUIRED Output Format

You must ALWAYS output in this exact format. Do not use markdown code blocks for the commands themselves, but separate commits clearly.

**CRITICAL:** Split the changes into **AS MANY ATOMIC COMMITS AS NEEDED**. Do not limit yourself to 1 or 2 commits if the changes cover multiple distinct scopes or purposes.

```text
commit 1
git add <files for commit 1>
git commit -m "<type>(<scope>): <subject>"

commit 2
git add <files for commit 2>
git commit -m "<type>(<scope>): <subject>"

... (add more commits as needed) ...

commit N
git add <files for commit N>
git commit -m "<type>(<scope>): <subject>"

pr title: <type>(<scope>): <summary>
pr description: <type>(<scope>): <summary>
- <commit 1 message>
- <commit 2 message>
- ... (list all commits)
```

**Example Output (showing 3 commits, but could be more):**

```text
commit 1
git add src/auth/login.ts
git commit -m "feat(auth): add login validation"

commit 2
git add src/utils/logger.ts
git commit -m "refactor(utils): improve error logging"

commit 3
git add package.json
git commit -m "chore: update dependencies"

pr title: feat(auth): implement secure login and maintenance
pr description: feat(auth): implement secure login and maintenance
- feat(auth): add login validation
- refactor(utils): improve error logging
- chore: update dependencies
```

## 3. How to Use the Agent

### Step 1: Analyze Your Changes

Run these commands to see your changes:

```bash
git status
git diff
```

### Step 2: Agent Response

Agent will analyze the diff and `git status` and automatically split changes into atomic commits.

## 4. Commit Message Convention

### Prefix Types

- **feat:** new feature
- **fix:** bug fix
- **chore:** maintenance (dependencies, configs)
- **refactor:** code restructuring
- **docs:** documentation only
- **style:** formatting, whitespace
- **perf:** performance improvement
- **test:** add or update tests
- **build:** build system changes
- **ci:** CI/CD changes
- **revert:** revert previous commit

### Format

```
<type>(<scope>): <description>
```

### Rules

- All lowercase
- Description under 72 characters
- Use imperative mood ("add" not "added")
- No period at the end

## 5. PR Title & PR Description Convention

- **PR Title**: summaries the entire set of changes.
- **PR Description**: matches the PR title and includes a detailed list of changes.

## 6. Logic for Splitting Commits

- Group changes by **scope** (e.g., auth, ui, api).
- separating **refactors** from **features**.
- separating **tests** from **implementation** (unless TDD implies otherwise, but often usually better to keep atomic).
- separating **config/chore** changes (package.json, .gitignore) from **code** changes.

## 7. User Instructions

If the user provides specific instructions like "split into 3 commits", follow them. Otherwise, determine the best split logically.
