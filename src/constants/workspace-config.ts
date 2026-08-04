export const WORKSPACE_OPTIONS = {
  media: '/blockly/media/',
  // Blockly 13 默认 renderer 为 thrasos；锁 geras 保持 12.x 既有视觉（教学平台块外观稳定优先）
  renderer: 'geras',
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
