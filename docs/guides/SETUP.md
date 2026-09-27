# 环境搭建与验收指南

本指南用于在本地启动 CipherCat、构建生产前端、运行桌面版本，并确认文档、代码生成和 Demo 验证链路可用。它只覆盖 CipherCat 前端；平台后端随机性测评由独立的 `metacrypt_server` 后端负责。

## 1. 环境要求

| 项目 | 要求 | 检查命令 |
|---|---|---|
| Node.js | 24 或更高版本 | `node --version` |
| npm | 随 Node.js 安装，使用锁文件安装 | `npm --version` |
| 浏览器 | 支持 IndexedDB、ES modules 和 WebAssembly 的现代浏览器 | 打开本地开发地址 |
| Git | 获取源码和查看变更 | `git --version` |
| Tauri（可选） | Rust stable、系统 WebView 和平台构建工具 | 见“桌面应用” |

## 2. 获取代码并安装依赖

在仓库根目录执行：

```bash
git clone <repository-url>
cd CipherCat
npm ci
```

`npm ci` 使用 `package-lock.json` 安装固定版本。仓库根目录的 `.npmrc` 也属于安装策略，Dockerfile 会和锁文件一起复制它；不要让宿主机的 npm 配置改变容器内安装结果。只有在明确需要升级依赖时才使用 `npm install`，升级后应提交锁文件并重新运行完整验证。

## 3. 启动开发服务器

```bash
npm run dev -- --host 127.0.0.1 --port 3001
```

浏览器打开 <http://127.0.0.1:3001/>。开发服务器启动后按以下顺序检查：

1. 首页可以打开，语言切换可以使用。
2. 打开“文档”，确认用户文档和开发文档分组显示。
3. 打开“编辑器”，新建项目并拖出一个数据块。
4. 导入 `demos/AES-Atomic-Round.json`，确认四个顶层 AES 原语和共享状态；画布中没有值接口连线。
5. 选择 Python，点击“生成”，确认代码面板出现带语法颜色的代码。
6. 刷新页面，确认项目仍存在；项目数据应保存在浏览器 IndexedDB 中。

![文档中心的用户文档与开发文档分组（实际页面截图）](/docs-assets/tutorials/06-docs-center-current.png)

_图：本地页面中，用户文档、演示教程、原语参考和开发文档分别列出。_

![Python 代码生成后的开发模式验收页面（实际页面截图）](/docs-assets/tutorials/05-generated-python.png)

_图：本截图展示工具箱、工作区和生成后的 Python 代码；导入后的空代码面板见用户教程。_

开发服务器默认只监听本机地址。需要在局域网访问时，显式改用 `--host 0.0.0.0`，并确认防火墙和访问范围。

## 4. 生产构建与预览

```bash
npm run type-check
npm run build
npm run build:check-bundle
npm run preview -- --host 127.0.0.1 --port 4173
```

打开 <http://127.0.0.1:4173/>，重复上一节的文档、编辑器、导入 Demo 和代码高亮检查。生产预览不能替代后端部署，也不会自动提供平台后端随机性测评服务。

## 5. 桌面应用

桌面开发和打包需要 Tauri 2 的 Rust 工具链及对应平台依赖：

```bash
npm run tauri:dev
npm run tauri:build
```

平台注意事项：

- Linux 需要 GTK/WebKitGTK、编译器和 WebView 开发包；可以参考 `docker/Dockerfile` 的依赖清单。
- Windows 需要 Microsoft C++ Build Tools 和 WebView2。Linux 上的交叉编译脚本只生成裸 `.exe`，不能替代 Windows 上的安装包构建。
- macOS 需要 Xcode Command Line Tools 和 Apple SDK；macOS 安装包应在 macOS 主机上构建。

Linux 容器构建脚本：

```bash
./docker/docker-build-linux.sh
```

该脚本需要 Docker/Podman 兼容命令、容器构建权限以及 Tauri 所需的图形库。容器运行失败时，先使用浏览器开发模式完成前端验收，再单独排查容器运行时。

## 6. 提交前质量门禁

最小检查：

```bash
npm run lint:check
npm run type-check
npm run test:unit
npm run build
npm run docs:check-links
```

完整检查：

```bash
npm run verify:all
npm run standards:check
npm run standards:inventory
npm run cycles:check
```

`verify:all` 验证标准元数据、结构化拆分、公式字段、source 回链、模板和 Demo。它证明工程回归和登记向量一致性，不构成认证、形式化证明或平台后端测评结论。

## 7. 前端与后端边界

前端负责工作区编辑、代码生成、用户试验和结果展示。平台后端随机性测评的样本生成、隔离执行、统计检测、规则判定和报告由 `metacrypt_server` 后端完成。前端页面展示后端返回的参数和结果，不在浏览器中替代后端判定；该测评不等同认证或熵源质量证明。

## 8. 验收记录

一次可复现的本地验收至少应记录：

- Git 提交或分支；
- Node.js、npm 和浏览器版本；
- 执行过的命令及退出码；
- 访问的 URL；
- 导入的 Demo 文件；
- 生成语言和代码输出；
- 失败时的控制台错误、截图或日志。

截图应包含当前页面的相关控件和结果区域；截图用于确认界面状态，不能代替测试输出、标准原文或后端测评报告。
