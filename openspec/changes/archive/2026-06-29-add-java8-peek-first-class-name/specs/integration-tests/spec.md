## ADDED Requirements

### Requirement: Integration runner peekFirstClassName 覆盖

集成 runner SHALL 调用 `JAVA8.peekFirstClassName` 并将结果写入 `test/resources/out/`。SHALL 提供 fixture 验证 `peekFirstClassName` 在 body 语法非法时仍返回类名，且与 `firstClassName` 行为可区分。

#### Scenario: peekFirstClassName 合法文件
- **WHEN** `JAVA8.peekFirstClassName` 作用于 `test.java.text`
- **THEN** runner 将结果写入 `test/resources/out/test.java.peekFirstClassName.txt`

#### Scenario: body 非法时 peek 与 strict 对比
- **WHEN** runner 对含合法 header、非法 body 的小 fixture 分别调用 `peekFirstClassName` 与 `firstClassName`
- **THEN** `peekFirstClassName` 输出预期类名；`firstClassName` 抛出 ParseError 或被 runner 记录为预期失败
