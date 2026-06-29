#!/usr/bin/env bash
# 用 lib/ 下的 ANTLR 工具 jar 从 src/grammars/<lang>/ 生成 JavaScript 解析器到 src/parser/<lang>/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
JAR="$ROOT/lib/antlr-4.9.3-complete.jar"
GRAMMAR_DIR="$ROOT/src/grammars"
OUT_DIR="$ROOT/src/parser"

if [ ! -f "$JAR" ]; then
  echo "错误: 未找到 $JAR。请先将 antlr-4.9.3-complete.jar 放入 lib/。" >&2
  exit 1
fi

for lang in json5 json java8; do
  src="$GRAMMAR_DIR/$lang"
  dest="$OUT_DIR/$lang"
  if [ ! -d "$src" ]; then
    echo "跳过: 未找到语法目录 $src" >&2
    continue
  fi
  mkdir -p "$dest"
  echo "生成 $lang → $dest"
  java -jar "$JAR" -Dlanguage=JavaScript -o "$dest" "$src"/*.g4
done

echo "已生成解析器到 $OUT_DIR/{json5,json,java8}/"
