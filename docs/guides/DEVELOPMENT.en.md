# CipherCat Development Guide

> [中文](./DEVELOPMENT.md)

## Environment Setup

Please refer to the "Quick Start" section of the project root [README.md](../README.en.md):

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器 → http://localhost:3001
npm run build        # 构建生产版本
npm run tauri:dev    # Tauri 桌面开发模式
npm run tauri:build  # Tauri 打包
```

> **Note**: The project currently has no formal test framework configured. Confirm the test toolchain adopted by the project before adding tests.

---

## How to Add a New Blockly Block

Using the addition of a post-quantum basic block as an example, the full workflow is as follows:

### Step 1: Define the Block

Create a file under `src/blocks/<category>/`, placing it in the directory matching its category:

```
src/blocks/post-quantum/basic/your-block.ts
```

Follow the existing naming conventions and block definition patterns:

```typescript
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_INT_LIST } from '@/constants/block-types';

// 1. 在文件顶部声明块类型常量
export const YOUR_BLOCK_TYPES = ['pq_your_block'] as const;
export type YourBlockType = (typeof YOUR_BLOCK_TYPES)[number];

// 2. 通过 Blockly.Blocks 注册块定义
Blockly.Blocks['pq_your_block'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(TYPE_BYTES)  // 使用类型常量，而非 null
      .appendField('YourBlock(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);  // 输出类型
    this.setColour(230);             // 后量子类目色号
    this.setTooltip('Your block description');
    this.setHelpUrl('https://...');
  },
};
```

**Naming conventions**:
- Block type name: `<category>_<block_name>` in lowercase snake_case, e.g. `pq_bytes_to_bits`
- File naming: lowercase snake_case matching the block type, e.g. `bytes-to-bits.ts` or `encoding.ts`
- Exported constants: uppercase snake_case, e.g. `ENCODING_BLOCK_TYPES`

> See the existing implementation: `src/blocks/post-quantum/basic/encoding.ts`

### Step 2: Register in the Category's index.ts

Export the new file and merge the types in the `index.ts` of the owning category:

```typescript
// src/blocks/post-quantum/basic/index.ts
export * from './your-block';

import { YOUR_BLOCK_TYPES, type YourBlockType } from './your-block';
import { OTHER_BLOCK_TYPES, type OtherBlockType } from './other';

export const PQ_BASIC_BLOCK_TYPES = [
  ...YOUR_BLOCK_TYPES,
  ...OTHER_BLOCK_TYPES,
] as const;

export type PqBasicBlockType = YourBlockType | OtherBlockType;
```

### Step 3: Add to the Toolbox Configuration

In `src/utils/toolbox-config.ts`, if the block type is newly defined, import it and add it to the `contents` array of the corresponding category:

```typescript
import { YOUR_BLOCK_TYPES } from '@/blocks/post-quantum/basic/your-block';

// 在 postquantumBasic 类目的 contents 中追加
const postquantumBasic = {
  kind: "category",
  name: msg.CRYPTO_CATEGORY_POSTQUANTUM_BASIC || "Post-Quantum Basic",
  colour: "#5C5CA6",
  contents: [
    ...PQ_BASIC_BLOCK_TYPES.map((type) => ({ kind: "block" as const, type })),
  ],
};
```

> Note: If the block type is already included in the `PQ_BASIC_BLOCK_TYPES` union type (exported from the parent index.ts), the existing code usually picks it up automatically, and no manual changes to `toolbox-config.ts` are needed.

### Step 4: Add the JavaScript Code Generator

Create the corresponding file under `src/generators/javascript/<category>/`:

```typescript
// src/generators/javascript/postquantum/basic/your-block.ts
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['pq_your_block'] = function (block: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'input';

  const funcName = javascriptGenerator.provideFunction_('yourFunction', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(data) {',
    '  // 你的实现逻辑',
    '  return data;',
    '}'
  ]);

  return [`${funcName}(${input})`, Order.ATOMIC];
};
```

Then import it in `src/generators/javascript/<category>/index.ts`:

```typescript
import './basic/your-block';
```

### Step 5: Add the Python Code Generator

Create the corresponding file under `src/generators/python/<category>/` (the pattern is symmetric to the JS generator):

```typescript
// src/generators/python/postquantum/basic/your-block.ts
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['pq_your_block'] = function (block: Block): [string, number] {
  const input = pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'input';

  const funcName = pythonGenerator.provideFunction_('your_function', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(data):',
    '    # 你的实现逻辑',
    '    return data',
  ]);

  return [funcName + '(' + input + ')', Order.ATOMIC];
};
```

Then import it in `src/generators/python/<category>/index.ts`:

```typescript
import './basic/your-block';
```

### Step 6: Top-Level Generator Imports

Make sure `src/generators/javascript/index.ts` and `src/generators/python/index.ts` import the corresponding category's `index.ts` (this is usually already the case, so no duplicate work is needed):

```typescript
// src/generators/javascript/index.ts
import './postquantum';  // 已导入 postquantum/index.ts → 递归导入所有子模块

// src/generators/python/index.ts
import './postquantum';  // 同上
```

### Step 7: Add Internationalization Translations

Add the translation keys for the block label and tooltip to both the `MESSAGES_ZH_HANS` and `MESSAGES_EN` objects in `src/composables/locale.ts`.

**Chinese** (`MESSAGES_ZH_HANS`):

```typescript
// 积木块标签
CRYPTO_YOUR_BLOCK: '你的积木',
CRYPTO_YOUR_BLOCK_TOOLTIP: '你的积木功能描述',
```

**English** (`MESSAGES_EN`):

```typescript
CRYPTO_YOUR_BLOCK: 'Your Block',
CRYPTO_YOUR_BLOCK_TOOLTIP: 'Description of your block',
```

**Referencing the translation in the block definition**:

```typescript
Blockly.Blocks['pq_your_block'] = {
  init: function () {
    // ...
    this.setTooltip(Blockly.Msg['CRYPTO_YOUR_BLOCK_TOOLTIP']);
  },
};
```

---

## Block Category Quick Reference

| Category | blocks directory | generators JS directory | generators Python directory |
|------|------------|-------------------|----------------------|
| Control flow | `src/blocks/ctrl/` | `src/generators/javascript/ctrl/` | `src/generators/python/ctrl/` |
| Data & conversion | `src/blocks/data/` | `src/generators/javascript/data/` | `src/generators/python/data/` |
| Arrays | `src/blocks/array/` | `src/generators/javascript/array/` | `src/generators/python/array/` |
| Logic | `src/blocks/logic/` | `src/generators/javascript/logic/` | `src/generators/python/logic/` |
| Bitwise | `src/blocks/bitwise/` | `src/generators/javascript/bit/` | `src/generators/python/bit/` |
| S-Box | `src/blocks/sbox/` | `src/generators/javascript/sbox/` | `src/generators/python/sbox/` |
| Hash | `src/blocks/hash/` | `src/generators/javascript/hash/` | `src/generators/python/hash/` |
| Number theory | `src/blocks/numtheory/` | `src/generators/javascript/numtheory/` | `src/generators/python/numtheory/` |
| Elliptic curve | `src/blocks/ecc/` | `src/generators/javascript/ecc/` | `src/generators/python/ecc/` |
| Post-quantum | `src/blocks/post-quantum/` | `src/generators/javascript/postquantum/` | `src/generators/python/postquantum/` |
| Procedure | `src/blocks/procedure/` | `src/generators/javascript/procedure/` | `src/generators/python/procedure/` |

> Note: The blocks and generators directories are named slightly differently (`bitwise` vs `bit`, `post-quantum` vs `postquantum`); just follow the existing pattern.

---

## Build and Type-Check Commands

```bash
npm run dev          # 开发服务器 (Vite)
npm run build        # 生产构建 (vue-tsc + Vite)
npm run preview      # 预览生产构建
npm run tauri:dev    # Tauri 桌面开发
npm run tauri:build  # Tauri 桌面打包
npm run lint         # ESLint 检查
npm run typecheck    # vue-tsc 类型检查 (如有配置)
```

---

## Code Style Conventions

- **TypeScript**: strict mode, Vue 3 Composition API + `<script setup lang="ts">`
- **File naming**: PascalCase for Vue components, camelCase for TS modules
- **Block definition style**: register directly via `Blockly.Blocks['block_name']`, without wrapping in an extra abstraction layer
- **Generator style**: use `generator.forBlock['block_name']` + `generator.provideFunction_()` to inject helper functions
- **Import order**: standard library → third-party libraries → project-internal modules (alias `@/`)

For the complete engineering behavior guidelines, see [RULES.md](../../RULES.md), which covers file conventions, type conventions, naming conventions, and more.

---

## Testing

The project currently has no formal test framework configured. During development:

- Manually verify block rendering and interaction in the browser
- Manually verify the correctness of the generated JavaScript / Python code
- Run the TypeScript type check (`npm run typecheck`)
- Run ESLint (`npm run lint`)

If you have testing needs, Vitest (compatible with the Vite ecosystem) or Playwright (for end-to-end testing) is recommended.

---

## Common Tasks

### Modifying Block Appearance

Modify the `setColour()` setting in the block definition to change the color, or modify `setInputsInline()` / `setOutput()` to change how connections work.

### Adding a New Code Generation Language

1. Create a new language directory under `src/generators/`
2. Register a generation function for the new language for each block
3. Add a language enum in `src/constants/code-languages.ts`
4. Update the `generateCode()` function in `src/composables/generator.ts`

### Block Type Migration

If an old block type is renamed or deprecated, add a mapping entry to `BLOCK_TYPE_MIGRATION_MAP` in `src/utils/migration.ts`. This mapping automatically converts old block names when a workspace is loaded.

---

## Reference Links

- [Blockly Developer Documentation](https://developers.google.com/blockly/guides/overview)
- [Vue 3 Documentation](https://vuejs.org/guide/introduction)
- [Tauri Documentation](https://v2.tauri.app/start/)
- [FIPS 202 (SHA-3)](../standards/fips202-SHA3/)
- [FIPS 203 (ML-KEM)](../standards/fips203-ML-KEM/)
- [FIPS 204 (ML-DSA)](../standards/fips204-ML-DSA/)
