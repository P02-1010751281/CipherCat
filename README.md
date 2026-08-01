# CipherCat · 薛定喵编辑器

🐱 后量子密码学可视化编程平台 — 基于 Blockly 和 Vue 3。

> "The cat is both alive and dead until you open the box.  
> Your cipher is both secure and broken until you audit the code."

## 特性

- 🔮 **后量子密码** — NTT/INTT、编码压缩、SampleNTT 等全套后量子原语（最核心特色）
- 🔐 **密码学全覆盖** — 对称密码（S-Box、位运算）、哈希函数（SM3/SHA）、数论运算
- 🧩 **可视化编程** — 拖拽积木块，像搭乐高一样写密码学代码
- 🌐 **多语言** — 中英文界面，Blockly 积木块同步切换
- 💻 **代码生成** — 一键生成 JavaScript / Python 可执行代码
- 📁 **项目管理** — 基于 IndexedDB 的多项目本地管理，自动保存
- 🖥️ **桌面应用** — Tauri 封装，Windows / Linux / macOS 原生运行
- 📱 **响应式** — 宽窄屏自适应，拖拽调整面板

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev          # → http://localhost:3001

# 构建生产版本
npm run build

# Tauri 桌面应用
npm run tauri:dev    # 开发模式
npm run tauri:build  # 打包
```

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | Vue 3 (Composition API + TypeScript) |
| 可视化编程 | Blockly 12.x |
| 代码高亮 | highlight.js |
| 桌面封装 | Tauri 2.x |
| 构建工具 | Vite + vue-tsc |
| 代码规范 | ESLint 9.x |
| 本地存储 | IndexedDB (idb) |

## 项目结构

```
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
```

## 支持的密码学模块（98 个自定义积木块，13 类目）

| 类目 | 块数 | 积木块 |
|------|------|--------|
| 控制流 | 1 | 循环迭代 |
| 基础数学 | 7 | 模运算（Mod/ModPow/DivRem）、大数 BN 加减乘除 |
| 数组 | 1 | 数组分区 |
| 数据与转换 | 9 | 值输入、种子（bytes/hex）、密钥派生、位/字节长度、类型转换 |
| 位运算 | 8 | AND/OR/XOR、NOT、移位、循环移位、字节替换、中缀表达式 |
| 逻辑 | 3 | 逻辑运算、复合运算、NOT |
| S-Box | 4 | S-Box 定义/替换、S-Box 变量读写 |
| 哈希 | 18 | SM3 压缩/填充、SHA-256 压缩/填充、SHA-3 Keccak-f/吸收/挤出/填充、SHAKE XOF/PRF、HMAC |
| 对称密码 | 12 | AES 四步运算、SM4 轮函数/线性变换、ECB/CBC/CTR 模式、PKCS#7/零填充 |
| 数论 | 10 | NTT/INTT、NTT 蝶形/乘法、域加法、模逆、GF(2⁸) 乘法、多项式加减、矩阵×向量 |
| 椭圆曲线 | 5 | 曲线参数加载、点加载、倍点、点加、点乘 |
| 后量子 | 11 | 编码/解码、压缩/解压、字节拼接/切片、SampleNTT、SamplePolyCBD |
| 编码工具 | 5 | Base64 编解码、Hex↔Bytes、字节序转换 |
| 函数封装 | 4 | crypto_return、加/解密/哈希函数模板 |

> 合计 98 个自定义积木块（`src/blocks/index.ts` 的 `ALL_BLOCK_TYPES`）；另有 27 个 `proc_*` 函数模板与 Blockly 原生 procedure 块（函数封装类目）。

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
