## Entry Metadata

| Field | Value |
|---|---|
| Type | Decoding primitive / teaching breakdown |
| Standard position | Patterson algebraic decoding, error-locator polynomial, and Chien search |
| Source evidence | [Research-source index](./00-Research-Source.en.md#L17): Patterson 1975 and ISO Clause 13 |
| Source location | Patterson 1975, pp. 203–207; ISO/IEC 18033-2:2006/Amd 2:2026 Clause 13; the full ISO text is not stored locally |
| Project status | Teaching decoder implemented; ISO Classic McEliece parameter sets and conformance are not implemented |

## Source Location and Citation

> This page is a teaching derivation and implementation note, not a transcription of the full standard. See the [source index](./00-Research-Source.en.md#L17) for original sources and access limitations.

## Source Notes (Paraphrase, Not a Verbatim Quote)

> Original reference: Patterson 1975, “The Algebraic Decoding of Goppa Codes.” The DOI and source-access status are listed in [00-Research-Source.md](./00-Research-Source.md#L17).

Patterson decoding obtains an error-locator polynomial from a syndrome using algebra over the finite field. CipherCat implements a small teaching instance, not the standardized Classic McEliece KEM.

## Formula or Pseudocode

> The steps below fully describe the teaching derivation used here; they are not a verbatim extract from the paywalled ISO text.

### Algorithm

Input: support set L, degree-t G(z), and received word y with syndrome polynomial S(z), deg S<t.

1. Compute `S(z) = Σᵢ yᵢ/(z−αᵢ) mod G(z)` from H·y.
2. Find an error-locator polynomial σ(z) satisfying `S(z)·σ(z) ≡ σ′(z) mod G(z)`, where σ′ is the formal derivative.
3. Write `σ = r² + z·B²`. In characteristic 2, `σ′=B²`, so `r² = B²·(S⁻¹+z) mod G`. Let `T=√(S⁻¹+z) mod G`; then `r ≡ B·T mod G`.
4. Apply extended Euclid to (G,T), stopping when the remainder degree is at most ⌊t/2⌋; recover (r,B) from the remainder and Bézout coefficient.
5. Form `σ(z)=r(z)²+z·B(z)²`.
6. Chien-search αᵢ∈L; positions with σ(αᵢ)=0 are error locations.
7. Flip those positions in y.

For the teaching case t=2, deg T=1=⌊t/2⌋, so the Euclidean loop does not iterate: r=T, B=1, σ=T²+z.

### Derivation and Implementation Notes

- The key equation is `S·σ ≡ σ′`, not `σ ≡ S·σ′`.
- The decomposition uses the Euclidean pair (r,B), not arbitrary coefficients returned by a different algorithm variant. The Bézout relation is `r ≡ B·T mod G`.
- The modular square root is computed as an inverse Frobenius map over GF(2^m)[z]/(G). The implementation builds the GF(2)-linear Frobenius matrix in basis `{z^i·2^j}`, inverts it, and applies it to the target.
- The matrix orientation is easy to transpose accidentally; the local demo checks known outputs and error-correction round trips.

## CipherCat Block Mapping

- `goppa_decode(y, g, l)` performs the teaching Patterson closure: extended Euclid, Frobenius square root, Chien search, and correction for the t=2, n=14, GF(16)-subfield instance.
- The demo composes `arr_slice` and `syndrome_calc` for the syndrome-side atomic chain; the iterative decoding remains a black-box block.
- `gf2m_poly_xgcd(a,b)` returns Bézout coefficients and a monic gcd for polynomial inputs over GF(2^8).

## Verification

`demos/procedures/Goppa-Decode.json` checks known roots 13 and 81, an inverse identity, an atomic-chain syndrome `[236,12]`, no-error/single-error/double-error round trips, and rejection after changing G.
