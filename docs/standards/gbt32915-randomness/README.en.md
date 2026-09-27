# GB/T 32915 — Randomness Test Methods for Binary Sequences

## Standard status

As of 2026-09-26, GB/T 32915-2016, *Information security technology — Randomness test methods for binary sequence*, remains in force. GB/T 32915-2026, *Cybersecurity technology — Randomness test methods for binary sequence*, has been issued and will take effect on 2026-12-01, fully replacing the 2016 edition.

- [Official record for GB/T 32915-2016](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=46D7E3E9C4B81DF460052FFEB706CAB0)
- [Official record and effective date for GB/T 32915-2026](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=405C2B25366B34447CBB0DD362F96752)
- [Edition replacement record](https://std.samr.gov.cn/gb/search/gbDetailed?id=oOfJ0FpRS8Q%3D&mode=p)

## Scope and project boundary

The standard specifies statistical randomness tests for binary sequences. It tests supplied output sequences; it is not a minimum-entropy assessment, entropy-source health certification, or cryptographic-module certification. Passing statistical tests alone does not prove entropy-source quality.

GB/T 32915 and the cryptographic industry standard GM/T 0005, *Randomness test specification*, are distinct standards and must not be treated as interchangeable. `metacrypt_server` has a backend assessment flow based on GM/T 0005, but has not completed a clause-by-clause applicability or conformance review for GB/T 32915.

## Documentation and follow-up status

This directory is currently a standards-status entry; it does not contain the full standard text or a structured split of its test procedures, formulas, and parameter tables. The follow-up is listed in `metacrypt_server/docs/ASSESSMENT-ROADMAP.md`, section 5. No GB/T 32915 conformance or entropy-source quality claim should be made before the source and clause mappings are reviewed.
