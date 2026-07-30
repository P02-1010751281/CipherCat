#!/bin/bash
# CipherCat → metacrypt_server 同步脚本
# 将 CipherCat 的 Blockly 核心改动同步到 metacrypt_server
#
# 使用方法：
#   1. 确保 metacrypt_server 文件系统可写（可能需要 remount）
#   2. 运行此脚本

set -e

CIPHER="/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat"
META="/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/metacrypt_server"

echo "=== CipherCat → metacrypt_server 同步 ==="

# ─── 1. 类型常量文件 ───
echo "[1/7] 类型常量: block-types.ts"
cp "$CIPHER/src/constants/block-types.ts" \
   "$META/frontend/src/blockly/constants/block-types.ts"

# ─── 2. procedure 块定义 ───
echo "[2/7] procedure 块定义"
mkdir -p "$META/frontend/src/blockly/blocks/procedure"
cp "$CIPHER/src/blocks/procedure/"*.ts \
   "$META/frontend/src/blockly/blocks/procedure/"

# ─── 3. procedure JS 生成器 ───
echo "[3/7] procedure JS 生成器"
mkdir -p "$META/frontend/src/blockly/generators/javascript/procedure"
cp "$CIPHER/src/generators/javascript/procedure/"*.ts \
   "$META/frontend/src/blockly/generators/javascript/procedure/"

# ─── 4. procedure Python 生成器 ───
echo "[4/7] procedure Python 生成器"
mkdir -p "$META/frontend/src/blockly/generators/python/procedure"
cp "$CIPHER/src/generators/python/procedure/"*.ts \
   "$META/frontend/src/blockly/generators/python/procedure/"

# ─── 5. 块类型约束（setCheck/setOutput）─ 完整文件覆盖 ───
echo "[5/7] 块类型约束（完整文件覆盖）"
for f in \
  src/blocks/data/number.ts \
  src/blocks/data/measurement.ts \
  src/blocks/bitwise/operation.ts \
  src/blocks/bitwise/not.ts \
  src/blocks/bitwise/expression.ts \
  src/blocks/bitwise/rotate.ts \
  src/blocks/post-quantum/basic/encoding.ts \
  src/blocks/post-quantum/basic/compress.ts \
  src/blocks/post-quantum/basic/operations.ts \
  src/blocks/post-quantum/advanced/sampling.ts \
  src/blocks/post-quantum/advanced/operations.ts \
  src/blocks/hash/sha256.ts \
  src/blocks/hash/sm3.ts \
  src/blocks/hash/sha3.ts \
  src/blocks/hash/shake.ts \
  src/blocks/numtheory/poly-add.ts \
  src/blocks/numtheory/ntt.ts \
  src/blocks/index.ts; do
  dest="$META/frontend/src/blockly/blocks/$(echo $f | sed 's|src/blocks/||')"
  mkdir -p "$(dirname "$dest")"
  sed "s|from '@/constants/block-types'|from '@/blockly/constants/block-types'|g" "$CIPHER/$f" > "$dest"
  echo "  $f"
done

# ─── 6. 生成器修复 ───
echo "[6/7] 生成器修复"
cp "$CIPHER/src/generators/python/bit/expression.ts" \
   "$META/frontend/src/blockly/generators/python/bitwise/expression.ts"
cp "$CIPHER/src/generators/javascript/array/partition.ts" \
   "$META/frontend/src/blockly/generators/javascript/array/partition.ts"

# ─── 7. ESLint 配置 ───
echo "[7/7] ESLint 配置（如存在 .cargo 目录）"
if [ -d "$META/.cargo" ] && [ -f "$META/eslint.config.js" ]; then
  grep -q '.cargo' "$META/eslint.config.js" || \
    sed -i "s|\*\*/target/\*\*',|\*\*/target/\*\*',\n      '**/.cargo/**',|" \
    "$META/eslint.config.js"
  echo "  eslint.config.js 已更新"
else
  echo "  跳过（无 .cargo 目录）"
fi

echo ""
echo "=== 同步完成 ==="
echo ""
echo "⚠️  以下文件需要手动编辑（因为 metacrypt_server 可能有 MCL 等额外内容）："
echo ""
echo " 1. $META/frontend/src/blockly/blocks/index.ts"
echo "    → 添加: export * from './procedure';"
echo "    → 导入 PROCEDURE_BLOCK_TYPES 和 ProcedureBlockType"
echo "    → 在 ALL_BLOCK_TYPES 和 AllBlockType 中加入 procedure 类型"
echo ""
echo " 2. $META/frontend/src/blockly/generators/javascript/index.ts"
echo "    → 添加: import './procedure';"
echo ""
echo " 3. $META/frontend/src/blockly/generators/python/index.ts"
echo "    → 添加: import './procedure';"
echo ""
echo " 4. $META/frontend/src/blockly/utils/toolbox-config.ts"
echo "    → procedure 分类改用 PROCEDURE_CATEGORY_KEY"
echo "    → 参考 CipherCat: src/utils/toolbox-config.ts"
echo ""
echo " 5. $META/frontend/src/blockly/utils/workspace/core.ts"
echo "    → 注册 registerProcedureCategoryCallbacks"
echo ""
echo "参考文件位置: $CIPHER/src/blocks/index.ts (已同步)"
echo "请在 metacrypt_server 中运行: npm run lint:check && npm run build"
