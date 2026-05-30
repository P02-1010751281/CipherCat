#!/bin/bash
# Tauri dev mode in Docker with X11 GUI (hot reload)
set -e
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
IMAGE="localhost/ciphercat:tauri"

if ! docker image inspect "$IMAGE" &>/dev/null; then
  echo ">>> Image not found, building..."
  docker build -t "$IMAGE" -f "$PROJECT_DIR/docker/Dockerfile" "$PROJECT_DIR"
fi

docker run --rm -it \
    --privileged \
    -v "$PROJECT_DIR":/app \
    -v tauri-cargo-registry:/opt/cargo/registry \
    -v tauri-cargo-target:/app/src-tauri/target \
    -v /tmp/.X11-unix:/tmp/.X11-unix \
    -v /run/user/1000:/run/user/1000 \
    -e DISPLAY="$DISPLAY" \
    -e XAUTHORITY="$XAUTHORITY" \
    -e WAYLAND_DISPLAY="$WAYLAND_DISPLAY" \
    -e XDG_RUNTIME_DIR="/run/user/1000" \
    -e LIBGL_ALWAYS_SOFTWARE=1 \
    -e GALLIUM_DRIVER=llvmpipe \
    -e GSK_RENDERER=cairo \
    -e WEBKIT_DISABLE_COMPOSITING_MODE=1 \
    --net=host \
    --ipc=host \
    "$IMAGE" \
    bash -c "npm run tauri:dev"
