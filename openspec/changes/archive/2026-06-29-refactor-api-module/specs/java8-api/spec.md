## REMOVED Requirements

### Requirement: snowflakeId 随机唯一标识

**Reason**: 迁至 `api` 能力，由 `api.snowflakeId` 提供；实现位于 `src/parser/api/snowflake-id.js`。

**Migration**: 使用 `import { api } from 'antlr4_help'` 并调用 `api.snowflakeId()`。

### Requirement: Java8 toApiSchema 多文件输入

**Reason**: 迁至 `api` 能力，由 `api.java8ToApiSchema` 提供。

**Migration**: 使用 `api.java8ToApiSchema(inputs, options?)` 替代 `java8.toApiSchema(...)`。

### Requirement: Java8 toApiSchema 仅展开字段

**Reason**: 同上，属 `api.java8ToApiSchema` 行为要求。

**Migration**: 见 `api.java8ToApiSchema 仅展开字段` requirement。

### Requirement: Java8 toApiSchema baseTypeMap

**Reason**: 同上。

**Migration**: 见 `api.java8ToApiSchema baseTypeMap` requirement。

### Requirement: Java8 toApiSchema List 与 Map 展开

**Reason**: 同上。

**Migration**: 见 `api.java8ToApiSchema List 与 Map 展开` requirement。

### Requirement: Java8 toApiSchema 注解 desc 与 check

**Reason**: 同上。

**Migration**: 见 `api.java8ToApiSchema 注解 desc 与 check` requirement。

### Requirement: Java8 toApiSchema 继承 field 合并

**Reason**: 同上。

**Migration**: 见 `api.java8ToApiSchema 继承 field 合并` requirement。

### Requirement: Java8 toApiSchema 循环引用检测

**Reason**: 同上。

**Migration**: 见 `api.java8ToApiSchema 循环引用检测` requirement。

### Requirement: Java8 toApiSchema 节点结构

**Reason**: 同上。

**Migration**: 见 `api.java8ToApiSchema 节点结构` requirement。

### Requirement: Java8 toApiSchema 不索引 nestedTypes

**Reason**: 同上。

**Migration**: 见 `api.java8ToApiSchema 不索引 nestedTypes` requirement。
