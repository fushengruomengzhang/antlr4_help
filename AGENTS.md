# antlr4_help

This repository uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) (`@fission-ai/openspec`) for spec-driven development. The `openspec/` directory holds the spec/config, and `.cursor/commands` + `.cursor/skills` provide the OpenSpec slash commands/skills for the Cursor IDE.

## Cursor Cloud specific instructions

- The OpenSpec CLI is installed globally into a user-writable prefix at `~/.npm-global` (the default global prefix resolves to `/` here, which is not writable without root, and setting a persistent npm `prefix` in `~/.npmrc` conflicts with nvm). Install/update with `npm install -g --prefix "$HOME/.npm-global" @fission-ai/openspec@latest` (this is the update script).
- `~/.npm-global/bin` must be on `PATH` to use the `openspec` command. This is added to `~/.bashrc`; if a future session cannot find `openspec`, either re-add `export PATH="$HOME/.npm-global/bin:$PATH"` or invoke it directly via `~/.npm-global/bin/openspec`.
- Do NOT install the bare `openspec` npm package — that name is an unrelated empty placeholder (`openspec@0.0.0`). The real CLI is `@fission-ai/openspec`.
- Common commands (run from repo root): `openspec list` / `openspec list --changes` / `openspec list --specs`, `openspec status --change <name>`, `openspec validate --all`, `openspec new change "<name>"`. Spec authoring is normally driven via the `/opsx:*` slash commands in Cursor.
- Empty OpenSpec dirs (`openspec/changes`, `openspec/changes/archive`, `openspec/specs`) are created by `openspec init` but are not tracked by git when empty; `openspec init --force` regenerates the full structure if needed.
- There is no build/test/lint pipeline yet — this is a spec-only repo. Validation is done via `openspec validate --all`.
