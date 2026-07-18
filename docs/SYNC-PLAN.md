# CipherCat → metacrypt_server 同步计划书

## 一、背景

CipherCat（薛定喵编辑器）近期完成了以下改进，需要回合到 metacrypt_server：

| 改进项 | 说明 |
|--------|------|
| 类型系统 | 新增 `block-types.ts`：Bytes/IntList/SBox 类型常量 + TYPE_MAP 语言对齐表 |
| 函数封装 | 新增 `procedure/` 类目：预置加密/解密/哈希模板、独立 return 块、导入导出功能 |
| 类型约束 | 16 个文件的块定义添加了 setCheck/setOutput 类型检查 |
| 生成器修复 | Python bit_expr_infix 32-bit 截断、JS arr_partition 字节容器类型保留 |
| 文档更新 | ARCHITECTURE.md / DEVELOPMENT.md / docs/README.md |

metacrypt_server 与 CipherCat 共享同一套 Blockly 积木块和代码生成器核心，需要同步上述全部改动。

## 三、自动同步（执行脚本）

```bash
cd /run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat
bash scripts/sync-to-metacrypt.sh
```

该脚本完成以下 7 步文件复制：

### 3.1 类型常量

| 源 (CipherCat) | 目标 (metacrypt_server) |
|---------------|------------------------|
| `src/constants/block-types.ts` | `frontend/src/blockly/constants/block-types.ts` |

### 3.2 procedure 块定义（3 个文件）

| 源 | 目标 |
|---|------|
| `src/blocks/procedure/index.ts` | `frontend/src/blockly/blocks/procedure/index.ts` |
| `src/blocks/procedure/blocks.ts` | `frontend/src/blockly/blocks/procedure/blocks.ts` |
| `src/blocks/procedure/category.ts` | `frontend/src/blockly/blocks/procedure/category.ts` |

### 3.3 procedure 生成器（4 个文件）

| 源 | 目标 |
|---|------|
| `src/generators/javascript/procedure/index.ts` | `frontend/src/blockly/generators/javascript/procedure/index.ts` |
| `src/generators/javascript/procedure/blocks.ts` | `frontend/src/blockly/generators/javascript/procedure/blocks.ts` |
| `src/generators/python/procedure/index.ts` | `frontend/src/blockly/generators/python/procedure/index.ts` |
| `src/generators/python/procedure/blocks.ts` | `frontend/src/blockly/generators/python/procedure/blocks.ts` |

### 3.4 类型约束覆盖（18 个文件）

| 类目 | 文件 | 改动摘要 |
|------|------|---------|
| data | `blocks/data/number.ts` | seed_bytes→Bytes, cipher_key_from_seed→IntList |
| data | `blocks/data/measurement.ts` | 输出→Number |
| bitwise | `blocks/bitwise/operation.ts` | 输入/输出→Number |
| bitwise | `blocks/bitwise/not.ts` | 输入/输出→Number |
| bitwise | `blocks/bitwise/expression.ts` | 输入/输出→Number |
| bitwise | `blocks/bitwise/rotate.ts` | Input→Number |
| post-quantum | `blocks/post-quantum/basic/encoding.ts` | Bytes↔IntList |
| post-quantum | `blocks/post-quantum/basic/compress.ts` | IntList→Bytes, Bytes→IntList |
| post-quantum | `blocks/post-quantum/basic/operations.ts` | all→Bytes |
| post-quantum | `blocks/post-quantum/advanced/sampling.ts` | SEED→Bytes, 输出→IntList |
| post-quantum | `blocks/post-quantum/advanced/operations.ts` | SEED→Bytes, 输出→Bytes/IntList |
| hash | `blocks/hash/sha256.ts` | pad→Bytes |
| hash | `blocks/hash/sm3.ts` | pad→Bytes |
| hash | `blocks/hash/sha3.ts` | pad→Bytes, absorb BLOCK→Bytes, squeeze→Bytes |
| hash | `blocks/hash/shake.ts` | XOF/PRF 类型标注 |
| numtheory | `blocks/numtheory/poly-add.ts` | 输入/输出→IntList |
| numtheory | `blocks/numtheory/ntt.ts` | 输入/输出→IntList |
| core | `blocks/index.ts` | 注册 procedure 导出 |

### 3.5 生成器修复（2 个文件）

| 源 | 目标 | 修复内容 |
|---|------|---------|
| `src/generators/python/bit/expression.ts` | `frontend/src/blockly/generators/python/bit/expression.ts` | XOR/AND/OR 添加 `& 0xFFFFFFFF` 32-bit 截断 |
| `src/generators/javascript/array/partition.ts` | `frontend/src/blockly/generators/javascript/array/partition.ts` | 字节容器(B/Block/padded/data/state)保持 Uint8Array |

### 3.6 ESLint 配置

```javascript
// eslint.config.js — ignores 数组追加
'**/.cargo/**',
```

## 四、手动编辑（5 项）

以下文件因 metacrypt_server 有额外内容（MCL 生成器等），不能直接覆盖，需手动插入。

### 4.1 `frontend/src/blockly/blocks/index.ts`

**添加导出**（在 `export * from './post-quantum';` 之后）：
```typescript
export * from './procedure';
```

**添加导入**（在 post-quantum 导入块之后）：
```typescript
import {
  PROCEDURE_BLOCK_TYPES,
  type ProcedureBlockType,
} from './procedure';
```

**在 ALL_BLOCK_TYPES 数组中追加**：
```typescript
  ...PROCEDURE_BLOCK_TYPES,
```

**在 AllBlockType 联合类型中追加**：
```typescript
  | ProcedureBlockType;
```

### 4.2 `frontend/src/blockly/generators/javascript/index.ts`

在 `import './postquantum';` 之后添加：
```typescript
import './procedure';
```

### 4.3 `frontend/src/blockly/generators/python/index.ts`

同上。

### 4.4 `frontend/src/blockly/utils/toolbox-config.ts`

```typescript
// 1. 顶部添加导入
import { PROCEDURE_CATEGORY_KEY } from '@/blockly/blocks/procedure/category';

// 2. 找到 procedure 分类定义，将
custom: 'PROCEDURE',
// 改为
custom: PROCEDURE_CATEGORY_KEY,
```

### 4.5 `frontend/src/blockly/utils/workspace/core.ts`（或对应文件）

```typescript
// 1. 添加导入
import { registerProcedureCategoryCallbacks } from '@/blockly/blocks/procedure/category';

// 2. 在 workspace 初始化处（registerSboxCategoryCallbacks 之后）添加调用：
registerProcedureCategoryCallbacks(workspace);
```

> 注意：metacrypt_server 的 workspace 初始化文件路径可能与 CipherCat 略有不同，请搜索 `registerSboxCategoryCallbacks` 定位。

## 五、验证

同步完成后在 metacrypt_server 目录执行：

```bash
cd /run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/metacrypt_server/frontend
npm run lint:check
npm run type-check
npm run build
```

三项应全部通过。

## 六、文件清单汇总

| 类别 | 文件数 | 方式 |
|------|--------|------|
| 类型常量 | 1 | 自动复制 |
| procedure 块定义 | 3 | 自动复制 |
| procedure 生成器 | 4 | 自动复制 |
| 类型约束覆盖 | 18 | 自动复制 |
| 生成器修复 | 2 | 自动复制 |
| ESLint | 1 | 自动复制 |
| 手动编辑 | 5 | 手动插入代码 |
| **总计** | **34** | |

## 七、执行步骤总结

```
1. sudo mount -o remount,rw /run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c
2. bash scripts/sync-to-metacrypt.sh
3. 按第四章逐项手动编辑 5 个文件
4. npm run type-check && npm run lint:check && npm run build
```
