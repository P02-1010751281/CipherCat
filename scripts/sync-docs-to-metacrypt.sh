#!/usr/bin/env bash
# =============================================================================
# sync-docs-to-metacrypt.sh — 通用文档单源同步（CipherCat → metacrypt_server）
#
# 两项目共享 Blockly 核心，以下文档在 CipherCat 维护、同步到 metacrypt：
#   docs/guides/{TYPE-SYSTEM,IMPLEMENTATION-PLAN,BLOCKLY-GUIDE,AUDIT-REPORT,DEMO}.md(+en)
#   docs/blocks/（8 份块文档，双语）
#   docs/standards/（33 算法规范目录，纯知识库）
#   docs/demos/（5 份算法搭建文档，双语）
#   demos/（Blockly 工作区示例文件 + README，metacrypt 编辑器可直接导入）
#
# 不同步（平台专属）：ARCHITECTURE / DEVELOPMENT（metacrypt 平台形态不同）
# 链接约定：同步保持相对目录结构（guides/ + blocks/ + standards/ + demos/），
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
for f in TYPE-SYSTEM IMPLEMENTATION-PLAN BLOCKLY-GUIDE AUDIT-REPORT; do
  for ext in md en.md; do
    src="$CC_ROOT/docs/guides/$f.$ext"
    if [ -f "$src" ]; then
      cp "$src" "$MC_ROOT/docs/guides/$f.$ext"
      echo "  guides/$f.$ext"
    fi
  done
done

echo "== 同步 blocks/ 双语块文档 =="
for f in INDEX bitwise-logic data-encoding ecc-sbox hash numtheory post-quantum symmetric; do
  for ext in md en.md; do
    src="$CC_ROOT/docs/blocks/$f.$ext"
    if [ -f "$src" ]; then
      cp "$src" "$MC_ROOT/docs/blocks/$f.$ext"
      echo "  blocks/$f.$ext"
    fi
  done
done

echo "== 同步 standards/ 算法规范知识库 =="
rm -rf "$MC_ROOT/docs/standards"
cp -r "$CC_ROOT/docs/standards" "$MC_ROOT/docs/standards"
echo "  standards/ ($(find "$CC_ROOT/docs/standards" -type f | wc -l) files)"

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
for f in "$CC_ROOT"/demos/procedures/*.json; do
  mkdir -p "$MC_ROOT/demos/procedures"
  cp "$f" "$MC_ROOT/demos/procedures/"
  echo "  demos/procedures/$(basename "$f")"
done
for ext in md en.md; do
  cp "$CC_ROOT/demos/README.$ext" "$MC_ROOT/demos/README.$ext"
  echo "  demos/README.$ext"
done

echo "== 同步部署副本 backend/docs（容器 DOCS_ROOT=/app/docs 读取） =="
rm -rf "$MC_ROOT/backend/docs"
cp -r "$CC_ROOT/docs" "$MC_ROOT/backend/docs"
echo "  backend/docs/ ($(find "$CC_ROOT/docs" -type f | wc -l) files)"

echo "== 同步完成 =="
echo "提示：同步后需更新 metacrypt docs/INDEX.md、重启 mc-backend 容器并运行死链检查（见脚本头部约定）。"
