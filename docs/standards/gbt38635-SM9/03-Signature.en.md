# SM9 — Digital Signature and Verification

## Entry Metadata

| Field | Value |
|---|---|
| Type | Identity-based cryptography / digital signature |
| Standard position | GB/T 38635.1-2020 §§5.5, 7.2.7, 7.2.9; GB/T 38635.2-2020 §§6.2, 6.4 (flowcharts: §§6.3, 6.5) |
| Source evidence | [Part 1 source](./00-Standard-Source.md#L313), [Part 1 PDF](./GBT+38635.1-2020.pdf); [Part 2 source](./00-Standard-Source.md#L2040), [Part 2 PDF](./GBT+38635.2-2020.pdf) |
| Source location | Part 1 §5.5 [lines 313–322](./00-Standard-Source.md#L313), §7.2.7 [lines 457–472](./00-Standard-Source.md#L457), §7.2.9 [lines 509–545](./00-Standard-Source.md#L509); Part 2 §6.2 [lines 2040–2052](./00-Standard-Source.md#L2040), §6.4 [lines 2062–2076](./00-Standard-Source.md#L2062) |
| Project mapping | `sm9_sign`, `sm9_verify`; [SM9 signature Demo](../../../demos/procedures/SM9-Sign.json) |
| Project status | Implemented with limited regression evidence; this is not a complete conformance finding, third-party algorithm validation, or product certification |

## Source location and citation

The original text and page layout are preserved in the PDFs. This page structures the algorithm steps and input contract; the following references locate the source material:

- GB/T 38635.1-2020 §5.5 requires curve membership and `[N]Q = O`; points at infinity are not valid finite inputs in G1/G2 ([source lines 313–322](./00-Standard-Source.md#L313)).
- §7.2.7 requires decoded base-field elements to lie in `[0,q−1]` ([source lines 457–472](./00-Standard-Source.md#L457)).
- §7.2.9 decodes point coordinates using the selected encoding and applies §7.2.7's field-element conversion ([source lines 509–545](./00-Standard-Source.md#L509)).
- GB/T 38635.2-2020 §§6.2 and 6.4 specify signature generation and verification; §§6.3 and 6.5 provide the corresponding flowcharts ([signing steps, lines 2040–2052](./00-Standard-Source.md#L2040), [verification steps, lines 2062–2076](./00-Standard-Source.md#L2062)).

## Formula or Pseudocode

The following is a structured transcription of the signature and verification procedures, normalized from the source extraction. It is not a verbatim quotation. Here `N` is the group order; `P1` and `P2` are the G1 and G2 generators; `Ppub-s` is the signature master public key; and `deA` is the signing private key for identity `IDA`.

### Signing

~~~text
g = e(P1, Ppub-s)
Repeat:
    r ← [1, N−1]
    w = g^r, then encode w as specified by the standard
    h = H2(M || w, N)
    l = (r − h) mod N
Until l ≠ 0
S = [l]deA
Encode h and S as specified; output (h,S)
~~~

### Verification

~~~text
Input message M′, signature (h′,S′), identity IDA, identifier hid, and system public key Ppub-s
B1. Decode h′ as specified and require 1 ≤ h′ < N
B2. Decode S′ as specified and require S′ ∈ G1
B3. g = e(P1,Ppub-s)
B4. t = g^h′
B5. h1 = H1(IDA || hid,N)
B6. Q = [h1]P2 + Ppub-s
B7. u = e(S′,Q)
B8. w′ = u·t, then encode w′ as specified
B9. h2 = H2(M′ || w′,N); accept iff h2 = h′
~~~

Membership in G1 requires more than checking the curve equation: coordinates must be valid field elements and `[N]S′ = O`. Coordinate encodings that decode to `q` or a larger integer are invalid, even if modular arithmetic would map them onto the curve.

## Block inputs and outputs

| Parameter | Blockly representation | Contract |
|---|---|---|
| `sm9_sign`: `MSG`, `DS`, `PPUB` | Byte arrays | Message, identity private key `deA`, and signature master public key `Ppub-s` |
| `sm9_sign`: `R` | Optional byte array | An empty socket requests secure random sampling; an explicit value must be 32 bytes and satisfy `1 ≤ r < N` |
| `sm9_sign`: output | 97-byte array | `h` (32 bytes) followed by `S` (65 bytes, `0x04 ‖ x ‖ y`) |
| `sm9_verify`: `MSG`, `ID` | Byte arrays | Message and identity `IDA`; identity encoding must match key issuance |
| `sm9_verify`: `H` | 32-byte array | Signature component `h`; its integer must lie in `[1,N−1]` |
| `sm9_verify`: `S` | 65-byte array | Uncompressed point `0x04 ‖ x ‖ y`; `x` and `y` are 32 bytes each |
| `sm9_verify`: `PPUB` | 128-byte array | Signature master public key; four field coordinates encoded as two Fp2 components each for x and y |
| `sm9_verify`: `HID` | Fixed value `0x01` | This block is for SM9 signatures and matches the user signing-key block |
| `sm9_verify`: output | Boolean | Returns `true` for accepted input and `false` for rejected verification input |

Generated code accepts byte arrays whose elements are integers in `[0,255]`. An empty signing `R` socket samples with Web Crypto (JavaScript) or Python `secrets`; explicit `R` is not reduced modulo `N` and is rejected if out of range or not 32 bytes. If a random `r` produces `l=0`, it is sampled again; a fixed `r` that produces this case raises an error.

The project signing blocks fix `HID` to `0x01` (signature purpose) and do not offer encryption-purpose `0x03`. Both signing and verification validate the canonical coordinates, non-infinity, G2 curve equation, and subgroup condition `[N]Ppub-s=O` for the system public key. Signing also validates the corresponding G1 conditions for `DS`. Verification checks the lengths of `H`, `S`, and `Ppub-s`, the range of `h`, and the signature point's canonical coordinates, non-infinity, curve equation, and subgroup condition `[N]S=O`. Invalid or non-canonical points are rejected. The caller must still provide a public key paired with the identity private key under the same system parameters and key-generation process; point validation alone does not establish that the two keys match.

## Implementation mapping and tests

The JavaScript and Python generators are in `src/generators/{javascript,python}/sm9/blocks.ts`. `tests/unit/sm9-verification.test.ts` loads the actual Blockly block, generates and executes both languages, and covers:

- The GB/T 38635.2-2020 Annex A signature/verification vector.
- Modified message, identity, and signature hash; the project block fixes `hid` to `0x01`.
- `h=0`, `h=N`, wrong point prefix, wrong length, off-curve signature/system public points, and an on-curve system public key outside the order-`N` subgroup.
- Byte-array elements outside `[0,255]`.
- A non-canonical point coordinate formed by adding `q` to a valid curve coordinate. A fixed hash substitute isolates input decoding for this negative case; the separate standard-vector test uses the real SM9 hash and pairing implementation.

The tested JavaScript and Python cases produce the same Boolean result. They are targeted regressions, not a complete standard test suite, exhaustive invalid-encoding coverage, or full system-parameter validation. See [product certification feasibility and product boundary](../PRODUCT-CERTIFICATION-FEASIBILITY.md) for the distinction from third-party validation.

`tests/unit/sm9-keygen-range.test.ts` executes the JavaScript and Python generated by the actual `sm9_master_key` and `sm9_user_key` Blockly blocks. It checks the 32-byte `[0,255]` encoding contract, accepts `N−1`, and rejects `0`, `N`, and `N+1`.

`tests/unit/sm9-randomness.test.ts` also executes the signer with a non-byte element in each of `MSG`, `DS`, and `Ppub`, verifying that generated JavaScript and Python reject inputs outside the byte-array contract.

`tests/unit/sm9-randomness.test.ts` covers explicit scalar bounds, the bilingual standard vector, random-scalar rejection sampling, and the `l=0` retry branch through fault injection. Fault injection checks a branch; it is not a natural-occurrence KAT or an independent entropy-source quality assessment. These tests are not formal algorithm validation.
