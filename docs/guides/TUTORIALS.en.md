# User tutorials: from editor to verifiable algorithms

These tutorials are for CipherCat users and walk through the editor; the backend-assessment section separately explains how to continue in the Metacrypto platform. Each step is organized as action, interface state, expected result, and troubleshooting.

Screenshots illustrate shared-editor operations; the source build is not recorded per image, so they do not prove the current deployment's page state. They do not replace standard formulas, pseudocode, or official test vectors.

## 1. First five minutes: open the editor and import a demo

### Step 1: Open the editor

- **Action**: Click **New Project** on the CipherCat project list.
- **Interface state**: The project list shows **Docs**, **EN**, and **New Project**; the editor shows a toolbox, workspace, and code panel.
- **✅ Expected**: A Blockly workspace and code panel are visible.
- **⚠️ Troubleshooting**: Refresh if the page is empty. If only the toolbox appears, inspect Blockly initialization logs.

![CipherCat project list and new-project entry (interface example)](/docs-assets/tutorials/01-project-list.png)

![Blank CipherCat editor (interface example)](/docs-assets/tutorials/02-editor-empty.png)

_Figure 1: CipherCat project entry and blank editor examples; they do not show Metacrypto's home page or project entry._

### Step 2: Import a workspace

- **Action**: Open **More → Import Workspace** and select `demos/AES-Atomic-Round.json`.
- **Interface state**: Four AES primitive blocks appear at the workspace top level; they are not joined by value connections.
- **✅ Expected**: The four primitive blocks are imported and visible in the workspace. The code panel still shows its empty-state placeholder; click Generate in Step 4 to see the code.
- **⚠️ Troubleshooting**: Make sure the selected file is a Blockly JSON/XML workspace, not Markdown or source code.

![Import entry in the More menu (interface example)](/docs-assets/tutorials/03-import-menu.png)

![Editor after importing the AES demo (interface example)](/docs-assets/tutorials/04-editor-imported.png)

_Figure 2: The screenshot shows the toolbox, top-level primitive blocks, and code panel; the AES atomic demo performs one round through ordered calls on shared state, not a value-connected chain._

📚 [AES demo](../demos/aes.en.md) · [Block index](../blocks/INDEX.en.md)

## 2. Generate code from a block chain

### Step 3: Select a target language

- **Action**: Select Python or JavaScript from the language selector.
- **Interface state**: The language selector shows the target language while the workspace remains visible.
- **✅ Expected**: The code panel language matches the selection.
- **⚠️ Troubleshooting**: Use one output language per verification; fix the language before comparing results.

![Editor with Python selected in the language control (interface example)](/docs-assets/tutorials/04-editor-imported.png)

_Figure: The screenshot shows the collapsed language control with Python selected. It locates the control; the expanded menu and language-switch transition are not shown._

### Step 4: Generate and read the code

- **Action**: Click **Generate**.
- **Interface state**: The code panel shows readable generated code, including inputs, block calls, and the return value.
- **✅ Expected**: Call order matches the workspace.
- **⚠️ Troubleshooting**: Check the generator and top-level blocks if the panel is empty. For a type mismatch, start with the [user guide’s explanation of data types and block connections](./USER-GUIDE.en.md).

![Editor after generating Python code (interface example)](/docs-assets/tutorials/05-generated-python.png)

_Figure 3: After choosing Python and generating code, the code panel shows the actual syntax-highlighted output._

### Step 5: Copy the generated code

- **Action**: Click **Copy Code** to take the generated code to the user's own environment.
- **Interface state**: The code panel retains the generated result while the workspace remains editable.
- **✅ Expected**: Pasting into the target environment yields the complete generated code in the selected language. The screenshot locates the copy control; it does not prove that the clipboard operation succeeded.
- **⚠️ Troubleshooting**: The CipherCat editor builds workspaces and generates code; it does not run backend randomness assessment in the browser. Continue to Metacrypto's task page when platform assessment is needed.

![Generated-code panel and copy control (interface example)](/docs-assets/tutorials/05-generated-python.png)

_Figure: The interface example includes the generated-code area and the Copy Code control._

## 3. From an algorithm stage to a reusable function

### Step 6: Define the function boundary

- **Action**: Use `procedures_defreturn` to define `SM4_Sbox`, add an `x: int` parameter, and connect the S-box lookup block to the return input.
- **Interface state**: The function definition, `int` parameter, S-box lookup block, and return input are visible together.
- **✅ Expected**: Inputs, output, and return block are explicit and compatible.
- **⚠️ Troubleshooting**: `int` is an S-box index example; it is not a type recommendation for byte strings, polynomials, or unrelated algorithm inputs.

![Function-definition demo (interface example)](/docs-assets/tutorials/08-function-demo.png)

_Figure 4: The function demo shows a typed `int` parameter, a return block, and an `SM4_Sbox` call._

### Step 7: Generate and inspect the function code

- **Action**: Click **Generate** and inspect the function code panel.
- **Interface state**: The panel shows generated `sm4_sbox` code and `sm4_sbox_lookup` calling it; the screenshot's Blockly canvas shows the definition block, not a call block.
- **✅ Expected**: Generated code contains the function implementation and its helper call, consistent with the workspace definition.
- **⚠️ Troubleshooting**: To place a call block in the main flow, follow the [Blockly guide](./BLOCKLY-GUIDE.en.md); this image does not document the call-block canvas state.

![Function demo after Python generation (interface example)](/docs-assets/tutorials/09-function-generated.png)

_Figure 5: Generated Python for the function definition, including its helper call._

📚 [Blockly guide](./BLOCKLY-GUIDE.en.md) · [User guide: data types and block connections](./USER-GUIDE.en.md) · [Demo guide](./DEMO.en.md)

## 4. View platform-side backend assessment

> The backend assessment page must be captured from an authenticated `metacrypt_server` task-detail page. This repository does not embed a login page, a 401 error page, or a fabricated report screenshot; use the [GM/T 0005 assessment boundary](../standards/gmt0005-randomness/03-Backend-Evaluation.en.md) for report fields and decision boundaries.

### Step 8: Submit an assessment task

- **Action**: In the Metacrypto platform, open **Tasks → Randomness Test**, select or submit the Blockly algorithm, and enter assessment parameters.
- **Interface state**: The form reads the algorithm type from project preflight (read-only). Review sample length, sequence count, seed, and GPU option before submission.
- **✅ Expected**: The task has a traceable ID and queued, running, or completed status.
- **⚠️ Troubleshooting**: The frontend does not generate samples for platform assessment or execute server-supplied code in the browser; sample generation and statistical testing run in the backend workflow.

### Step 9: Read the assessment report

- **Action**: In `metacrypt_server` task list `/tasks/index`, open the task detail at `/tasks/detail/<jobId>` and inspect sample metadata, tests, parameters, and failure reasons.
- **Interface state**: The task detail shows the backend summary and test rows; check which rule and detector-version fields are actually present.
- **✅ Expected**: The displayed summary and detail rows match the returned task result. Do not claim traceability to rule/version fields that are absent.
- **⚠️ Troubleshooting**: Passing statistical tests is not the same as algorithm certification.

📚 [User guide](./USER-GUIDE.en.md) · [GM/T 0005 assessment boundary](../standards/gmt0005-randomness/03-Backend-Evaluation.en.md)
