# User tutorial: build an algorithm from blocks

The main path of this tutorial is **assembling an algorithm from blocks**: drag a block, connect it, generate code.

Treat procedure templates and demos as **convenience starting points** (they save repeated dragging), not as the capability itself. The platform's capability boundary is "can this be built from blocks"; the presence of a template or demo does not change that. The steps below therefore **do not start from a demo**; importing one is covered in [Appendix A](#appendix-a-taking-the-demo-shortcut).

## 1. Open the editor and recognise the four areas

**Do**: on the project list, click "New project".

**Observe**: the editor opens with four areas — the toolbox on the left (blocks grouped by category), the workspace in the middle, the language selector (JavaScript / Python) at the top right, and the code panel on the right.

**If it looks wrong**: refresh if the page is blank and confirm the frontend is reachable; if only the toolbox shows, check the browser console for Blockly initialisation errors.

![Project list and the new-project entry](/docs-assets/tutorials/01-project-list.png)

![Empty editor: toolbox, workspace, language selector, code panel](/docs-assets/tutorials/02-editor-empty.png)

_Figure 1: project entry and empty editor._

## 2. Drag the first block out of the toolbox

**Do**: expand a toolbox category (for example "Hash / padding") and drag the `SHA-256 padding` block into the workspace.

**Observe**: a block appears with its input sockets (value inputs) or top/bottom connectors (statement blocks). The code panel is still empty — a block that is not connected to an output/return does not reach the generated code.

**If it looks wrong**: expand the toolbox category if the block will not drag; a greyed-out block means a connection-type mismatch, so use a matching socket.

> Tip: each block does one thing (pad, compress, XOR, …); the algorithm comes from connecting them — that is the design premise of this platform.

![Toolbox with the "Hash / padding" category expanded](/docs-assets/tutorials/10-toolbox-category.png)

![The first block dragged from the toolbox into the workspace](/docs-assets/tutorials/11-first-block.png)

_Figure 2: expanding a toolbox category (left), then dragging `SHA-256 padding` into the workspace (right)._

## 3. Connect blocks into an algorithm stage chain

**Do**: drag a second block (for example `SHA-256 compress`) and connect its left input socket to the first block's output socket; drag data blocks (hex/byte constants) into the most upstream input when you need input material.

**Observe**: connections appear between blocks, forming "data → stage 1 → stage 2"; the chain still ends without an output, so the code panel stays empty.

**If it looks wrong**: connections usually fail on type mismatch (sockets carry colour/shape hints); see [User guide: data types and block connections](./USER-GUIDE.en.md).

![Connecting the padding block's output to the compress block's input](/docs-assets/tutorials/12-block-chain.png)

_Figure 3: drag the first block's output plug onto the second block's input socket (`V=`); the two blocks now form one chain._

## 4. Generate JavaScript or Python code

**Do**: pick the target language at the top right, then click "Generate".

**Observe**: the code panel shows complete code whose function order matches the workspace chain; switching language and generating again yields the equivalent code in the other language.

**If it looks wrong**: empty code means the chain is not connected to a top-level output/return; for type mismatches start with the user guide's data-type section.

![Workspace and code panel after generating code](/docs-assets/tutorials/13-generate-code.png)

_Figure 4: after selecting Python and clicking Generate, the code panel shows the matching implementation; switching the language yields the JavaScript version._

## 5. (Optional) Wrap the chain into a reusable function

**Do**: drag in a function-definition block (`procedures_defreturn`), give it a parameter (for example `x: int` or `msg: message`), and connect the chain to its return socket.

**Observe**: the function block shows a parameter row and a return socket; the generated code contains the corresponding function implementation.

**If it looks wrong**: the parameter type must match the first block's input type; when unsure, use the same type as your data block.

![Function definition block with a parameter and return socket](/docs-assets/tutorials/08-function-demo.png)

![Python code generated from the function chain](/docs-assets/tutorials/09-function-generated.png)

_Figure 5: wrapping a chain into a function and reusing it in generated code._

## 6. Keep three things apart: block chain, test evidence, backend assessment

Assembling a chain only shows that **code can be generated**. It does not prove the algorithm is correct, and certainly not that it passes a standard or certification. Judge at these levels separately:

| Level | What to look at | Where |
|---|---|---|
| Blocks and connections | Is the structure right, do the types match | Editor workspace |
| Executability | Does the generated JS/Python run | Code panel / local run |
| Standards conformance | Standard interfaces, parameter sets, official vectors | Coverage matrix and per-block evidence under `docs/standards/` |
| Backend assessment | Statistical test verdict on samples | Metacrypto platform tasks and reports |

## 7. View the platform's backend randomness assessment

**Do**: on the Metacrypto platform open "Tasks → Randomness test", choose or submit the algorithm and fill in assessment parameters, then open the task detail from the task list.

**Observe**: the form reads the project precheck result (algorithm type is read-only); submitting returns a task id. The task detail shows the summary, detection details, and parameter fields returned by the backend.

**Note**: the frontend neither generates assessment samples nor executes server-side code in the browser, and passing a statistical test is not cryptography certification. Whether the report carries detector/rule version fields depends on what the backend actually returns — do not describe missing fields as "traced". Field semantics and verdict boundaries: [GM/T 0005 assessment boundary](../standards/gmt0005-randomness/03-Backend-Evaluation.en.md).

## Appendix A: taking the demo shortcut

Demos and procedure templates save repeated dragging and are handy for seeing a complete chain at a glance; they are **not required**, and they do not change the fact that the capability itself is "buildable from blocks".

- **Import a workspace**: `More → Import workspace`, pick a JSON under `demos/` (for example `demos/AES-Atomic-Round.json`).
- **Drag a template**: drag a procedure template block into the workspace; it pre-fills a structure (for example the 28-statement ML-KEM encapsulation chain). Parameters left empty by the template must be filled in by you.
- **Template boundary**: a pre-filled template is not a complete algorithm and not a test pass; per-object coverage is listed in the [conformance inventory](../standards/CONFORMANCE-INVENTORY.md).

![Import entry under the "More" menu](/docs-assets/tutorials/03-import-menu.png)

_Figure 6: the import entry, used only for the shortcut path; the main tutorial does not need it._

📚 Continue with: [Blockly guide](./BLOCKLY-GUIDE.en.md) · [User guide: data types and connections](./USER-GUIDE.en.md) · [Capability map](./CAPABILITY-MAP.en.md) · [Demo index](../../demos/README.en.md)
