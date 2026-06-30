# CipherCat 开发指南

## 环境搭建

请参阅项目根目录 [README.md](../README.md) 的"快速开始"部分：

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器 → http://localhost:3001
npm run build        # 构建生产版本
npm run tauri:dev    # Tauri 桌面开发模式
npm run tauri:build  # Tauri 打包
```

> **注意**：当前项目没有正式的测试框架配置。添加测试前请先确认项目采用的测试工具链。

---

## 如何添加一个新的 Blockly 积木块

以添加一个后量子基础积木块为例，完整流程如下：

### 第一步：定义积木块

在 `src/blocks/<category>/` 下创建文件，按照类别放入对应目录：

```
src/blocks/post-quantum/basic/your-block.ts
```

遵循既有的命名规范和块定义模式：

```typescript
import * as Blockly from 'blockly/core';

// 1. 在文件顶部声明块类型常量
export const YOUR_BLOCK_TYPES = ['pq_your_block'] as const;
export type YourBlockType = (typeof YOUR_BLOCK_TYPES)[number];

// 2. 通过 Blockly.Blocks 注册块定义
Blockly.Blocks['pq_your_block'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(null)
      .appendField('YourBlock(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);             // 后量子类目色号
    this.setTooltip('Your block description');
    this.setHelpUrl('https://...');
  },
};
```

**命名规范**：
- 块类型名：`<category>_<block_name>` 小写下划线，如 `pq_bytes_to_bits`
- 文件命名：与块类型对应的小写下划线，如 `bytes-to-bits.ts` 或 `encoding.ts`
- 导出常量：全大写下划线，如 `ENCODING_BLOCK_TYPES`

> 参考现有实现：`src/blocks/post-quantum/basic/encoding.ts`

### 第二步：注册到类目的 index.ts

在所属类目的 `index.ts` 中导出新文件并合并类型：

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

### 第三步：添加到工具箱配置

在 `src/utils/toolbox-config.ts` 中，如果块类型是新定义的，将其导入并添加到对应类目的 `contents` 数组：

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

> 注意：如果块类型已经包含在 `PQ_BASIC_BLOCK_TYPES` 联合类型中（已在父 index.ts 中导出），现有代码通常会自动包含，不需要单独干涉 `toolbox-config.ts`。

### 第四步：添加 JavaScript 代码生成器

在 `src/generators/javascript/<category>/` 下创建对应文件：

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

然后在 `src/generators/javascript/<category>/index.ts` 中导入：

```typescript
import './basic/your-block';
```

### 第五步：添加 Python 代码生成器

在 `src/generators/python/<category>/` 下创建对应文件（模式与 JS 生成器对称）：

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

然后在 `src/generators/python/<category>/index.ts` 中导入：

```typescript
import './basic/your-block';
```

### 第六步：生成器顶层导入

确保 `src/generators/javascript/index.ts` 和 `src/generators/python/index.ts` 已导入对应类目的 `index.ts`（通常已有，无需重复操作）：

```typescript
// src/generators/javascript/index.ts
import './postquantum';  // 已导入 postquantum/index.ts → 递归导入所有子模块

// src/generators/python/index.ts
import './postquantum';  // 同上
```

### 第七步：添加国际化翻译

在 `src/composables/locale.ts` 的 `MESSAGES_ZH_HANS` 和 `MESSAGES_EN` 对象中同时添加积木块标签和工具提示的翻译键。

**中文**（`MESSAGES_ZH_HANS`）：

```typescript
// 积木块标签
CRYPTO_YOUR_BLOCK: '你的积木',
CRYPTO_YOUR_BLOCK_TOOLTIP: '你的积木功能描述',
```

**英文**（`MESSAGES_EN`）：

```typescript
CRYPTO_YOUR_BLOCK: 'Your Block',
CRYPTO_YOUR_BLOCK_TOOLTIP: 'Description of your block',
```

**在块定义中引用翻译**：

```typescript
Blockly.Blocks['pq_your_block'] = {
  init: function () {
    // ...
    this.setTooltip(Blockly.Msg['CRYPTO_YOUR_BLOCK_TOOLTIP']);
  },
};
```

---

## 积木块类目速查

| 类目 | blocks 目录 | generators JS 目录 | generators Python 目录 |
|------|------------|-------------------|----------------------|
| 控制流 | `src/blocks/ctrl/` | `src/generators/javascript/ctrl/` | `src/generators/python/ctrl/` |
| 数据与转换 | `src/blocks/data/` | `src/generators/javascript/data/` | `src/generators/python/data/` |
| 数组 | `src/blocks/array/` | `src/generators/javascript/array/` | `src/generators/python/array/` |
| 逻辑 | `src/blocks/logic/` | `src/generators/javascript/logic/` | `src/generators/python/logic/` |
| 位运算 | `src/blocks/bitwise/` | `src/generators/javascript/bit/` | `src/generators/python/bit/` |
| S-Box | `src/blocks/sbox/` | `src/generators/javascript/sbox/` | `src/generators/python/sbox/` |
| 哈希 | `src/blocks/hash/` | `src/generators/javascript/hash/` | `src/generators/python/hash/` |
| 数论 | `src/blocks/numtheory/` | `src/generators/javascript/numtheory/` | `src/generators/python/numtheory/` |
| 椭圆曲线 | `src/blocks/ecc/` | `src/generators/javascript/ecc/` | `src/generators/python/ecc/` |
| 后量子 | `src/blocks/post-quantum/` | `src/generators/javascript/postquantum/` | `src/generators/python/postquantum/` |

> 注意：blocks 目录和 generators 目录的命名略有不同（`bitwise` vs `bit`, `post-quantum` vs `postquantum`），遵循现有模式即可。

---

## 构建与类型检查命令

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

## 代码风格约定

- **TypeScript**: 严格模式，Vue 3 Composition API + `<script setup lang="ts">`
- **文件命名**: Vue 组件 PascalCase，TS 模块 camelCase
- **块定义风格**: 使用 `Blockly.Blocks['block_name']` 直接注册，不封装额外抽象层
- **生成器风格**: 使用 `generator.forBlock['block_name']` + `generator.provideFunction_()` 注入辅助函数
- **导入顺序**: 标准库 → 第三方库 → 项目内部模块 (alias `@/`)

完整的工程行为准则请参阅 [RULES.md](../RULES.md)，涵盖文件规范、类型规范、命名约定等。

---

## 测试

当前项目没有正式的测试框架配置。在开发过程中：

- 手动验证积木块在浏览器中的渲染和交互
- 手动验证生成的 JavaScript / Python 代码的正确性
- 检查 TypeScript 类型 (`npm run typecheck`)
- 检查 ESLint (`npm run lint`)

如果有测试需求，建议使用 Vitest（与 Vite 生态兼容）或 Playwright（端到端测试）。

---

## 常见任务

### 修改积木块外观

修改块定义中的 `setColour()` 设置色号，或修改 `setInputsInline()` / `setOutput()` 改变连接方式。

### 添加新的代码生成语言

1. 在 `src/generators/` 下创建新语言目录
2. 为每个积木块注册对应语言的生成函数
3. 在 `src/constants/code-languages.ts` 添加语言枚举
4. 更新 `src/composables/generator.ts` 中的 `generateCode()` 函数

### 积木块类型迁移

如果重命名或废弃了旧积木块类型，需要在 `src/utils/migration.ts` 的 `BLOCK_TYPE_MIGRATION_MAP` 中添加映射记录。该映射会在工作区加载时自动转换旧块名。

---

## 参考链接

- [Blockly 开发者文档](https://developers.google.com/blockly/guides/overview)
- [Vue 3 文档](https://vuejs.org/guide/introduction)
- [Tauri 文档](https://v2.tauri.app/start/)
- [FIPS 202 (SHA-3)](./fips202-SHA3/)
- [FIPS 203 (ML-KEM)](./fips203-ML-KEM/)
- [FIPS 204 (ML-DSA)](./fips204-ML-DSA/)
