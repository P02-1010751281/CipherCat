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
├── router/                     # 路由（编辑器 + 项目管理）
├── views/                      # 页面视图
│   └── ProjectList.vue         # 多项目管理仪表板
├── blocks/                     # Blockly 积木块定义
│   ├── core/                   # 核心积木（赋值、表达式、宏定义）
│   ├── bitwise/                # 位运算（AND/OR/XOR/NOT/移位/循环移位）
│   ├── hash/                   # 哈希函数（SM3/SHA-1/SHA-2）
│   ├── sbox/                   # S-Box（定义、替换、逆替换）
│   ├── number-theory/          # 数论运算（POW/MOD/EXT_GCD/MR）
│   └── post-quantum/           # 后量子（NTT/INTT）
├── generators/                 # 代码生成器
│   ├── javascript/             # JavaScript 生成
│   └── python/                 # Python 生成
├── composables/                # Vue Composables
│   ├── locale.ts               # 国际化（中/英）
│   ├── generator.ts            # 代码生成逻辑
│   ├── useEditorProject.ts     # 项目管理
│   ├── useProjectDB.ts         # IndexedDB 操作
│   ├── useProjectSave.ts       # 自动保存
│   └── useSplitLayout.ts       # 分割面板拖拽
├── constants/                  # 常量配置
│   ├── code-languages.ts       # 支持的语言
│   └── workspace-config.ts     # Blockly 工作区配置
├── components/                 # 通用组件
│   ├── BlocklyEditor.vue       # Blockly 编辑器组件
│   └── CodePreviewer.vue       # 代码预览器
├── api/                        # API 接口层
├── styles/                     # 全局样式 / CSS 变量
└── utils/                      # 工具函数
```

## 支持的密码学模块（71 个积木块）

| 模块 | 块数 | 积木块 |
|---|---|---|
| **位运算** | 8 | AND/OR/XOR, NOT, 左移/右移, 循环左移/右移, 字节替换, 中缀表达式 |
| **S-Box** | 2 | S-Box 定义, S-Box 替换 |
| **哈希** | 17 | SM3 压缩/填充, SHA-256 压缩/填充, SHA-3 Keccak-f/吸收/挤出/填充, SHAKE XOF/PRF |
| **数论** | 12 | NTT/INTT 变换, NTT 蝶形运算/乘法, 椭圆曲线（加/倍点/点乘）, 模逆, 域/多项式加法 |
| **后量子基础** | 9 | BytesToBits, BitsToBytes, ByteEncode/Decode, Compress/Decompress, ByteConcat, BytesSlice, SeedWithNonce |
| **后量子高级** | 8 | SampleNTT, SamplePolyCBD, SampleNTTMat, CBDNTTVec, ATrINTTAddE1, TrINTTAddE2Mu, BuildVec3, VecCompressEncode |
| **核心** | 15 | 变量赋值, 数值, 逻辑/复合运算, 循环, 类型转换, 位/字节长度, 种子生成, 数组分区 |

## 代码生成示例

拖拽积木块 → 一键生成可执行代码，以 Kyber (FIPS 203) NTT 后量子原语为例：

### Python

```python
def ntt(a, q=3329, n=256):
    """FIPS 203 Cooley-Tukey NTT with bit-reversed zetas (Algorithm 9)"""
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
    while stride >= 1:
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
    while (stride >= 1) {
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
