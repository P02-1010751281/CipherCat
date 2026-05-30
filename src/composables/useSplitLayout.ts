import { ref, onMounted, onUnmounted } from 'vue';

const MIN_RIGHT = 280;
const MAX_RIGHT_RATIO = 0.55;
const MIN_TOP = 160;

export function useSplitLayout(editorViewRef: ReturnType<typeof ref<HTMLElement | null>>) {
  const rightWidth = ref<number | undefined>(undefined);
  const topHeight = ref<number | undefined>(undefined);

  let splitDragging = false;
  const narrowMedia = window.matchMedia('(max-width: 1200px)');
  let resizeCleanup: (() => void) | null = null;

  function isNarrowLayout() {
    return narrowMedia.matches;
  }

  function onSplitDragStart(e: MouseEvent) {
    e.preventDefault();
    splitDragging = true;
    document.addEventListener('mousemove', onSplitDragMove);
    document.addEventListener('mouseup', onSplitDragEnd);
    document.body.style.cursor = isNarrowLayout() ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
  }

  function onSplitDragMove(e: MouseEvent) {
    if (!splitDragging) return;
    const container = editorViewRef.value;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    if (isNarrowLayout()) {
      const fromTop = e.clientY - rect.top;
      const maxTop = rect.height * 0.7;
      topHeight.value = Math.max(MIN_TOP, Math.min(fromTop, maxTop));
    } else {
      const fromRight = rect.right - e.clientX;
      const maxRight = rect.width * MAX_RIGHT_RATIO;
      rightWidth.value = Math.max(MIN_RIGHT, Math.min(fromRight, maxRight));
    }
  }

  function onSplitDragEnd() {
    splitDragging = false;
    document.removeEventListener('mousemove', onSplitDragMove);
    document.removeEventListener('mouseup', onSplitDragEnd);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  function initResponsive(callback?: () => void) {
    const onBreakpoint = () => {
      if (narrowMedia.matches) {
        rightWidth.value = undefined;
      } else {
        topHeight.value = undefined;
      }
      callback?.();
    };
    narrowMedia.addEventListener('change', onBreakpoint);
    resizeCleanup = () => narrowMedia.removeEventListener('change', onBreakpoint);
  }

  onUnmounted(() => {
    if (splitDragging) {
      document.removeEventListener('mousemove', onSplitDragMove);
      document.removeEventListener('mouseup', onSplitDragEnd);
    }
    resizeCleanup?.();
  });

  return {
    rightWidth,
    topHeight,
    isNarrowLayout,
    onSplitDragStart,
    onSplitDragEnd,
    initResponsive,
  };
}
