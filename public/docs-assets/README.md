# Documentation screenshot index

These assets support the user guide, Blockly guide, Demo guide, tutorials, and setup guide. They document frontend interface state only; they are not test output, standard evidence, or backend assessment reports. Images 02–05, 08, and 09 show shared editor workflows; image 01 shows a CipherCat-specific project list and must not be used in MetaCrypto documentation.

Older captures are retained, but their capture environment and date are not recorded; they are not evidence of a live deployment. The previous `06-docs-center.png` capture is obsolete and no longer used because its grouping predates the user/developer documentation split. `06-docs-center-current.png` was captured from the local Vite page at `http://127.0.0.1:4175/#/docs` on 2026-09-24 (Firefox headless, 1660×990); it documents the current navigation only, not a deployed service. The backend section must use a real authenticated `metacrypt_server` task-detail page when a report screenshot is available. Do not add a login page, a `401` error page, or a fabricated report.

| Asset | Referenced from | Intended use | SHA-256 |
|---|---|---|---|
| `tutorials/01-project-list.png` | CipherCat user guide and tutorial only; excluded from Metacrypto sync | CipherCat project list and entry points; not portable to Metacrypto's home/editor navigation | `300b083c28c0c5f64be2b6a79572da20675830441299cee296a2473bebbffb01` |
| `tutorials/02-editor-empty.png` | User tutorial | Empty editor state | `655d6b065015f7dd5d476310e1fd28074603dd1606e55001fec5403b06b30f0b` |
| `tutorials/03-import-menu.png` | User guide, Blockly guide, Demo guide, and user tutorial | Import-workspace menu | `24d4378ac7119d589582a77bc7c6fb1cc3f5283019aeb9eaa4882b50b0741a09` |
| `tutorials/04-editor-imported.png` | Blockly guide, Demo guide, and user tutorial | Imported workspace; code panel is still empty | `38cd2db3221b5b6e9b7fd51d1c7618c11d62e6593708501d5dfbb7a8cb2462f7` |
| `tutorials/05-generated-python.png` | User guide, Blockly guide, and user tutorial | Generated Python view | `7329d2c5163d9c24534af734519e1d006eab559a972d644dc4fa92de6856b0af` |
| `tutorials/06-docs-center.png` | Not referenced; retained as an obsolete capture | Historical documentation-center grouping, before user/developer split | `2bfd12cc4ea648212eb8d9ff396f962583ae8eba1400be47343cd8574e67944a` |
| `tutorials/06-docs-center-current.png` | Setup guide | Current documentation-center grouping | `acaa63526858447e4a8380c10935f0a2a0a8529b7b2e64cc27c64a495b56df1f` |
| `tutorials/07-tutorial-page.png` | Not referenced | Retained older tutorial-page capture | `89cf2582346c7d627c3d85c2228f039ef6241b91ce189575b3b9b4768c762124` |
| `tutorials/08-function-demo.png` | Blockly guide and user tutorial | Function-definition Demo | `cd7963b33b402c28a87922345e84d91e092f8d4e31ae80755701ca3dc06de8d5` |
| `tutorials/09-function-generated.png` | User tutorial | Generated Python from a function Demo | `3102295ddb43994180b7bd5b37052069440b02fbb161764880e88cd500423360` |

The hashes identify the repository assets; they do not identify the page state, source commit, backend run, sample, or report represented by a screenshot.
