# PBKDF2 Specification (NIST SP 800-132)

来源: NIST SP 800-132 — Recommendation for Password-Based Key Derivation
PDF: [NIST.SP.800-132.pdf](./NIST.SP.800-132.pdf)
全文: [full.txt](./full.txt) (636 lines)

## PBKDF2 Definition

PBKDF2(P, S, c, dkLen) = T₁ ‖ T₂ ‖ ... ‖ T_{dkLen/hLen}

where Tᵢ = U₁ ⊕ U₂ ⊕ ... ⊕ U_c
      U₁ = PRF(P, S ‖ INT(i))
      Uⱼ = PRF(P, U_{j-1}), for j > 1

## CipherCat 实现

`kdf_pbkdf2` — 使用 hashlib.pbkdf2_hmac / Web Crypto API
