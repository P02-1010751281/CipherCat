#!/bin/bash
# CipherCat → metacrypt_server 同步脚本（2026-08-01 重写）
# 将 CipherCat 的 Blockly 核心改动同步到 metacrypt_server
#
# 背景：2026-08-01 平台重构 Step2 features 化后，metacrypt 的 Blockly 核心
# 从 frontend/src/blockly/ 移至 frontend/src/features/blockly/core/。
# 旧脚本路径已失效 + 目录名不匹配（bit→bitwise、postquantum→post-quantum），
# 且 metacrypt 侧残留已删除文件（convenience.ts、gf-mul.ts）。
# 本次重写为"全量镜像 + 目录映射 + 旧文件清理"。
#
# 使用方法：
#   1. CipherCat 侧修复完成并自验（vue-tsc/build）后运行
#   2. 运行此脚本，然后在 metacrypt_server 运行 npm run build 验证
#
# 导入别名转换（CipherCat @/ → metacrypt @/features/blockly/core/）：
#   @/constants/block-types          → @/features/blockly/core/constants/block-types
#   @/blocks/procedure/blocks        → @/features/blockly/core/blocks/procedure/blocks
#   @/utils/migration                → @/features/blockly/core/utils/migration
# 注意：镜像后 metacrypt 的 blocks/index.ts 会被 CipherCat 版本覆盖（含 REMAINING_BLOCK_TYPES
# 合并进 ALL_BLOCK_TYPES，这是期望行为——metacrypt 旧 index 漏了 remaining）。
# metacrypt 专属文件（generators/mcl/、utils/locale.ts、blockly-patches.ts、generator/、
# constants/mcl-highlight.ts）不在镜像范围，保留。

set -e

# 导入别名 sed 转换函数（CipherCat 别名 → metacrypt features/blockly/core 别名）
# 两类转换：
#   a) @/ 绝对别名：CipherCat @/constants/... → metacrypt @/features/blockly/core/...
#   b) 相对目录名（仅 generators/）：CipherCat bit/ → metacrypt bitwise/，postquantum/ → post-quantum/
#      （blocks/ 目录两边同名，不需要；但 generators/ 目录名两边不同，镜像后 index.ts 等
#      相对导入会指向不存在的 ./bit 或 ./postquantum，必须映射）
fix_imports() {
  sed -i \
    -e "s|@/constants/block-types|@/features/blockly/core/constants/block-types|g" \
    -e "s|@/blocks/procedure/blocks|@/features/blockly/core/blocks/procedure/blocks|g" \
    -e "s|@/utils/migration|@/features/blockly/core/utils/migration|g" \
    -e "s|'\./bit'|'./bitwise'|g" \
    -e "s|'\./postquantum'|'./post-quantum'|g" \
    -e "s|'\.\./postquantum/|'../post-quantum/|g" \
    -e "s|'\.\./bit/|'../bitwise/|g" \
    "$1"
}

# 仅 blocks/ 目录不需要相对目录映射（目录名两边一致）；generators/ 需要。
# 调用方按需决定：blocks 文件传 false（跳过相对映射），generators 文件传 true。
fix_imports_blocks() {
  sed -i \
    -e "s|@/constants/block-types|@/features/blockly/core/constants/block-types|g" \
    -e "s|@/blocks/procedure/blocks|@/features/blockly/core/blocks/procedure/blocks|g" \
    -e "s|@/utils/migration|@/features/blockly/core/utils/migration|g" \
    "$1"
}

CIPHER="/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat"
META="/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/metacrypt_server"
CORE="$META/frontend/src/features/blockly/core"

echo "=== CipherCat → metacrypt_server 同步（features/blockly/core 全量镜像）==="

# ─── 1. blocks/ 全量镜像（CipherCat 为权威源）───
echo "[1/4] blocks/ 全量镜像"
# 先清空目标 blocks 内容区（保留目录结构），再复制
# 注意：不能用 rm -rf 整个目录（可能有未跟踪文件），改为：
#   a) 复制 CipherCat 全部 .ts
#   b) 删除 metacrypt 中 CipherCat 不存在的 .ts（旧文件清理）
cd "$CIPHER/src/blocks"
find . -name "*.ts" | while read -r f; do
  mkdir -p "$CORE/blocks/$(dirname "$f")"
  cp "$f" "$CORE/blocks/$f"
  fix_imports_blocks "$CORE/blocks/$f"
done
# 删除 metacrypt 残留但 CipherCat 已不存在的块文件
(cd "$CORE/blocks" && find . -name "*.ts" | while read -r f; do
  [ -f "$CIPHER/src/blocks/$f" ] || { echo "  DEL blocks/$f"; rm "$f"; }
done)

# ─── 2. generators/python/ + generators/javascript/ 全量镜像（目录映射）───
echo "[2/4] generators/ 全量镜像（bit→bitwise, postquantum→post-quantum）"
for gen in python javascript; do
  cd "$CIPHER/src/generators/$gen"
  find . -name "*.ts" | while read -r f; do
    # 目录映射：CipherCat bit/ → metacrypt bitwise/，postquantum/ → post-quantum/
    mf=$(echo "$f" | sed -e 's|^\./bit/|./bitwise/|' -e 's|^\./postquantum/|./post-quantum/|')
    mkdir -p "$CORE/generators/$gen/$(dirname "$mf")"
    cp "$f" "$CORE/generators/$gen/$mf"
    fix_imports "$CORE/generators/$gen/$mf"
  done
  # 删除 metacrypt 残留旧文件（按映射后路径比对）
  (cd "$CORE/generators/$gen" && find . -name "*.ts" | while read -r f; do
    cf=$(echo "$f" | sed -e 's|^\./bitwise/|./bit/|' -e 's|^\./post-quantum/|./postquantum/|')
    [ -f "$CIPHER/src/generators/$gen/$cf" ] || { echo "  DEL generators/$gen/$f"; rm "$f"; }
  done)
done

# ─── 3. constants/block-types.ts 镜像（保留 metacrypt 专属 mcl-highlight.ts）───
echo "[3/4] constants/block-types.ts"
cp "$CIPHER/src/constants/block-types.ts" "$CORE/constants/block-types.ts"
fix_imports_blocks "$CORE/constants/block-types.ts"

# ─── 4. 核对清单 ───
echo "[4/4] 核对"
echo ""
echo "已同步（自动）：blocks/ 全部、generators/{python,javascript}/ 全部、constants/block-types.ts"
echo ""

# ─── 手工核对项（同步后需检查）───
echo "⚠️  以下 metacrypt 专属/手工文件未被覆盖，需人工核对："
echo ""
echo " 1. $CORE/blocks/remaining.ts 中的 MCL 专属块（base64/hex 等）"
echo "    → 若 CipherCat 已删同名块，metacrypt 侧对应生成器也会被删，需确认无残留引用"
echo ""
echo " 2. $CORE/utils/toolbox-config.ts"
echo "    → metacrypt 有 MCL 专属类目，全量镜像未覆盖 utils/；确认块类目仍完整"
echo ""
echo " 3. $CORE/utils/workspace/*.ts、$CORE/utils/migration.ts"
echo "    → metacrypt 专属逻辑（blockly-patches.ts、locale.ts、generator/）保留"
echo ""
echo " 4. metacrypt 侧 demos/（如有）引用已删块（pq_*_vec、gf_mul）需清理"
echo ""
echo "验证：cd $META/frontend && npm run build"
