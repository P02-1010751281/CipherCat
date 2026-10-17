#!/usr/bin/env bash
# AI 草稿门禁：AI 产出的块、模板、文档、测试在入库前必须全部通过确定性检查。
#
# 语义：门禁通过只表示"确定性检查通过"，不构成对 AI 建议或草稿正确性的背书，
# 也不把 AI 输出变成证据（见 docs/research/CRYPTO-RESEARCH-2026-10-16.md 与能力地图）。
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "== [1/5] 类型检查 =="
npm run type-check

echo "== [2/5] 全仓 lint =="
npm run lint:check

echo "== [3/5] 单元测试 =="
npx vitest run

echo "== [4/5] 文档与覆盖门禁 =="
npm run verify:all

echo "== [5/5] 生产构建 =="
npm run build

echo
echo "AI 草稿门禁：全部通过。"
echo "注意：通过门禁仅代表确定性检查通过；AI 建议本身仍不构成证据，也不得写进报告或认证材料。"
