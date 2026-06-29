## MODIFIED Requirements

### Requirement: 端到端解析流水线

项目 SHALL 提供一条可运行的「语法 → 生成 → 解析」流水线：使用生成的解析器与 `antlr4` 运行时，`node src/index.js` MUST 能调用 JSON5、JSON4 或 JAVA8 示例 API 并产生可观察的输出而不报错。

#### Scenario: 运行入口完成解析

- **WHEN** 在已 `npm install` 且已生成解析器的前提下运行 `node src/index.js`
- **THEN** 进程成功退出（退出码 0）并打印至少一种语言（JSON5、JSON4 或 JAVA8）的解析/格式化/签名提取示例结果

### Requirement: 统一 API 导出入口

`src/index.js` SHALL re-export `JSON5`、`JSON4`、`JAVA8`、`API` 命名空间及 `ParseError`，供外部 `import { JSON5, JSON4, JAVA8, API, ParseError } from 'antlr4_help'`（或相对路径）使用。MUST NOT 再 export 小写 `json5`、`json`、`java8`、`api`。

#### Scenario: 命名空间可导入

- **WHEN** 在 ESM 模块中 `import { JSON5, JSON4, JAVA8, API, ParseError } from './src/index.js'`
- **THEN** 五个导出均可访问且 `JSON5.validate`、`JSON4.parse`、`JAVA8.signatures`、`API.java8ToApiSchema` 为函数
