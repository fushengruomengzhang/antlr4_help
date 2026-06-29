## 1. 内联 baseTypeMap

- [x] 1.1 在 `src/parser/api/java8/type-to-parsed.js` 顶部添加模块内 `const baseTypeMap`（内容与现 `base-type-map.js` 一致）
- [x] 1.2 移除 `import { resolveBaseType } from './base-type-map.js'`
- [x] 1.3 将 primitive 与 class 分支中的 `resolveBaseType(sig.name)` 改为 `baseTypeMap[sig.name]`

## 2. 删除旧模块

- [x] 2.1 删除 `src/parser/api/java8/base-type-map.js`
- [x] 2.2 确认仓库内无残留 `base-type-map` import（`grep base-type-map src/` 无匹配）

## 3. 验证

- [x] 3.1 运行 `npm test`（或 `node test/run.mjs`）确认 java8 toApiSchema 相关输出不变
