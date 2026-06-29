## 1. format-emitter suffix gap trim

- [x] 1.1 新增 `trimInterMemberGapCompact(suffix)`（sort+compact：丢弃 member 间 layout gap，保留 `, // inline`）
- [x] 1.2 接入 `memberSuffixForSortedMember(..., compact=true)`；必要时收紧 `normalizeMemberSuffixCompact`
- [x] 1.3 验证嵌套 object/array 递归路径同样无 whitespace-only 行

## 2. 测试

- [x] 2.1 新增 `cases/json5.sort-compact-gap.text`
- [x] 2.2 `test/run.mjs` 注册 gap case assert（无 whitespace-only 行）
- [x] 2.3 加强 `json5 format (sortKeys)` runCase：assert 无 whitespace-only 行
- [x] 2.4 确认 sort-section-inline、sort-prefix-newline、sort-inline-comment 无回归
- [x] 2.5 更新 `test/resources/out/test.json5.format.sorted.text`

## 3. 验证

- [x] 3.1 `npm test` 通过
- [x] 3.2 `openspec validate --all` 通过
