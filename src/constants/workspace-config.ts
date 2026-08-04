export const WORKSPACE_OPTIONS = {
  media: '/blockly/media/',
  // renderer 不显式指定：采用 Blockly 13 默认 thrasos（更性能，官方推荐）
  scrollbars: true,
  move: {
    scrollbars: true,
    drag: true,
    wheel: true,
  },
  grid: {
    spacing: 20,
    length: 3,
    colour: '#ccc',
    snap: true,
  },
  zoom: {
    controls: true,
    wheel: true,
    startScale: 1.0,
    maxScale: 3,
    minScale: 0.3,
    scaleSpeed: 1.2,
  },
  trashcan: true,
};
