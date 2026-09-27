# Classic McEliece and Goppa-Code Research Sources

This page indexes standard-status records and research literature. It is not a transcription of the ISO standard or of the cited papers. Verify teaching formulas against the original sources below.

## ISO Standard Record

- [Official ISO/IEC 18033-2:2006/Amd 2:2026 catalog entry](https://www.iso.org/standard/86890.html): status Published; publication date 2026-06-05.
- [Classic McEliece project team’s ISO status page](https://classic.mceliece.org/iso.html): the team says the KEM was included in the amendment and lists parameter sets. This is submitter information, not a substitute for ISO’s publication record.
- The ISO text is copyright-protected and available for purchase. It was not downloaded, OCR’d, or transcribed here. A local copy of the normative text remains unavailable.

## NIST Process Status

- [NIST IR 8545 PDF](./NIST.IR.8545.pdf), March 2025. The report lists Classic McEliece as a fourth-round candidate and records that NIST selected only HQC for subsequent standardization; the announcement further explains why Classic McEliece was not selected.
- The conclusion can be checked against the [official NIST publication record](https://csrc.nist.gov/pubs/ir/8545/final) and [NIST’s 2025-03-11 announcement](https://csrc.nist.gov/news/2025/hqc-announced-as-a-4th-round-selection).
- The [current NIST PQC project page](https://csrc.nist.gov/Projects/post-quantum-cryptography), updated 2026-08-05, says HQC standardization is underway. Together with IR 8545, it distinguishes the fourth-round selection result from the subsequent HQC standardization work.
- Although the [NIST additional-signatures project page](https://csrc.nist.gov/Projects/pqc-dig-sig/standardization) shows an update date of 2026-09-22, its body still says fourth-round KEM candidates are “still under consideration.” That stale text does not match IR 8545 or the published fourth-round result; it is not treated as meaning the current NIST process remains unresolved, nor as a decision about the 2026 ISO amendment.

## Original Papers and Algorithm Materials

- R. J. McEliece, “A Public-Key Cryptosystem Based on Algebraic Coding Theory,” DSN Progress Report 42-44, 1978, pp. 114–116. Original: [JPL PDF](https://ipnpr.jpl.nasa.gov/progress_report2/42-44/44N.PDF); local copy: [McEliece-1978.pdf](./McEliece-1978.pdf). This three-page scan has no extractable text layer, so no unverified OCR transcript is provided.
- V. D. Goppa, “A New Class of Linear Correcting Codes,” *Problemy Peredachi Informatsii*, 6(3), 1970, pp. 24–30; English translation in *Problems of Information Transmission*, 6(3), pp. 207–212. Journal record and original PDF: [MathNet](https://www.mathnet.ru/eng/ppi1748). The scanned PDF was not downloaded into this repository.
- E. R. Berlekamp, “Goppa Codes,” *IEEE Transactions on Information Theory*, 19(5), 1973, pp. 590–592. [DOI](https://doi.org/10.1109/TIT.1973.1055088).
- N. J. Patterson, “The Algebraic Decoding of Goppa Codes,” *IEEE Transactions on Information Theory*, 21(2), 1975, pp. 203–207. [DOI](https://doi.org/10.1109/TIT.1975.1055350).
- [Official Classic McEliece specification](https://classic.mceliece.org/spec.html) and the candidate overview in [NIST IR 8545](https://nvlpubs.nist.gov/nistpubs/ir/2025/NIST.IR.8545.pdf). ISO Clause 13 and NIST Round-4 parameters are distinct from this project’s teaching parameters.

## Local PDF Checksums

| File | Purpose | SHA-256 |
|---|---|---|
| [NIST.IR.8545.pdf](./NIST.IR.8545.pdf) | NIST process status report | `d802f4849a52d18001533cef86e0950f31350643cc06881ee62b2382e1ea0e9d` |
| [McEliece-1978.pdf](./McEliece-1978.pdf) | Scan of McEliece’s original paper | `33a47430ca58a8374a19180cb90fcb186925dace20c03e73a19b85ae359603dc` |
