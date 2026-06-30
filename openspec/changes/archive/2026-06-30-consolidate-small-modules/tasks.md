## 1. ParseError 与 core 合并

- [x] 1.1 将 `ParseError` class 实现迁入 `src/parser/parse-error.js`；删除 `core/parse-error.js`
- [x] 1.2 合并 `error-listener.js`、`visit-helpers.js` 入 `parse-pipeline.js`；更新 peek 等 import
- [x] 1.3 删除 `core/error-listener.js`、`core/visit-helpers.js`

## 2. 删除 re-export 占位

- [x] 2.1 删除 `json/string-utils.js`；json/json5 value-visitor 直引 `core/string-decode.js`

## 3. JSON4 / JSON5 薄 wrapper 合并

- [x] 3.1 合并 `json/parse.js` → `json/value-visitor.js`；更新 `json/index.js`；删除 `parse.js`
- [x] 3.2 合并 `json5/validate.js`、`parse.js` → `json5/value-visitor.js`；更新 `json5/index.js`
- [x] 3.3 合并 `json5/format.js` → `json5/format-emitter.js`；更新 `json5/index.js`；删除 `format.js`

## 4. Java8 / API 小文件合并

- [x] 4.1 合并 `first-class-name.js`、`signatures.js` → `signature-visitor.js`；更新 `java8/index.js` 与 `api/java8-to-api-schema.js` import
- [x] 4.2 将 `snowflakeId` 移入 `api/java8/java8-to-api-schema.js` 并 export；`api/index.js` 统一 import；删除 `snowflake-id.js`

## 5. 验证

- [x] 5.1 `npm test` 全绿
- [x] 5.2 `openspec validate --all` 通过
