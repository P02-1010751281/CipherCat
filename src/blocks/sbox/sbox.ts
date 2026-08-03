import * as Blockly from 'blockly/core';
import { TYPE_SBOX } from '@/constants/block-types';
import { SBOX_PRESETS } from '@/constants/sbox-presets';

export const SBOX_BLOCK_TYPES = ['sbox', 'sbox_sub'] as const;

export type SBoxBlockType = (typeof SBOX_BLOCK_TYPES)[number];

interface SBoxBlock extends Blockly.Block {
  gridData: string[];
  settingsPopup: HTMLDivElement | null;
  settingsPopupClickHandler: ((_e: MouseEvent) => void) | null;
  exportToCsv: () => void;
  openCsvImportDialog: () => void;
  loadCsvData: (_file: File) => void;
  updateShape: () => void;
  toggleSboxTable: () => void;
}

/** 打开着 S-box 表格弹窗的块（workspace.clear/导入/组件卸载时统一关闭，防 listener + DOM 泄漏） */
const openPopupBlocks = new Set<SBoxBlock>();

export function closeAllSboxPopups(): void {
  for (const block of openPopupBlocks) {
    if (block.settingsPopup) {
      block.settingsPopup.remove();
      block.settingsPopup = null;
    }
    if (block.settingsPopupClickHandler) {
      document.removeEventListener('click', block.settingsPopupClickHandler);
      block.settingsPopupClickHandler = null;
    }
  }
  openPopupBlocks.clear();
}

function hexValidator(newValue: string): string | null {
  if (
    /^0[xX][0-9a-fA-F]{1,2}$/.test(newValue) ||
    /^[0-9a-fA-F]{1,2}$/.test(newValue)
  ) {
    return newValue.toUpperCase().replace(/^0x/i, '');
  }
  return null;
}

 
function getSboxRowCol(this: SBoxBlock) {
  void this;
  const row = Number(this.getFieldValue('ROW')) || 4;
  const col = Number(this.getFieldValue('COL')) || 4;
  const maxRow = Math.min(row, 32);
  const maxCol = Math.min(col, 32);
  return { maxRow, maxCol };
}

const iconLoad =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9IiM0NDQiIHJ4PSIyIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTcgM2gydjRINGEyVjNoM3YySDl2NGgtMlY1SDRWM2gzeiIvPjwvc3ZnPg==';
const iconSave =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9IiMyYTliZCIgcng9IjIiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNOCAydjZINmwzIDMgMy0zaC0yVjJ6TTIgMTJoMTJ2MkgyeiIvPjwvc3ZnPg==';
const iconTable =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9IiM2YTYiIHJ4PSIyIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIgMmgxMnYxMkgyVjJ6bTEgMXY0aDRWM0gzem01IDB2NGg0VjNIOHpNMyA4djRoNFY4SDN6bTUgMHY0aDRWOEg4eiIvPjwvc3ZnPg==';

Blockly.Blocks['sbox'] = {
   
  init: function (this: SBoxBlock) {
    const dropdown = new Blockly.FieldDropdown(() => [
      [Blockly.Msg.CRYPTO_SBOX_ARRAY_1D || '1D Array', '1d'],
      [Blockly.Msg.CRYPTO_SBOX_ARRAY_2D || '2D Array', '2d'],
    ]);
    const presetDropdown = new Blockly.FieldDropdown(() => [
      [Blockly.Msg.CRYPTO_SBOX_PRESET_NONE || 'Custom (CSV)', ''],
      [Blockly.Msg.CRYPTO_SBOX_PRESET_AES || 'AES S-box (FIPS 197)', 'aes'],
      [Blockly.Msg.CRYPTO_SBOX_PRESET_SM4 || 'SM4 S-box (GM/T 0002)', 'sm4'],
      [Blockly.Msg.CRYPTO_SBOX_PRESET_ZUC_S0 || 'ZUC S0 (GB/T 33133)', 'zuc_s0'],
      [Blockly.Msg.CRYPTO_SBOX_PRESET_ZUC_S1 || 'ZUC S1 (GB/T 33133)', 'zuc_s1'],
    ]);
    presetDropdown.setValidator((newValue) => {
      if (newValue && newValue !== '') {
        const preset = SBOX_PRESETS[newValue];
        if (preset) {
          // 预设填充：16×16 网格 + 数据
          Blockly.Events.disable();
          try {
            this.setFieldValue('16', 'ROW');
            this.setFieldValue('16', 'COL');
            this.gridData = preset.slice();
            this.updateShape();
          } finally {
            Blockly.Events.enable();
          }
        }
      }
      return newValue;
    });
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_SBOX_SIZE || 'S-box Size')
      .appendField(new Blockly.FieldNumber(4, 1, 32), 'ROW')
      .appendField('x')
      .appendField(new Blockly.FieldNumber(4, 1, 32), 'COL')
      .appendField(dropdown, 'OUTPUT_FORMAT');
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_SBOX_PRESET || 'Preset')
      .appendField(presetDropdown, 'PRESET')
      .appendField(
        new Blockly.FieldImage(iconLoad, 16, 16, '导入CSV', () => {
          this.openCsvImportDialog();
        }),
      )
      .appendField(
        new Blockly.FieldImage(iconSave, 16, 16, '导出CSV', () => {
          this.exportToCsv();
        }),
      )
      .appendField(
        new Blockly.FieldImage(iconTable, 16, 16, '查看表格', () => {
          this.toggleSboxTable();
        }),
      );

    this.updateShape();

    this.setOutput(true, TYPE_SBOX);
    this.setColour(230);
    this.setTooltip(
      Blockly.Msg.CRYPTO_SBOX_TOOLTIP || 'S-box lookup table, import CSV',
    );

    this.setOnChange(function (
      this: SBoxBlock,
      event: Blockly.Events.Abstract,
    ) {
      if (event.type === Blockly.Events.BLOCK_CHANGE) {
        const e = event as Blockly.Events.BlockChange;
        if (e.blockId === this.id && (e.name === 'ROW' || e.name === 'COL')) {
          Blockly.Events.disable();
          try {
            this.updateShape();
          } finally {
            Blockly.Events.enable();
          }
        }
      } else if (event.type === Blockly.Events.BLOCK_DELETE) {
        const e = event as Blockly.Events.BlockDelete;
        if (e.blockId === this.id) {
          if (this.settingsPopupClickHandler && this.settingsPopup) {
            document.removeEventListener('click', this.settingsPopupClickHandler);
            this.settingsPopup.remove();
            this.settingsPopup = null;
            this.settingsPopupClickHandler = null;
          }
        }
      }
    });
  },

  /** JSON serialize: return the mutation data for Blockly 12 */

   
  saveExtraState: function (this: SBoxBlock): object {
    void this;
    const state: Record<string, unknown> = {};
    state.row = this.getFieldValue('ROW') || 4;
    state.col = this.getFieldValue('COL') || 4;
    state.output_format = this.getFieldValue('OUTPUT_FORMAT') || '2d';
    const preset = this.getFieldValue('PRESET') || '';
    if (preset) state.preset = preset;
    if (this.gridData && this.gridData.length > 0) {
      state.data = this.gridData.join(',');
    }
    return state;
  },

  /** JSON deserialize: receive mutation data from Blockly 12 */
  loadExtraState: function (this: SBoxBlock, state: Record<string, unknown>) {
    void this;
    const rowA = String(state.row || 4);
    const colA = String(state.col || 4);
    const fmt = String(state.output_format || '2d');
    const dataStr = typeof state.data === 'string' ? state.data : undefined;
    const preset = typeof state.preset === 'string' ? state.preset : '';
    if (rowA) this.setFieldValue(rowA, 'ROW');
    if (colA) this.setFieldValue(colA, 'COL');
    if (fmt) this.setFieldValue(fmt, 'OUTPUT_FORMAT');
    if (preset) this.setFieldValue(preset, 'PRESET');

    if (dataStr) {
      this.gridData = dataStr.split(',');
    } else if (preset && SBOX_PRESETS[preset]) {
      this.gridData = SBOX_PRESETS[preset].slice();
    } else {
      console.warn('[sbox] loadExtraState: no data in state');
    }
    this.updateShape();
  },

   
  mutationToDom: function (this: SBoxBlock) {
    void this;
    const c = Blockly.utils.xml.createElement('mutation');
    c.setAttribute('row', String(this.getFieldValue('ROW') || 4));
    c.setAttribute('col', String(this.getFieldValue('COL') || 4));
    c.setAttribute(
      'output_format',
      String(this.getFieldValue('OUTPUT_FORMAT') || '2d'),
    );
    const preset = this.getFieldValue('PRESET') || '';
    if (preset) c.setAttribute('preset', preset);
    if (this.gridData && this.gridData.length > 0) {
      c.setAttribute('data', this.gridData.join(','));
    }
    return c;
  },

  domToMutation: function (this: SBoxBlock, xmlElement: Element) {
    void this;
    const rowA = xmlElement.getAttribute('row');
    const colA = xmlElement.getAttribute('col');
    const fmt = xmlElement.getAttribute('output_format');
    const dataStr = xmlElement.getAttribute('data');
    const preset = xmlElement.getAttribute('preset') || '';
    if (rowA) this.setFieldValue(rowA, 'ROW');
    if (colA) this.setFieldValue(colA, 'COL');
    if (fmt) this.setFieldValue(fmt, 'OUTPUT_FORMAT');
    if (preset) this.setFieldValue(preset, 'PRESET');

    if (dataStr) {
      this.gridData = dataStr.split(',');
    } else if (preset && SBOX_PRESETS[preset]) {
      this.gridData = SBOX_PRESETS[preset].slice();
    } else if (xmlElement.parentElement) {
      const r = Number(rowA) || 4,
        c = Number(colA) || 4;
      const arr: string[] = [];
      for (let ri = 0; ri < r; ri++) {
        for (let ci = 0; ci < c; ci++) {
          const f = xmlElement.parentElement.querySelector(
            'field[name=\'SBox_' + ri + '_' + ci + '\']',
          );
          arr.push(f?.textContent?.trim() || '00');
        }
      }
      if (arr.length === r * c) {
        this.gridData = arr;
      }
    }
    this.updateShape();
  },

   
  /**
   * 调整 gridData 大小以匹配当前 ROW×COL。
   * ROW_ input 清理是历史兼容代码（当前版本无此类 input）。
   */
  updateShape: function (this: SBoxBlock) {
    const { maxRow, maxCol } = getSboxRowCol.call(this);
    const size = maxRow * maxCol;
    // 历史兼容：清理旧版 ROW_ 输入
    this.inputList
      .filter((i) => i.name?.startsWith('ROW_'))
      .forEach((i) => this.removeInput(i.name!));
    // gridData 大小同步
    if (!this.gridData || this.gridData.length === 0) {
      this.gridData = Array.from({ length: size }, () => '00');
    } else if (this.gridData.length !== size) {
      const nd = Array.from({ length: size }, () => '00');
      for (let i = 0; i < Math.min(this.gridData.length, size); i++)
        nd[i] = this.gridData[i];
      this.gridData = nd;
    }
  },

   
  toggleSboxTable: function (this: SBoxBlock) {
    if (this.settingsPopup) {
      this.settingsPopup.remove();
      this.settingsPopup = null;
      if (this.settingsPopupClickHandler) {
        document.removeEventListener('click', this.settingsPopupClickHandler);
        this.settingsPopupClickHandler = null;
      }
      openPopupBlocks.delete(this);
      return;
    }

    const { maxRow, maxCol } = getSboxRowCol.call(this);
    const popup = document.createElement('div');
    popup.style.cssText =
      'position:fixed;z-index:10000;background:var(--el-bg-color-overlay,#fff);' +
      'border:2px solid var(--el-color-primary,#4a90d9);border-radius:8px;padding:12px;' +
      'color:var(--el-text-color-primary,#333);' +
      'max-width:min(90vw,720px);' +
      'box-shadow:0 4px 20px rgba(0,0,0,0.25);' +
      'font-family:monospace;max-height:420px;overflow:auto;';

    const title = document.createElement('div');
    title.style.cssText =
      'font-size:14px;font-weight:bold;margin-bottom:8px;color:var(--el-text-color-primary,#333);';
    title.textContent = 'S-box ' + maxRow + 'x' + maxCol;
    popup.appendChild(title);

    const table = document.createElement('table');
    table.style.cssText = 'border-collapse:collapse;';
    const tr = document.createElement('tr');
    const empty = document.createElement('th');
    empty.style.cssText =
      'border:1px solid var(--el-border-color,#bbb);padding:3px 6px;background:var(--el-fill-color-light,#e8f4fd);text-align:center;min-width:28px;';
    tr.appendChild(empty);
    for (let c = 0; c < maxCol; c++) {
      const th = document.createElement('th');
      th.style.cssText =
        'border:1px solid var(--el-border-color,#bbb);padding:3px 6px;background:var(--el-fill-color-light,#e8f4fd);text-align:center;font-weight:bold;';
      th.textContent = 'x' + c.toString(16).toUpperCase();
      tr.appendChild(th);
    }
    table.appendChild(tr);
    for (let r = 0; r < maxRow; r++) {
      const tr2 = document.createElement('tr');
      const rh = document.createElement('td');
      rh.style.cssText =
        'border:1px solid var(--el-border-color,#bbb);padding:3px 6px;background:var(--el-fill-color-light,#e8f4fd);text-align:center;font-weight:bold;';
      rh.textContent = r.toString(16).toUpperCase();
      tr2.appendChild(rh);
      for (let c = 0; c < maxCol; c++) {
        const td = document.createElement('td');
        td.style.cssText =
          'border:1px solid var(--el-border-color,#bbb);padding:3px 6px;text-align:center;font-family:monospace;';
        td.textContent =
          this.gridData && r * maxCol + c < this.gridData.length
            ? this.gridData[r * maxCol + c]
            : '00';
        tr2.appendChild(td);
      }
      table.appendChild(tr2);
    }
    popup.appendChild(table);
    document.body.appendChild(popup);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const el = (this as any).getSvgRoot();
      const bbox = el.getBoundingClientRect();
      let x = bbox.right + 8,
        y = bbox.top;
      const pw = popup.offsetWidth || 200,
        ph = popup.offsetHeight || 300;
      x = Math.max(8, Math.min(x, window.innerWidth - pw - 8));
      y = Math.max(8, Math.min(y, window.innerHeight - ph - 8));
      popup.style.left = x + 'px';
      popup.style.top = y + 'px';
    } catch {
      popup.style.left = '80px';
      popup.style.top = '80px';
    }

    this.settingsPopup = popup;
    const handler = (e: MouseEvent) => {
      if (popup && !popup.contains(e.target as Node)) this.toggleSboxTable();
    };
    setTimeout(() => document.addEventListener('click', handler));
    this.settingsPopupClickHandler = handler;
    openPopupBlocks.add(this);
  },

  loadCsvData: function (this: SBoxBlock, file: File) {
    void this;
    const { maxRow, maxCol } = getSboxRowCol.call(this);
    const size = maxRow * maxCol;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const vals = text
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v.length > 0);
        if (vals.length !== size)
          throw new Error('CSV: ' + vals.length + ' values, need ' + size);
        const validated: string[] = [];
        vals.forEach((v, i) => {
          const vv = hexValidator(v);
          if (vv === null)
            throw new Error('CSV row ' + (i + 1) + ' invalid: ' + v);
          validated.push(vv.padStart(2, '0'));
        });
        this.gridData = validated;
        this.setWarningText(null);
      } catch (err) {
        this.setWarningText((err as Error).message);
        this.gridData = Array.from({ length: size }, () => '00');
      }
    };
    reader.onerror = () => {
      this.setWarningText('CSV read failed');
      this.gridData = Array.from({ length: size }, () => '00');
    };
    reader.readAsText(file);
  },

   
  openCsvImportDialog: function (this: SBoxBlock) {
    void this;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.txt';
    input.style.display = 'none';
    input.onchange = () => {
      const file = (input as HTMLInputElement).files?.[0];
      if (file) this.loadCsvData(file);
      document.body.removeChild(input);
    };
    document.body.appendChild(input);
    input.click();
  },

   
  exportToCsv: function (this: SBoxBlock) {
    const { maxRow, maxCol } = getSboxRowCol.call(this);
    const csv = this.gridData.slice(0, maxRow * maxCol).join(',');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sbox_' + maxRow + 'x' + maxCol + '.csv';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

Blockly.Blocks['sbox_sub'] = {
  init: function () {
    this.appendValueInput('INPUT_VAR')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_SBOX_SUB || 'S-box Sub Input Var');
    this.appendValueInput('SBOX_VAR')
      .setCheck(TYPE_SBOX)
      .appendField(Blockly.Msg.CRYPTO_SBOX_SUB_VAR || 'S-box');
    this.appendValueInput('OUTPUT_VAR')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_LOGIC_OUTPUT_VAR || '输出变量');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip(
      Blockly.Msg.CRYPTO_SBOX_SUB_TOOLTIP ||
        'Execute S-box substitution on 32-bit input variable',
    );
    this.setHelpUrl('');
  },
};
