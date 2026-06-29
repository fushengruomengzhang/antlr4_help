## Context

`src/parser/api/java8/` 当前含四个模块：

```
java8-to-api-schema.js  →  effective-fields.js
                       →  type-to-parsed.js  →  base-type-map.js
```

`base-type-map.js`（约 20 行）仅导出 `baseTypeMap` 与 `resolveBaseType()`，且只有 `type-to-parsed.js` 引用。映射规则已在 `openspec/specs/api/spec.md` 的 `API.java8ToApiSchema baseTypeMap` requirement 中定义，与文件拆分无关。

## Goals / Non-Goals

**Goals:**

- 将 `baseTypeMap` 内联到 `type-to-parsed.js`，删除 `base-type-map.js`
- 保持 `typeSignatureToParsed()` 行为与现有 baseTypeMap 映射完全一致
- 减少 `api/java8/` 模块数（4 → 3）

**Non-Goals:**

- 修改 baseTypeMap 条目或映射逻辑
- 将 map 导出为公共 API
- 更新归档 change 文档中的历史路径引用

## Decisions

### 1. 内联目标：`type-to-parsed.js`（非 `java8-to-api-schema.js`）

**选择**：在 `type-to-parsed.js` 顶部定义模块内 `const baseTypeMap`。

**理由**：`base-type-map.js` 的唯一消费者是 `type-to-parsed.js`；`java8-to-api-schema.js` 只依赖 `typeSignatureToParsed`，不直接查 map。

**备选**：内联到 `java8-to-api-schema.js` — 拒绝，会错放职责且 `type-to-parsed.js` 仍需要 map。

### 2. 不保留 `resolveBaseType` helper

**选择**：调用处直接使用 `baseTypeMap[sig.name]`。

**理由**：helper 仅一行 `return baseTypeMap[name]`，无额外逻辑；内联后更直观。

**备选**：保留本地 function — 拒绝，无收益。

### 3. 不 export `baseTypeMap`

**选择**：模块内 `const`，不加入 `src/index.js` 或任何公开 API。

**理由**：当前无外部消费者；spec 约束的是 `API.java8ToApiSchema` 行为，不是 map 的模块边界。

## Risks / Trade-offs

- **[Risk] 未来第二处需要 baseTypeMap** → **Mitigation**：届时再从 `type-to-parsed.js` 抽出共享常量；当前 YAGNI。
- **[Risk] 内联后 type-to-parsed.js 略长** → **Mitigation**：仅增加 ~12 行常量，可接受。

## Migration Plan

1. 编辑 `type-to-parsed.js`：移除 import，顶部添加 `baseTypeMap`，替换两处 lookup
2. 删除 `base-type-map.js`
3. 确认无残留 import（`grep base-type-map`）
4. 手动或集成测试验证 `API.java8ToApiSchema` 输出不变

回滚：恢复两文件即可，无数据或配置迁移。

## Open Questions

（无）
