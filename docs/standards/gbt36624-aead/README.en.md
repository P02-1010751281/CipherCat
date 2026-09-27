# GB/T 36624-2018 — Authenticated Encryption

Source: GB/T 36624-2018, *Information technology—Security techniques—Authenticated encryption*.

The [official full-text portal record](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=7DF46F1692B9F774F53E0BEF094379C3) lists publication on 2018-09-17 and implementation on 2019-04-01, and states that copyright prevents it from providing text-reading service. The [National Standard Information Public Service Platform record](https://std.samr.gov.cn/gb/search/gbDetailed?id=7643B2F25138267CE05397BE0A0AAF6A) lists the standard as current and gives the latest review date as 2025-05-30, with the conclusion “continue in force.” It classifies the standard as a modified adoption of ISO/IEC 19772:2009; that relationship does not establish clause-by-clause equivalence or completed clause verification.

## Evidence status

- Local scan: [GB/T 36624-2018 PDF](<./GB∕T 36624-2018 信息技术 安全技术 可鉴别的加密机制.pdf>).
- The 28-page PDF is image-only for practical extraction: `pdftotext -layout` did not recover its body text. Its metadata contains the site marker `bingdian001.com`; the file’s provenance has not been verified against an official publication copy, so it is retained only as a scan reference, not as an authoritative verbatim source.
- No OCR engine is available in the current environment. Unverified OCR or third-party transcriptions are not treated as standard text. A full structured split requires a clear, lawfully obtained copy and page-by-page verification.
- The official record is verified, but the manifest remains `review`. This standard is not counted as clause documentation verified against the original text.

## Relation to the project

The project has separate GCM, CCM, and Ascon paths. Those implementations do not establish coverage of the mechanisms, parameters, encodings, or authentication requirements in GB/T 36624. No matching Blockly blocks, demo, or complete verification path currently exists.

Remaining work includes a verified clause outline, mechanism/parameter matrix, vector provenance, decryption-failure semantics, and item-by-item mapping to project functionality. See the structured [source-extraction gap](./01-Extraction-Gap.en.md).
