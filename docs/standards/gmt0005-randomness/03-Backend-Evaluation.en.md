# Project architecture note: GM/T 0005 backend assessment boundary

## Entry Metadata

| Field | Value |
|---|---|
| Type | Project architecture note; not a normative clause |
| Standard position | Project architecture note related to GM/T 0005-2021; it does not correspond to a normative clause |
| Source evidence | Not applicable to this project-design note; the GM/T 0005 source is in the [source extraction](./00-Standard-Source.md) and local PDF |
| Source location | No corresponding standard clause; [Section 6, source lines 614–704](./00-Standard-Source.md#L614-L704) is context only |
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

## NIST SP 800-22 detection suite (`nist`)

Besides the default GM/T suite, the backend offers a NIST SP 800-22 Rev.1a suite, selected by detector flag `-suite nist` and task field `testSuite`. The two are parallel item lists with the same decision rule (sample pass rate plus sample uniformity) but different columns, item names, and parameters; a report from one suite cannot be parsed as the other.

The NIST suite has 15 detector methods and 16 report items (the serial test reports two P-values). Parameters follow the reference implementation `sts/src/assess.c`: block frequency M=128, non-overlapping template m=9/N=8, overlapping template m=9/M=1032, universal L=7, linear complexity M=500, serial m=16, approximate entropy m=10, rank M=Q=32. Four items do not exist in the GM/T suite: non-overlapping template matching (§2.7), overlapping template matching (§2.8, all-ones template), random excursions (§2.14), and random excursions variant (§2.15). The GM/T “overlapping sub-sequence” item is mathematically the NIST serial test (§2.11); each suite keeps its own item name.

Acceptance is a cross-check against the NIST STS reference implementation: the reference `sts/src/*.c` (with cephes igamc) and the backend detector run the same first 1,000,000 bits of the e constant and the P-values are compared item by item. Fourteen of fifteen items match exactly. Linear complexity differs by 1.4e-4 because the reference implementation prints π₀ as 0.01047 while SP 800-22 §2.10.4 and GM/T 0005-2021 both state π₀ = 0.010417; this implementation follows the standard text. Rank and longest-run-of-ones use each standard's own probability table (NIST: §2.4.4 table and the closed-form P₃₂/P₃₁; GM/T: its own table), so those two items legitimately differ between the suites.

To reproduce that cross-check: take the NIST STS sources (`sts/src/` plus `sts/include/`), write a `main` that calls `Frequency`, `BlockFrequency(128,n)`, `CumulativeSums`, `Runs`, `LongestRunOfOnes`, `Rank`, `DiscreteFourierTransform`, `NonOverlappingTemplateMatchings(9,n)`, `OverlappingTemplateMatchings(9,n)`, `Universal`, `ApproximateEntropy(10,n)`, `LinearComplexity(500,n)`, `Serial(16,n)`, `RandomExcursions`, and `RandomExcursionsVariant`, pointing `stats[]/results[]` at stderr, and feed it the first 1,000,000 bits of `randomness/data/data_e`; then run `rddetector -suite nist` on the same sample and compare item by item. This repository does not vendor NIST's C sources; only the recorded values and the noted differences live here.

Multi-sub-test items are projected to one P-value in the platform report: non-overlapping template matching takes the worst of 148 templates, random excursions the worst of 8 states, and random excursions variant the worst of 18 states (any failing sub-test fails the item, matching NIST's per-item rule). At α=0.01 this makes that item strict for a single sample; batch conclusions still come from pass rate and uniformity across samples. The two excursion tests require J ≥ max(0.005√n, 500) cycles and report “not executed” rather than passing when that fails.

Current scope: the NIST suite is enabled only for the 1,000,000-bit tier (the excursion tests themselves require n ≥ 10^6), and a full 1,000-sample batch has not been exercised yet, so reports still return “inconclusive” when the sample count is short. These checks are not a NIST recognition, CAVP validation, or any certification claim.

### Running both suites in one task (`both`)

With `testSuite=both` the backend runs both suites over the same samples, parses each report against its own complete item list, and merges the presentation: the three items that share both a name and an algorithm (single-bit frequency, total runs, discrete Fourier) appear once, so the 1,000,000-bit tier shows 40 report items (27 + 16 − 3). `summary.suiteSummaries` keeps each suite's own verdict, and the combined verdict takes the stricter side (fail if any suite fails, pass only if both pass, otherwise inconclusive). This is a platform presentation choice; each standard's decision unit remains its own list. Combinations that include NIST are likewise limited to the 1,000,000-bit tier and take roughly twice as long as a single suite.

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
