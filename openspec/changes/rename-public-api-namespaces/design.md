## Context

`src/index.js` 当前导出四个小写命名空间对象，内部实现位于 `src/parser/{json5,json,java8,api}/`（目录名小写不变）。v2.3.0 已将 ApiSchema 转换迁至 `api` 命名空间；本次仅改 **公开 export 标识符**，不改函数实现、grammar 或 `ParseError` 诊断字段。

探索阶段已确认映射：`json5→JSON5`、`json→JSON4`、`java8→JAVA8`、`api→API`。

## Goals / Non-Goals

**Goals:**

- 统一四条产品线的对外品牌命名（SCREAMING 标识符）
- 保持各方法行为、参数、返回值与 v2.3.0 完全一致
- 硬切 BREAKING（v2.4.0），与 v2.3.0 迁移策略一致

**Non-Goals:**

- 不重命名 `src/parser/**` 目录或内部模块文件
- 不改 `ParseError.language`（仍为 `'json5'` / `'json'` / `'java8'`）
- 不改命名空间内方法名（如 `java8ToApiSchema` 保持 camelCase）
- 不提供旧名 deprecation 别名
- 不改 fixture / golden 文件名

## Decisions

### 1. 导出名映射

| 旧 export | 新 export | 理由 |
|-----------|-----------|------|
| `json5` | `JSON5` | 与 JSON5 规格名一致 |
| `json` | `JSON4` | 与 `JSON5` 对称表达「ANTLR 产品线」；**避开** ESM 模块内 `import { JSON }` 对全局 `JSON` 的遮蔽 |
| `java8` | `JAVA8` | 与 `JSON5`/`API` 视觉对齐 |
| `api` | `API` | 转换层产品线品牌名 |

**备选：** `json→JSON` — 拒绝，易与内置 `JSON.parse` 混淆且 import 遮蔽全局对象。

### 2. 仅改 `index.js` export 绑定

```javascript
export const JSON5 = { validate, parse, format };
export const JSON4 = { parse };
export const JAVA8 = { firstClassName, signatures };
export const API = { snowflakeId, java8ToApiSchema };
```

内部 import 路径与局部变量名（`json5Parse` 等）可保持小写，仅 export 标识符变更。

### 3. 硬切，无兼容层

与 v2.3.0 `api` refactor 一致：不 export 旧名，README release note 提供迁移表。

### 4. `ParseError.language` 保持小写

诊断字段是内部语言 id，与文件路径/grammar 一致；公开命名空间品牌化不影响错误对象形状。

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 连续两次 BREAKING（v2.3.0 → v2.4.0） | README 迁移表；本仓库 test/spec 一次性更新 |
| SCREAMING export 不符合常见 JS camelCase 惯例 |  intentional 产品线品牌；仅 4 个顶层 key |
| 消费者仍使用旧 import | release note + 无别名硬切 |
| `JSON4` 名称无业界标准对应 | README 说明：ANTLR 标准 JSON 解析，非 JSON5 |

## Migration Plan

1. 改 `src/index.js` export 名
2. 改 `test/run.mjs` import 与调用
3. 改 `README.md`、`package.json` description
4. bump `package.json` version → `2.4.0`
5. `npm test` 全绿
6. 归档 change 同步主 spec

**消费者迁移：**

```javascript
// v2.3.x
import { json5, json, java8, api } from 'antlr4_help';

// v2.4.0
import { JSON5, JSON4, JAVA8, API } from 'antlr4_help';
```

## Open Questions

（无——探索阶段 `JSON4` 命名已确认。）
