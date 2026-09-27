# User guide: from blocks to algorithms and verification

CipherCat is a Blockly frontend for cryptographic algorithm structure and code generation. It presents primitives, composes algorithm stages, generates Python/JavaScript code, and links demos to standards. When code is submitted to the integrated Metacrypto platform for randomness assessment, the backend handles sample generation, statistical testing, and reports. Code generation, demo verification, and backend assessment are separate evidence levels and must not be substituted for one another. Screenshots illustrate the CipherCat interface and do not prove the current deployment state.

## 1. Documentation paths

| Purpose | Document |
|---|---|
| Platform scope and capability classes | [Capability map](./CAPABILITY-MAP.en.md) |
| Editor, types, and function blocks | [Blockly guide](./BLOCKLY-GUIDE.en.md) |
| Importable workspaces | [Demo guide](./DEMO.en.md), [demo file index](../../demos/README.en.md) |
| Standard formulas, pseudocode, and source locations | [Standards coverage](../standards/COVERAGE.en.md), structured entries, and `00-Standard-Source.md` |
| Extraction status and gaps | [Documentation status](../standards/DOCUMENT-STATUS.en.md) |

## 2. Projects and editor

### 2.1 Open the editor

CipherCat's home page links to the project list and documentation center and provides a language selector. Click **New Project** to create a local Blockly workspace. Projects and workspaces are stored in browser IndexedDB; the editor route is `/editor/<project-id>`.

This project-list entry applies only to CipherCat. Metacrypto opens the editor through **Open Composer** on its home page and manages platform projects under Resources; their home-page and project screenshots are not interchangeable.

### 2.2 Import a workspace

`More → Import Workspace` accepts Blockly JSON/XML. Importing a demo before making changes provides known inputs, outputs, and a reproducible starting point.

| Goal | Workspace | Content |
|---|---|---|
| AES round structure | `demos/AES-Atomic-Round.json` | `SubBytes → ShiftRows → MixColumns → AddRoundKey` |
| SM3 hash chain | `demos/procedures/SM3-Hash.json` | padding, compression, and digest return |
| Function wrapping | `demos/Procedure-AES-Round.json` | atomic blocks and `procedures_defreturn` |
| Lattice primitives | `demos/ML-KEM-Atomic.json` | sampling, NTT, polynomial/vector arithmetic, and encoding |
| Standard-vector flow | `demos/procedures/ML-KEM-Encaps.json` | FIPS 203 ML-KEM-512 Encaps |

![Import-workspace entry in the More menu (interface example)](/docs-assets/tutorials/03-import-menu.png)

_Figure: The import entry is located in the editor's More menu._

### 2.3 Edit, generate, and save

The left side of the editor is the Blockly workspace and the right side is the code preview:

1. Drag blocks from the toolbox and connect them by type.
2. Select Python or JavaScript in the code panel.
3. Click **Generate Code** and use **Copy Code** when needed.
4. Save manually or enable auto-save.

The frontend generators support Python and JavaScript. Generated code can be copied into a runtime or test script; the frontend does not turn arbitrary generated code into a platform-side backend assessment result.

![Editor after generating Python code (interface example)](/docs-assets/tutorials/05-generated-python.png)

_Figure: The code panel shows generated output; showing code is not a backend assessment result._

Menu operations:

- `More → Export Workspace`: export JSON or XML;
- `More → Import Workspace`: import JSON/XML;
- `More → New Workspace`: start a new canvas;
- `More → Clear Workspace`: remove the current blocks.

## 3. Block layers and types

### 3.1 Three block layers

| Layer | Name | Examples | Role |
|---|---|---|---|
| L1 | Atomic primitive | `pq_ntt`, `hash_sm3_compress`, `aes_sub_bytes`, `gf2_poly_mul` | Express one formula or pseudocode step |
| L2 | Composite operation | `mode_cbc_encrypt`, `gcm_encrypt`, `pq_mat_vec_mul` | Express a reusable algorithm stage |
| L3 | Function/template | `procedures_defreturn`, `proc_*` | Add parameters, return values, and call interfaces |

Block layers describe composition, not assurance. The standard entry and demo determine the actual coverage.

### 3.2 Data types and block connections

Types help Blockly check whether blocks can connect. A type describes the data’s meaning and use, not just its representation in code. Bytes and bits are not interchangeable just because generated code may represent both as arrays. The platform does not insert general-purpose type conversions automatically; use the relevant conversion block and verify bit order, byte order, and length.

| Type | Meaning | Common use |
|---|---|---|
| `Bytes` | Byte sequence | Keys, messages, ciphertext, random seeds, digests |
| `Bits` | Sequence of 0s and 1s | Bit-level inputs and encodings in standards |
| `IntList` | List of integers | State words, polynomial coefficients, field elements |
| `Vector` / `Matrix` | Integer lists with vector or matrix semantics | Polynomial vectors, matrices, and intermediate values |
| `Number` | Single integer | Lengths, moduli, rounds, and indices |
| `SBox` | Substitution lookup table | Nonlinear substitution in block ciphers |
| `String` / `Boolean` | Text / true-or-false result | Text parameters and decision results |

Blocks connect only when the input accepts the output type. Matching types such as `Bytes` → `Bytes` can connect. `Bits` and `IntList` cannot connect directly, even though both may be represented by integer arrays in generated code. When conversion is needed, use a matching conversion block if one is available, and check bit order, byte order, and length; do not bypass the check by relaxing the type constraint.

When a connection is rejected, first read the type shown on each end and decide whether a conversion is needed. Full type definitions, port declarations, and implementation conventions are in the developer [Type System specification](./TYPE-SYSTEM.en.md).

## 4. Algorithm construction workflow

### 4.1 Define the boundary

Before assembly, read the structured entry for the relevant standard and confirm:

- input, output, byte order, and encoding;
- parameters, constants, moduli, and lengths;
- algorithm stages and standard clauses;
- whether the project records a complete interface, a core stage, or a teaching subset.

Block names do not replace input/output specifications. Byte order, padding, truncation, encoding length, and randomness domain separation are common sources of errors.

### 4.2 Start from an atomic demo

The recommended construction sequence is:

```text
input
  → padding / encoding
  → sampling / field arithmetic
  → permutation / compression / round function
  → composition / truncation
  → output
```

Import the closest demo, retain its known input and output, and replace one stage at a time. Each change then has a local failure point.

### 4.3 Wrap a stage in a function

When a block chain expresses an independent stage:

1. create a `procedures_defreturn` function;
2. open the function block's mutator, add parameters, and select semantic types such as bytes (`bytes`), integer lists (`int_list`), polynomials (`poly`), or seeds (`seed`);
3. place the atomic chain in the function body;
4. return the result with `crypto_return`;
5. reuse the function with a call block.

For example, SM3 can be expressed as message → padding → compression → digest. ML-KEM Encaps can be expressed as encapsulation key and message/random input → SHA3 derivation → SampleNTT/CBD → NTT-domain arithmetic → encoding/compression → ciphertext and shared key.

### 4.4 Distinguish a complete algorithm from a stage

Repository workspaces include atomic primitives, algorithm stages, procedure-wrapped chains, and a smaller set of complete interfaces. `AES-Atomic-Round.json` is an AES round example, not automatically a complete AES-128 encryption interface. `procedures/ML-KEM-Encaps.json` is a FIPS 203 Encaps flow with a registered test specification. Use the [capability map](./CAPABILITY-MAP.en.md) and [coverage matrix](../standards/COVERAGE.en.md) for the exact boundary.

### 4.5 Three construction paths

| Path | Atomic chain/stage | Workspace |
|---|---|---|
| SM3 digest | `hash_sm3_pad` → `hash_sm3_compress` → `crypto_return` | `demos/procedures/SM3-Hash.json` |
| AES single-round primitive sequence | `demos/AES-Atomic-Round.json` | Four top-level calls mutate shared state in workspace order; no value-socket wiring |
| AES explicitly connected round | `AddRoundKey(MixColumns(ShiftRows(SubBytes(state))), round_key)` | `demos/procedures/AES-Round.json` |
| ML-KEM Encaps | `pq_xof`/seed → `pq_sample_ntt`, `pq_sample_poly_cbd` → `pq_ntt`, `pq_intt`, `pq_ntt_mul` → `pq_poly_add`, `pq_mat_vec_mul` → `pq_byte_encode`, `pq_compress` | `demos/ML-KEM-Atomic.json`, `demos/procedures/ML-KEM-Encaps.json` |

Reproduce the fixed-input demo first, replace fixed inputs with function parameters, and only then add loops, branches, rejection paths, and multi-parameter support.

## 5. Verification and assessment

The project uses four verification layers:

| Layer | Executor | Verification | Main evidence |
|---|---|---|---|
| Workspace/generator | CipherCat | JSON/XML loading, block connections, Python/JavaScript generation | editor, build, template harness |
| Vector/cross-check | CipherCat demo harness | registered inputs against standard vectors or independent implementations | `demos/tests.json`, `npm run verify:all` |
| User code trial | user’s Python/JavaScript runtime | behavior of modified code for specified inputs | code, test script, input/output |
| Platform-side backend randomness assessment | `metacrypt_server` backend generates samples and runs tests; its platform frontend displays reports | sample generation, isolation, statistical tests, rule decisions, and reports | task results include code/sample fingerprints; the comparison API separately exposes a parameter fingerprint; detector/rule versions and report integrity still have gaps |

A block without a registered demo must not be marked “verified” merely because it generates code. A demo pass is not a certification result.

### 5.1 Local project gates

```bash
npm run verify:all
npm run docs:check-links
npm run test:unit
npm run build
```

`verify:all` covers standard metadata, structured splits, formulas, source links, templates, demos, and the verification build. `docs:check-links` checks Markdown relative links. `test:unit` and `build` check unit tests and the production frontend build.

For a single workspace, build the verify harness first and then follow [demos/README.en.md](../../demos/README.en.md) and `scripts/verify-demo.ts`.

### 5.2 Platform-side backend randomness-assessment boundary

The responsibility split between user trials and backend assessment is:

```text
CipherCat: block construction, code generation, and user code trials
        ↓
metacrypt_server: isolated sample generation and statistical assessment; its platform frontend displays task reports
```

Sample generation, statistical testing, isolation, and the final decision run in the `metacrypt_server` backend pipeline; the Metacrypto platform frontend provides task lists and report details. The CipherCat editor provides Blockly editing, code generation, and user code trials; integrated platform tasks/reports are separate features and the editor itself does not issue assessment conclusions. Backend assessment does not prove generator honesty, entropy-source quality, or algorithm certification. See the [GM/T 0005 backend boundary](../standards/gmt0005-randomness/03-Backend-Evaluation.en.md).

Fingerprints in task results and the comparison API have explicit scopes: `projectCodeHash` covers submitted source, `sampleHash` covers the ordered bytes sent to the detector, and database field `input_hash` appears as `inputHash1/2` in comparisons for normalized parameters. A match means only that the corresponding fingerprint scope is equal; it does not prove sample provenance, algorithm correctness, or reproducibility. See the [backend assessment boundary](../standards/gmt0005-randomness/03-Backend-Evaluation.en.md) for field definitions.

This guide does not embed a backend assessment screenshot. Capture an authenticated `metacrypt_server` task-detail page and caption only the task ID and fields actually shown. If research records require versions or raw results, attach separately verifiable task logs/result files; a screenshot cannot establish detector or rule versions that the page does not display. A login page, 401 page, or manually assembled report is not evidence.

## 6. Result states

Recommended labels for experiment records:

- **Structurally covered**: a corresponding Blockly block and structured standard reference exist;
- **Demo verified**: a registered demo passed vector, property, or cross-check assertions;
- **Source-linked**: the structured entry links to source text, formulas, pseudocode, or clauses;
- **Teaching subset**: only core stages, fixed parameters, or simplified inputs are covered;
- **Backend assessed**: the backend returned a randomness-test report; verify its completeness and version traceability from the fields actually present.

Claims such as “the full algorithm is certified”, “randomness passed”, or “all parameter sets are supported” require separate evidence.

## 7. Documentation navigation

- [Capability map](./CAPABILITY-MAP.en.md): algorithm classes, primitive scope, and evidence boundaries;
- [Blockly guide](./BLOCKLY-GUIDE.en.md): editor details, types, and templates;
- [Demo guide](./DEMO.en.md): AES, SM4, hash, SM2, and post-quantum cases;
- [Block index](../blocks/INDEX.en.md): custom blocks and standard references;
- [Standards coverage](../standards/COVERAGE.en.md): standards, blocks, demos, templates, and build guides;
- [Documentation status](../standards/DOCUMENT-STATUS.en.md): extraction, structured splitting, and known gaps.
