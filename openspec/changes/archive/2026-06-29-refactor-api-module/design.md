## Context

当前 `src/parser/java8/` 同时承载 Java 解析（`signatures` → `FileModel`）与 ApiSchema 转换（`toApiSchema`）。`snowflakeId` 位于 `src/parser/core/`，但仅被 toApiSchema 使用。对外 export 为 `java8.toApiSchema` 与顶层 `snowflakeId`，与「解析 vs 业务转换」分层不符。v2.2.2 已实现继承合并与回边环检测；本 change 仅重组模块与公开 API，**不改变** ApiSchema 输出语义。

## Goals / Non-Goals

**Goals:**

- 建立 `src/parser/api/` 与 `src/parser/java8/` 同级，清晰分离解析层与转换层
- 对外统一 `api` 命名空间：`api.java8ToApiSchema`、`api.snowflakeId`
- 保持 toApiSchema 行为、golden、结构断言不变
- 为后续 `api.java8ToJson5` 预留同目录落点

**Non-Goals:**

- 不实现 `java8ToJson5`（留给 `add-java8-to-json5`）
- 不修改 ANTLR grammar 或 `java8.signatures()` 行为
- 不提供 `java8.toApiSchema` 兼容别名或 deprecation 周期（硬切 BREAKING）
- 不修改 ApiSchema 节点 JSON 形状或环检测/继承逻辑

## Decisions

### 1. 目录布局：`src/parser/api/java8/`

```
src/parser/api/
├── snowflake-id.js
└── java8/
    ├── java8-to-api-schema.js   # export java8ToApiSchema
    ├── effective-fields.js
    ├── type-to-parsed.js
    └── base-type-map.js
```

**理由：** `api` 与 `java8` 同级表达「转换产品线」；`api/java8/` 子目录按输入来源分组，便于未来 `api/json-schema/` 等扩展。

**备选：** 文件全平铺在 `api/` 根 — 拒绝，多转换器时根目录拥挤。

### 2. 公开 API 命名

| 旧 (v2.2.x) | 新 (v2.3.0) |
|-------------|-------------|
| `snowflakeId()` 顶层 | `api.snowflakeId()` |
| `java8.toApiSchema(...)` | `api.java8ToApiSchema(...)` |

**理由：** 探索阶段已确认 `{source}{Target}` 模式（`java8` + `ToApiSchema`）；`java8` 命名空间回归纯解析。

### 3. 依赖方向

```
api/java8/*  →  java8/signatures, java8/first-class-name, java8/models
             →  api/snowflake-id
```

`java8/` MUST NOT import from `api/`。单向依赖避免环。

### 4. 实现迁移策略

- **git mv** 保留历史（若环境支持）；否则 move + 更新 import 路径
- 内部函数 `toApiSchema` 重命名为 `java8ToApiSchema`；错误前缀同步
- `src/index.js`：

```js
export const api = {
  snowflakeId,
  java8ToApiSchema,
};
export const java8 = {
  firstClassName,
  signatures,
  // 移除 toApiSchema
};
// 移除顶层 export snowflakeId
```

### 5. Spec 能力拆分

- 新建 `openspec/specs/api/spec.md`：自 `java8-api` 迁出 snowflakeId + 全部 toApiSchema requirements（路径/导出名更新）
- `java8-api`：REMOVED 上述 requirements
- `project-structure`：补充 `api/` 目录与 `api` export
- `integration-tests`：调用路径改为 `api.java8ToApiSchema`

### 6. 版本号

**v2.3.0** — 公开 API BREAKING，行为不变。

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 外部消费者仍调用 `java8.toApiSchema` | README + release note 说明迁移；本仓库内 test/spec 全量更新 |
| import 路径遗漏导致运行失败 | `npm test` 15/15；`openspec validate --all` |
| `core/snowflake-id.js` 删除后误引用 | grep 全库确认无残留 import |

## Migration Plan

1. 创建 `src/parser/api/` 并迁移文件
2. 更新 `src/index.js` export
3. 更新 `test/run.mjs`、README
4. 删除 `src/parser/java8/` 下已迁出文件及 `src/parser/core/snowflake-id.js`
5. `npm test` + `openspec validate --all`
6. 提交 `release: v2.3.0 refactor api module`

**回滚：** revert commit；无数据迁移。

## Open Questions

- 无（探索阶段已确认：硬切、无顶层 snowflakeId、无 java8 别名）
