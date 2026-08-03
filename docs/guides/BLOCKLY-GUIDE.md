# Blockly 使用指南


使用 Blockly 12 可视化编程编辑器搭建密码算法：拖拽积木块、按类型连接、一键生成 Python / JavaScript 代码。本指南覆盖编辑器操作、类型系统、函数模板与算法拼装样例。

---

## 1. 界面概览

```
┌──────────┬──────────────────────────────────────────┐
│ 工具箱    │          工作区 (Workspace)               │
│ (类目列表)│                                          │
│          │   拖入的积木块在此连接与编辑              │
│  ▸ 控制流 │                                          │
│  ▸ 变量   │                                          │
│  ▸ 数学   │                                          │
│  ▸ 数据   │                                          │
│  ▸ 位运算 │                                          │
│  ▸ S-Box  │                                          │
│  ▸ 哈希   │                                          │
│  ▸ 数论   │                                          │
│  ▸ ECC    │                                          │
│  ▸ 后量子 │        ▶ Generate (JS / Python)          │
│  ▸ 对称   │                                          │
│  ▸ 模式   │                                          │
│  ▸ 函数   │                                          │
└──────────┴──────────────────────────────────────────┘
```

- **工具箱（Toolbox）**：左侧类目列表。点击类目展开积木块，拖到工作区使用。
- **工作区（Workspace）**：中央画布，积木块在此连接。支持缩放（Ctrl+滚轮）与拖动。
- **生成器（Generate）**：工具栏按钮，把工作区积木块翻译为 JavaScript 或 Python 代码。

## 2. 基本操作

| 操作 | 方法 |
|------|------|
| 添加块 | 从工具箱拖拽到工作区 |
| 连接块 | 把块的插头（value/statement 输入口）拖到另一块的插座（输出口），高亮即连接 |
| 断开 | 拖走连接的块即可分离 |
| 删除 | 右键 → 删除块（或拖到垃圾桶/按 Delete） |
| 复制 | 右键 → 复制块 |
| 撤销/重做 | Ctrl+Z / Ctrl+Shift+Z |
| 缩放 | Ctrl+滚轮 / 右键 → 缩放 |
| 整理 | 右键 → 整理所有块（自动排列） |

## 3. 数据与类型系统

密码学块带有类型标注，**类型不匹配无法连接**（Blockly 连接检查）：

| 类型 | 含义 | 典型块 |
|------|------|--------|
| `Bytes` | 字节序列 | `data_bytes_from_hex`、哈希输入 |
| `IntList` | 整数数组（有限域系数等） | `pq_sample_poly_cbd`、`pq_ntt` |
| `Number` | 标量整数 | `math_number`、模数参数 |
| `SBox` | S-box 查找表（可 CSV 导入） | `sbox_define` |

连接时若类型不匹配，插头变红且拒绝连接——这是防止算法语义错误的第一道防线。

**变量**：Variables 类目可创建变量（如 `state`、`rk`、`block`）。注意变量在代码生成中对应语言变量，密码学块通常直接返回新值而非修改变量（纯函数式，便于验证）。

## 4. 函数与算法模板

### 4.1 自定义函数

Functions 类目使用 Blockly 原生 procedure 系统：

- **＋新建**：插入一个带参数的函数定义块（齿轮 ⚙ mutator 增删参数，参数可标注类型）
- 函数体由原子块拼装，`RETURN` 输出结果
- 调用：拖出对应的**调用块**（call block），下拉选择函数名，自动同步参数

### 4.2 算法模板（函数管理）

工具箱「Crypto Templates / 函数管理」提供 **28 个密码算法模板**（AES/SM4 加密、哈希、HMAC、PBKDF2、ML-KEM KeyGen/Encaps 等）。**拖出即用**：模板自动预填完整算法链（原子块序列），无需手工拼装：

- 轮函数类模板（如 AES 轮）：自动生成 `AES SubBytes → ShiftRows → MixColumns → AddRoundKey` 链
- 循环类模板（密钥扩展/迭代哈希）：自动注入 `ctrl_iterate` 循环（10/16/32 轮）
- 模板参数（key/iv/nonce 等）留空输入，由用户填入数据块

> 模板是**展示算法结构**的教学工具：拖出后可以看到每个原子步骤，也可以右键展开核对。

### 4.3 函数管理面板

工具栏「函数管理」面板支持：＋新建函数、📥 导入函数（.json）、📤 导出函数、模板加入/移出工具箱（＋📦）。

## 5. 代码生成

点击 **▶ Generate** 生成代码，可在 Python / JavaScript 间切换。生成的代码是**可直接运行的**（含 helper 函数展开）。示例——SM3 哈希工作区生成：

```python
def hash_sm3_pad(msg):  # ...
    ...
def sm3_compress(v, block):  # ...
    ...
# 工作区块按连接顺序展开为调用链
result = sm3_compress(IV, hash_sm3_pad(b"abc"))
```

官方向量验证：`demos/procedures/` 下的 4 个 demo（SM4-Sbox / SM3-Hash / SM2-PointMul / ML-KEM-Encaps）双语言生成结果与官方测试向量一致（见 `scripts/verify-demo.ts`）。

## 6. 导入 / 导出

- **工作区导入**：菜单 → Import Workspace → 选择 `.json`（Blockly 标准序列化格式）
- **工作区导出**：菜单 → Export Workspace → 保存 `.json`（可重新导入/分享）
- **函数级导出**：函数管理面板 → 选中函数 → 📤 导出 `.json`
- **样例文件**：`demos/` 目录预置多个原子块工作区（`demos/README.md` 是唯一权威清单）

## 7. 密码算法拼装样例

> 完整搭建步骤见 [DEMO.md](./DEMO.md) 与 `docs/demos/{sm4,aes,hash,sm2,post-quantum}.md`。以下为最小可运行的原子链示意。

### 7.1 SM4 S-box 查表

```
sm4_sbox( 0x01 )  →  0x90   （GM/T 0002 官方向量）
```

### 7.2 SM3 哈希

```
hash_sm3_pad("abc")  →  64 字节填充块
sm3_compress(IV, 填充块)  → 66c7f0f4…ba8e0（GB/T 32905 官方向量）
```

### 7.3 AES-128 单轮加密

```
AES AddRoundKey(
  AES MixColumns(
    AES ShiftRows(
      AES SubBytes(state)   ← 字节替换（S-box 查表）
    )
  ), rk)
```

### 7.4 ML-KEM-512 Encaps（FIPS 203）

```
1. 解析 ek：t̂ = ByteDecode12(ek[0:768])，ρ = ek[768:800]
2. K = G(m ‖ H(ek)) 前 32 字节（SHA3-512）
3. Â ← SampleNTT(ρ)：pq_seed_with_nonce 链式拼接（ρ‖j‖i，34 字节）
4. ŝ ← pq_sample_poly_cbd(η₁, PRF(r, 0))；e₁/e₂ 同理（η₂，nonce 偏移）
5. u = INTT(Âᵀ∘ŝ) + e₁；v = INTT(t̂ᵀ∘ŝ) + e₂ + Decompress₁(m)
6. c = ByteEncode₁₀(Compress₁₀(u)) ‖ ByteEncode₄(Compress₄(v))
```

> ML-KEM 无矩阵乘法块，k=2 时手展 `ntt_mul` + `poly_add`；ek 中 t̂ 已是 NTT 域，**不可再过 NTT**。

## 8. 常见问题

| 问题 | 解决 |
|------|------|
| 插头变红连不上 | 类型不匹配（Bytes/IntList/Number 检查） |
| 模板拖出后链不完整 | 模板缺输入（key/iv/nonce）留空，需手动填入数据块 |
| 生成代码报错 | 检查函数模板是否被拖到主工作区（flyout 预览不生成） |
| 想验证结果 | 打开 `demos/procedures/*.json` 并 ▶ Generate 对照官方向量 |
