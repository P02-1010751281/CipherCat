# MCL 生成器语法契约（metacrypt，2026-08-03 确定）

MCL（Meta Crypto Language）= metacrypt 专属教学伪代码 DSL。生成器在 `frontend/src/features/blockly/core/generators/mcl/`，metacrypt 专属、**不在 sync 范围**（CipherCat 无 MCL）。

## 调用约定（Blockly 12.5.1 源码实证）

- `mclGenerator.forBlock[type]` 函数签名：`(block: Block, generator: MCLGenerator)`。
- Blockly 以 **`func.call(block, block, this)`** 调用——**双参都传**（block + generator 实例）。`text.ts` 的双参模式是官方正确写法；`sha256.ts`/`argon2.ts` 的模块级单例 `mclGenerator.valueToCode(...)` 也有效（同一实例），但**新增一律用双参模式**（不依赖模块单例，可测试）。
- 值块返回 `[string, Order]` 元组；语句块返回 `string`（多行，`# ` 注释 + 代码行）。

## 程序外壳（MCLGenerator.finish 自动包）

```
BEGIN MCL PROGRAM
DEFINE VARIABLES: <var1>, <var2>   ← 有变量时
<definitions>
<code>
END MCL PROGRAM
```

## 语法元素

| 元素 | 约定 | 例 |
|---|---|---|
| 指令 | 大写指令词 + 括号 + 逗号分隔参数 | `SHA256_PAD(x)`、`JOIN_TEXT (a, b)`、`ARGON2_HASH(p, s, sec, ad, 32, 3, 4, 32, 0)` |
| Order | 指令调用用 `Order.FUNCTION_CALL`，原子值 `Order.ATOMIC` | |
| 默认值 | 空输入给教学占位：字节 `|| '[]'`（或语义名 `|| 'MESSAGE'`），数字 `|| '32'` 等 | `mclGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'MESSAGE'` |
| 字符串 | `generator.quote_()`（双引号，转义 \\ \n \'） | |
| 注释 | `# ` 前缀（scrub_ 自动加块注释） | |
| 语句块 | 返回多行 string，`generator.prefixLines` 缩进 | |
| 未覆盖块 | 兜底 `UNSUPPORTED_OP("块名")`（MCLGenerator.blockToCode override，不抛错） | |

## 注册方式

- 目录内文件 `export function <块名>(block, generator)`；目录 `index.ts` `export * from './<文件>'`。
- 顶层 `mcl/index.ts`：`import * as <mod> from './<mod>'` + `...<mod>` 展开进 `generators` + `mclGenerator.forBlock[name] = generators[name]`（循环自动注册）。目录型（`./ctrl` 等副作用 import）在文件内直接 `mclGenerator.forBlock['x'] = ...` 赋值。
- 新算法族建新目录（如 `symmetric/`）时：建目录 + index.ts + 在 mcl/index.ts 加 import 与 spread。

## 覆盖状态（2026-08-03 全量补完后）

- 136 个注册块中 **134 覆盖**（`procedures_mutatorarg`/`mutatorcontainer` 为 mutator 内部 UI 块，正确无生成器）。
- 新目录：`symmetric/`（AES/SM4/mode/CCM/CMAC/GCM/XTS）、`zuc/`、`ascon/`；ecc/ 扩展（ecdh/sm2/ecdsa/eddsa/x25519）、hash/ 扩展（hmac/sha512/keccak/sponge/pbkdf2/hkdf/gm-rng）、data/ 扩展（value/encoding/padding）、numtheory/ 扩展（rsa/sm9/drbg/gf2m）、post-quantum/ 扩展（mldsa/mat-vec/poly-sub）。
- 未覆盖块兜底 `UNSUPPORTED_OP("块名")` 保持（防御新增块）。
