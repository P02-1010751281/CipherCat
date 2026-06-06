# RULES.md — CipherCat 工程行为准则

本文件定义 CipherCat 项目的唯一工程行为准则，与 `CLAUDE.md` 分工明确：后者约束 AI 即时协作行为，本文件约束代码资产的结构性规则。

## 概述与适用范围

- **适用项目**：CipherCat 项目
- **生效范围**：所有源代码、配置文件、测试代码
- **优先级**：本文件 > 历史习惯 > 个人偏好；与 `CLAUDE.md` 冲突时以本文件为准

## 元规则：如何制定、修改和废除规则

### R-META-01 规则变更必须通过 PR
任何对本文件或 `CLAUDE.md` 的修改必须通过 Pull Request，PR 描述须说明变更理由、影响范围、迁移方案。**验证标准**：直接 commit 修改规则文件视为违规。

### R-META-02 规则豁免流程
紧急情况下需临时违反规则时，必须在 PR 中标注「规则豁免」及对应规则编号，说明原因及恢复时间，获得 reviewer 批准。**验证标准**：无豁免声明的违规视为故意绕过门禁。

### R-META-03 规则可挑战但必须先改规则
对规则的质疑必须通过修改本文件或 `CLAUDE.md` 的 PR 发起；PR 合入前必须严格遵守现行规则。执行删除任务时添加 `@deprecated` 标记不违反 `CLAUDE.md` Rule 3。

## 文件与目录规范

### R-FILE-01 单一职责原则
每个文件只负责一件事：一个 Vue 组件、一个 composable、一个工具函数集合。禁止混合多个独立抽象。**验证标准**：Vue 组件文件不得导出多个组件；工具文件内函数必须属于同一领域；单文件超过 300 行需审查拆分。

### R-FILE-02 文件命名约定
- Vue 组件：PascalCase（`CryptoBlockEditor.vue`）
- TypeScript 模块：camelCase（`codeGenerator.ts`）
- 常量文件：camelCase + `.const.ts`（`blockCategories.const.ts`）
- 类型定义：camelCase + `.types.ts`（`generator.types.ts`）

**验证标准**：运行 `find src -name "*.vue" -o -name "*.ts"` 检查命名一致性。

### R-FILE-03 目录结构与放置
```
src/
├── blocks/          # Blockly 块定义（按密码学类型分组）
├── components/      # Vue 通用组件
├── composables/     # Composition API 逻辑复用
├── constants/       # 常量定义
├── generators/      # 代码生成器（javascript/python）
├── styles/          # 全局样式
├── utils/           # 纯工具函数（无副作用）
```
**验证标准**：新文件必须放入对应职责目录，禁止在 `src/` 根目录创建业务逻辑文件（`main.ts`、`App.vue`、`vite-env.d.ts` 除外）。

## 子包与模块边界规范

### R-MODULE-01 扁平子包结构
`src/blocks/` 和 `src/generators/` 采用一级子目录组织，禁止嵌套超过两层：✅ `blocks/symmetric/sm4.ts`，❌ `blocks/symmetric/block/sm4/core.ts`。**为什么**：减少认知负荷，避免深层嵌套导致导入路径冗长。

### R-MODULE-02 最小化公开接口
每个子目录必须通过 `index.ts` 统一导出，外部模块只能从 `index.ts` 导入。**验证标准**：运行 `grep -r "from '\./blocks/symmetric/" src/` 检查是否有直接导入子模块的行为。

### R-MODULE-03 依赖方向约束
依赖必须单向流动：`generators` → `blocks` → `constants/types`，禁止反向依赖或循环依赖。**验证标准**：使用 `madge` 检测循环依赖：`npx madge --circular src/`

## 代码风格与命名

### R-CODE-01 遵循现有 ESLint 配置
所有代码必须通过 `npm run lint:check`，禁止使用 `// eslint-disable` 抑制警告（除非有充分理由并注释说明）。**验证标准**：合并前必须运行 `npm run lint:check`，退出码为零。

### R-CODE-02 TypeScript 严格模式
必须启用 `tsconfig.json` 中的 `strict: true`，禁止使用 `any` 类型（特殊情况用 `unknown` 并做类型守卫）。**验证标准**：运行 `npm run type-check`，零错误才允许合并。

### R-CODE-03 命名语义化
- 布尔变量/函数：以 `is`、`has`、`can`、`should` 开头（`isValidKey`）
- 回调函数：以 `on` 或 `handle` 开头（`onBlockChange`、`handleGenerateCode`）
- 常量：UPPER_SNAKE_CASE（`MAX_BLOCK_COUNT`）

## 测试与质量门禁

### R-TEST-01 自动化门禁是唯一有效手段
合并前必须全部通过（退出码为零）：
```bash
npm run lint:check      # ESLint 检查
npm run type-check      # TypeScript 类型检查
npm run build           # 构建验证
```
**验证标准**：在 `.git/hooks/pre-commit` 中配置 simple-git-hooks 自动执行上述命令，任一失败则阻止提交。

### R-TEST-02 引入 Vitest 单元测试（待实施）
引入 Vitest 后，所有公共 API 必须有单元测试覆盖：`generators/` 代码生成逻辑、`composables/` 状态管理逻辑、`utils/` 纯函数。**验证标准**：运行 `npm run test`，覆盖率不低于 80%。

### R-TEST-03 测试可维护性
测试必须编码「为什么」而非仅「是什么」：
```typescript
// ✅ 好例子：说明意图
test('SM4 block generates valid Kasm51 IV', () => {
  // IV 必须是 16 字节，符合国密 SM4 标准
  const code = generate(sm4Block);
  expect(code).toMatch(/iv\s*=\s*0x[0-9A-F]{32}/);
});
```

## 安全、性能与日志的硬性规则

### R-SEC-01 禁止硬编码密钥
密码学相关密钥、IV、盐值必须通过参数传入或从安全存储读取。**验证标准**：运行 `grep -rn "0x[0-9A-F]\{32,\}" src/` 检查疑似硬编码密钥。

### R-SEC-02 输入验证
所有来自用户输入（Blockly 工作区、文件上传、API 响应）的数据必须进行类型和范围验证。**为什么**：防止注入攻击和运行时崩溃。

### R-PERF-01 避免不必要的重渲染
Vue 组件中使用 `computed` 缓存派生状态，大型列表使用 `v-memo` 或虚拟滚动。**验证标准**：Chrome DevTools Performance 面板检查组件重渲染次数。

### R-LOG-01 生产环境禁用 console
生产构建中必须移除 `console.log`、`console.debug`，仅保留 `console.error`。**验证标准**：在 Vite 构建配置中添加 `drop: ['console', 'debugger']`。

## 禁止事项

### R-BAN-01 禁止隐式依赖
❌ 依赖全局变量（`window.blocklyWorkspace`）、依赖模块加载顺序；✅ 通过 props、provide/inject、Pinia 显式传递依赖。**验证标准**：代码审查时检查是否存在未声明的全局访问。

### R-BAN-02 禁止可变全局状态
禁止使用 `let` 声明模块级可变变量，状态必须通过 Vue reactive 系统或 Pinia 管理。**为什么**：全局可变状态导致难以追踪的 bug 和测试困难。

### R-BAN-03 禁止魔法字符串
禁止在多处重复使用相同字符串字面量，必须提取为常量：**验证标准**：运行 `grep -rn "'sm4_" src/ | wc -l` 检查重复字符串。

### R-BAN-04 禁止绕过类型检查
禁止使用 `as any`、`// @ts-ignore`、`// @ts-nocheck`，除非在 PR 中说明理由并获得批准。**为什么**：TypeScript 类型系统是防止运行时错误的第一道防线。

### R-BAN-05 禁止过度抽象
禁止为单一调用点创建抽象层，除非能证明未来有真实扩展需求。**验证标准**：代码审查时问「这个抽象是否被两处以上使用？如果没有，能否内联？」

### R-BAN-06 禁止静默失败与滥用异常
所有异步操作必须有错误处理（try-catch 或 `.catch()`），禁止吞掉异常。**但优先使用条件判断而非异常**：能用 if-else 处理的业务逻辑不使用 try-catch，仅对真正的异常场景（网络请求、文件 I/O、第三方 API）使用 try-catch。**验证标准**：代码审查时检查 catch 块是否为空；检查是否用 try-catch 包裹可通过条件判断处理的逻辑。

## 面向删除设计

### R-DEL-01 废弃标记规范
废弃的 API 必须添加 JSDoc `@deprecated` 标记并说明迁移路径：**验证标准**：运行 `grep -rn "@deprecated" src/` 检查废弃 API 是否有迁移说明。

### R-DEL-02 废弃期最少一个主版本
废弃的 API 必须保留至少一个主版本周期（如 v2.x 中标记废弃，v3.0.0 才能删除）。**为什么**：给调用方足够时间迁移，避免破坏性变更。

---
**最后更新**：2026-05-27 | **下次审查**：2026-08-27（每季度审查）
