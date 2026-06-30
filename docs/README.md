# CipherCat 文档中心

🐱 **后量子密码学可视化编程平台** — 基于 Blockly 12.x 和 Vue 3 (Composition API + TypeScript)。

CipherCat 让你像搭乐高一样拖拽积木块来编写密码学算法，一键生成 JavaScript 或 Python 可执行代码。覆盖从位运算、S-Box、哈希函数到后量子密码（ML-KEM / ML-DSA）的全套密码学原语，共 71+ 个积木块。

## 文档结构

```
docs/
├── README.md                     ← 你现在在这里：顶层索引
├── ARCHITECTURE.md               ← 系统架构概览
├── DEVELOPMENT.md                ← 开发指南（添加积木块等）
├── fips202-SHA3/                 ← FIPS 202 SHA-3 算法参考
│   ├── README.md                 ← 参数表 + 算法清单
│   ├── 01-Theta.md ...           ← 各步映射 / 置换详细文档
│   └── SHA3-functions.md ...
├── fips203-ML-KEM/               ← FIPS 203 ML-KEM 算法参考
│   ├── README.md                 ← 参数集 + 算法清单
│   ├── guides/                   ← 实战构建指南
│   └── 01-ForExample.md ...
└── fips204-ML-DSA/               ← FIPS 204 ML-DSA 算法参考
    ├── README.md                 ← 参数集 + 算法清单
    └── 01-ML-DSA.KeyGen.md ...
```

## 快速链接

| 文档 | 说明 |
|------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 系统架构、数据流、模块组织 |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | 开发环境搭建、添加积木块步骤、i18n、代码风格 |
| [fips202-SHA3/](./fips202-SHA3/) | SHA-3 / SHAKE / KECCAK-p 算法参考 |
| [fips203-ML-KEM/](./fips203-ML-KEM/) | ML-KEM (Kyber) 密钥封装算法参考 |
| [fips204-ML-DSA/](./fips204-ML-DSA/) | ML-DSA (Dilithium) 数字签名算法参考 |

## 项目概览

- **前端框架**: Vue 3 (Composition API + TypeScript)
- **可视化编程**: Blockly 12.x
- **桌面封装**: Tauri 2.x
- **构建工具**: Vite + vue-tsc
- **代码规范**: ESLint 9.x + 详细 [RULES.md](../RULES.md)
- **本地存储**: IndexedDB
- **代码生成**: JavaScript / Python（支持用户自定义扩展）

更多信息请参阅项目根目录 [README.md](../README.md)。
