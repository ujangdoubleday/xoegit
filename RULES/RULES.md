# Git Workflow Agent

An agent that helps generate git commit messages, PR titles, and squash messages following team conventions. You execute all commands manually.

## 1. Agent Purpose

The agent will **only suggest/generate**:

- Which files to stage (`git add`)
- Commit messages following conventions
- PR title in proper format
- Squash message for PR merge

**Agent will NOT**:

- Auto-commit your changes
- Auto-create PRs
- Auto-merge PRs

## 2. How to Use the Agent

### Step 1: Analyze Your Changes

Run these commands to see your changes:

```bash
git status
git diff
```

### Step 2: Ask the Agent

Provide context about your changes:

**Request Format:**

```
I changed:
- [file1]: [what changed]
- [file2]: [what changed]
- [file3]: [what changed]

Purpose: [what is the goal of this change]
```

**Example Request:**

```
I changed:
- src/auth/login.controller.ts: added input validation
- src/auth/auth.service.ts: implemented JWT token generation
- src/middleware/validation.middleware.ts: created validation middleware

Purpose: implement login validation and JWT authentication
```

### Step 3: Agent Response

Agent will respond with:

```
📦 Files to Stage:
git add src/auth/login.controller.ts src/auth/auth.service.ts src/middleware/validation.middleware.ts

💬 Commit Message:
feat(auth): implement login validation and jwt authentication

🔄 Alternative (if changes can be split):

Commit 1:
git add src/middleware/validation.middleware.ts
git commit -m "feat(auth): add input validation middleware"

Commit 2:
git add src/auth/login.controller.ts src/auth/auth.service.ts
git commit -m "feat(auth): implement jwt token authentication"
```

### Step 4: Execute Manually

Copy and run the suggested commands:

```bash
git add src/auth/login.controller.ts src/auth/auth.service.ts src/middleware/validation.middleware.ts
git commit -m "feat(auth): implement login validation and jwt authentication"
git push origin your-branch-name
```

### Step 5: Create PR (Manual)

When ready to create PR, ask agent:

**Request Format:**

```
Generate PR title and squash message for:
[list all commits in this PR or describe overall changes]
```

**Example Request:**

```
Generate PR title and squash message for:
- feat(auth): add input validation middleware
- feat(auth): implement jwt token authentication
- feat(auth): add password hashing
- test(auth): add authentication tests
```

### Step 6: Agent Response for PR

```
📋 PR Title:
feat(auth): implement complete authentication system

📝 Squash Commit Message:
feat(auth): implement complete authentication system

- added input validation middleware
- implemented jwt token generation and verification
- added bcrypt password hashing
- added comprehensive authentication tests

Closes #123
```

### Step 7: Create PR Manually

Use the suggested title and description:

```bash
# Via GitHub CLI
gh pr create --title "feat(auth): implement complete authentication system" --body "[paste description]"

# Or create via GitHub web interface
```

## 3. Commit Message Convention

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

### Examples

```
feat(auth): add jwt token refresh
fix(api): resolve race condition in user creation
chore(deps): upgrade react to v18
refactor(utils): simplify date formatting logic
docs(readme): update installation instructions
test(auth): add login endpoint tests
```

## 4. PR Title Convention

### Format

```
<type>(<scope>): <description>
```

### Rules

- All lowercase
- Must summarize entire PR
- Clear and concise
- Under 72 characters

### Examples

```
feat(auth): implement oauth2 authentication
fix(payment): resolve stripe webhook handling
chore(deps): update all dependencies to latest
refactor(database): migrate to prisma orm
```

## 5. Squash Message Convention

### Format

```
<type>(<scope>): <summary title>

- bullet point of change 1
- bullet point of change 2
- bullet point of change 3

Closes #issue-number
```

### Rules

- First line is the PR title (all lowercase)
- Bullet points describe key changes
- Each bullet starts with lowercase
- Include issue references

### Example

```
feat(auth): implement complete authentication system

- added jwt token generation and refresh
- implemented password hashing with bcrypt
- added input validation middleware
- created authentication guards
- added comprehensive unit and integration tests

Closes #234, #235
```

## 6. Agent Prompt Templates

### For Single Commit

```
I made these changes:
[describe file changes]

Purpose: [goal]

Please suggest:
1. git add command
2. commit message
```

### For Multiple Atomic Commits

```
I made these changes:
[describe file changes]

These changes cover multiple features/fixes.

Please suggest:
1. How to split into atomic commits
2. git add commands for each
3. commit messages for each
```

### For PR Creation

```
Generate PR title and squash message.

My commits in this branch:
[list commits or describe overall work]

Related issues: #123, #456
```

### For Complex Changes

```
I've been working on [feature name] and made these changes:

Files changed:
- [file1]: [changes]
- [file2]: [changes]
- [file3]: [changes]
...

Goals achieved:
- [goal 1]
- [goal 2]

Please suggest:
1. Best way to organize into commits
2. git add commands
3. commit messages
4. PR title
5. squash message
```

## 7. Example Workflows

### Example 1: Simple Feature

**User Request:**

```
I changed:
- src/components/Button.tsx: added loading state
- src/components/Button.test.tsx: added tests for loading state

Purpose: add loading state to button component
```

**Agent Response:**

```
📦 Files to Stage:
git add src/components/Button.tsx src/components/Button.test.tsx

💬 Commit Message:
feat(ui): add loading state to button component
```

---

### Example 2: Bug Fix with Multiple Files

**User Request:**

```
I changed:
- src/api/user.controller.ts: fixed null pointer error
- src/api/user.service.ts: added null checks
- src/api/user.test.ts: added test for null case

Purpose: fix crash when user data is null
```

**Agent Response:**

```
📦 Files to Stage:
git add src/api/user.controller.ts src/api/user.service.ts src/api/user.test.ts

💬 Commit Message:
fix(api): handle null user data to prevent crash
```

---

### Example 3: Multiple Separate Commits

**User Request:**

```
I changed:
- src/auth/login.ts: added validation
- src/auth/register.ts: added validation
- src/utils/logger.ts: improved error logging
- src/config/database.ts: updated connection pool settings

Purpose: multiple improvements
```

**Agent Response:**

```
These changes should be split into atomic commits:

📦 Commit 1 - Validation:
git add src/auth/login.ts src/auth/register.ts
git commit -m "feat(auth): add input validation for login and register"

📦 Commit 2 - Logging:
git add src/utils/logger.ts
git commit -m "refactor(utils): improve error logging format"

📦 Commit 3 - Database:
git add src/config/database.ts
git commit -m "chore(config): update database connection pool settings"
```

---

### Example 4: PR Creation

**User Request:**

```
Generate PR title and squash message.

Commits in this branch:
- feat(auth): add input validation for login and register
- feat(auth): implement jwt token generation
- feat(auth): add password hashing with bcrypt
- test(auth): add authentication test suite

Related: #234
```

**Agent Response:**

```
📋 PR Title:
feat(auth): implement secure authentication system

📝 Squash Commit Message:
feat(auth): implement secure authentication system

- added input validation for login and register endpoints
- implemented jwt token generation and verification
- added bcrypt password hashing for secure storage
- created comprehensive authentication test suite

Closes #234
```

## 8. Quick Reference

### Ask for Commit Message

```
changes: [list files and what changed]
purpose: [goal]
```

### Ask for Multiple Commits

```
changes: [list files and what changed]
split into atomic commits
```

### Ask for PR Title & Squash

```
generate pr title and squash for:
[list commits or describe work]
```

## 9. Tips for Better Agent Responses

✅ **DO:**

- Be specific about what changed in each file
- Explain the purpose/goal clearly
- Mention if changes are related or separate
- Include issue numbers if applicable
- Ask to split if you modified unrelated things

❌ **DON'T:**

- Just say "I changed many files"
- Leave out the purpose of changes
- Mix unrelated changes without mentioning
- Forget to specify if it's a breaking change

## 10. Advanced Scenarios

### Breaking Changes

**Request:**

```
I changed:
- src/api/user.ts: changed getUserById to return promise
- src/api/user.ts: removed callback parameter

Purpose: modernize api to use async/await

Note: this breaks existing code using callbacks
```

**Agent Response:**

```
📦 Files to Stage:
git add src/api/user.ts

💬 Commit Message:
feat(api)!: migrate user api to async/await

BREAKING CHANGE: getUserById now returns Promise instead of using callbacks
```

---

### Multiple Scopes

**Request:**

```
I changed:
- src/api/auth.controller.ts: fixed login bug
- src/ui/LoginForm.tsx: updated form validation
- src/api/user.controller.ts: fixed user update bug

Purpose: various bug fixes
```

**Agent Response:**

```
Split into separate commits by scope:

📦 Commit 1:
git add src/api/auth.controller.ts
git commit -m "fix(api): resolve login authentication bug"

📦 Commit 2:
git add src/ui/LoginForm.tsx
git commit -m "fix(ui): correct form validation logic"

📦 Commit 3:
git add src/api/user.controller.ts
git commit -m "fix(api): resolve user update error"
```

---

## Summary

This agent is your **message generator assistant**:

1. You code
2. You ask agent for suggestions
3. Agent gives you commands and messages
4. You copy and execute manually
5. Full control stays with you

**Remember:** All lowercase, semantic prefixes, clear descriptions!
