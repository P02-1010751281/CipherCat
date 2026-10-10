# RFC 9106 — Argon2 Memory-Hard Function

Source: [RFC 9106](https://datatracker.ietf.org/doc/html/rfc9106), *Argon2 Memory-Hard Function for Password Hashing and Proof-of-Work Applications*. A text copy is included as [`rfc9106.txt`](./rfc9106.txt). RFC 9106 is an IRTF Informational RFC, not an IETF Standards Track specification.

## Variants

| Variant | Description in RFC 9106 | Project block |
|---|---|---|
| Argon2d | Data-dependent memory access | `argon2_hash` (`VARIANT`) |
| Argon2i | Data-independent memory access | `argon2_hash` (`VARIANT`) |
| Argon2id | Argon2i for the first half of the first pass, then Argon2d; recommended by the RFC | `argon2_hash` (`VARIANT`) |

The project implements Argon2 v1.3 (`version = 0x13`) and all three variants. RFC 9106 §3.1 defines the encoded ranges for `p`, `t`, `m`, and tag length, including `m ≥ 8p`. Password, salt, secret, and associated-data lengths (`P/S/K/X`) are each limited to `2^32−1` bytes. A 16-byte salt is recommended; RFC 9106 sets no minimum salt length. Generated code accepts byte sequences or UTF-8 text, rejects arbitrary iterators, and limits each input to 1 MiB to bound copying and computation in the teaching environment; this is a project resource limit, not an RFC limit. Other project execution limits are `m ≤ 65,536 KiB`, `t ≤ 10`, `p ≤ 16`, tag length `≤ 1,024` bytes, and `m × t ≤ 65,536 KiB-passes`.

These local limits exclude both RFC-recommended profiles (2 GiB/1 pass and 64 MiB/3 passes), so this implementation is for teaching and research, not production password storage or key derivation.

The Demo regression executes the final tag examples in RFC 9106 §5.1–5.3 for Argon2d/i/id. It does not check pre-hash digests or intermediate memory blocks and is not the complete official test set. See [`ARGON2.json`](../../../demos/procedures/ARGON2.json).

## PBKDF2 comparison

| Property | PBKDF2 | Argon2 |
|---|---|---|
| Memory hardness | No | Yes |
| Parallelism | Supported by implementations | Designed around lanes |
| Reference | NIST SP 800-132 | RFC 9106 (IRTF Informational) |
| Project use | Password-based derivation example | Resource-limited teaching/research example |
