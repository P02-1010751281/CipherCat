# 用户指南：从积木到算法与验证

CipherCat 是基于 Blockly 的密码算法结构与代码生成前端，支持展示原语、拼装算法阶段、生成 Python/JavaScript 代码，并提供演示工作区与标准参考。若将代码提交到集成的 Metacrypto 平台做随机性测评，样本生成、统计检测和报告由平台后端负责。代码生成、演示验证和后端测评属于不同证据层级，不能相互替代。本文截图用于说明 CipherCat 界面，不证明当前部署版本的页面状态。

## 1. 文档路径

| 目标 | 文档 |
|---|---|
| 了解平台定位和能力分类 | [能力地图](./CAPABILITY-MAP.md) |
| 学习编辑器、类型和函数块 | [Blockly 使用指南](./BLOCKLY-GUIDE.md) |
| 查看可导入工作区 | [演示指南](./DEMO.md)、[演示文件清单](../../demos/README.md) |
| 核对标准公式、伪代码和原文 | [标准覆盖矩阵](../standards/COVERAGE.md)、对应标准目录的结构化页和 `00-Standard-Source.md` |
| 查看文档提取与缺项 | [标准文档状态](../standards/DOCUMENT-STATUS.md) |

## 2. 项目与编辑器

### 2.1 打开编辑器

CipherCat 首页可进入项目列表、文档中心并切换语言。选择“新建项目”会创建本地 Blockly 工作区；项目和工作区保存在浏览器 IndexedDB，编辑器路由为 `/editor/<项目编号>`。

此项目列表入口仅适用于 CipherCat；Metacrypto 使用首页的“打开 Composer”进入编辑器，并通过资源页管理平台项目。两者的首页和项目截图不可互换。

### 2.2 导入工作区

编辑器菜单“更多 → 导入工作区”支持 Blockly JSON/XML。推荐先导入演示工作区，再逐步替换输入或算法阶段。入门顺序如下：

| 学习目标 | 工作区 | 内容 |
|---|---|---|
| AES 单轮原语顺序调用 | `demos/AES-Atomic-Round.json` | 四个顶层原语按工作区顺序原地修改共享状态；无值接口连线 |
| AES 显式函数链 | `demos/procedures/AES-Round.json` | `AddRoundKey(MixColumns(ShiftRows(SubBytes(state))), round_key)` |
| SM3 散列链 | `demos/procedures/SM3-Hash.json` | 填充、压缩和摘要返回 |
| 函数封装 | `demos/Procedure-AES-Round.json` | 原子块链与 `procedures_defreturn` |
| 格基原语 | `demos/ML-KEM-Atomic.json` | 采样、NTT、多项式/向量运算和编码 |
| 标准向量链 | `demos/procedures/ML-KEM-Encaps.json` | FIPS 203 ML-KEM-512 Encaps |

![“更多”菜单中的导入工作区入口（界面示例）](/docs-assets/tutorials/03-import-menu.png)

_图：导入入口位于编辑器的“更多”菜单。_

### 2.3 编辑、生成与保存

编辑器左侧为 Blockly 工作区，右侧为代码预览：

1. 从工具箱拖出积木块并按类型连接。
2. 在代码面板选择 Python 或 JavaScript。
3. 点击“生成代码”生成代码文本，点击“复制代码”复制结果。
4. 使用“保存”或自动保存保存项目。

当前前端生成器支持 Python 和 JavaScript。生成代码可复制到对应运行环境或测试脚本中执行；前端不把任意生成代码直接转换为平台后端测评结论。

![生成 Python 代码后的编辑器（界面示例）](/docs-assets/tutorials/05-generated-python.png)

_图：代码面板显示生成结果；代码显示不等于后端测评结论。_

菜单操作：

- “更多 → 导出工作区”：导出 JSON 或 XML；
- “更多 → 导入工作区”：导入 JSON/XML 文件；
- “更多 → 新建工作区”：重新开始当前画布；
- “更多 → 清空工作区”：删除当前画布中的块。

## 3. 块的层次与类型

### 3.1 三层块结构

| 层级 | 名称 | 示例 | 作用 |
|---|---|---|---|
| L1 | 原子原语 | `pq_ntt`、`hash_sm3_compress`、`aes_sub_bytes`、`gf2_poly_mul` | 对照标准公式和伪代码表达单个步骤 |
| L2 | 组合操作 | `mode_cbc_encrypt`、`gcm_encrypt`、`pq_mat_vec_mul` | 表达可复用的算法阶段 |
| L3 | 函数/模板 | `procedures_defreturn`、`proc_*` | 添加参数、返回值和函数调用接口 |

块的层级不表示认证级别。原子块、组合块和模板均须结合标准条目和演示工作区判断覆盖范围。

### 3.2 数据类型与积木连接

类型帮助 Blockly 检查积木能否连接。类型名表示数据的内容和用途，不只是代码里的数组形状；例如，字节序列和比特序列不能因为生成代码都使用数组就直接互换。平台不会自动插入通用类型转换；需要转换时，请使用对应的转换积木，并核对位序、字节序和长度。

| 类型 | 表示内容 | 常见用途 |
|---|---|---|
| `Bytes` | 字节序列 | 密钥、消息、密文、随机种子、摘要 |
| `Bits` | 由 0 和 1 组成的比特序列 | 标准算法中的位级输入和编码 |
| `IntList` | 整数列表 | 状态字、多项式系数、有限域元素 |
| `Vector` / `Matrix` | 带向量或矩阵语义的整数列表 | 多项式向量、矩阵和算法中间值 |
| `Number` | 单个整数 | 长度、模数、轮数和索引 |
| `SBox` | 替换盒查找表 | 分组密码中的非线性替换 |
| `String` / `Boolean` | 文本 / 是或否结果 | 文本参数、判断结果 |

积木只能连接到接口接受的类型。两端类型相同通常可以连接；类型不同且输入端有限制时，Blockly 会拒绝连接。比如 `Bytes` 输出可接收 `Bytes` 的输入；`Bits` 和 `IntList` 即使在生成代码中都可能表示为整数数组，也不能直接互连。需要转换时，只使用工具箱实际提供的对应转换积木，并核对位序、字节序和长度；不要通过放宽类型限制来绕过检查。

遇到连接问题时，先看输出端和输入端标注的类型，再决定是否需要转换。完整的类型名称、块端口声明和开发约定见开发文档中的[类型系统规范](./TYPE-SYSTEM.md)。

## 4. 算法搭建流程

### 4.1 确定算法边界

开始搭建前，先阅读对应标准目录的结构化条目，确认：

- 输入、输出、字节序和编码格式；
- 参数、常量、模数和长度；
- 算法阶段及其标准条款；
- 当前项目记录的是完整接口、核心阶段还是教学子集。

密码算法的常见错误来自字节序、填充、截断、编码长度和随机数域分隔。块名不能替代输入输出规范。

### 4.2 从原子演示工作区开始

推荐的搭建顺序是：

```text
输入
  → 填充 / 编码
  → 采样 / 域运算
  → 置换 / 压缩 / 轮函数
  → 组合 / 截断
  → 输出
```

导入最接近的演示工作区，保留已知输入和输出，每次只替换一个阶段。该方法可以将失败定位到具体积木链。

### 4.3 使用函数块封装

当一条块链能够独立表达一个阶段时：

1. 使用 `procedures_defreturn` 创建函数；
2. 打开函数块的变形设置（mutator），添加参数并选择字节序列（`bytes`）、整数列表（`int_list`）、多项式（`poly`）或种子（`seed`）等语义类型；
3. 将原子链放入函数体；
4. 使用 `crypto_return` 返回结果；
5. 使用调用块在主流程或其他函数中复用。

示例：SM3 可封装为“消息 → 填充 → 压缩 → 摘要”；ML-KEM Encaps 可封装为“封装密钥和消息/随机输入 → SHA3 派生 → SampleNTT/CBD → NTT 域运算 → 编码压缩 → 密文和共享密钥”。

### 4.4 区分完整算法与算法阶段

仓库中的工作区分为原子原语、算法阶段、函数封装链和少量完整接口。`AES-Atomic-Round.json` 是 AES 单轮结构示例，不等同于完整 AES-128 加密接口；`procedures/ML-KEM-Encaps.json` 是带 FIPS 203 Encaps 测试规格的完整链路示例。具体边界以 [能力地图](./CAPABILITY-MAP.md) 和 [覆盖矩阵](../standards/COVERAGE.md) 为准。

### 4.5 三条搭建路线

| 路线 | 原子链/阶段 | 工作区 |
|---|---|---|
| SM3 摘要 | `hash_sm3_pad` → `hash_sm3_compress` → `crypto_return` | `demos/procedures/SM3-Hash.json` |
| AES 单轮 | `SubBytes` → `ShiftRows` → `MixColumns` → `AddRoundKey` | 显式连接：`demos/procedures/AES-Round.json`；共享状态顺序调用：`demos/AES-Atomic-Round.json` |
| ML-KEM Encaps | `pq_xof`/seed → `pq_sample_ntt`、`pq_sample_poly_cbd` → `pq_ntt`/`pq_intt`/`pq_ntt_mul` → `pq_poly_add`/`pq_mat_vec_mul` → `pq_byte_encode`/`pq_compress` | `demos/ML-KEM-Atomic.json`、`demos/procedures/ML-KEM-Encaps.json` |

固定输入复现通过后，再替换为函数参数，最后增加循环、分支、拒绝路径和多参数支持。

## 5. 验证与测评

项目采用四层验证模型：

| 层级 | 执行方 | 验证内容 | 主要证据 |
|---|---|---|---|
| 工作区/生成器 | CipherCat | JSON/XML 加载、块连接、Python/JavaScript 代码生成 | 编辑器、构建、模板验证工具 |
| 向量/交叉验证 | CipherCat 演示验证工具 | 登记输入与标准向量或独立实现的一致性 | `demos/tests.json`、`npm run verify:all` |
| 用户代码试验 | 用户的 Python/JavaScript 环境 | 修改后代码在指定输入下的行为 | 代码、测试脚本、输入输出 |
| 平台后端随机性测评 | `metacrypt_server` 后端生成样本并执行检测；其平台前端展示报告 | 样本生成、隔离执行、统计检测、规则判定和报告 | 任务结果含代码/样本指纹，对比接口另给参数指纹；检测器/规则版本及报告完整性仍有缺项 |

没有登记演示工作区的块不得仅因能够生成代码而标记为“已验证”。演示通过也不等同于认证通过。

### 5.1 本地工程门禁

```bash
npm run verify:all
npm run docs:check-links
npm run test:unit
npm run build
```

`verify:all` 包含标准元数据、结构化拆分、公式、标准原文回链、模板、演示工作区和验证构建；`docs:check-links` 检查 Markdown 相对链接；`test:unit` 和 `build` 分别检查单元测试与前端生产构建。

单独验证工作区时，先构建验证工具，再按 [demos/README.md](../../demos/README.md) 和 `scripts/verify-demo.ts` 的说明执行。

### 5.2 平台后端随机性测评边界

平台试验与后端测评的职责划分如下：

```text
CipherCat：积木构建、代码生成、用户代码试验
        ↓
metacrypt_server：隔离生成样本并执行统计检测；在自身平台前端展示任务报告
```

样本生成、统计检测、隔离环境和最终判定由 `metacrypt_server` 后端链路执行；Metacrypto 平台前端提供任务列表和报告详情。CipherCat 编辑器提供 Blockly 编辑、代码生成和用户代码试验；集成平台的任务/报告是独立功能，不由编辑器本身作出测评结论。后端测评不证明生成器诚实、熵源合格或算法获得认证。详细说明见 [GM/T 0005 后端测评边界](../standards/gmt0005-randomness/03-Backend-Evaluation.md)。

报告和对比接口中的指纹仅用于区分其明确的输入范围：`projectCodeHash` 对应提交源码，`sampleHash` 对应按序送检的样本字节，数据库字段 `input_hash` 在对比接口中以 `inputHash1/2` 表示规范化参数。匹配只表示对应范围的指纹相同，不证明样本来源、算法正确性或任务可复现。完整字段定义见[后端测评边界](../standards/gmt0005-randomness/03-Backend-Evaluation.md)。

本指南不嵌入后端测评报告截图。截图应来自已登录的 `metacrypt_server` 任务详情页，图注只描述任务编号和页面实际显示的字段。若研究记录需要版本或原始结果，应另附可核对的任务日志/结果文件；页面未展示的规则或检测器版本不得仅凭截图宣称。登录页、401 页面或人工拼接的报告不能作为插图。

## 6. 结果状态

实验记录采用以下状态：

- **结构已覆盖**：存在对应 Blockly 块和标准结构化参考；
- **演示已验证**：登记的演示工作区通过向量、性质或交叉断言；
- **标准参考已回链**：结构化条目可回到标准原文、公式、伪代码或条款；
- **教学子集**：仅覆盖核心阶段、固定参数或简化输入；
- **后端测评**：后端已返回随机性检测报告；完整性与版本可追溯性按报告实际字段核验。

除非存在独立证据，文档不得使用“完整算法已认证”“随机性已通过”或“所有参数集均支持”等表述。

## 7. 文档导航

- [能力地图](./CAPABILITY-MAP.md)：算法分类、原语范围和证据边界；
- [Blockly 使用指南](./BLOCKLY-GUIDE.md)：编辑器细节、类型系统和模板；
- [演示指南](./DEMO.md)：AES、SM4、散列、SM2 和后量子案例；
- [积木块索引](../blocks/INDEX.md)：自定义块和标准依据；
- [标准覆盖矩阵](../standards/COVERAGE.md)：标准、积木、演示、模板和搭建指南；
- [标准文档状态](../standards/DOCUMENT-STATUS.md)：原文提取、结构化拆分和已知缺项。
