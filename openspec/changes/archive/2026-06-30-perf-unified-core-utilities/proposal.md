## Why

JSON4、JSON5、Java8 三条产品线共用 `runParsePipeline`，但性能相关基建仍分散：`CollectingErrorListener` 在 `peek-first-class-name.js` 重复实现；`decodeJsonString` 与 `TextBuf` 各自用 `out +=` / 私有 class；JSON4/JSON5 的 `visitArray` 均用 `.map` 多分配一层数组；pipeline 未启用 SLL 预测模式；`API.java8ToApiSchema` 默认路径重复 parse。v2.5.1 已对 JSON5 format emitter 做单语言优化，现需在 **`src/parser/core/` 统一抽取并优化共享工具**，使 JSON4 parse、JSON5 parse/validate/format、Java8 pipeline 同批受益，并补齐跨语言 benchmark。

## What Changes

- **共享层抽取（Phase A refactor，行为不变）**
  - `src/parser/core/text-buf.js` — 从 `format-emitter.js` 抽出 `TextBuf`
  - `src/parser/core/string-decode.js` — 自 `json/string-utils.js` 迁移 `decodeJsonString` / `encodeJsonString`；`json/string-utils.js` 保留 re-export
  - `src/parser/core/visit-helpers.js` — `visitArrayChildren` 等
  - `src/parser/core/error-listener.js` — 共享 `CollectingErrorListener` + `throwIfErrors`；删除 `peek-first-class-name.js` 内重复
- **共享层优化（Phase B，输出 byte-equal）**
  - `decodeJsonString` 无转义快路径 + `TextBuf`/`parts` 拼接
  - JSON4/JSON5 `visitArray` 改用 `visitArrayChildren` 预分配 loop
  - `TextBuf.beginMemberLine` / `beginCloseLine` 避免全量 `parts.join()`；`formatDocument` / `emitTriple*` 迁移至 `TextBuf`
- **Pipeline 统一加速（Phase C）**
  - `runParsePipeline` 尝试 SLL prediction，失败则 reset + LL fallback（JSON4 / JSON5 / Java8 共用）
- **薄层收尾（Phase D）**
  - `java8ToApiSchema` 默认 root 从已有 `fileModels[0].types[0]` 取名，消除 `firstClassName` 二次 parse
  - 新增 `scripts/bench-all.mjs`（JSON4 / JSON5 validate|parse|format / Java8 / API；不进 `npm test`）
- **非 BREAKING**：对外 API 签名与语义不变；`JSON5.format` 输出 MUST byte-equal；`npm test` 全绿

## Capabilities

### New Capabilities

- `core-utilities`：定义 `src/parser/core/` 下共享性能工具模块（`TextBuf`、string decode/encode、visit helpers、error listener）的职责与消费约定

### Modified Capabilities

- `parse-pipeline`：SLL + LL fallback 预测模式；error listener 自 core 导入
- `project-structure`：`core/` 模块布局扩展；`scripts/bench-all.mjs` 跨语言基准约定

## Impact

- **代码**：`src/parser/core/*`（新建/扩展）、`src/parser/json/`、`src/parser/json5/`、`src/parser/java8/peek-first-class-name.js`、`src/parser/api/java8/java8-to-api-schema.js`
- **脚本**：`scripts/bench-all.mjs`（新建）；保留现有 `scripts/bench-json5.mjs` 或由其扩展
- **测试**：现有集成测试作为回归门禁；bench 仅手动运行
- **API**：无公开签名变更；patch 版本 bump（实现完成后）
