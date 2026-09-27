# Project architecture note: GM/T 0005 backend assessment boundary

## Entry Metadata

| Field | Value |
|---|---|
| Type | Project architecture note; not a normative clause |
| Standard relation | GM/T 0005-2021 Section 6 defines decision rules; this page is project documentation |
| Standard source | [source extraction](./00-Standard-Source.md) and the local PDF |
| Related location | [Section 6, source lines 614–704](./00-Standard-Source.md#L614-L704) is context only, not the source of this architecture description |
| Project status | Partially implemented; see the current gaps below |

## Source Location and Citation

The linked source range covers the standard’s test-suite decision rules and sample-size parameter tables. This page does not reproduce those normative units; consult the [source extraction](./00-Standard-Source.md#L614-L704) and local PDF for their complete text and layout.

## Source Notes (Paraphrase, Not a Verbatim Quote)

GM/T 0005 defines the tested sample count, per-test pass-rate threshold, distribution-uniformity decision, and sample-length-specific settings. It does not prescribe CipherCat’s frontend/backend architecture. The execution boundary below is a project design constraint, not a requirement attributed to the standard.

## Scope

This page describes that project execution boundary. It is not a verbatim replacement for the standard.

## Formula or Pseudocode

> This entry defines the backend execution boundary; it does not define an independent formula or pseudocode. See the 04–07 entries in this directory for the structured test definitions.



Browser trials do not replace platform-side backend randomness assessment. The frontend must not receive and execute arbitrary server-supplied `exec(user_code)`. The backend runs submitted code and detects the resulting sample bytes, but this does not prove generator honesty, entropy-source quality, or algorithm certification. Detector/rule versions and report integrity are current gaps.

## Current batch-decision scope

The platform defaults to the 20,000-bit tier with 1,000 samples. For each configured detector item, the backend counts samples with `P-value ≥ 0.01` and applies a ten-bin uniformity test to the 1,000 `Q-values` (`αT = 0.0001`). A report says “pass” only when both conditions hold and the applicable suite for that length tier is present. Too few samples, a row-count mismatch, or a missing detector item yields “inconclusive”; one passing sample is never reported as a passing batch.

The standard defines 15 detector methods. Expanding their parameters and modes for each length tier yields an ordered set of 22/27/30 P/Q report items for 20,000, 1,000,000, and 100,000,000 bits, respectively. Method count is not report-item count. Missing, duplicate, reordered, or mismatched P/Q items cannot produce a batch decision.

The ten-bin `Q-value` uniformity test is computed only with the complete 1,000-sample batch. Malformed detector reports and non-finite or out-of-range P/Q values are rejected rather than absorbed as ordinary failed samples.

The backend caps total assessment input at 100,000,000 bits per task. Therefore the 1,000,000-bit tier allows at most 100 samples and the 100,000,000-bit tier one sample; these tiers provide diagnostics only and cannot produce a GM/T 0005 batch conclusion. The sandbox's 64 MiB sample-payload limit is independent and does not determine those tier counts. Task status “completed” means the pipeline finished, not that the randomness passed. This describes current product behavior; it is not a certification claim.

| Field | Scope | A match establishes | It does not establish |
|---|---|---|---|
| `projectCodeHash` | SHA-256 of submitted Python source UTF-8 bytes | identical submitted source bytes | identical runtime, dependencies, execution path, or untampered report |
| `sampleHash` | Ordered bytes passed to the detector; digest includes sample count and each sample length | identical ordered detector input bytes | entropy quality, generator honesty, or reproducible test execution |
| `input_hash` / comparison API `inputHash1/2` | Normalized JSON parameters `seed_hex`, `n_bits`, `m_seq`, and `primitive` | identical parameters (`inputHashScope=parameters_only`) | identical code, samples, environment, or results |
| Comparison API `resultsMatch` | Statistical report fields; scope is `statistical_report_fields_only` | equality of the compared report fields | identical inputs/samples, reproducibility, report authenticity, or algorithm correctness |

These SHA-256 values are scoped fingerprints, not signatures, provenance proofs, or reproducibility evidence. Reproduction also requires access to the actual samples, backend/detector and rule versions, execution environment, raw results, and a report protected against modification.

## Current gaps

- Detector-binary identity, rule versioning, and signed report integrity;
- A transactional outbox is not implemented for database task creation and broker publication. A pending task is now failed explicitly after 90 minutes, whether or not its Celery task ID was persisted; it must then be resubmitted or handled operationally. Celery late acknowledgement, worker-loss redelivery, conditional database claiming, and timeout-based orphan cleanup are implemented, but provide at-least-once recovery rather than an exactly-once guarantee;
- End-to-end negative cases and permission-isolation tests;
- Independent evidence links to each applicable standard clause, platform score, or paper result;
- Authenticated UI acceptance for task submission, report viewing, and comparison.

The project can describe this partially implemented backend assessment pipeline, but it must not describe it as a completed GM/T 0005 product assessment or certification.
