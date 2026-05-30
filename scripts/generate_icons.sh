#!/usr/bin/env bash
# Generate Tauri PNG icons from SVG using rsvg-convert (perfect anti-aliasing)
# SVG uses fill-opacity="0.999" to force RGBA output.
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SVG="$PROJECT_DIR/public/favicon.svg"
ICONS_DIR="$PROJECT_DIR/src-tauri/icons"

mkdir -p "$ICONS_DIR"

echo "Generating Tauri icons from $SVG ..."

rsvg-convert -w  32 -h  32 "$SVG" -o "$ICONS_DIR/32x32.png"
echo "  ✓ 32x32.png"

rsvg-convert -w 128 -h 128 "$SVG" -o "$ICONS_DIR/128x128.png"
echo "  ✓ 128x128.png"

rsvg-convert -w 256 -h 256 "$SVG" -o "$ICONS_DIR/128x128@2x.png"
echo "  ✓ 128x128@2x.png"

# Windows .ico (multi-size)
if command -v convert &>/dev/null; then
  convert "$ICONS_DIR/32x32.png" "$ICONS_DIR/128x128.png" "$ICONS_DIR/256x256.png" "$ICONS_DIR/icon.ico" 2>/dev/null || true
  echo "  ✓ icon.ico"
else
  echo "  ⚠ ImageMagick not found, skipping icon.ico (Tauri will auto-generate)"
fi

# macOS .icns (requires macOS)
if [[ "$(uname)" == "Darwin" ]]; then
  mkdir -p "$ICONS_DIR/icon.iconset"
  cp "$ICONS_DIR/32x32.png"     "$ICONS_DIR/icon.iconset/icon_32x32.png"
  cp "$ICONS_DIR/128x128.png"   "$ICONS_DIR/icon.iconset/icon_128x128.png"
  cp "$ICONS_DIR/128x128@2x.png" "$ICONS_DIR/icon.iconset/icon_256x256.png"
  iconutil -c icns "$ICONS_DIR/icon.iconset" -o "$ICONS_DIR/icon.icns"
  rm -rf "$ICONS_DIR/icon.iconset"
  echo "  ✓ icon.icns"
else
  echo "  ⚠ macOS .icns skipped (requires macOS, Tauri will auto-generate)"
fi

echo "Done."
