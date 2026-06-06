# Algorithm 34  ExpandMask(𝜌, 𝜇)

**章节**: §3.3  
**类别**: 采样

### 规范

```
Algorithm 34 ExpandMask(𝜌, 𝜇)
Samples a vector 𝐲 ∈ 𝑅ℓ such that each polynomial 𝐲[𝑟] has coefficients between −𝛾1 + 1 and
𝛾1 .
Input: A seed 𝜌 ∈ 𝔹64 and a nonnegative integer 𝜇.
Output: Vector 𝐲 ∈ 𝑅ℓ .
1: 𝑐 ← 1 + bitlen (𝛾1 − 1)
2: for 𝑟 from 0 to ℓ − 1 do
3:
𝜌′ ← 𝜌||IntegerToBytes(𝜇 + 𝑟, 2)
4:
𝑣 ← H(𝜌′ , 32𝑐)
5:
𝐲[𝑟] ← BitUnpack(𝑣, 𝛾1 − 1, 𝛾1 )
6: end for
7: return 𝐲
38

▷ 𝛾1 is always a power of 2
▷ seed depends on 𝜇 + 𝑟

FIPS 204

7.4

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

High-Order and Low-Order Bits and Hints

This specification uses the auxiliary functions Power2Round, Decompose, HighBits, LowBits, MakeHint,
and UseHint and explicitly defines these functions, where 𝑟 ∈ ℤ𝑞 , 𝑟1 , 𝑟0 ∈ ℤ, and ℎ is a Boolean (or
equivalently an element of ℤ2 ). However, this specification also uses these functions where 𝐫, 𝐳 ∈ 𝑅𝑞𝑘 ,
𝐫1 , 𝐫0 ∈ 𝑅𝑘 , and 𝐡 ∈ 𝑅2𝑘 . In this case, the functions are applied coefficientwise to the polynomials in the
vectors. In particular:
• For 𝐫 ∈ 𝑅𝑞𝑘 , define (𝐫1 , 𝐫0 ) ∈ (𝑅𝑘 )2 = Power2Round(𝐫) so that:
((𝐫1 [𝑖])𝑗 , (𝐫0 [𝑖])𝑗 ) = Power2Round((𝐫[𝑖])𝑗 ).
• For 𝐫 ∈ 𝑅𝑞𝑘 , define (𝐫1 , 𝐫0 ) ∈ (𝑅𝑘 )2 = Decompose(𝐫) so that:
((𝐫1 [𝑖])𝑗 , (𝐫0 [𝑖])𝑗 ) = Decompose((𝐫[𝑖])𝑗 ).
• For 𝐫 ∈ 𝑅𝑞𝑘 , define 𝐫1 = HighBits (𝐫) so that:
(𝐫1 [𝑖])𝑗 = HighBits((𝐫[𝑖])𝑗 ).
• For 𝐫 ∈ 𝑅𝑞𝑘 , define 𝐫0 = LowBits(𝐫) so that:
(𝐫0 [𝑖])𝑗 = LowBits((𝐫[𝑖])𝑗 ).
• For 𝐳, 𝐫 ∈ 𝑅𝑞𝑘 , define 𝐡 ∈ 𝑅2𝑘 = MakeHint(𝐳, 𝐫) so that:
(𝐡[𝑖])𝑗 = MakeHint((𝐳[𝑖])𝑗 , (𝐫[𝑖])𝑗 ).
• For 𝐡 ∈ 𝑅2𝑘 and 𝐫 ∈ 𝑅𝑞𝑘 , define 𝐫1 ∈ 𝑅𝑘 = UseHint(𝐡, 𝐫) so that:
𝐫1 [𝑖]𝑗 = UseHint((𝐡[𝑖])𝑗 , (𝐫[𝑖])𝑗 ).
These algorithms are used to support the key compression optimization of ML-DSA. They involve dropping
the 𝑑 low-order bits of each coefficient of the polynomial vector 𝐭 from the public key using the function
Power2Round. However, in order to make this optimization work, additional information called a “hint”
needs to be provided in the signature to allow the verifier to reconstruct enough of the information in
the dropped public-key bits to verify the signature. Hints are created during signing and used during
verification by the functions MakeHint and UseHint, respectively. In the verification of a valid signature,
the hint allows the verifier to recover 𝐰1 ∈ 𝑅𝑘 , which represents 𝐰 ∈ 𝑅𝑞𝑘 rounded to a nearby multiple
of 𝛼 = 2𝛾2 . The signer directly obtains 𝐰1 using the function HighBits, and the part rounded off (i.e., 𝐫0 )
is obtained by LowBits. 𝐫0 is used by the signer in the rejection sampling procedure.
Power2Round decomposes an input 𝑟 ∈ ℤ𝑞 into integers that represent the high- and low-order bits of
𝑟 mod 𝑞 in the straightforward bitwise way, 𝑟 mod 𝑞 = 𝑟1 ⋅ 2𝑑 + 𝑟0 , where 𝑟0 = (𝑟 mod 𝑞) mod± 2𝑑 and
𝑟1 = (𝑟 mod 𝑞 − 𝑟0 )/2𝑑 .
However, for the purpose of computations related to hints, this method of decomposing 𝑟 has the
undesirable property that when 𝑟 is close to 𝑞 − 1 or 0, a small rounding error in 𝑟 can cause 𝑟1 to change
by more than 1, even accounting for wrap-around. In contrast to other unequal pairs of values of 𝑟1 ⋅ 2𝑑
and 𝑟1′ ⋅ 2𝑑 , the distance (mod𝑞) between ⌊𝑞/2𝑑 ⌋ ⋅ 2𝑑 and 0 may be very small.

39

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

To avoid this problem, this specification defines Decompose, which is similar to Power2Round except:
• 𝑟 is generally decomposed as 𝑟 mod 𝑞 = 𝑟1 ⋅ 𝛼 + 𝑟0 , where 𝛼 = 2𝛾2 is a divisor of 𝑞 − 1.
• If the straightforward rounding procedure would return (𝑟1 = (𝑞 − 1)/𝛼, 𝑟0 ∈ [−(𝛼/2) + 1, 𝛼/2]),
Decompose instead returns (𝑟1 = 0, 𝑟0 − 1).
The functions HighBits and LowBits — which only return 𝑟1 and 𝑟0 , respectively — and MakeHint and
UseHint use Decompose. For additional discussion of the mathematical properties of these functions
that are relevant to the correctness and security of ML-DSA, see Section 2.4 in [6].

```

### CipherCat

尚未实现。
