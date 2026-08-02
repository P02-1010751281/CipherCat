# Attention

本文件是 CodeStable 技能启动必读的项目注意事项入口。所有 CodeStable 子技能开始工作前必须读取它。

## 报告语言

CodeStable 所有落盘产出的正文用**中文**：plan / design、plan review / design-review、code review、QA、验收、issue（report / analysis / fix-note）、refactor、roadmap、goal、沉淀（compound）等所有人读报告都用中文表达。机器状态（YAML / JSON / `state.yaml` / frontmatter 字段）保持机读格式不翻译。如需改默认语言，改这一节。

## 项目碎片知识

<!-- cs-note managed: 用 cs-note 维护，新条目按下面分节追加 -->

### 编译与构建

### 运行与本地起服务

### 测试

### 命令与脚本陷阱

### 路径与目录约定

### 环境变量与凭证

### 其他

- **不滥用 try/catch（及 Rust `expect`）：有抛出必有处理**。`catch` 必须给出实际处理——日志上报（`console.warn(e)`）或定义明确的回退行为；禁止空吞 `catch {}` / noop。`expect()` 仅用于不可恢复的启动初始化路径。
- **文档慎用 ASCII art 盒图**（┌─┐│ 嵌套图容易对不齐）：优先 mermaid（docs-site / GitHub 均支持；CipherCat DocsView 已支持）或 markdown 表格/列表；缩进树（├── └──）不受影响。
