# CipherCat 系统架构

## 总体架构

```
┌──────────────────────────────────────────────────────────┐
│                     Tauri 桌面壳层                         │
│  ┌────────────────────────────────────────────────────┐  │
│  │                 Vue 3 前端应用                       │  │
│  │                                                     │  │
│  │  ┌──────────────┐  ┌────────────┐  ┌────────────┐  │  │
│  │  │  ProjectList  │  │   Editor   │  │  Views /   │  │  │
│  │  │  (项目管理)    │  │  (编辑器)   │  │  App.vue   │  │  │
│  │  └──────┬───────┘  └─────┬──────┘  └────────────┘  │  │
│  │         │                │                          │  │
│  │  ┌──────┴───────┐  ┌─────┴──────────────────────┐  │  │
│  │  │   Composables  │  │      Components           │  │  │
│  │  │  · locale.ts   │  │  ┌──────────────────┐    │  │  │
│  │  │  · generator.ts│  │  │ BlocklyEditor.vue │    │  │  │
│  │  │  · useEditor   │  │  │ (封装 Blockly      │    │  │  │
│  │  │    Project.ts  │  │  │  工作区生命周期)    │    │  │  │
│  │  │  · useProject  │  │  └────────┬─────────┘    │  │  │
│  │  │    DB.ts       │  │  ┌────────┴─────────┐    │  │  │
│  │  └──────┬───────┘  │  │ CodePreviewer.vue │    │  │  │
│  │         │          │  │ (代码预览/高亮)    │    │  │  │
│  │         │          │  └──────────────────┘    │  │  │
│  │  ┌──────┴────────────────────────┐             │  │  │
│  │  │         Utils                 │             │  │  │
│  │  │  ┌────────┐ ┌──────────────┐ │             │  │  │
│  │  │  │workspace│ │ toolbox-     │ │             │  │  │
│  │  │  │/core.ts │ │ config.ts   │ │             │  │  │
│  │  │  │/serial- │ └──────────────┘ │             │  │  │
│  │  │  │ization  │ ┌──────────────┐ │             │  │  │
│  │  │  │/theme.ts│ │ migration.ts │ │             │  │  │
│  │  │  └────────┘ └──────────────┘ │             │  │  │
│  │  └───────────────────────────────┘             │  │  │
│  │                                                  │  │
│  │  ┌────────────────────────────────────────┐      │  │
│  │  │   Blockly 核心                           │      │  │
│  │  │  ┌──────────┐  ┌──────────────────┐    │      │  │
│  │  │  │  Blocks   │  │   Generators     │    │      │  │
│  │  │  │  (积木块) │  │  · JavaScript    │    │      │  │
│  │  │  │  10 类目  │  │  · Python        │    │      │  │
│  │  │  └──────────┘  └──────────────────┘    │      │  │
│  │  └────────────────────────────────────────┘      │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │                IndexedDB (useProjectDB.ts)          │  │
│  │  存储: 项目记录 (workspace XML/JSON + 元数据)       │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## Vue 3 前端 + Blockly 集成模式

CipherCat 不使用繁琐的第三方 Blockly-Vue 封装库，而是直接通过 Vue 组件管理 Blockly 工作区的生命周期：

```
BlocklyEditor.vue (组件)
├── onMounted
│   └── workspaceApi.initWorkspace(container)
│       ├── Blockly.inject(container, {toolbox, theme, ...})
│       └── 注册 S-Box 分类回调
├── 暴露方法 (defineExpose)
│   ├── exportWorkspace / loadWorkspace
│   ├── clearWorkspace / zoomIn/Out/Reset
│   └── setTheme / refreshBlocks
└── 事件监听
    └── workspace.addChangeListener → emit('change')
        → App.vue 处理 → 更新保存状态 / 自动保存
```

**关键设计原则**：
- Blockly 工作区是"受控组件"——所有操作通过 `utils/workspace/` 层封装
- Vue 组件不直接操作 Blockly DOM，通过 Composable 层做桥接
- 工作区变化通过事件冒泡到 App.vue，触发存储/状态更新

---

## 模块组织

### 积木块定义 (`src/blocks/`)

按密码学领域分为 10 个类目，每个类目有独立的 `index.ts` 导出类型和块定义：

| 目录 | 类目 | 说明 |
|------|------|------|
| `ctrl/` | 控制流 | 循环（`ctrl_iterate`） |
| `data/` | 数据与转换 | 数值、类型转换、位/字节长度、种子生成 |
| `array/` | 数组 | 分区工具（`arr_partition_to_array`） |
| `logic/` | 逻辑运算 | 复合逻辑（AND/OR/XOR/NOT） |
| `bitwise/` | 位运算 | AND/OR/XOR/NOT/移位/循环移位/字节替换 |
| `sbox/` | S-Box | 动态 S-Box 定义与替换（支持 CSV 导入/导出） |
| `hash/` | 哈希与填充 | SM3/SHA-256/SHA-3 填充与压缩，SHAKE XOF/PRF |
| `numtheory/` | 数论 | NTT/INTT/Montgomery 约简、椭圆曲线、模逆 |
| `ecc/` | 椭圆曲线 | 曲线参数、点加/倍点/点乘 |
| `post-quantum/` | 后量子 | 基础（编解码/压缩）+ 高级（采样/NTT/向量操作） |

所有块类型汇总到 `src/blocks/index.ts` 的 `ALL_BLOCK_TYPES` 联合类型中。

### 代码生成器 (`src/generators/`)

与 `blocks/` 镜像的目录结构：

```
src/generators/
├── javascript/
│   ├── index.ts            ← 导入所有 JS 生成器
│   ├── ctrl/ data/ array/  ← 与 blocks 类目对应
│   ├── bit/ logic/ sbox/
│   └── postquantum/
└── python/
    ├── index.ts            ← 导入所有 Python 生成器
    └── (同上镜像结构)
```

每个生成器文件通过 `javascriptGenerator.forBlock['block_type']` 或 `pythonGenerator.forBlock['block_type']` 注册生成函数。

### 工具函数 (`src/utils/`)

| 文件 | 职责 |
|------|------|
| `workspace/core.ts` | Blockly 工作区创建、销毁、主题切换 |
| `workspace/serialization.ts` | XML/JSON 序列化/反序列化、文件上传下载、S-Box 字段迁移 |
| `workspace/theme.ts` | 自定义 Blockly 主题（亮/暗） |
| `workspace/index.ts` | Workspace() 工厂函数，封装所有工作区操作 |
| `toolbox-config.ts` | 动态工具箱配置（基于 Blockly.Msg.i18n 的类目名） |
| `migration.ts` | 积木块类型迁移映射（兼容旧版块名） |
| `errorHandler.ts` | 统一错误处理 |

### 可组合函数 (`src/composables/`)

| 文件 | 职责 |
|------|------|
| `locale.ts` | 国际化：Blockly 语言包 + 自定义 UI 消息 + 积木块标签 |
| `generator.ts` | 调用 `javascriptGenerator.workspaceToCode()` / `pythonGenerator.workspaceToCode()` |
| `useEditorProject.ts` | 编辑器项目管理：加载/保存/新建/自动保存 |
| `useProjectDB.ts` | IndexedDB CRUD 操作（`getAllProjects`, `saveProject`, `deleteProject` 等） |

### 常量 (`src/constants/`)

| 文件 | 职责 |
|------|------|
| `code-languages.ts` | 支持的语言枚举（Python / JavaScript） |
| `workspace-config.ts` | Blockly 工作区配置（网格、缩放、滚动条等） |

---

## 代码生成管道

```
用户拖拽积木块
       │
       ▼
Blockly 工作区 (WorkspaceSvg)
       │
       ├── javascriptGenerator.workspaceToCode(workspace)
       │       │
       │       ▼
       │    JavaScript 代码字符串
       │
       └── pythonGenerator.workspaceToCode(workspace)
               │
               ▼
            Python 代码字符串
                │
                ▼
        CodePreviewer.vue (highlight.js 高亮)
                │
                ├── 复制到剪贴板
                └── 手动另存为文件
```

生成函数通过 `generator.ts` 的 `generateCode(workspace, language)` 统一调用。

---

## 关键数据流

```
1. 用户拖拽积木块到工作区
       │
       ▼
2. Blockly 触发 change 事件
       │
       ▼
3. BlocklyEditor.vue → emit('change')
       │
       ▼
4. App.vue: handleWorkspaceChanged()
       │
       ├─ 标记 saveStatus = 'unsaved'
       │
       └─ 如果自动保存开启:
              │
              ▼
          1.5 秒后 → useEditorProject.doSave()
              │
              ▼
          IndexedDB.saveProject(record)
              │
              ▼
          序列化 workspace 为 XML,
          存入 {id, name, workspace, format, language, timestamps}
```

导出流程：
```
用户点击"导出" → exportWorkspace(format)
                  │
                  ├─ XML 模式: Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace))
                  └─ JSON 模式: Blockly.serialization.workspaces.save(workspace)
                             → 下载为 .xml / .json 文件 (Tauri 文件对话框 或 浏览器 download)
```

---

## 国际化 (i18n) 方案

CipherCat 使用**两层 i18n**：

### 层 1: Blockly 内置机制

通过 `Blockly.setLocale()` 切换 Blockly 自带的语言包（`blockly/msg/zh-hans` / `en`）。
内置积木块的标签、工具提示、菜单自动切换。

### 层 2: 自定义消息系统 (`src/composables/locale.ts`)

- `MESSAGES_ZH_HANS` / `MESSAGES_EN`：积木块标签（如 `CRYPTO_BITWISE_AND`、`CRYPTO_SHA3_KECCAK_F_TOOLTIP`）
- `UI_MESSAGES`：UI 界面文字（按钮、提示、状态）
- `BLOCKLY_OVERRIDES_ZH_HANS`：对 Blockly 内置中文字串的定制覆盖
- `ui(key)`：获取当前语言的 UI 消息
- `useBlocklyLocale()`：响应式 locale 切换，自动刷新工作区

**添加新积木块时**，必须在 `MESSAGES_ZH_HANS` 和 `MESSAGES_EN` 中同时添加对应翻译键。

---

## 项目存储 (IndexedDB)

数据库名: `blockly-crypto-editor` / 对象存储: `projects`

```typescript
interface ProjectRecord {
  id?: number;         // 自增主键
  name: string;        // 项目名称
  workspace: string;   // 序列化的 XML 工作区内容
  format: 'json' | 'xml';
  language: string;    // 代码语言
  createdAt: string;   // ISO 时间戳
  updatedAt: string;   // ISO 时间戳
}
```

通过 `useProjectDB.ts` 的异步 CRUD 操作访问，支持自动保存（1.5 秒防抖）。

---

## 跨平台考量

| 能力 | Web 浏览器 | Tauri 桌面 |
|------|-----------|-----------|
| 编辑器 | Blockly 工作区 ✅ | 完全一致 ✅ |
| 存储 | IndexedDB | IndexedDB（当前方案） |
| 文件导入/导出 | 浏览器 File API / download | Tauri `dialog.save` + `fs.writeTextFile` |
| 性能 | 受浏览器限制 | 原生窗口，更优 |
| 打包 | Vite build | `npm run tauri:build` |

当前代码库在 `serialization.ts` 中通过运行时检测环境来切换文件读写策略（`window.__TAURI__` 或 `window.showDirectoryPicker`），实现同一套代码同时兼容 Web 与 Tauri。

---

## 路由

```typescript
// src/router/index.ts
const routes = [
  { path: '/',             name: 'ProjectList', component: ProjectList },
  { path: '/editor/:id',   name: 'Editor',      component: App.vue     },
];
```

- `/` — 项目管理页：新建、打开、删除项目
- `/editor/:id` — 编辑器主界面：Blockly 工作区 + 代码预览面板
