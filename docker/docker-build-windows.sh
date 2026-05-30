#!/bin/bash
# Cross-compile CipherCat for Windows from Linux Docker
set -e
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
IMAGE="localhost/ciphercat:tauri"

echo ">>> Build Docker image..."
docker build -t "$IMAGE" -f "$PROJECT_DIR/docker/Dockerfile" "$PROJECT_DIR"

echo ">>> Cross-compile Windows .exe..."
docker run --rm \
    -v "$PROJECT_DIR":/app \
    -v tauri-cargo-registry:/opt/cargo/registry \
    "$IMAGE" \
    bash -c "
        convert src-tauri/icons/32x32.png src-tauri/icons/128x128.png src-tauri/icons/128x128@2x.png src-tauri/icons/icon.ico
        cd src-tauri && cargo build --release --target x86_64-pc-windows-gnu
    "

echo ""
echo ">>> Output:"
ls -lh "$PROJECT_DIR/src-tauri/target/x86_64-pc-windows-gnu/release/ciphercat.exe" 2>/dev/null || true
echo ""
echo "NOTE: Only bare .exe is produced. To bundle as .msi/.nsis installer,"
echo "      run 'npm run tauri:build' on a Windows host."
