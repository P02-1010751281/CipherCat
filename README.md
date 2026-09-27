# CipherCat · 薛定喵编辑器

🐱 后量子密码学可视化编程平台 — 基于 Blockly 和 Vue 3。

> "The cat is both alive and dead until you open the box.  
> Your cipher is both secure and broken until you audit the code."

## 特性

- 🔮 **后量子密码** — 以格基密码为核心，覆盖 NTT/INTT、编码压缩、SampleNTT 等公共原语与算法阶段
- 🔐 **密码学教学覆盖** — AES 单轮原语与模式、SM4 全轮、哈希函数（SM3/SHA/HMAC）和数论运算
- 🧮 **算法模板** — 29 个密码算法模板（拖出即用，自动预填原子链）
- ✅ **官方向量验证** — SM4/SM3/SM2/ML-KEM 双语言通过官方测试向量
- 🧩 **可视化编程** — 拖拽积木块，像搭乐高一样写密码学代码
- 🌐 **多语言** — 中英文界面，Blockly 积木块同步切换
- 💻 **代码生成** — 一键生成 JavaScript / Python 可执行代码
- 📁 **项目管理** — 基于 IndexedDB 的多项目本地管理，自动保存
- 🖥️ **桌面应用** — Tauri 封装，Windows / Linux / macOS 原生运行
- 📱 **响应式** — 宽窄屏自适应，拖拽调整面板

## 快速开始

第一次使用请先看：[环境搭建与验收](docs/guides/SETUP.md) · [用户完整指南](docs/guides/USER-GUIDE.md) · [能力地图](docs/guides/CAPABILITY-MAP.md) · [Demo 清单](demos/README.md)。

```bash
# 安装依赖
npm ci

# 启动开发服务器
npm run dev          # → http://localhost:3001

# 构建生产版本
npm run build
npm run build:check-bundle

# Tauri 桌面应用
npm run tauri:dev    # 开发模式
npm run tauri:build  # 打包

# 质量门禁
npm run test:unit
npm run standards:check
npm run standards:inventory
# 重新生成逐项 source 清单时使用：npm run standards:inventory:write
npm run cycles:check
npm run lint:check
npm run type-check
npm run verify:all
npm run docs:check-links
```

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | Vue 3 (Composition API + TypeScript) |
| 可视化编程 | Blockly 13.x |
| 代码高亮 | highlight.js |
| 文档渲染 | marked + mermaid |
| 桌面封装 | Tauri 2.x |
| 构建工具 | Vite + vue-tsc |
| 代码规范 | ESLint 10.x |
| 本地存储 | 浏览器 IndexedDB |

## 项目结构

```text
src/
├── App.vue                     # 主编辑器视图
├── main.ts                     # 应用入口
├── router/                     # 路由（编辑器 + 文档 + 项目管理）
├── views/                      # 页面视图（ProjectList / DocsView）
├── blocks/                     # Blockly 积木块定义（按类目分目录）
│   ├── ctrl/ data/ array/ logic/ bitwise/ sbox/ hash/
│   ├── symmetric/ numtheory/ ecc/ post-quantum/
│   ├── procedure/              # 函数模板 + Blockly 原生 procedure 覆盖
│   └── remaining.ts            # 数学原语 + HMAC + 编码工具
├── generators/                 # 代码生成器
│   ├── javascript/             # JavaScript 生成
│   └── python/                 # Python 生成
├── composables/                # Vue Composables
│   ├── locale.ts               # 国际化（中/英）
│   ├── generator.ts            # 代码生成逻辑
│   ├── useEditorProject.ts     # 项目管理
│   └── useProjectDB.ts         # IndexedDB 操作
├── constants/                  # 常量配置
│   ├── block-types.ts          # 类型系统
│   ├── code-languages.ts       # 支持的语言
│   └── workspace-config.ts     # Blockly 工作区配置
├── components/                 # 通用组件
│   ├── BlocklyEditor.vue       # Blockly 编辑器组件
│   ├── CodePreviewer.vue       # 代码预览器
│   └── CryptoFunctionPanel.vue # 函数模板管理面板
├── utils/                      # 工具函数（toolbox-config / migration / markdown）
├── styles/                     # 全局样式 / CSS 变量
└── assets/                     # 静态资源
docs/                           # 文档体系（guides/ 核心 + blocks/ 索引 + demos/ + standards/ 37 算法目录 + papers/ 文献索引）
demos/                          # Blockly 工作区示例（含官方向量期望）
```

## 支持的密码学模块（194 个自定义积木块，17 个工具箱类目）

| 类目 | 代表能力 |
|------|----------|
| 控制流编排 | 循环迭代（`ctrl_iterate`）及 Blockly 控制组合 |
| 数据处理与转换 | 值与种子输入、位/字节长度、类型转换、Base64/Hex 编解码、字节序 |
| 位运算单元 | AND/OR/XOR、NOT、移位、循环移位、字节替换、中缀表达式 |
| 非线性运算单元（S-Box） | 自定义 S-Box 与 AES/SM4/ZUC 预设 |
| 散列与填充 | SM3、SHA-2/SHA-3、SHAKE、HMAC、HKDF、PBKDF2、DRBG、Argon2 |
| 对称密码 | AES、SM4、分组模式、CMAC、CCM、XTS、GCM、ASCON |
| 数论与密钥推导 | NTT、GF(2^m)、模逆/模幂、多项式、RSA |
| 椭圆曲线与公钥 | EdDSA、ECDSA、ECDH、X25519、SM2、SM9 与曲线/点运算 |
| 序列密码 | ZUC 状态变换、密钥流及 EEA3 构件 |
| 后量子密码 | ML-KEM/ML-DSA 格基构件与阶段；另含 SLH-DSA、纠错码教学构件 |
| 函数与 Blockly 原生类目 | 29 个函数模板及变量、数学、数组、逻辑等 Blockly 原生块 |

> 总数按 `src/blocks/index.ts` 的 `ALL_BLOCK_TYPES` 递归展开、去重得到 194 个自定义块类型。另有 29 个函数模板注册项，其中 3 个基础 `crypto_*` 块已计入这 194 个类型，26 个 `proc_*` 模板是额外类型；块与模板合并去重后共 220 个类型。工具箱 17 类目含 4 个 Blockly 原生类目。上表用于说明能力范围，不提供可能重叠的分类小计。

## 代码生成示例

拖拽积木块 → 一键生成可执行代码，以 Kyber (FIPS 203) NTT 后量子原语为例：

### Python

```python
def ntt(a, q=3329, n=256):
    """FIPS 203 Cooley-Tukey NTT with bit-reversed zetas (Algorithm 6)"""
    gen = 17 if q == 3329 else 3
    res = list(a)
    ln = len(res)
    def _brv(x, bits):
        r = 0
        for _ in range(bits):
            r = (r << 1) | (x & 1)
            x >>= 1
        return r
    nbits = n.bit_length() - 1
    stride = ln // 2
    zz = 0
    while stride >= 2:  # FIPS 203 Alg 6: for(len=128; len>=2; len>>=1)
        for start in range(0, ln, stride * 2):
            zz += 1
            zp = pow(gen, _brv(zz, nbits - 1), q)
            for i in range(start, start + stride):
                u = res[i]
                t = (zp * res[i + stride]) % q
                res[i] = (u + t) % q
                res[i + stride] = (u - t + q) % q
        stride >>= 1
    return res

# NTT 域逐点乘法
result = ntt_mul(ntt_a, ntt_b, q=3329)
```

### JavaScript

```javascript
function ntt(a, q = 3329, n = 256) {
    const gen = (q === 3329) ? 17 : 3;
    const res = a.slice();
    const len = res.length;
    const brv = (x, bits) => {
        let r = 0;
        for (let i = 0; i < bits; i++) { r = (r << 1) | (x & 1); x >>= 1; }
        return r;
    };
    const nbits = Math.log2(n) | 0;
    let stride = len / 2;
    let zz = 0;
    while (stride >= 2) {  // FIPS 203 Alg 6: for(len=128; len>=2; len>>=1)
        for (let start = 0; start < len; start += stride * 2) {
            zz++;
            const zp = modPow(gen, brv(zz, nbits - 1), q);
            for (let i = start; i < start + stride; i++) {
                const u = res[i];
                const t = (zp * Number(res[i + stride])) % q;
                res[i] = (u + t) % q;
                res[i + stride] = (u - t + q) % q;
            }
        }
        stride >>= 1;
    }
    return res;
}
```

## 许可证

[MIT](LICENSE)
