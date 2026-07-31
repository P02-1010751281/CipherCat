/**
 * 密码学函数封装积木块定义
 *
 * 策略：完整独立实现增强版 procedure 块，直接注册到 Blockly 原生块名
 * （procedures_defreturn 等），覆盖原生注册。不 Object.assign 原生定义——
 * 全部方法自包含，参数带密码学类型下拉（bytes/int/int_list/...）。
 * 兼容原生 flyout / mutateCallers / 序列化 / toolbox。
 */
import * as Blockly from 'blockly/core';
import 'blockly/blocks';

export const PROCEDURE_BLOCK_TYPES = [
  'crypto_return',
  'crypto_encrypt_func',
  'crypto_decrypt_func',
  'crypto_hash_func',
] as const;

export type ProcedureBlockType = (typeof PROCEDURE_BLOCK_TYPES)[number];

export const CRYPTO_PARAM_TYPES: [string, string][] = [
  ['bytes', 'bytes'], ['int', 'int'], ['int_list', 'int_list'],
  ['poly', 'poly'], ['seed', 'seed'], ['key', 'key'], ['message', 'message'],
];

// ─────────────────────────────────────────────────────────
// crypto_return — 独立返回块
// ─────────────────────────────────────────────────────────

Blockly.Blocks['crypto_return'] = {
  init: function () {
    this.appendValueInput('VALUE').setCheck(null).appendField('🔧 return');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('Return a value from a crypto function.');
    this.setHelpUrl('');
  },
};

// ─────────────────────────────────────────────────────────
// 内部工具
// ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyBlock = any;

// ─────────────────────────────────────────────────────────
// procedures_mutatorcontainer — mutator 根块
// ─────────────────────────────────────────────────────────

Blockly.Blocks['procedures_mutatorcontainer'] = {
  init: function () {
    const msg = Blockly.Msg as Record<string, string>;
    this.appendDummyInput()
      .appendField(msg.PROCEDURES_MUTATORCONTAINER_TITLE || 'procedure properties');
    this.appendStatementInput('STACK');
    this.setColour(290);
    this.setTooltip(msg.PROCEDURES_MUTATORCONTAINER_TOOLTIP || 'Add, remove, or reorder items.');
    this.setHelpUrl(msg.PROCEDURES_MUTATORCONTAINER_HELPURL || '');
    (this as unknown as { contextMenu: boolean }).contextMenu = false;
  },
};

// ─────────────────────────────────────────────────────────
// procedures_mutatorarg — 参数块（变量名 + 类型下拉）
// ─────────────────────────────────────────────────────────

Blockly.Blocks['procedures_mutatorarg'] = {
  init: function () {
    this.appendDummyInput()
      .appendField((Blockly.Msg as Record<string, string>).PROCEDURES_MUTATORARG_TITLE || 'input')
      .appendField(new Blockly.FieldVariable(null, undefined, undefined, ''), 'NAME')
      .appendField(':')
      .appendField(new Blockly.FieldDropdown(CRYPTO_PARAM_TYPES), 'PARAM_TYPE');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setStyle('procedure_blocks');
    this.setColour(290);
    this.setTooltip('A crypto procedure parameter with a type annotation.');
    (this as unknown as { contextMenu: boolean }).contextMenu = false;
  },
};

// ─────────────────────────────────────────────────────────
// procedures_defreturn / procedures_defnoreturn
// 完整独立实现，legacy procedure 路径（getProcedureDef + mutateCallers）
// ─────────────────────────────────────────────────────────

function makeDefBlock(hasReturn: boolean): AnyBlock {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const DEF: Record<string, any> = {
    init: function (this: AnyBlock) {
      const msg = Blockly.Msg as Record<string, string>;
      const title = hasReturn
        ? (msg.PROCEDURES_DEFRETURN_TITLE || 'to')
        : (msg.PROCEDURES_DEFNORETURN_TITLE || 'to do');
      const nameField = new Blockly.FieldTextInput(
        Blockly.Procedures.findLegalName('', this),
      );
      nameField.setValidator(Blockly.Procedures.rename);
      nameField.setSpellcheck(false);
      this.appendDummyInput()
        .appendField(title)
        .appendField(nameField, 'NAME')
        .appendField('', 'PARAMS');
      if (hasReturn) {
        this.appendValueInput('RETURN')
          .setCheck(null)
          .setAlign(Blockly.inputs.Align.RIGHT)
          .appendField(msg.PROCEDURES_DEFRETURN_RETURN || 'return');
      }
      this.setMutator(new Blockly.icons.MutatorIcon(['procedures_mutatorarg'], this));
      this.setStyle('procedure_blocks');
      this.setColour(290);
      this.setTooltip(msg.CRYPTO_PROCEDURES_TEMPLATE_TOOLTIP || 'A crypto function with typed parameters.');
      this.setHelpUrl('');
      this.arguments_ = [];
      this.argumentVarModels_ = [];
      this.paramTypes_ = [];
      this.paramIds_ = [];
      this.setStatements_(true);
      this.statementConnection_ = null;
    },
    getProcedureDef: function (this: AnyBlock): [string, string[], boolean] {
      return [this.getFieldValue('NAME') as string, this.arguments_, hasReturn];
    },
    updateParams_: function (this: AnyBlock) {
      const msg = Blockly.Msg as Record<string, string>;
      const before = msg.PROCEDURES_BEFORE_PARAMS || 'with';
      const parts = this.arguments_.map((name: string, i: number) =>
        name + ': ' + (this.paramTypes_[i] || 'bytes'));
      const label = parts.length ? before + ' ' + parts.join(', ') : '';
      Blockly.Events.disable();
      try { this.setFieldValue(label, 'PARAMS'); } finally { Blockly.Events.enable(); }
    },
    setStatements_: function (this: AnyBlock, hasStatements: boolean) {
      if (this.hasStatements_ === hasStatements) return;
      if (hasStatements) {
        this.appendStatementInput('STACK')
          .appendField((Blockly.Msg as Record<string, string>).PROCEDURES_DEFRETURN_DO || 'do');
        if (this.getInput('RETURN')) this.moveInputBefore('STACK', 'RETURN');
      } else {
        this.removeInput('STACK', true);
      }
      this.hasStatements_ = hasStatements;
    },
    mutationToDom: function (this: AnyBlock, opt_saveId?: boolean): Element {
      const container = Blockly.utils.xml.createElement('mutation');
      if (opt_saveId) container.setAttribute('name', (this.getFieldValue('NAME') as string) || '');
      for (let i = 0; i < this.argumentVarModels_.length; i++) {
        const arg = Blockly.utils.xml.createElement('arg');
        const v = this.argumentVarModels_[i];
        arg.setAttribute('name', v.getName());
        arg.setAttribute('varid', v.getId());
        if (opt_saveId && this.paramIds_) arg.setAttribute('paramId', this.paramIds_[i]);
        arg.setAttribute('type', this.paramTypes_[i] || 'bytes');
        container.appendChild(arg);
      }
      if (this.hasStatements_ === false) container.setAttribute('statements', 'false');
      return container;
    },
    domToMutation: function (this: AnyBlock, xmlElement: Element) {
      this.arguments_ = [];
      this.argumentVarModels_ = [];
      this.paramTypes_ = [];
      const children = Array.from(xmlElement.childNodes);
      for (const child of children) {
        if (child.nodeName.toLowerCase() !== 'arg') continue;
        const argEl = child as Element;
        const name = argEl.getAttribute('name') || '';
        const varId = argEl.getAttribute('varid') || argEl.getAttribute('varId') || '';
        const type = argEl.getAttribute('type') || 'bytes';
        this.arguments_.push(name);
        this.paramTypes_.push(type);
        const v = Blockly.Variables.getOrCreateVariablePackage(this.workspace, varId || null, name, '') as unknown as Blockly.VariableModel | null;
        if (v) this.argumentVarModels_.push(v);
        else console.warn(`Failed to create variable "${name}", ignoring.`);
      }
      this.updateParams_();
      Blockly.Procedures.mutateCallers(this);
      this.setStatements_((xmlElement.getAttribute('statements') !== 'false'));
    },
    decompose: function (this: AnyBlock, workspace: Blockly.Workspace): Blockly.Block {
      const topBlock = workspace.newBlock('procedures_mutatorcontainer');
      (topBlock as Blockly.BlockSvg).initSvg();
      let connection = topBlock.getInput('STACK')?.connection ?? null;
      for (let i = 0; i < this.arguments_.length; i++) {
        const argBlock = workspace.newBlock('procedures_mutatorarg');
        argBlock.setFieldValue(this.arguments_[i], 'NAME');
        argBlock.setFieldValue(this.paramTypes_[i] || 'bytes', 'PARAM_TYPE');
        (argBlock as Blockly.BlockSvg).initSvg();
        if (connection && argBlock.previousConnection) connection.connect(argBlock.previousConnection);
        connection = argBlock.nextConnection;
      }
      Blockly.Procedures.mutateCallers(this);
      return topBlock;
    },
    compose: function (this: AnyBlock, topBlock: Blockly.Block) {
      this.arguments_ = [];
      this.paramIds_ = [];
      this.argumentVarModels_ = [];
      this.paramTypes_ = [];
      let block: Blockly.Block | null = topBlock.getInputTargetBlock('STACK');
      while (block && !block.isInsertionMarker()) {
        const name = (block.getFieldValue('NAME') as string) || '';
        const type = (block.getFieldValue('PARAM_TYPE') as string) || 'bytes';
        this.arguments_.push(name);
        this.paramTypes_.push(type);
        this.paramIds_.push(block.id);
        const v = this.workspace.getVariableMap().getVariable(name, '') as unknown as Blockly.VariableModel | null;
        this.argumentVarModels_.push(v as unknown as Blockly.VariableModel);
        block = block.getNextBlock();
      }
      this.updateParams_();
      Blockly.Procedures.mutateCallers(this);
    },
    saveExtraState: function (this: AnyBlock): Record<string, unknown> | null {
      if (!this.argumentVarModels_.length && this.hasStatements_ !== false) return null;
      const state: Record<string, unknown> = {};
      if (this.argumentVarModels_.length) {
        state.params = this.argumentVarModels_.map((v: Blockly.VariableModel, i: number) => ({
          name: v.getName(),
          id: v.getId(),
          type: this.paramTypes_[i] || 'bytes',
        }));
      }
      if (this.hasStatements_ === false) state.hasStatements = false;
      return state;
    },
    loadExtraState: function (this: AnyBlock, state: Record<string, unknown>) {
      // flyout 传 {name, params}：name 应用到 NAME 字段（函数选择）
      if (typeof state.name === 'string' && state.name) {
        try { this.setFieldValue(state.name, 'NAME'); } catch {}
      }
      const raw = (state.params as Array<{ name: string; id: string; type?: string } | string>) || [];
      this.arguments_ = [];
      this.argumentVarModels_ = [];
      this.paramTypes_ = [];
      for (const item of raw) {
        const p = typeof item === 'string' ? { name: item, id: '', type: 'bytes' } : item;
        this.arguments_.push(p.name);
        this.paramTypes_.push(p.type || 'bytes');
        const v = (this.workspace.getVariableMap().getVariable(p.name, '') ||
          this.workspace.createVariable(p.name, '', p.id || undefined)) as unknown as Blockly.VariableModel;
        this.argumentVarModels_.push(v);
      }
      this.updateParams_();
      Blockly.Procedures.mutateCallers(this);
      if (state.hasStatements === false) this.setStatements_(false);
    },
    getVars: function (this: AnyBlock): string[] {
      return this.arguments_;
    },
    getVarModels: function (this: AnyBlock): Blockly.VariableModel[] {
      return this.argumentVarModels_;
    },
    renameVarById: function (this: AnyBlock, oldId: string, newId: string) {
      const varmap = this.workspace.getVariableMap();
      const oldVar = varmap.getVariableById(oldId);
      if (!oldVar || oldVar.getType() !== '') return;
      const newVar = varmap.getVariableById(newId);
      if (!newVar) return;
      const idx = this.argumentVarModels_.findIndex((v: Blockly.VariableModel) => v.getId() === oldId);
      if (idx === -1) return;
      const oldName = oldVar.getName();
      this.arguments_[idx] = newVar.getName();
      this.argumentVarModels_[idx] = newVar;
      this.displayRenamedVar_(oldName, newVar.getName());
      Blockly.Procedures.mutateCallers(this);
    },
    updateVarName: function (this: AnyBlock, variable: Blockly.VariableModel) {
      const name = variable.getName();
      let changed = false;
      let oldName = '';
      for (let i = 0; i < this.argumentVarModels_.length; i++) {
        if (this.argumentVarModels_[i].getId() === variable.getId()) {
          oldName = this.arguments_[i];
          this.arguments_[i] = name;
          changed = true;
        }
      }
      if (changed) {
        this.displayRenamedVar_(oldName, name);
        Blockly.Procedures.mutateCallers(this);
      }
    },
    displayRenamedVar_: function (this: AnyBlock, oldName: string, newName: string) {
      this.updateParams_();
      const icon = this.getIcon(Blockly.icons.MutatorIcon.TYPE) as unknown as {
        bubbleIsVisible: () => boolean; getWorkspace: () => Blockly.WorkspaceSvg | null;
      };
      if (icon && icon.bubbleIsVisible()) {
        const ws = icon.getWorkspace();
        if (ws) {
          for (const b of ws.getAllBlocks(false)) {
            if (b.type === 'procedures_mutatorarg' &&
                Blockly.Names.equals(oldName, b.getFieldValue('NAME') as string)) {
              b.setFieldValue(newName, 'NAME');
            }
          }
        }
      }
    },
  };

  DEF.callType_ = hasReturn ? 'procedures_callreturn' : 'procedures_callnoreturn';
  return DEF;
}

Blockly.Blocks['procedures_defreturn'] = makeDefBlock(true);
Blockly.Blocks['procedures_defnoreturn'] = makeDefBlock(false);

// ─────────────────────────────────────────────────────────
// procedures_callreturn / procedures_callnoreturn
// 完整独立实现，通过 mutateCallers 与 def 同步
// ─────────────────────────────────────────────────────────


/** 构建 call 块 NAME 下拉选项：所有已定义函数名。 */
function buildCallOptions(block: AnyBlock): Array<[string, string]> {
  try {
    const ws = (block.workspace as unknown as { targetWorkspace?: Blockly.Workspace }).targetWorkspace || block.workspace;
    const tuples = Blockly.Procedures.allProcedures(ws);
    const names = tuples[0].concat(tuples[1]).map((t) => t[0]);
    if (!names.length) return [[Blockly.Msg.PROCEDURES_UNNAMED || 'unnamed', '']];
    return names.map((n) => [n, n]);
  } catch {
    return [[Blockly.Msg.PROCEDURES_UNNAMED || 'unnamed', '']];
  }
}

/** call 块选择函数后同步参数行。 */
function syncCallParams(block: AnyBlock, funcName: string) {
  const ws = (block.workspace as unknown as { targetWorkspace?: Blockly.Workspace }).targetWorkspace || block.workspace;
  const def = Blockly.Procedures.getDefinition(funcName, ws);
  if (!def) { block.arguments_ = []; block.argumentVarModels_ = []; block.paramTypes_ = []; block.updateShape_!(); return; }
  const defRec = def as unknown as Record<string, unknown>;
  const args = Array.isArray(defRec.arguments_) ? (defRec.arguments_ as string[]) : [];
  const types = Array.isArray(defRec.paramTypes_) ? (defRec.paramTypes_ as string[]) : [];
  block.arguments_ = args;
  block.paramTypes_ = types;
  block.argumentVarModels_ = [];
  args.forEach(function (name, i) {
    const v = block.workspace.getVariableMap().getVariable(name, '') || block.workspace.createVariable(name, '');
    block.argumentVarModels_.push(v);
  });
  block.updateShape_!();
}

function makeCallBlock(hasReturn: boolean): AnyBlock {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CALL: Record<string, any> = {
    init: function (this: AnyBlock) {
      const msg = Blockly.Msg as Record<string, string>;
      const title = hasReturn
        ? (msg.PROCEDURES_CALLRETURN_TITLE || 'call')
        : (msg.PROCEDURES_CALLNORETURN_TITLE || 'call');
      // NAME 用下拉：列出工作区中所有已定义函数，供用户选择调用
      const nameField = new Blockly.FieldDropdown(buildCallOptions(this));
            nameField.setValidator(function (this: Blockly.Field, newName: string) {
        // 选择函数后同步参数
        const block = this.getSourceBlock();
        if (block && newName) {
          syncCallParams(block as AnyBlock, newName);
        }
        return newName;
      });
      this.appendDummyInput('TOPROW')
        .appendField(title)
        .appendField(nameField, 'NAME');
      if (hasReturn) {
        this.setOutput(true);
      } else {
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
      }
      this.setStyle('procedure_blocks');
      this.setColour(290);
      this.setTooltip('Call a typed crypto function.');
      this.setHelpUrl('');
      this.arguments_ = [];
      this.argumentVarModels_ = [];
      this.paramTypes_ = [];
    },
    getProcedureCall: function (this: AnyBlock): string {
      return this.getFieldValue('NAME') as string;
    },
    renameProcedure: function (this: AnyBlock, name: string, args: string[]) {
      this.setFieldValue(name, 'NAME');
      this.arguments_ = args || [];
      this.updateShape_();
    },
    updateShape_: function (this: AnyBlock) {
      for (let i = 0; i < this.arguments_.length; i++) {
        const label = this.arguments_[i] + ': ' + (this.paramTypes_[i] || 'bytes');
        const existing = this.getField('ARGNAME' + i);
        if (existing) {
          Blockly.Events.disable();
          try { existing.setValue(label); } finally { Blockly.Events.enable(); }
        } else {
          this.appendValueInput('ARG' + i)
            .setCheck(null)
            .setAlign(Blockly.inputs.Align.RIGHT)
            .appendField(label, 'ARGNAME' + i);
        }
      }
      for (let i = this.arguments_.length; this.getInput('ARG' + i); i++) {
        this.removeInput('ARG' + i);
      }
      const top = this.getInput('TOPROW');
      if (top) {
        if (this.arguments_.length) {
          if (!this.getField('WITH')) {
            top.appendField((Blockly.Msg as Record<string, string>).PROCEDURES_CALL_BEFORE_PARAMS || 'with', 'WITH');
          }
        } else if (this.getField('WITH')) {
          top.removeField('WITH');
        }
      }
    },
    mutationToDom: function (this: AnyBlock): Element {
      const container = Blockly.utils.xml.createElement('mutation');
      for (let i = 0; i < this.argumentVarModels_.length; i++) {
        const arg = Blockly.utils.xml.createElement('arg');
        const v = this.argumentVarModels_[i];
        arg.setAttribute('name', v.getName());
        arg.setAttribute('varid', v.getId());
        arg.setAttribute('type', this.paramTypes_[i] || 'bytes');
        container.appendChild(arg);
      }
      return container;
    },
    domToMutation: function (this: AnyBlock, xmlElement: Element) {
      this.arguments_ = [];
      this.argumentVarModels_ = [];
      this.paramTypes_ = [];
      const children = Array.from(xmlElement.childNodes);
      for (const child of children) {
        if (child.nodeName.toLowerCase() !== 'arg') continue;
        const argEl = child as Element;
        const name = argEl.getAttribute('name') || '';
        const varId = argEl.getAttribute('varid') || argEl.getAttribute('varId') || '';
        const type = argEl.getAttribute('type') || 'bytes';
        this.arguments_.push(name);
        this.paramTypes_.push(type);
        const v = Blockly.Variables.getOrCreateVariablePackage(this.workspace, varId || null, name, '') as unknown as Blockly.VariableModel | null;
        if (v) this.argumentVarModels_.push(v);
      }
      this.updateShape_();
    },
    saveExtraState: function (this: AnyBlock): Record<string, unknown> | null {
      if (!this.argumentVarModels_.length) return null;
      const state: Record<string, unknown> = {};
      state.params = this.argumentVarModels_.map((v: Blockly.VariableModel, i: number) => ({
        name: v.getName(),
        id: v.getId(),
        type: this.paramTypes_[i] || 'bytes',
      }));
      return state;
    },
    loadExtraState: function (this: AnyBlock, state: Record<string, unknown>) {
      // flyout 传 {name, params}：name 应用到 NAME 字段（函数选择）
      if (typeof state.name === 'string' && state.name) {
        try { this.setFieldValue(state.name, 'NAME'); } catch {}
      }
      const raw = (state.params as Array<{ name: string; id: string; type?: string } | string>) || [];
      this.arguments_ = [];
      this.argumentVarModels_ = [];
      this.paramTypes_ = [];
      for (const item of raw) {
        // flyout 传字符串数组 ['key','msg']；序列化存对象数组 [{name,id,type}]
        const p = typeof item === 'string' ? { name: item, id: '', type: 'bytes' } : item;
        this.arguments_.push(p.name);
        this.paramTypes_.push(p.type || 'bytes');
        const v = (this.workspace.getVariableMap().getVariable(p.name, '') ||
          this.workspace.createVariable(p.name, '', p.id || undefined)) as unknown as Blockly.VariableModel;
        this.argumentVarModels_.push(v);
      }
      this.updateShape_();
    },
    getVars: function (this: AnyBlock): string[] {
      return this.arguments_;
    },
    getVarModels: function (this: AnyBlock): Blockly.VariableModel[] {
      return this.argumentVarModels_;
    },
    renameVarById: function (this: AnyBlock, oldId: string, newId: string) {
      const varmap = this.workspace.getVariableMap();
      const oldVar = varmap.getVariableById(oldId);
      if (!oldVar || oldVar.getType() !== '') return;
      const newVar = varmap.getVariableById(newId);
      if (!newVar) return;
      const idx = this.argumentVarModels_.findIndex((v: Blockly.VariableModel) => v.getId() === oldId);
      if (idx === -1) return;
      this.arguments_[idx] = newVar.getName();
      this.argumentVarModels_[idx] = newVar;
      this.updateShape_();
    },
    updateVarName: function (this: AnyBlock, variable: Blockly.VariableModel) {
      const name = variable.getName();
      let changed = false;
      for (let i = 0; i < this.argumentVarModels_.length; i++) {
        if (this.argumentVarModels_[i].getId() === variable.getId()) {
          this.arguments_[i] = name;
          changed = true;
        }
      }
      if (changed) this.updateShape_();
    },
  };
  return CALL;
}

Blockly.Blocks['procedures_callreturn'] = makeCallBlock(true);
Blockly.Blocks['procedures_callnoreturn'] = makeCallBlock(false);

// ─────────────────────────────────────────────────────────
// Template blocks (single-param inline)
// ─────────────────────────────────────────────────────────

function _makeTemplateBlock(
  presetName: string, paramName: string, paramType: string, label: string,
): void {
  const msg = Blockly.Msg as Record<string, string>;
  Blockly.Blocks[presetName] = {
    init: function () {
      this.appendDummyInput('NAME_INPUT')
        .appendField(label)
        .appendField(new Blockly.FieldTextInput(presetName), 'FUNC_NAME');
      this.appendDummyInput('PARAM_INPUT')
        .appendField(msg.CRYPTO_PROCEDURES_PARAM_MSG || 'param:')
        .appendField(new Blockly.FieldTextInput(paramName), 'PARAM_NAME')
        .appendField(':')
        .appendField(new Blockly.FieldDropdown(CRYPTO_PARAM_TYPES), 'PARAM_TYPE');
      this.appendStatementInput('BODY').setCheck(null).appendField(msg.CRYPTO_ITERATE_DO || 'Do');
      this.appendValueInput('RETURN').setCheck(null).appendField(msg.PROCEDURES_DEFRETURN_RETURN || '\u2699 return');
      this.setInputsInline(false);
      this.setColour(290);
      this.setTooltip(msg.CRYPTO_PROCEDURES_TEMPLATE_TOOLTIP || 'Pre-configured crypto function template.');
      this.setHelpUrl('');
    },
  };
}

_makeTemplateBlock('crypto_encrypt_func', 'message', 'message', Blockly.Msg.CRYPTO_PROCEDURES_ENCRYPT_LABEL || '🔐 encrypt');
_makeTemplateBlock('crypto_decrypt_func', 'ciphertext', 'message', Blockly.Msg.CRYPTO_PROCEDURES_DECRYPT_LABEL || '🔓 decrypt');
_makeTemplateBlock('crypto_hash_func', 'message', 'message', Blockly.Msg.CRYPTO_PROCEDURES_HASH_LABEL || '#️⃣ hash');

const MSG = Blockly.Msg as Record<string, string>;
_makeTemplateBlock('proc_aes_round', 'state', 'int_list', MSG.PROC_AES_ROUND_LABEL || '🔧 AES_Round');
_makeTemplateBlock('proc_aes_last_round', 'state', 'int_list', MSG.PROC_AES_LAST_ROUND_LABEL || '🔧 AES_LastRound');
_makeTemplateBlock('proc_aes_key_schedule', 'key', 'bytes', MSG.PROC_AES_KEY_SCHEDULE_LABEL || '🔧 AES_KeySchedule');
_makeTemplateBlock('proc_sm4_round', 'state', 'int_list', MSG.PROC_SM4_ROUND_LABEL || '🔧 SM4_Round');
_makeTemplateBlock('proc_sm4_key_schedule', 'key', 'bytes', MSG.PROC_SM4_KEY_SCHEDULE_LABEL || '🔧 SM4_KeySchedule');
_makeTemplateBlock('proc_sha256_hash', 'msg', 'message', MSG.PROC_SHA256_HASH_LABEL || '🔧 SHA256_Hash');
_makeTemplateBlock('proc_sm3_hash', 'msg', 'message', MSG.PROC_SM3_HASH_LABEL || '🔧 SM3_Hash');
_makeTemplateBlock('proc_hmac_sha256', 'key', 'bytes', MSG.PROC_HMAC_SHA256_LABEL || '🔧 HMAC_SHA256');
_makeTemplateBlock('proc_sm3_hmac', 'key', 'bytes', MSG.PROC_SM3_HMAC_LABEL || '🔧 HMAC_SM3');
_makeTemplateBlock('proc_pbkdf2', 'password', 'bytes', MSG.PROC_PBKDF2_LABEL || '🔧 PBKDF2');
_makeTemplateBlock('proc_hkdf', 'ikm', 'bytes', MSG.PROC_HKDF_LABEL || '🔧 HKDF');
_makeTemplateBlock('proc_mlkem_keygen', 'seed', 'seed', MSG.PROC_MLKEM_KEYGEN_LABEL || '🔧 ML_KEM_KeyGen');
_makeTemplateBlock('proc_md_iterate', 'iv', 'int_list', MSG.PROC_MD_ITERATE_LABEL || '🔧 MD_Iterate');
_makeTemplateBlock('proc_sponge_duplex', 'state', 'int_list', MSG.PROC_SPONGE_DUPLEX_LABEL || '🔧 Sponge_Duplex');
_makeTemplateBlock('proc_mode_ecb', 'data', 'bytes', MSG.PROC_MODE_ECB_LABEL || '🔧 ECB');
_makeTemplateBlock('proc_mode_cbc', 'data', 'bytes', MSG.PROC_MODE_CBC_LABEL || '🔧 CBC');
_makeTemplateBlock('proc_mode_ctr', 'data', 'bytes', MSG.PROC_MODE_CTR_LABEL || '🔧 CTR');
_makeTemplateBlock('proc_mode_gcm', 'data', 'bytes', MSG.PROC_MODE_GCM_LABEL || '🔧 GCM');
_makeTemplateBlock('proc_ntt_vec', 'vec', 'int_list', MSG.PROC_NTT_VEC_LABEL || '🔧 NTT_Vec');
_makeTemplateBlock('proc_pq_cbd', 'seed', 'seed', MSG.PROC_PQ_CBD_LABEL || '🔧 CBD_NTT_Vec');
_makeTemplateBlock('proc_pq_mat_mul', 'mat', 'int_list', MSG.PROC_PQ_MAT_MUL_LABEL || '🔧 Mat×Vec_NTT');
_makeTemplateBlock('proc_pq_sample', 'seed', 'seed', MSG.PROC_PQ_SAMPLE_LABEL || '🔧 SampleNTT_Mat');
_makeTemplateBlock('proc_pq_vec_add', 'a', 'int_list', MSG.PROC_PQ_VEC_ADD_LABEL || '🔧 Vec_Add');
_makeTemplateBlock('proc_pq_vec_sub', 'a', 'int_list', MSG.PROC_PQ_VEC_SUB_LABEL || '🔧 Vec_Sub');
