# 哈希演示

> [English](./hash.en.md) · [中文](./hash.md)

> [← 返回索引](../DEMO.md) · [demo 文件清单](../../demos/README.md)
>
> 场景 3（SHA-256）+ 场景 7（SM3），对应 `docs/DEMO.md` 索引。

---

## 场景 3：SHA-256 哈希（5 分钟）

### 目标
对文本计算 SHA-256 哈希值，理解填充和压缩两步。

### 步骤

1. **加载 demo**：导入 `demos/SHA256-Atomic-Hash.json`
2. **观察结构**：
   - `data_value`："abc"（SHA-256 最经典测试向量）
   - `hash_sha256_pad`：填充（追加 1+0*+64-bit 长度），输出 512-bit 块列表
   - `hash_sha256_compress`：64 轮压缩（σ0 σ1 Σ0 Σ1 Ch Maj 位运算）
3. **生成代码**：点击「▶」选择 JavaScript
4. **验证**：输出 8×32-bit 整数 = 256-bit 哈希值

### 涉及原子块
| 块 | 功能 | 标准 |
|----|------|------|
| `data_text` | UTF-8 文本输入 | — |
| `hash_sha256_pad` | SHA-256 消息填充 | FIPS 180-4 §5.1 |
| `hash_sha256_compress` | 64 轮压缩函数 | FIPS 180-4 §6.2 |

### 验证方法
SHA-256("abc") = `ba7816bf 8f01cfea 414140de 5dae2223 b00361a3 96177a9c b410ff61 f20015ad`。生成代码后运行对比。

---

## 场景 7：SM3 哈希（10 分钟）

### 目标
用原子块搭 SM3 填充 + 压缩，封装为 `SM3_Hash(msg)`，验证 GB/T 32905-2016 官方向量。

### 步骤

1. **加载 demo**：导入 `demos/procedures/SM3-Hash.json`
2. **观察结构**：
   - `procedures_defreturn` 块：函数名 `SM3_Hash`，参数 `msg: message`
   - 函数体 RETURN：`hash_sm3_compress(V=IV 常量, W=hash_sm3_pad(msg))`
   - IV 常量 = 8 个 32-bit 字（`0x7380166f, 0x4914b2b9, ...`）用 `data_value` 数组字面量
3. **生成代码**：点击「▶」选择 Python 或 JavaScript
4. **验证**：
   - Python：`SM3_Hash("abc")` → `66c7f0f4 62eeedd9 ... b0fb0e4e`
   - 官方向量：SM3("abc") = `66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0`（GB/T 32905-2016 A.1）

> 注意：demo 演示单块消息（≤55 字节）路径；多块消息需 `ctrl_iterate` 循环，留作扩展。

### 涉及块
| 块 | 功能 |
|----|------|
| `hash_sm3_pad` | SM3 消息填充（1‖0*‖64-bit 长度） |
| `hash_sm3_compress` | CF 压缩函数（64 轮，W/W′ 内部展开） |
| `data_value` | 原样透传表达式（IV 数组字面量） |

---

**官方向量验证**：`node dist-verify/verify-demo.js demos/procedures/SM3-Hash.json --exec` → `=== ALL VECTORS PASS ===`
