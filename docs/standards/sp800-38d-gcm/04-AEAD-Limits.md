# GCM — IV 唯一性、调用上限与实现验证

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 标准约束 / IV 管理 / 实现验证 |
| 标准定位 | NIST SP 800-38D §§8–9，含 §§8.1–8.3、9.1–9.2 |
| 原文证据 | [GCM 原文提取稿](./00-Standard-Source.md) · [NIST SP 800-38D PDF](./NIST.SP.800-38D.pdf) |
| 原文位置 | PDF 页码 26–32（标准页 18–24）；提取稿 [§8](./00-Standard-Source.md#L1066)、[§8.1](./00-Standard-Source.md#L1090)、[§8.2](./00-Standard-Source.md#L1117)、[§8.2.1](./00-Standard-Source.md#L1143)、[§8.2.2](./00-Standard-Source.md#L1174)、[§8.3](./00-Standard-Source.md#L1206)、[§9](./00-Standard-Source.md#L1247)、[§9.1](./00-Standard-Source.md#L1262)、[§9.2](./00-Standard-Source.md#L1323) |
| 项目状态 | 项目有 GCM 加密路径；IV 唯一性策略、标准调用上限和认证解密未形成完整实现覆盖 |

## 原文定位与引用

本条目完整整理 §§8–9 及其子节。此处引用的验证要求与 NIST SP 800-38D 原文相关，不表示项目已经通过 FIPS 140 验证或满足该标准的全部部署要求。全文页码与数学上、下标按本地 PDF 视觉页核对；原始文本层见对应 source 行号。

## 原文摘录

> 以下为 §§8–9 的完整正文摘录，保留规范性要求、示例和问项；仅整理 PDF 分页、页眉及行末断行，并按 PDF 视觉版恢复数学上、下标。

### 8 Uniqueness Requirement on IVs and Keys

> The IVs in GCM must fulfill the following “uniqueness” requirement:
>
> The probability that the authenticated encryption function ever will be invoked with the same IV and the same key on two (or more) distinct sets of input data shall be no greater than 2⁻³².
>
> Compliance with this requirement is crucial to the security of GCM. Across all instances of the authenticated encryption function with a given key, if even one IV is ever repeated, then the implementation may be vulnerable to the forgery attacks that are described in Ref. [5] and summarized in Appendix A. In practice, this requirement is almost as important as the secrecy of the key.
>
> The role of key establishment in supporting this requirement is discussed in Sec. 8.1. The two allowed IV constructions for satisfying this requirement are given in Sec. 8.2. Constraints on the number of invocations of the authenticated encryption function are given in Sec. 8.3.

### 8.1 Key Establishment

> The following requirement, which is the norm for secret key cryptographic algorithms in general, takes on explicit importance for GCM to support the uniqueness requirement in Sec. 8:
>
> Any GCM key that is established among its intended users shall, with high probability, be fresh.
>
> In practice, the requirements in Sec. 5.1 should ensure that a key is fresh when it is generated, if the generation mechanism is resistant to tampering. Achieving such resistance usually imposes requirements on the management of the key generation mechanism.
>
> In particular, if the key generation mechanism is deterministic, then the management of the mechanism shall provide strong assurance that no outside entity can induce the repetition of a previous set of inputs to the mechanism, or otherwise cause the repetition of a previous output. For example, GCM keys may be established using the key derivation functions of the following protocols as allowed in [9]: Transport Layer Security, Internet Key Exchange v1 and v2, and Secure Shell.
>
> Similarly, if a new key must be transported to its intended recipient(s), the method of transport/distribution shall provide strong assurance against “replay,” so that no party can induce the substitution of a previous key for the intended key.
>
> GCM keys should be established within the framework of an approved key management structure to assure their freshness, as well as their confidentiality and authenticity; the details of such structures are outside the scope of this Recommendation.

### 8.2 IV Constructions

> This Recommendation provides two frameworks for constructing IVs. The first construction, described in Sec. 8.2.1, relies on deterministic elements to achieve the uniqueness requirement in Sec. 8; the second construction, described in Sec. 8.2.2, relies on a sufficiently long output string from an approved RBG with a sufficient security strength.
>
> For any supported IV length that is strictly less than 96 bits, the construction in Sec. 8.2.1 shall be used, across all instances of the authenticated encryption function with the given key.
>
> For any supported IV length that is 96 bits or greater, exactly one of the constructions, but not both, shall be used, across all instances of the authenticated encryption function with the given key.
>
> For example, suppose that an implementation supports IV lengths of 64 bits, 96 bits, 128 bits, and 160 bits. For 64-bit IVs the only choice is the construction in Sec. 8.2.1. For the other three IV lengths, one possible combination of choices is the construction in Sec. 8.2.1 for 96-bit IVs and the construction in Sec. 8.2.2 for 128-bit and 160-bit IVs.

### 8.2.1 Deterministic Construction

> In the deterministic construction, the IV is the concatenation of two fields, called the fixed field and the invocation field. The fixed field shall identify the device, or, more generally, the context for the instance of the authenticated encryption function. The invocation field shall identify the sets of inputs to the authenticated encryption function in that particular device.
>
> For any given key, no two distinct devices shall share the same fixed field, and no two distinct sets of inputs to any single device shall share the same invocation field. Compliance with these two requirements implies compliance with the uniqueness requirement on IVs in Sec. 8.
>
> If desired, the fixed field itself may be constructed from two or more smaller fields. Moreover, one of those smaller fields could consist of bits that are arbitrary (i.e., not necessarily deterministic nor unique to the device), as long as the remaining bits ensure that the fixed field is not repeated in its entirety for some other device with the same key.
>
> Similarly, the entire fixed field may consist of arbitrary bits when there is only one context to identify, such as when a fresh key is limited to a single session of a communications protocol. In this case, if different participants in the session share a common fixed field, then the protocol shall ensure that the invocation fields are distinct for distinct data inputs.
>
> The invocation field typically is either 1) an integer counter or 2) a linear feedback shift register that is driven by a primitive polynomial to ensure a maximal cycle length. In either case, the invocation field increments upon each invocation of the authenticated encryption function.
>
> The lengths and positions of the fixed field and the invocation field shall be fixed for each supported IV length for the life of the key. In order to promote interoperability for the default IV length of 96 bits, this Recommendation suggests, but does not require, that the leading (i.e., leftmost) 32 bits of the IV hold the fixed field; and that the trailing (i.e., rightmost) 64 bits hold the invocation field.

### 8.2.2 RBG-based Construction

> In the RBG-based construction, the IV is the concatenation of two fields, called the random field and the free field. For each IV length that is supported by the implementation and used with the RBG-based construction, the lengths of these fields shall be fixed for the life of the key. Moreover, the length of the random field shall be at least 96 bits; the free field may be empty.
>
> If i is a supported IV length that is associated to the RBG-based construction, then let r(i) denote the bit length of the random field. The random field shall either consist of 1) an output string of r(i) bits from an approved RBG with a sufficient security strength, or 2) the result of applying the r(i)-bit incrementing function to the random field of the preceding IV for the given key. The r(i)-bit output string from the RBG is called a direct random string, and the random fields that result from applying the r(i)-bit incrementing function are called its successors.
>
> There are no requirements on the bits in the free field. For example, they may identify the device, similar to the fixed field of the deterministic construction, except within the RBG-based construction these identifiers are not required to be distinct for each device. For any IV length that is associated to the RBG-construction, the free field is recommended to be empty, so that the random field is the entire IV.
>
> The instantiations of the RBGs in any two distinct devices shall be independent, so that the distribution of direct random strings across all of the RBG instantiations is expected to be uniform. For example, if the initialization of the RBG instantiations depends only on a secret seed, then each instantiation shall be initialized with a distinct seed.

### 8.3 Constraints on the Number of Invocations

> The following requirement applies to all implementations that use either 1) the deterministic construction with IVs whose length is not 96, or 2) the RBG-based construction, for IVs of any length. In other words, unless an implementation only uses 96-bit IVs that are generated by the deterministic construction:
>
> The total number of invocations of the authenticated encryption function shall not exceed 2³², including all IV lengths and all instances of the authenticated encryption function with the given key.
>
> This is a “global” requirement that can be achieved by appropriate “local” limits on each instance of the authenticated encryption function with a given key. For example, suppose an implementation consists of 2¹⁰ devices that only support 64-bit, 96-bit, and 128-bit IVs. One way to satisfy the above requirement would be to limit each device to 2²⁰ invocations with 64-bit IVs, 2²¹ invocations with 96-bit IVs, and 2²⁰ invocations with 128-bit IVs.
>
> For the RBG-based construction of IVs, the above requirement, in conjunction with the requirement that r(i) ≥ 96, is sufficient to ensure the uniqueness requirement in Sec. 8, as follows from the discussion in Ref. [4].
>
> For the deterministic construction, the lengths of the two fields imply two additional operational constraints. These constraints apply to any supported IV length, including 96 bits:
>
> - The bit length of the invocation field limits the number of invocations of the authenticated encryption function with any given fixed field and key. In particular, if s denotes the number of bits in the invocation field, then the authenticated encryption function cannot be invoked on more than 2ˢ distinct input sets without violating the uniqueness requirement.
> - Similarly, an s-bit fixed field implies a limit of 2ˢ on the number of distinct devices/contexts that can implement the authenticated encryption function for the given key, with IVs of the given length.

### 9 Practical Considerations for Validating Implementations

> Both the designer of a GCM implementation and the information technology (IT) professional who deploys and maintains it within a particular system have important roles in meeting the uniqueness requirement in Sec. 8, as discussed in Secs. 9.1 and 9.2 below.
>
> The additional requirements in these two sections are provided for the purpose of demonstrating compliance with the uniqueness requirement in Sec. 8 within a validation program. Specifically, analogous to the requirements in Ref. [9], the requirements in these two sections apply to implementations that are validated against the requirements of FIPS Pub. 140-2 (Ref. [3]), or any superseding version of FIPS 140.
>
> Implementations that are not validated against the requirements of FIPS Pub. 140-2 may interpret the requirements in Secs. 9.1 and 9.2 as recommendations.

### 9.1 Design Considerations

> In order to inhibit an unauthorized party from controlling or influencing the generation of IVs, GCM shall be implemented only within a cryptographic module that meets the requirements of FIPS Pub. 140-2. In particular, the cryptographic boundary of the module shall contain a “generation unit” that produces IVs according to one of the constructions in Sec. 8.2 above.
>
> The documentation of the module for its validation against the requirements of FIPS 140-2 shall describe how the module complies with the uniqueness requirement on IVs. At a minimum, the documentation shall address the considerations in this section, and clearly document the responsibilities of the IT professional who configures, deploys, and maintains the GCM implementations within a larger system.
>
> The following are three important design considerations for GCM modules:
>
> 1. The freshness of keys shall be assured, as discussed in Sec. 8.1.
> 2. The IV shall be a critical security parameter as defined in FIPS Pub. 140-2 until the authenticated encryption function is invoked with the IV. Prior to this invocation, the IV shall be provided the same protection as other critical security parameters in a module that is validated to the requirements in FIPS Pub. 140-2.
> 3. A loss of power to the module shall not cause the repetition of IVs. If the generation unit cannot recover from a loss of power, then the authenticated encryption function shall enter a failure state until a fresh key can be established.
>
> The IV construction that is implemented from Sec. 8.2 above affects the options for recovery from a loss of power. For the deterministic construction, all of the deterministic elements that are necessary to construct the IV would have to be available when power is restored. For example, these elements could be stored in non-volatile memory.
>
> When power is restored, neither the preceding IV nor any other previous IV shall immediately be repeated for the key. One way to avoid such a repetition would be to ensure that the invocation field value that is periodically stored in the non-volatile memory is always one or more values ahead of the operational value in the sequence.
>
> One potential advantage of the RBG-based construction is that the RBG may be designed to recover from a loss of power in a straightforward manner, i.e., without requiring action from the IT professional that maintains the system. For example, the RBG may incorporate a non-deterministic source of bits that would automatically be available to the RBG when power is restored.
>
> Alternatively, the entire state of the RBG may be stored periodically in non-volatile memory. In this case, similar to the deterministic construction, when power is restored, the design shall ensure that the RBG shall not output strings for use within new IVs until the state of the RBG is advanced beyond the state that generated the last IV for the key. In other words, the direct random string for the first new IV shall be, with high probability, different than the direct random string in any IV that was generated before the loss of power.
>
> Even if the process is not automatic, the IT professional who maintains the system may simply reinitialize the RBG when power is restored, for example, with a fresh seed. In this case, either the design of the module or the IT professional that maintains the system shall ensure that compliance is maintained with the independence condition on the RBGs in Sec. 8.2.2.

### 9.2 Operational Considerations

> Compliance with the uniqueness requirement on IVs, and hence the security of GCM, ultimately depends on the IT professional who configures, deploys, and maintains the GCM modules within a particular system. The documentation for a GCM module shall give the IT professional detailed instructions that are tailored to the particular design of the module.
>
> The following are some typical operational considerations for the uniqueness requirement:
>
> - Is the configuration of any GCM module, or any operational value, vulnerable to control or influence from any unauthorized party?
> - For any given key, how are configuration choices enforced across all modules that ever implement the authenticated encryption function?
> - How is the freshness of keys assured, as discussed in Sec. 8.1?
> - If an implementation does not exclusively use 96-bit IVs that are generated by the deterministic construction, how is the requirement in Sec. 8.3 on the number of invocations ensured?
> - As discussed in Sec. 9.1, how does IV generation within the modules recover from a loss of power without violating the uniqueness requirement on IVs?
>
> The following considerations are specific to the deterministic construction:
>
> - How are the device identifiers installed into the fixed field so that compliance with the requirements on the fixed field in Sec. 8.2.1 is ensured, both for the initially deployed modules and for any subsequent deployed modules?
> - Is the length of the invocation field sufficient to support all of the invocations that can occur in any module during the lifetime of any key, as discussed in the first bullet in Sec. 8.3?
> - For any given key and IV length, is the length of the fixed field sufficient to support the number of modules that will implement authenticated encryption, as discussed in the second bullet in Sec. 8.3?
> - If the default setting for the lengths of the fixed field and the invocation field can be altered, then how is the choice enforced across all modules with any given key?
>
> The following consideration is specific to the RBG-based construction:
>
> - How are the RBGs for IV generation initialized so that compliance is ensured with the independence requirement in Sec. 8.2.2, for the initially deployed modules and for any subsequent deployed modules?

## 标准定义

§8–§9 的唯一性条件、IV 构造要求、调用上限与验证责任，以以上完整原文为准；不得把项目功能映射当作标准符合性结论。

## 公式或伪代码

以下为上述条款的全部数值边界和计数关系，不是项目自行补写的 GCM 算法：

```text
Pr[same key and IV are used with distinct input sets] ≤ 2⁻³²

Unless only 96-bit IVs from the deterministic construction are used:
total invocations under one key ≤ 2³²

Example: 2¹⁰ devices; per-device limits:
64-bit IVs: 2²⁰ invocations
96-bit IVs: 2²¹ invocations
128-bit IVs: 2²⁰ invocations

If invocation-field length is s bits:
invocations for one fixed field and key ≤ 2ˢ

If fixed-field length is s bits:
distinct devices/contexts for one key and IV length ≤ 2ˢ

For the RBG-based construction: random-field length r(i) ≥ 96 bits
```

## 输入与输出

本页整理的是 IV 与密钥管理约束，不定义新的算法输入或输出。算法输入、输出和认证标签语义见 [GCM AEAD 算法条目](./08-GCM-AE.md) 及 [GHASH](./02-GHASH.md)、[GCTR 与 J₀](./03-GCTR-and-J0.md)。

## 项目映射

项目提供 `gcm_encrypt` 加密路径；当前没有独立的认证解密/标签拒绝实现，也没有跨调用的 IV 唯一性状态管理、每密钥调用计数或部署配置验证。因此本文列出的是标准要求，不表示这些控制已由项目强制执行。

## 核验与缺项

原文范围已对照 NIST SP 800-38D PDF 物理第 26–32 页（标准页 18–24）逐页核对。项目侧仍需补充 IV 重用与计数边界的设计说明、认证解密/篡改拒绝测试，以及面向目标部署模式的密钥和 IV 生命周期检查；本条目不构成 FIPS 140 验证或认证声明。
