import * as Blockly from 'blockly/core';

// 统一应用 Blockly 核心补丁（适配 12.5+ 系列）
// 若后续需要细化补丁，可在此文件逐步扩展

let patchesApplied = false;

/**
 * 解析 Blockly 版本号，返回 [major, minor, patch] 数组。
 * 若无法解析，返回 [0, 0, 0]。
 */
function getBlocklyVersion(): [number, number, number] {
  try {
    const raw = (Blockly as any).VERSION as string;
    if (!raw) return [0, 0, 0];
    const parts = raw.split('.').map(Number);
    if (parts.length < 1 || isNaN(parts[0])) return [0, 0, 0];
    return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
  } catch {
    return [0, 0, 0];
  }
}

/** 判断当前 Blockly 版本是否 >= 指定的 major.minor */
function isBlocklyAtLeast(major: number, minor: number): boolean {
  const [maj, min] = getBlocklyVersion();
  return maj > major || (maj === major && min >= minor);
}

/** 在 console 记录补丁应用信息，便于将来排查 */
function logPatch(name: string, applied: boolean, reason?: string): void {
  const status = applied ? '✓ applied' : '✗ skipped';
  const suffix = reason ? ` (${reason})` : '';
  console.info(`[blockly-patches] ${name} ${status}${suffix}`);
}

export function applyAllPatches() {
  if (patchesApplied) return;

  const [major, minor] = getBlocklyVersion();
  console.info(
    `[blockly-patches] Blockly version: ${major}.${minor}.${getBlocklyVersion()[2]}`,
  );

  // 补丁针对 12.5+ 编写；若版本低于 12.5，跳过（相关 API 可能尚不存在）
  if (!isBlocklyAtLeast(12, 5)) {
    console.warn(
      `[blockly-patches] 当前 Blockly ${major}.${minor} 低于 12.5，` +
        '补丁可能不兼容。',
    );
  }

  _patchFlyoutClearOldBlocks();
  _patchBrowserEventsUnbind();
  _patchConnectionCanConnect();
  _patchGestureDoBlockClick();
  _patchBlockInitSvg();

  patchesApplied = true;
}

// 修复 Flyout 清除旧块时事件未禁用导致竞态崩溃（Blockly 12.5.1 已知 bug）
function _patchFlyoutClearOldBlocks() {
  const Flyout = Blockly.Flyout;
  if (!Flyout) return;

  const proto =
    Flyout.prototype ||
    Object.getPrototypeOf(Blockly.VerticalFlyout?.prototype) ||
    Object.getPrototypeOf(Blockly.HorizontalFlyout?.prototype);
  if (
    !proto ||
    typeof (proto as any).clearOldBlocks !== 'function' ||
    (proto as any).clearOldBlocks.__patched
  )
    return;

  const orig = (proto as any).clearOldBlocks;
  (proto as any).clearOldBlocks = function (this: any) {
    const wasEnabled = Blockly.Events.isEnabled();
    Blockly.Events.disable();
    try {
      orig.call(this);
    } finally {
      if (wasEnabled) Blockly.Events.enable();
    }
  };
  (proto as any).clearOldBlocks.__patched = true;
}

// 防御性补丁：unbind 传入空数组时避免崩溃
function _patchBrowserEventsUnbind() {
  if (!Blockly.browserEvents?.unbind) return;
  if ((Blockly.browserEvents.unbind as any).__patched) return;

  const orig = Blockly.browserEvents.unbind;
  (Blockly.browserEvents as any).unbind = function (bindData: any[]) {
    if (!bindData || !bindData.length) return;
    return orig(bindData);
  };
  (Blockly.browserEvents.unbind as any).__patched = true;
}

// 修复连接数据库潜在抛错：保护性包装
function _patchConnectionCanConnect() {
  if (!Blockly.Connection || (Blockly.Connection as any).__patched) return;

  const orig = (Blockly.Connection.prototype as any).canConnect;
  (Blockly.Connection.prototype as any).canConnect = function (
    this: any,
    otherConnection: any,
    opt_reason?: string,
  ) {
    try {
      return orig.call(this, otherConnection, opt_reason);
    } catch (e) {
      console.warn('Patched: Connection.canConnect error suppressed', e);
      return false;
    }
  };
  (Blockly.Connection as any).__patched = true;
}

// 保护性包装 gesture 的递归问题
function _patchGestureDoBlockClick() {
  if (!Blockly.Gesture || (Blockly.Gesture as any).__patched) return;

  const orig = (Blockly.Gesture.prototype as any).doBlockClick_;
  (Blockly.Gesture.prototype as any).doBlockClick_ = function (
    this: any,
    e: Event,
  ) {
    try {
      return orig.call(this, e);
    } catch (err) {
      console.warn('Patched: Gesture.doBlockClick_ error suppressed', err);
    }
  };
  (Blockly.Gesture as any).__patched = true;
}

// 初始化块时的防御性处理
function _patchBlockInitSvg() {
  if (!Blockly.Block || (Blockly.Block as any).__patched) return;

  const orig = (Blockly.Block.prototype as any).initSvg;
  (Blockly.Block.prototype as any).initSvg = function (this: any) {
    try {
      return orig.call(this);
    } catch (err) {
      console.warn('Patched: Block.initSvg error suppressed', err);
    }
  };
  (Blockly.Block as any).__patched = true;
}
