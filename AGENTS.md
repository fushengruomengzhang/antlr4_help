# antlr4_help

A **Node.js (ESM) + ANTLR 4.9.3** learning/reference project. It also uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) (`@fission-ai/openspec`) for spec-driven development: the `openspec/` directory holds the spec/config and active changes, and `.cursor/commands` + `.cursor/skills` provide the OpenSpec slash commands/skills for the Cursor IDE.

## Project layout & commands

- `src/grammars/{json5,json,java8}/` → ANTLR grammar sources (`.g4`) and generated JS parser (committed); `src/parser/` → runtime API; `src/index.js` → ESM entrypoint. `lib/antlr-4.9.3-complete.jar` is the Java generator tool. Standard commands live in `package.json` and `README.md`: `npm install`, `npm run generate`, `npm start` / `node src/index.js [input]`.

## Cursor Cloud specific instructions

- Two dependency tiers: the **Java ANTLR jar** in `lib/` is build-time only (needs Java; used by `npm run generate`); the **`antlr4` npm runtime** is run-time only. Running already-generated code (`npm start`) needs only Node, not Java.
- `src/grammars/{json5,json,java8}/` generated code is committed. After editing any `src/grammars/**/*.g4`, you MUST re-run `npm run generate` and commit the regenerated files in the same grammar directory — otherwise generated code drifts from the grammar.
- ANTLR 4.9.3's JavaScript target emits ESM (`import antlr4 from 'antlr4'` / `export default`), which matches `package.json` `"type": "module"`; keep the project ESM.

- The OpenSpec CLI is installed globally into a user-writable prefix at `~/.npm-global` (the default global prefix resolves to `/` here, which is not writable without root, and setting a persistent npm `prefix` in `~/.npmrc` conflicts with nvm). Install/update with `npm install -g --prefix "$HOME/.npm-global" @fission-ai/openspec@latest` (this is the update script).
- `~/.npm-global/bin` must be on `PATH` to use the `openspec` command. This is added to `~/.bashrc`; if a future session cannot find `openspec`, either re-add `export PATH="$HOME/.npm-global/bin:$PATH"` or invoke it directly via `~/.npm-global/bin/openspec`.
- Do NOT install the bare `openspec` npm package — that name is an unrelated empty placeholder (`openspec@0.0.0`). The real CLI is `@fission-ai/openspec`.
- Common commands (run from repo root): `openspec list` / `openspec list --changes` / `openspec list --specs`, `openspec status --change <name>`, `openspec validate --all`, `openspec new change "<name>"`. Spec authoring is normally driven via the `/opsx:*` slash commands in Cursor.
- Empty OpenSpec dirs (`openspec/changes`, `openspec/changes/archive`, `openspec/specs`) are created by `openspec init` but are not tracked by git when empty; `openspec init --force` regenerates the full structure if needed.
- There is no build/test/lint pipeline yet — this is a spec-only repo. Validation is done via `openspec validate --all`.
