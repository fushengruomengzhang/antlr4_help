## ADDED Requirements

### Requirement: 模块 spec 提供中文 mirror 文档

Each module under `openspec/specs/` SHALL provide a `spec.zh.md` file alongside `spec.md` that fully mirrors all requirements and scenarios in Simplified Chinese, while preserving English normative keywords (`Requirement`, `Scenario`, `WHEN`, `THEN`, `AND`, `SHALL`, `MUST`, `MAY`, `NOT`) and all code literals, paths, and API identifiers unchanged.

#### Scenario: json4 mirror exists

- **WHEN** the repository is checked out
- **THEN** `openspec/specs/json4/spec.zh.md` SHALL exist
- **AND** it SHALL contain the same number of `### Requirement:` blocks as `spec.md`

#### Scenario: English spec remains authoritative

- **WHEN** `openspec validate --all` is run
- **THEN** validation SHALL apply only to `spec.md`, not `spec.zh.md`
