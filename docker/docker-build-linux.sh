#!/bin/bash
# Build CipherCat for Linux: deb + rpm (+ appimage if FUSE available)
set -e
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
IMAGE="localhost/ciphercat:tauri"

echo ">>> Build Docker image..."
docker build -t "$IMAGE" -f "$PROJECT_DIR/docker/Dockerfile" "$PROJECT_DIR"

echo ">>> Linux build (deb/rpm/appimage)..."
docker run --rm \
    --privileged \
    --device /dev/fuse \
    -v "$PROJECT_DIR":/app \
    -v tauri-cargo-registry:/opt/cargo/registry \
    "$IMAGE" \
    bash -c "mkdir -p /dev/fuse 2>/dev/null; npm run tauri:build || npm run tauri:build -- --bundles deb,rpm"

echo ""
echo ">>> Output:"
ls -lh "$PROJECT_DIR/src-tauri/target/release/bundle/deb/"*.deb 2>/dev/null || true
ls -lh "$PROJECT_DIR/src-tauri/target/release/bundle/rpm/"*.rpm 2>/dev/null || true
ls -lh "$PROJECT_DIR/src-tauri/target/release/bundle/appimage/"*.AppImage 2>/dev/null || true
