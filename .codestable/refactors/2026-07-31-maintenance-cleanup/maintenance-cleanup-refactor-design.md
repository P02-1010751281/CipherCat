---
doc_type: refactor-design
refactor: 2026-07-31-maintenance-cleanup
status: draft
scope: "procedure 模板清单收敛 + 死样式/死键删除 + 类型登记补全（审计 finding-14/15/16/17）"
summary: "4 条结构清理，全为低风险 AI 可自证"
---

# maintenance-cleanup refactor design

## 1. 本次范围

- scan 勾选：#1（清单收敛）、#2（死样式）、#3（死键）、#4（类型登记）——全部 ✓
- 明确不做：无（4 条全选）
- 预估总工作量：约 150 行改动 / 6 文件 / 低风险档

## 2. 前置依赖

- 测试覆盖：纯声明式内容（样式 / 静态键表 / 静态清单 / 类型联合），豁免 characterization test
- 调用方搜索：改动前 grep 确认——`TEMPLATE_TYPES` 引用点、死键零引用逐键确认、`ALL_BLOCK_TYPES`/`AllBlockType` 消费者（仅 index.ts）
- 无其他一次性准备

## 3. 执行顺序

按低风险 + 独立性排序（#4 → #2 → #3 → #1），每条之间无依赖，单步可回滚。

### 步骤 1：#4 把 remaining.ts 13 块纳入 ALL_BLOCK_TYPES

- 引用方法：M-L1-01（Parallel Change）
- 具体操作：remaining.ts 末尾导出 `export const BLOCK_TYPES = [...] as const`（13 个已注册块名）；index.ts 的 `ALL_BLOCK_TYPES` 数组加入 `...REMAINING_BLOCK_TYPES`（或同义导入），`AllBlockType` 联合并入对应成员
- 退出信号：vue-tsc 通过；`ALL_BLOCK_TYPES` 长度 +13
- 验证责任：AI 自证
- 回滚：git revert 本步

### 步骤 2：#2 删除 BlocklyEditor.vue 死样式

- 引用方法：M-L2-09（Remove Dead Code）
- 具体操作：删除 `:deep(.blocklyToolboxDiv)`（:143/:173 两处）、`:deep(.blocklyTreeRow)`（:149）、`:deep(.blocklyTreeSelected)`（:160）四条规则
- 退出信号：vue-tsc 通过；grep 无 blocklyToolboxDiv/blocklyTreeRow 残留；浏览器工具箱渲染无差异
- 验证责任：AI 自证
- 回滚：git revert 本步

### 步骤 3：#3 删除 locale.ts 死键

- 引用方法：M-L2-09（Remove Dead Code）
- 具体操作：逐键 grep 确认零引用后删除 14 对死键（ZH+EN 同步）；合并语义重复键对（保留实际使用的 `CRYPTO_FUNCTIONS_*`）
- 退出信号：vue-tsc 通过；每键 grep 零引用；浏览器中/英切换面板正常
- 验证责任：AI 自证
- 回滚：git revert 本步

### 步骤 4：#1 模板清单收敛为单一数据源

- 引用方法：M-L1-01（Parallel Change）
- 具体操作：blocks.ts 从 `TEMPLATE_REGISTRY` 导出模板类型清单（`export const TEMPLATE_TYPES = Object.keys(TEMPLATE_REGISTRY) as const` 或等价的显式导出）；JS/PY 生成器 TEMPLATE_TYPES 删除幻影 `crypto_func_def` 并改为从注册表导入；CryptoFunctionPanel buildCategories 从注册表派生；删除配套死键 `CRYPTO_FUNC_DEF_LABEL`
- 退出信号：vue-tsc + vite build 通过；grep 无 crypto_func_def 残留；浏览器拖出模板/生成代码冒烟正常
- 验证责任：AI 自证
- 回滚：git revert 本步

## 4. 风险与看点

- 高风险步骤：无（全部低风险）
- 容易出错的点：
  - #1 注册表派生顺序与 panel 子类目分组——panel 按 5 子类目分组展示，若改从注册表派生需保留分组结构（注册表可增加 category 字段或 panel 保持分组逻辑仅清单来源切换）
  - #3 死键删除前必须逐键 grep（含字符串模板引用场景）
  - #4 幻影条目删除前确认无任何运行时依赖（call 块下拉、flyout 回调均不读 TEMPLATE_TYPES 的 crypto_func_def）
