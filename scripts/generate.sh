#!/usr/bin/env bash
# 用 lib/ 下的 ANTLR 工具 jar 从 src/grammars/*.g4 生成 JavaScript 解析器到 src/parser/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
JAR="$ROOT/lib/antlr-4.9.3-complete.jar"
GRAMMAR_DIR="$ROOT/src/grammars"
OUT_DIR="$ROOT/src/parser"

if [ ! -f "$JAR" ]; then
  echo "错误: 未找到 $JAR。请先将 antlr-4.9.3-complete.jar 放入 lib/。" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
java -jar "$JAR" -Dlanguage=JavaScript -o "$OUT_DIR" "$GRAMMAR_DIR"/*.g4
echo "已生成解析器到 $OUT_DIR"
