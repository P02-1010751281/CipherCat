#!/usr/bin/env bash
# =============================================================================
# sync-docs-to-metacrypt.sh — 通用文档单源同步（CipherCat → metacrypt_server）
#
# 两项目共享 Blockly 核心，以下文档在 CipherCat 维护、同步到 metacrypt：
#   docs/guides/{CAPABILITY-MAP,TYPE-SYSTEM,BLOCKLY-GUIDE,AUDIT-REPORT,DEMO}.md(+en)
#   docs/blocks/（8 份块文档，双语）
#   docs/standards/（38 标准与参考目录，纯知识库）
#   docs/demos/（5 份算法搭建文档，双语）
#   docs/research/（调研报告）
#   paper/references/（调研报告引用的标准与论文 PDF）
#   demos/（Blockly 工作区示例文件 + README，metacrypt 编辑器可直接导入）
#
# 不同步（平台专属）：USER-GUIDE / TUTORIALS / ARCHITECTURE / DEVELOPMENT（入口、路由及任务流程不同）
# 链接约定：同步保持相对目录结构（guides/ + blocks/ + standards/ + demos/ + research/），
#           内部相对链接在目标仓库同样有效；同步后运行全仓死链检查验证。
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CC_ROOT="$(dirname "$SCRIPT_DIR")"
MC_ROOT="${MC_ROOT:-/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/metacrypt_server}"

if [ ! -d "$MC_ROOT/.git" ]; then
  echo "ERROR: metacrypt_server not found at $MC_ROOT (set MC_ROOT to override)" >&2
  exit 1
fi

echo "== 同步 guides/ 通用文档 =="
mkdir -p "$MC_ROOT/docs/guides"
for f in CAPABILITY-MAP TYPE-SYSTEM BLOCKLY-GUIDE AUDIT-REPORT; do
  for ext in md en.md; do
    src="$CC_ROOT/docs/guides/$f.$ext"
    if [ -f "$src" ]; then
      cp "$src" "$MC_ROOT/docs/guides/$f.$ext"
      echo "  guides/$f.$ext"
    fi
  done
done

echo "== 同步 blocks/ 双语块文档 =="
for f in INDEX bitwise-logic data-encoding ecc-sbox hash numtheory post-quantum symmetric zuc; do
  for ext in md en.md; do
    src="$CC_ROOT/docs/blocks/$f.$ext"
    if [ -f "$src" ]; then
      cp "$src" "$MC_ROOT/docs/blocks/$f.$ext"
      echo "  blocks/$f.$ext"
    fi
  done
done

echo "== 同步 standards/ 算法规范知识库 =="
mkdir -p "$MC_ROOT/docs/standards"
# Copy canonical files without deleting target-only material (e.g. CNSA tracking).
# Obsolete target files require an explicit reviewed removal, not a whole-tree wipe.
cp -r "$CC_ROOT/docs/standards/." "$MC_ROOT/docs/standards/"
echo "  standards/ canonical files copied; target-only files preserved"

echo "== 同步 docs/demos/ 搭建文档 ==============="
mkdir -p "$MC_ROOT/docs/demos"
for f in sm4 aes hash sm2 post-quantum; do
  for ext in md en.md; do
    src="$CC_ROOT/docs/demos/$f.$ext"
    if [ -f "$src" ]; then
      cp "$src" "$MC_ROOT/docs/demos/$f.$ext"
      echo "  docs/demos/$f.$ext"
    fi
  done
done

# guides/DEMO.md（演示索引）——链接适配：ARCHITECTURE/DEVELOPMENT 不通用，
# metacrypt 的对应文档在 docs/ 顶层（../ARCHITECTURE.md），而非 guides/ 内
for ext in md en.md; do
  cp "$CC_ROOT/docs/guides/DEMO.$ext" "$MC_ROOT/docs/guides/DEMO.$ext"
  # en 版指向 metacrypt 中文版（metacrypt 无英文平台文档）
  sed -i \
    -e 's|(\./ARCHITECTURE\.md)|(../ARCHITECTURE.md)|g' \
    -e 's|(\./DEVELOPMENT\.md)|(../DEVELOPMENT.md)|g' \
    -e 's|(\./ARCHITECTURE\.en\.md)|(../ARCHITECTURE.md)|g' \
    -e 's|(\./DEVELOPMENT\.en\.md)|(../DEVELOPMENT.md)|g' \
    "$MC_ROOT/docs/guides/DEMO.$ext"
  echo "  guides/DEMO.$ext (link-adapted)"
done

echo "== 同步 demos/ 工作区示例 =================="
mkdir -p "$MC_ROOT/demos"
# 工作区 JSON + tests.json（官方向量期望值）
for f in "$CC_ROOT"/demos/*.json; do
  cp "$f" "$MC_ROOT/demos/"
  echo "  demos/$(basename "$f")"
done

echo "== 同步可复用的 Blockly 界面插图 ============"
mkdir -p "$MC_ROOT/frontend/public/docs-assets/tutorials"
for f in 02-editor-empty 03-import-menu 04-editor-imported 05-generated-python 08-function-demo 09-function-generated; do
  cp "$CC_ROOT/public/docs-assets/tutorials/$f.png" "$MC_ROOT/frontend/public/docs-assets/tutorials/$f.png"
  echo "  frontend/public/docs-assets/tutorials/$f.png"
done
# 06-docs-center-current.png is specific to CipherCat's docs UI; do not sync it.
for f in "$CC_ROOT"/demos/procedures/*.json; do
  mkdir -p "$MC_ROOT/demos/procedures"
  cp "$f" "$MC_ROOT/demos/procedures/"
  echo "  demos/procedures/$(basename "$f")"
done

echo "== 同步 research/ 调研报告 ================="
mkdir -p "$MC_ROOT/docs/research"
cp "$CC_ROOT/docs/research/CRYPTO-RESEARCH-2026-09.md" "$MC_ROOT/docs/research/"
echo "  research/CRYPTO-RESEARCH-2026-09.md"
cp "$CC_ROOT/docs/research/CRYPTO-RESEARCH-2026-09-12.md" "$MC_ROOT/docs/research/"
echo "  research/CRYPTO-RESEARCH-2026-09-12.md"
cp "$CC_ROOT/docs/research/CRYPTO-RESEARCH-2026-09-25.md" "$MC_ROOT/docs/research/"
echo "  research/CRYPTO-RESEARCH-2026-09-25.md"

echo "== 同步 research/ 文献包 =================="
mkdir -p "$MC_ROOT/paper/references"
cp "$CC_ROOT/paper/references/README.md" "$MC_ROOT/paper/references/"
cp "$CC_ROOT"/paper/references/*.pdf "$MC_ROOT/paper/references/"
echo "  paper/references/ ($(find "$CC_ROOT/paper/references" -name '*.pdf' | wc -l) PDFs)"

echo "== 同步 NIST 研究来源索引与 PDF ============="
mkdir -p "$MC_ROOT/docs/research/sources"
cp -r "$CC_ROOT/docs/research/sources/." "$MC_ROOT/docs/research/sources/"
echo "  docs/research/sources/ (index + source PDFs)"

for ext in md en.md; do
  cp "$CC_ROOT/demos/README.$ext" "$MC_ROOT/demos/README.$ext"
  echo "  demos/README.$ext"
done

echo "== 平台专属用户指南保留目标仓库版本 =="
echo "  USER-GUIDE / TUTORIALS 不同步：入口、路由和测评流程按目标平台维护，不做全仓品牌替换。"

echo "== 同步完成 =="
echo "提示：backend/docs 是历史冗余副本，不由此脚本生成；同步后需审阅 docs/INDEX.md 并运行死链检查。"
