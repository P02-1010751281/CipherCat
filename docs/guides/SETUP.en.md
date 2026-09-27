# Setup and acceptance guide

This guide covers local startup, production preview, desktop builds, and the checks needed to confirm that CipherCat's documentation, code generation, and demo paths work. It covers the CipherCat frontend only; platform-side backend randomness assessment runs in the separate `metacrypt_server` backend.

## 1. Requirements

| Item | Requirement | Check |
|---|---|---|
| Node.js | Version 24 or newer | `node --version` |
| npm | Use the lockfile for installation | `npm --version` |
| Browser | A modern browser with IndexedDB, ES modules, and WebAssembly | Open the local URL |
| Git | Fetch source and inspect changes | `git --version` |
| Tauri (optional) | Rust stable, system WebView, and platform build tools | See Desktop builds |

## 2. Fetch the source and install dependencies

Run from the repository root:

```bash
git clone <repository-url>
cd CipherCat
npm ci
```

`npm ci` installs the versions pinned by `package-lock.json`. The repository-root `.npmrc` is part of the install policy and the Dockerfile copies it with the lockfiles, so a host user's npm configuration cannot silently change the container install. Use `npm install` only when intentionally changing dependencies; commit the lockfile and rerun the full verification afterward.

## 3. Start the development server

```bash
npm run dev -- --host 127.0.0.1 --port 3001
```

Open <http://127.0.0.1:3001/> and check the following in order:

1. The home page opens and locale switching works.
2. Open Documentation and confirm that user and development documentation are separate groups.
3. Open the editor, create a project, and place a data block.
4. Import `demos/AES-Atomic-Round.json` and confirm the four top-level AES primitives and shared state; the canvas has no value-socket connections.
5. Select Python, choose Generate, and confirm that the code panel shows syntax-colored code.
6. Refresh the page and confirm that the project is still present in browser IndexedDB.

![Documentation center with user and development groups (actual page screenshot)](/docs-assets/tutorials/06-docs-center-current.png)

_Figure: The local page lists user docs, demos, primitive references, and development docs as separate groups._

![Development-mode acceptance page after Python code generation (actual page screenshot)](/docs-assets/tutorials/05-generated-python.png)

_Figure: This screenshot shows the toolbox, workspace, and generated Python. The imported workspace with its empty code panel is shown in the user tutorial._

The development server listens on the local host by default. To expose it on a LAN, explicitly use `--host 0.0.0.0` and review firewall and access scope first.

## 4. Production build and preview

```bash
npm run type-check
npm run build
npm run build:check-bundle
npm run preview -- --host 127.0.0.1 --port 4173
```

Open <http://127.0.0.1:4173/> and repeat the documentation, editor, demo import, and code-highlighting checks. A frontend preview does not deploy the backend or provide platform-side randomness assessment.

## 5. Desktop builds

Desktop development and packaging require the Tauri 2 Rust toolchain and platform dependencies:

```bash
npm run tauri:dev
npm run tauri:build
```

Platform notes:

- Linux needs GTK/WebKitGTK, a compiler, and WebView development packages; see `docker/Dockerfile` for the dependency list.
- Windows needs Microsoft C++ Build Tools and WebView2. The Linux cross-build script produces a bare `.exe`; it does not replace building an installer on Windows.
- macOS needs Xcode Command Line Tools and the Apple SDK. Build macOS installers on a macOS host.

Linux container build:

```bash
./docker/docker-build-linux.sh
```

This requires a Docker/Podman-compatible command, container build permissions, and the graphics libraries required by Tauri. If the container runtime fails, complete browser-mode acceptance first and then troubleshoot the container separately.

## 6. Pre-submit quality gates

Minimum checks:

```bash
npm run lint:check
npm run type-check
npm run test:unit
npm run build
npm run docs:check-links
```

Full checks:

```bash
npm run verify:all
npm run standards:check
npm run standards:inventory
npm run cycles:check
```

`verify:all` checks standard metadata, structured splits, formula fields, source links, templates, and demos. It demonstrates engineering regression coverage and registered-vector consistency; it is not a certification, formal proof, or trusted backend evaluation.

## 7. Frontend/backend boundary

The frontend handles workspace editing, code generation, user experiments, and result presentation. Sample generation, isolated execution, statistical tests, rule decisions, and reports for platform-side randomness assessment run in `metacrypt_server`. The frontend displays backend parameters and results; it does not replace backend decisions in the browser. This assessment is not certification or proof of entropy-source quality.

## 8. Acceptance record

A reproducible local acceptance record should include:

- Git commit or branch;
- Node.js, npm, and browser versions;
- commands executed and exit codes;
- URLs visited;
- imported demo files;
- selected generation language and output;
- console errors, screenshots, or logs when a check fails.

Screenshots should include the relevant controls and result area. They document UI state but do not replace test output, normative source text, or a backend evaluation report.
