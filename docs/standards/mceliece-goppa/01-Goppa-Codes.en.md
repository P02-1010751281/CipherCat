## Entry Metadata

| Field | Value |
|---|---|
| Type | Encoding primitive / teaching breakdown |
| Standard position | Goppa-code definition, generator polynomial, and syndrome |
| Source evidence | [Research-source index](./00-Research-Source.en.md#L17): Goppa 1970, Berlekamp 1973, ISO Clause 13 |
| Source location | Goppa 1970 §§2–3; ISO/IEC 18033-2:2006/Amd 2:2026 Clause 13; the full ISO text is not stored locally |
| Project status | Teaching primitives implemented; ISO Classic McEliece parameter sets and conformance are not implemented |

## Source Location and Citation

> This page is a structured teaching explanation based on research papers and ISO standard context, not a transcription of the full standard. See the [source index](./00-Research-Source.en.md#L17) for original sources and access limitations.

## Source Notes (Paraphrase, Not a Verbatim Quote)

> Source entry points: Goppa 1970, Berlekamp 1973, and ISO Clause 13. Bibliographic details and local-file status are listed in [00-Research-Source.md](./00-Research-Source.md#L17).

A binary Goppa code is a linear error-correcting code defined using a finite-field polynomial G(z) and a support set L. Its algebraic decoding structure provides mathematical background for code-based cryptography.

## Formula or Pseudocode

> The following is a complete teaching summary of the formulas used by this page, not a verbatim extract from the paywalled ISO text. Consult the original sources for normative definitions and parameters.

### Definition

Let G(z) be a degree-t polynomial over GF(2^m), and let L = {α₀, …, αₙ₋₁} ⊆ GF(2^m), where G(αᵢ) ≠ 0. The binary Goppa code is

```text
Γ(L, G) = { c ∈ GF(2)^n : Σᵢ cᵢ / (z − αᵢ) ≡ 0 mod G(z) }
```

Its length is n=|L|, its dimension satisfies k ≥ n−m·t, and it corrects up to t errors.

### Parity-Check Matrix

Set hᵢ=1/G(αᵢ). Form H from columns hᵢ·αᵢʲ for j=0,…,t−1, expanding each GF(2^m) element over GF(2). For received word y, the syndrome is s=H·y over GF(2). A zero syndrome means y is a codeword.

### Teaching Instance

- L contains 14 elements from the GF(16) subfield of the AES field GF(2^8); roots 13 and 81 of G are excluded.
- G=[176,92,1], with t=2 and roots 13 and 81.
- n=14 and k=6, using subfield degree m′=4; the measured parity-check rank is 8.

Property vectors in `demos/procedures/GF2m-Poly.json` check polynomial roots, the constant term 24, a Bézout identity, and monicity.

### Generator Polynomial

```text
G(z) = ∏ᵢ (z − αᵢ), with every αᵢ in the support set and G(αᵢ) ≠ 0.
```

In characteristic 2, subtraction equals addition. The teaching implementation multiplies coefficient polynomials over the AES field GF(2^8), using polynomial representation 0x11B.

## CipherCat Block Mapping

- `goppa_gen_poly(alpha)` returns low-degree-first coefficients of G(z)=∏(z−αᵢ).
- `syndrome_calc(h, y, m, n)` computes s=H·y mod 2 for a flattened binary matrix H.
- `gf2m_poly_add/mul/mod` implement coefficient-polynomial operations over GF(2^8); `gf2m_poly_mod` reduces modulo a monic polynomial.
- `gf2m_poly_eval(poly, alpha)` evaluates P(α) with Horner’s method.
