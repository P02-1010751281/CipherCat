#!/bin/bash
# Build CipherCat for macOS (.dmg)
# NOTE: macOS cannot be cross-compiled from Linux — run this on a Mac.
set -e
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [[ "$(uname)" != "Darwin" ]]; then
    echo "ERROR: macOS build requires a macOS host (Apple SDK + Xcode)."
    echo "       Run 'npm run tauri:build' directly on your Mac."
    echo "       Linux cross-compile to macOS is not supported by Tauri."
    exit 1
fi

echo ">>> macOS build (.dmg)..."
npm run tauri:build -- --bundles dmg

echo ""
echo ">>> Output:"
ls -lh "$PROJECT_DIR/src-tauri/target/release/bundle/dmg/"*.dmg 2>/dev/null || true
