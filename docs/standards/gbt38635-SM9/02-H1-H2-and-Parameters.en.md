# SM9 — Parameters and H1/H2 Primitives

## Entry Metadata

| Field | Value |
|---|---|
| Type | Primitive / function |
| Standard position | GB/T 38635.2-2020 §§5.2–5.3.2.3 — parameters and H1/H2 primitives |
| Source evidence | [Part 2 source extraction](./00-Standard-Source.md); PDF links are listed on the source page |
| Source location | Part 2, §§5.2–5.3.2.3, extraction lines 1948–2012; verify physical PDF pages against the source |
| Project status | Reference and internal implementation stages; see the boundary notes below |

## Source location and citation

This page structures the parameter and H1/H2 sections from the source extraction. It is not a verbatim quotation. See the [source extraction](./00-Standard-Source.md) and [Part 1](./GBT+38635.1-2020.pdf) / [Part 2](./GBT+38635.2-2020.pdf) PDFs.

## Formula or Pseudocode

### Parameters

SM9 uses the standard BN curve, group order `N`, generators, and pairing `G1 × G2 → GT`. Implementations must preserve the standard parameter values, byte order, and point encoding; an ordinary short-Weierstrass curve implementation is not a substitute.

### H1/H2

The standard uses `Hv` for the approved hash function defined in §5.3.2.1. H1 and H2 use distinct domain-separation prefixes and append a 32-bit big-endian counter starting at 1:

```text
H1: Ha = Hv(0x01 || Z || I2OSP(ct,4)), ct = 1,2,...
H2: Ha = Hv(0x02 || Z || I2OSP(ct,4)), ct = 1,2,...
h1/h2 = (OS2IP(leftmost_hlen_bits(Ha)) mod (N−1)) + 1
```

`hlen` is specified by the standard. For this parameter set, `N` is 256 bits and `hlen` is 320 bits. The project uses SM3 to match the standard vector: it concatenates two digest blocks, takes the first 40 bytes, and maps the integer to `[1,N−1]` using `mod (N−1)+1`. In the signature flow, the H1 input contains the user identity and `hid`; the H2 input contains the message and the standard-encoded pairing result. The domain-separation byte is a prefix, not a suffix, and the counter must not be omitted.

## Project boundary

`sm9_master_key` and `sm9_user_key` expose the current master-public-key and user-private-key paths. Both require a 32-byte `ks` that decodes to an integer in `[1,N−1]`. H1/H2 are internal stages of the signature generator and do not have standalone Blockly blocks.
