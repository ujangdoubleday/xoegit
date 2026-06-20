# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## What this is

`xoegit` is an AI-powered CLI that reads `git diff`/`git status`/`git log` and suggests atomic, Conventional-Commit-style commit commands and PR descriptions. Core philosophy: **it suggests commands, the user runs them.** By default it never stages, commits, or mutates the repo — only `--execute` (after an explicit confirmation prompt) runs the suggested `git add`/`git commit`. Preserve this invariant in any change.

## Commands

```bash
pnpm install            # install deps (repo uses pnpm; pnpm-lock.yaml is the lockfile)
pnpm build              # tsc -p tsconfig.build.json -> dist/ (src only, excludes tests)
pnpm test               # vitest run (one-shot)
pnpm test:watch         # vitest watch
pnpm test -- tests/encryption.test.ts   # run a single test file
pnpm lint               # eslint src/ tests/
pnpm format             # prettier --write
node dist/index.js      # run the built CLI locally (alias: pnpm start)
make                    # install + build + chmod +x dist/index.js + npm link (global symlink)
```

Note: `Makefile` and README still invoke `npm`, but the project is on pnpm (`pnpm-workspace.yaml`, `pnpm-lock.yaml`). Prefer `pnpm`. Husky runs `lint-staged` (prettier + eslint `--max-warnings 0`) on pre-commit. Node >= 20.19.5 required.

## Architecture

Entry point `src/index.ts` wires Commander options (`src/cli/program.ts`) to one of two actions based on the `--report` flag:
- **analyze** (`src/cli/analyze.ts`) — the default commit-suggestion flow.
- **report** (`src/cli/report.ts`) — generates a progress report from git log over a period (`--report 4W`, `--lang`).

Both actions follow the same shape: resolve provider + API key → check git repo → fetch git data → build system+user prompts → call the provider → print. The user-message assembly (untracked-file warning, optional `--context` section, status/log/diff) is currently duplicated between `analyze.ts` and the legacy `generateCommitSuggestion` in `gemini.ts`; `analyze.ts` is the live path.

### Provider abstraction (the key extension point)

All AI backends implement `AIProvider` (`src/types/provider.ts`): a single `generateContent(systemPrompt, userMessage)`. Adding a provider means touching these together:
- `src/providers/<name>.ts` — the implementation. Gemini uses `@google/genai`; OpenAI/Anthropic/Ollama/OpenRouter call REST via `fetch`.
- `src/providers/registry.ts` — `createProvider` switch, `getProviderLabel`, `requiresApiKey`, `getApiKeyEnvVar` (env var like `XOEGIT_GEMINI_API_KEY`).
- `src/providers/models.ts` — per-provider model maps, `getDefaultModel`, and `getModelList(provider, preferred?)` (fallback order, preferred/default first).
- `src/types/provider.ts` — add to the `ProviderName` union.
- `src/config/service.ts` — the `validProviders` array in `getProvider`.

Only **Gemini** implements rate-limit fallback: on a 429 it walks `getModelList('gemini', preferred)` trying each model before failing (the configured model, if any, is tried first). Other providers use a single model. Ollama is the only provider where `requiresApiKey` is false (endpoint via `XOEGIT_OLLAMA_BASE_URL` or the setup wizard, default `http://localhost:11434`). Default provider is `gemini`.

Provider, model, and key are all persisted by the first-run setup wizard (`src/cli/setup.ts`) and reused on later runs: `analyze.ts`/`report.ts` resolve the provider from `getProvider()` unless `--provider` is passed explicitly, and the per-provider model from the generic `ConfigService.getModel`/`saveModel` (config key `XOEGIT_<PROVIDER>_MODEL`). There are no `--ollama-url`/`--openrouter-url` flags; endpoints come from config/env only.

### Config & secrets

`ConfigService` (`src/config/service.ts`) reads/writes a JSON config at a platform-specific path (`src/config/constants.ts` — e.g. `~/.config/xoegit/config.json` on Linux), file mode `0600`. Resolution order for every setting is **env var → config file → default**.

API keys are encrypted at rest with AES-256-GCM (`src/config/encryption.ts`, `enc:v1:` prefix). The key is **derived from machine properties** (hostname + homedir + platform), so a config file is not portable across machines — decryption silently fails on a different host and the key is treated as missing. Plaintext keys found in config are auto-migrated to encrypted form on read.

### Prompts

`src/prompts/service.ts` builds the system prompt and embeds `RULES_CONTENT` from `src/prompts/rules.ts` — a large hardcoded string defining the required output format (`commit N` / `git add` / `git commit -m`, `pr title:`, `pr description:`). `analyze.ts`'s `parseCommitOperations` parses that exact format back out for `--execute`, so the rules string and the parser are coupled: changing the output format means updating both.

## Conventions

- ESM throughout (`"type": "module"`); **imports must use explicit `.js` extensions** (NodeNext resolution), even for `.ts` sources.
- Each module dir exposes a barrel `index.ts`; import from the directory, not deep files.
- Unused vars/args/caught-errors must be prefixed `_` (eslint enforced). `any` is a warning — avoid it.
- Commit messages in this repo follow Conventional Commits (the tool's own dogfood).
