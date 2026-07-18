# CipherCat 数据类型规范

> 版本 v1.0 | 2026-07-18 | 所有块实现的类型参考标准

## 一、类型总览

| Blockly 类型 | 常量 | 语义 | 值域 | 对应 Python | 对应 JavaScript |
|-------------|------|------|------|------------|----------------|
| `Bytes` | `TYPE_BYTES` | 字节序列 | `[0x00, 0xFF]` 每元素 | `bytes` / `bytearray` | `Uint8Array` |
| `IntList` | `TYPE_INT_LIST` | 整数列表 | 依上下文 | `list[int]` | `number[]` |
| `Bits` | `TYPE_BITS` | 比特数组 | `{0, 1}` 每元素 | `list[int]` | `number[]` |
| `Number` | `TYPE_NUMBER` | 标量整数 | `[0, 2^53)` JS / 任意 Python | `int` | `number` |
| `SBox` | `TYPE_SBOX` | S-box 查找表 | 二维 4×4 ~ 32×32 | `list[list[int]]` | `number[][]` |
| `Matrix` | `TYPE_MATRIX` | 矩阵（标签） | 二维 IntList | `list[list[int]]` | `number[][]` |
| `Vector` | `TYPE_VECTOR` | 向量（标签） | 一维 IntList | `list[int]` | `number[]` |

## 二、各类型详细规范

### 2.1 Bytes — 字节序列

```
定义：有序字节序列，每个元素是 [0x00, 0xFF] 的无符号整数。
密码学语义：密钥、消息、密文、IV、哈希值、种子、填充后数据。
```

| 属性 | 值 |
|------|-----|
| 元素类型 | `uint8` (0-255) |
| 长度 | 任意正整数，可为 0 |
| Python 类型 | `bytes` (不可变) / `bytearray` (可变) |
| JavaScript 类型 | `Uint8Array` |
| 默认值 | `b""` / `new Uint8Array(0)` |
| 索引操作 | 0-based, `data[i]` 返回 int |
| 切片操作 | `data[start:end]` 返回新的 Bytes |

**转换规则：**

| 从 | 到 | Python | JavaScript |
|----|----|--------|-----------|
| `Bytes` | `IntList` | `list(data)` | `Array.from(data)` |
| `Bytes` | `Bits` | `[(b>>j)&1 for b in data for j in range(8)]` | 展开为比特数组 |
| `Bytes` | `String(hex)` | `data.hex()` | `Array.from(data, b => b.toString(16).padStart(2,'0')).join('')` |
| `String(hex)` | `Bytes` | `bytes.fromhex(s)` | `Uint8Array.from(s.match(/.{2}/g), h => parseInt(h,16))` |
| `IntList` | `Bytes` | `bytes(lst)` (元素须 0-255) | `new Uint8Array(lst)` |
| `Bits` | `Bytes` | 每 8 位打包为 1 字节 | 同上 |
| `Number` | `Bytes` | `n.to_bytes((n.bit_length()+7)//8, 'big')` | `new Uint8Array([...])` 按需编码 |

**使用 Bytes 的典型块：**
`seed_bytes`(输出)、`pq_bytes_to_bits`(输入)、`hash_sha256_pad`(输出)、`pad_pkcs7`(输入/输出)、所有 hash 输出、`mode_*`(输入/输出)

---

### 2.2 IntList — 整数列表

```
定义：有序整数列表。密码学中承载三种语义：
  1. 多项式系数：范围 [0, q-1], 长度 = 256 (Kyber)
  2. NTT 域元素：同上但代数结构不同
  3. 大数 limbs：每个元素 32-bit, 小端/大端序
```

| 属性 | 值 |
|------|-----|
| 元素类型 | `int` (0 ~ q-1 或 0 ~ 2^32-1) |
| 长度 | 任意 |
| Python 类型 | `list[int]` |
| JavaScript 类型 | `number[]` |
| 默认值 | `[]` |

**子类型的语义区分：**

| 子类 | 典型值域 | 典型长度 | 代表块 |
|------|---------|---------|--------|
| 多项式系数 (Z_q) | `[0, q-1]`, q=3329 (Kyber) 或 q=12289 (NewHope) | 256 | `pq_sample_ntt`, `pq_ntt` |
| NTT 域元素 | 同上 | 256 | `pq_ntt`(输出) |
| 大数 limbs | `[0, 2^32-1]`, 每元素 32-bit | 任意 | `bn_add`, `bn_mul` |
| 通用列表 | 任意 int | 任意 | `pq_poly_add` |

**⚠️ 关键：IntList 与 Bits 的区别**
两者在运行时都是 `number[]`，但 Bits 的元素**严格限制为 {0,1}**。Blockly 通过类型字符串 `'Bits'` vs `'IntList'` 来区分，生成器不感知这个区别（都生成 `number[]`）。

**转换规则：**

| 从 | 到 | Python | JavaScript |
|----|----|--------|-----------|
| `IntList` | `Bytes` | `bytes(lst)` (每元素截断到 0-255) | `new Uint8Array(lst)` |
| `IntList`（大数 limbs） | `Number` | `int.from_bytes(b''.join(x.to_bytes(4,'big') for x in limbs), 'big')` | limbs 合成大整数 |
| `Number` | `IntList`（大数 limbs） | `[(n>>(i*32))&0xFFFFFFFF for i in range(limbs)]` | 同上逻辑 |

---

### 2.3 Bits — 比特数组

```
定义：有序比特序列，每个元素严格为 0 或 1。
密码学语义：比特流、编码转换中间表示。
```

| 属性 | 值 |
|------|-----|
| 元素类型 | `0` 或 `1` |
| 长度 | 任意正整数 |
| Python 类型 | `list[int]` (元素严格 0/1) |
| JavaScript 类型 | `number[]` (元素严格 0/1) |
| 默认值 | `[]` |

**转换规则：**

| 从 | 到 | 方法 |
|----|----|------|
| `Bytes` | `Bits` | 每字节展开为 8 比特（小端序：bit j = (byte>>j)&1） |
| `Bits` | `Bytes` | 每 8 比特打包为 1 字节（Σ bit_j · 2^j） |
| `Bits` | `IntList` | 直接赋值（类型兼容，语义不同） |
| `IntList` | `Bits` | ⚠️ 运行时无检查，Blockly 类型系统阻止 |

**使用 Bits 的块：**
`pq_bytes_to_bits`(输出 → Bits)、`pq_bits_to_bytes`(输入 ← Bits)

---

### 2.4 Number — 标量整数

```
定义：单个整数值。Blockly 原生类型。
密码学中使用：长度、索引、模数、轮数、位偏移。
```

| 属性 | 值 |
|------|-----|
| Python 类型 | `int` (任意精度) |
| JavaScript 类型 | `number` (安全范围 [0, 2^53-1]，位运算范围 [0, 2^32-1]) |
| Blockly 默认 | `0` |
| 密码学典型范围 | `[0, q-1]` (模数), `[1, 256]` (长度), `[0, 31]` (比特偏移) |

**⚠️ JavaScript 限制：**
位运算在 JS 中自动截断到 32-bit。正确做法用 `>>> 0` 确保无符号。

**转换规则：**

| 从 | 到 | Python | JavaScript |
|----|----|--------|-----------|
| `Number` | `Bytes` | `n.to_bytes((n.bit_length()+7)//8, 'big')` | 手动构造 Uint8Array |
| `Number` | `IntList` (limbs) | 按 32-bit 拆分 | 同上 |
| `Bytes` | `Number` | `int.from_bytes(data, 'big')` | BigInt / 手动循环 |

---

### 2.5 SBox — S-box 查找表

```
定义：二维字节矩阵，用于非线性替换。
通过 Blockly 变量系统管理，变量类型为 'SBox'。
```

| 属性 | 值 |
|------|-----|
| 维度 | `ROW × COL`, 默认 16×16 |
| 元素范围 | `[0x00, 0xFF]` |
| 表示格式 | 1D 或 2D |
| Python 类型 | `list[list[int]]` (2D) 或 `list[int]` (1D) |
| JavaScript 类型 | `number[][]` (2D) 或 `number[]` (1D) |

**SBox 操作：**
- `sbox`：定义/编辑 SBox
- `sbox_sub`：字节替换 `output = sbox[byte]`（32-bit 字拆为 4 字节分别查找）
- `sbox_variables_get/set`：变量系统存取

---

### 2.6 Matrix / Vector — 矩阵和向量标签

```
定义：仅作为 Blockly 类型标签，没有独立的运行时表示。
Matrix：二维 IntList (number[][])
Vector：一维 IntList (number[])
```

| 属性 | Matrix | Vector |
|------|--------|--------|
| Python 类型 | `list[list[int]]` | `list[int]` |
| JS 类型 | `number[][]` | `number[]` |
| 典型使用 | ML-KEM 的 k×k 矩阵 A | ML-KEM 的 k 维向量 t̂, ŝ |

**⚠️ 不做通用矩阵原语块。** 密码学中的"矩阵乘法"不是标准线性代数，而是 NTT 域多项式运算组合。`Matrix` 标签仅用于防止类型混淆。

---

## 三、类型兼容矩阵

表示"类型 A 的块输出能否连接到类型 B 的块输入"：

| 输出 ↓ / 输入 → | Bytes | IntList | Bits | Number | SBox | Matrix |
|-----------------|-------|---------|------|--------|------|--------|
| **Bytes** | ✅ | ⚠️ 隐式转 | ❌ | ❌ | ❌ | ❌ |
| **IntList** | ⚠️ 隐式转 | ✅ | ❌ | ❌ | ❌ | ⚠️ 隐式 |
| **Bits** | ⚠️ 隐式转 | ✅ 允许 | ✅ | ❌ | ❌ | ❌ |
| **Number** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **SBox** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Matrix** | ❌ | ⚠️ 隐式 | ❌ | ❌ | ❌ | ✅ |

**图例：**
- ✅ 类型完全匹配，直接连接
- ⚠️ 运行时兼容但需隐式转换（生成器会插入转换代码）
- ❌ Blockly 阻止连接

---

## 四、生成器中的类型约定

### Python

```python
# 变量命名约定（便于生成器内联判断）
data: bytes          # 当前种子/输入字节
padded: bytes        # 填充后数据
state: list[int]     # 内部状态（16×IntList 或 25×IntList）
W: list[int]         # 消息扩展（32-bit 字列表）
H: list[int]         # 哈希链值列表
result: bytes        # 最终输出

# 隐式转换模式
isinstance(msg, list): msg = bytes(msg)     # IntList → Bytes
isinstance(x, (bytes, bytearray)): ...      # Bytes 检测
int.from_bytes(data[start:end], 'big')       # Bytes → Number
```

### JavaScript

```javascript
// 隐式转换模式
Array.isArray(msg) ? msg = new Uint8Array(msg)   // IntList → Bytes
data instanceof Uint8Array                        // Bytes 检测
(data[0] << 24) | (data[1] << 16) | ...          // Bytes → Number (big-endian)
```

## 五、新增块时的类型检查清单

- [ ] 每个值输入声明了 `setCheck(TYPE_*)`
- [ ] 每个值输出声明了 `setOutput(true, TYPE_*)`
- [ ] 生成器代码产生的运行时类型与声明一致
- [ ] 如涉及类型转换，生成器中包含隐式转换代码
- [ ] `TYPE_MAP` 中已有该类型的三语言映射
- [ ] 文档 `BLOCK-REFERENCE.md` 中记录了类型信息
- [ ] 测试 JSON 验证了类型链路的正确性
