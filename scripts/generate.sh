#!/usr/bin/env bash
# 用 lib/ 下的 ANTLR 工具 jar 从 src/grammars/<lang>/ 生成 JavaScript 解析器到同目录
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
JAR="$ROOT/lib/antlr-4.9.3-complete.jar"
GRAMMAR_DIR="$ROOT/src/grammars"

if [ ! -f "$JAR" ]; then
  echo "错误: 未找到 $JAR。请先将 antlr-4.9.3-complete.jar 放入 lib/。" >&2
  exit 1
fi

for lang in json5 json java8; do
  dest="$GRAMMAR_DIR/$lang"
  if [ ! -d "$dest" ]; then
    echo "跳过: 未找到语法目录 $dest" >&2
    continue
  fi
  echo "生成 $lang → $dest"
  java -jar "$JAR" -Dlanguage=JavaScript -o "$dest" "$dest"/*.g4
done

echo "已生成解析器到 $GRAMMAR_DIR/{json5,json,java8}/"
