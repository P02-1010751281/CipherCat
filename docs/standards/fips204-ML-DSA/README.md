# FIPS 204 — 全算法索引

来源: NIST FIPS 204 — Module-Lattice-Based Digital Signature Standard
      https://csrc.nist.gov/pubs/fips/204/final      (2024-08-13)

## ML-DSA Parameter Sets

| Parameter | ML-DSA-44 | ML-DSA-65 | ML-DSA-87 |
|-----------|:---------:|:---------:|:---------:|
| k         | 4         | 5         | 7         |
| l         | 4         | 5         | 7         |
| η         | 2         | 4         | 2         |
| τ         | 39        | 49        | 60        |
| λ         | 128       | 192       | 256       |
| q         | 8380417   | 8380417   | 8380417   |
| d         | 13        | 13        | 13        |
| γ₁        | 2^17      | 2^19      | 2^19      |
| γ₂        | (q-1)/88  | (q-1)/32  | (q-1)/32  |
| ω         | 80        | 55        | 75        |
| β = τ·η  | 78        | 196       | 120       |

Sizes (bytes):
|               | ML-DSA-44 | ML-DSA-65 | ML-DSA-87 |
|---------------|:---------:|:---------:|:---------:|
| public key    | 1312      | 1952      | 2592      |
| secret key    | 2560      | 4032      | 4896      |
| signature     | 2420      | 3309      | 4627      |

## 算法清单

| 序号 | 文件 | 名称 | 类别 | CipherCat |
|:--:|------|------|------|:--:|
| 1 | `01-ML-DSA.KeyGen.md` | ML-DSA.KeyGen() | ML-DSA 公开 API | — |
| 2 | `02-ML-DSA.Sign.md` | ML-DSA.Sign(𝑠𝑘, 𝑀 , 𝑐𝑡𝑥) | ML-DSA 公开 API | — |
| 3 | `03-ML-DSA.Verify.md` | ML-DSA.Verify(𝑝𝑘, 𝑀 , 𝜎, 𝑐𝑡𝑥) | ML-DSA 公开 API | — |
| 4 | `04-HashML-DSA.Sign.md` | HashML-DSA.Sign(𝑠𝑘, 𝑀 , 𝑐𝑡𝑥, PH) | HashML-DSA 公开 API | — |
| 5 | `05-HashML-DSA.Verify.md` | HashML-DSA.Verify(𝑝𝑘, 𝑀 , 𝜎, 𝑐𝑡𝑥, PH) | HashML-DSA 公开 API | — |
| 6 | `06-ML-DSA.KeyGen_internal.md` | ML-DSA.KeyGen_internal(𝜉) | ML-DSA 内部 API | — |
| 7 | `07-ML-DSA.Sign_internal.md` | ML-DSA.Sign_internal(𝑠𝑘, 𝑀 ′ , 𝑟𝑛𝑑) | ML-DSA 内部 API | — |
| 8 | `08-ML-DSA.Verify_internal.md` | ML-DSA.Verify_internal(𝑝𝑘, 𝑀 ′ , 𝜎) | ML-DSA 内部 API | — |
| 9 | `09-IntegerToBits.md` | IntegerToBits(𝑥, 𝛼) | 整数/比特/字节编码 | — |
| 10 | `10-BitsToInteger.md` | BitsToInteger(𝑦, 𝛼) | 整数/比特/字节编码 | — |
| 11 | `11-IntegerToBytes.md` | IntegerToBytes(𝑥, 𝛼) | 整数/比特/字节编码 | — |
| 12 | `12-BitsToBytes.md` | BitsToBytes(𝑦) | 整数/比特/字节编码 | — |
| 13 | `13-BytesToBits.md` | BytesToBits(𝑧) | 整数/比特/字节编码 | — |
| 14 | `14-CoeffFromThreeBytes.md` | CoeffFromThreeBytes(𝑏0 , 𝑏1 , 𝑏2 ) | 系数采样辅助 | — |
| 15 | `15-CoeffFromHalfByte.md` | CoeffFromHalfByte(𝑏) | 系数采样辅助 | — |
| 16 | `16-SimpleBitPack.md` | SimpleBitPack(𝑤, 𝑏) | 比特打包 | — |
| 17 | `17-BitPack.md` | BitPack(𝑤, 𝑎, 𝑏) | 比特打包 | — |
| 18 | `18-SimpleBitUnpack.md` | SimpleBitUnpack(𝑣, 𝑏) | 比特打包 | — |
| 19 | `19-BitUnpack.md` | BitUnpack(𝑣, 𝑎, 𝑏) | 比特打包 | — |
| 20 | `20-HintBitPack.md` | HintBitPack(𝐡) | 比特打包 | — |
| 21 | `21-HintBitUnpack.md` | HintBitUnpack(𝑦) | 比特打包 | — |
| 22 | `22-pkEncode.md` | pkEncode(𝜌, 𝐭1 ) | 密钥/签名编解码 | — |
| 23 | `23-pkDecode.md` | pkDecode(𝑝𝑘) | 密钥/签名编解码 | — |
| 24 | `24-skEncode.md` | skEncode(𝜌, 𝐾, 𝑡𝑟, 𝐬1 , 𝐬2 , 𝐭0 ) | 密钥/签名编解码 | — |
| 25 | `25-skDecode.md` | skDecode(𝑠𝑘) | 密钥/签名编解码 | — |
| 26 | `26-sigEncode.md` | sigEncode(𝑐,̃ 𝐳, 𝐡) | 密钥/签名编解码 | — |
| 27 | `27-sigDecode.md` | sigDecode(𝜎) | 密钥/签名编解码 | — |
| 28 | `28-w1Encode.md` | w1Encode(𝐰1 ) | 密钥/签名编解码 | — |
| 29 | `29-SampleInBall.md` | SampleInBall(𝜌) | 采样 | — |
| 30 | `30-RejNTTPoly.md` | RejNTTPoly(𝜌) | 采样 | — |
| 31 | `31-RejBoundedPoly.md` | RejBoundedPoly(𝜌) | 采样 | — |
| 32 | `32-ExpandA.md` | ExpandA(𝜌) | 采样 | — |
| 33 | `33-ExpandS.md` | ExpandS(𝜌) | 采样 | — |
| 34 | `34-ExpandMask.md` | ExpandMask(𝜌, 𝜇) | 采样 | — |
| 35 | `35-Power2Round.md` | Power2Round(𝑟) | 舍入与分解 | — |
| 36 | `36-Decompose.md` | Decompose(𝑟) | 舍入与分解 | — |
| 37 | `37-HighBits.md` | HighBits(𝑟) | 舍入与分解 | — |
| 38 | `38-LowBits.md` | LowBits(𝑟) | 舍入与分解 | — |
| 39 | `39-MakeHint.md` | MakeHint(𝑧, 𝑟) | 舍入与分解 | — |
| 40 | `40-UseHint.md` | UseHint(ℎ, 𝑟) | 舍入与分解 | — |
| 41 | `41-NTT.md` | NTT(𝑤) | NTT 运算 | — |
| 42 | `42-NTT−1.md` | NTT−1 (𝑤)̂ | NTT 运算 | — |
| 43 | `43-BitRev8.md` | BitRev8 (𝑚) | NTT 运算 | — |
| 44 | `44-AddNTT.md` | AddNTT(𝑎,̂ 𝑏)̂ | NTT 运算 | — |
| 45 | `45-MultiplyNTT.md` | MultiplyNTT(𝑎,̂ 𝑏)̂ | NTT 运算 | — |
| 46 | `46-AddVectorNTT.md` | AddVectorNTT(𝐯,̂ 𝐰) | NTT 运算 | — |
| 47 | `47-ScalarVectorNTT.md` | ScalarVectorNTT(𝑐,̂ 𝐯)̂ | NTT 运算 | — |
| 48 | `48-MatrixVectorNTT.md` | MatrixVectorNTT(𝐌, | NTT 运算 | — |
| 49 | `49-MontgomeryReduce.md` | MontgomeryReduce(𝑎) | Montgomery 约简 | — |

CipherCat 尚未实现 ML-DSA。全部 49 个算法仅供参考。