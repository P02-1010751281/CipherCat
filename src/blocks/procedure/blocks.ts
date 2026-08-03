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
import { toolboxTemplates } from './toolbox-state';

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

// ─────────────────────────────────────────────────────────
// procedure 块共享逻辑（makeDefBlock / makeCallBlock 去重，audit finding-18）
// 两工厂仅 init / 渲染（updateParams_ vs updateShape_）与 statements 处理不同，
// 参数解析 / 序列化 / 变量联动完全同构 —— 抽为共享 helper + 渲染回调注入。
// ─────────────────────────────────────────────────────────

/** 从 mutation DOM 解析 args → arguments_ / paramTypes_ / argumentVarModels_。 */
function parseArgsFromDom(block: AnyBlock, xmlElement: Element): void {
  block.arguments_ = [];
  block.argumentVarModels_ = [];
  block.paramTypes_ = [];
  const children = Array.from(xmlElement.childNodes);
  for (const child of children) {
    if (child.nodeName.toLowerCase() !== 'arg') continue;
    const argEl = child as Element;
    const name = argEl.getAttribute('name') || '';
    const varId = argEl.getAttribute('varid') || argEl.getAttribute('varId') || '';
    const type = argEl.getAttribute('type') || 'bytes';
    block.arguments_.push(name);
    block.paramTypes_.push(type);
    const v = Blockly.Variables.getOrCreateVariablePackage(block.workspace, varId || null, name, '') as unknown as Blockly.VariableModel | null;
    if (v) block.argumentVarModels_.push(v);
    else console.warn(`Failed to create variable "${name}", ignoring.`);
  }
}

/** 把 args 序列化到 mutation DOM（def 可带 saveId/paramId，call 不带）。 */
function serializeArgsToDom(block: AnyBlock, container: Element, includeParamId = false): void {
  for (let i = 0; i < block.argumentVarModels_.length; i++) {
    const arg = Blockly.utils.xml.createElement('arg');
    const v = block.argumentVarModels_[i];
    arg.setAttribute('name', v.getName());
    arg.setAttribute('varid', v.getId());
    if (includeParamId && block.paramIds_) arg.setAttribute('paramId', block.paramIds_[i]);
    arg.setAttribute('type', block.paramTypes_[i] || 'bytes');
    container.appendChild(arg);
  }
}

/** saveExtraState 的 params 部分（def 额外处理 hasStatements，call 直接返回）。 */
function argsExtraState(block: AnyBlock): Record<string, unknown> | null {
  if (!block.argumentVarModels_.length) return null;
  return {
    params: block.argumentVarModels_.map((v: Blockly.VariableModel, i: number) => ({
      name: v.getName(),
      id: v.getId(),
      type: block.paramTypes_[i] || 'bytes',
    })),
  };
}

/** loadExtraState 的 name + params 部分（flyout 字符串数组 / 序列化对象数组兼容）。 */
function loadArgsExtraState(block: AnyBlock, state: Record<string, unknown>): void {
  // flyout 传 {name, params}：name 应用到 NAME 字段（函数选择）
  if (typeof state.name === 'string' && state.name) {
    try { block.setFieldValue(state.name, 'NAME'); } catch { /* noop */ }
  }
  const raw = (state.params as Array<{ name: string; id: string; type?: string } | string>) || [];
  block.arguments_ = [];
  block.argumentVarModels_ = [];
  block.paramTypes_ = [];
  for (const item of raw) {
    const p = typeof item === 'string' ? { name: item, id: '', type: 'bytes' } : item;
    block.arguments_.push(p.name);
    block.paramTypes_.push(p.type || 'bytes');
    const v = (block.workspace.getVariableMap().getVariable(p.name, '') ||
      block.workspace.createVariable(p.name, '', p.id || undefined)) as unknown as Blockly.VariableModel;
    block.argumentVarModels_.push(v);
  }
}

/** renameVarById 共享逻辑（afterChange 注入 displayRenamedVar_+mutateCallers / updateShape_）。 */
function renameVarByIdCommon(
  block: AnyBlock,
  oldId: string,
  newId: string,
  afterChange: (block: AnyBlock, oldName: string, newName: string) => void,
): void {
  const varmap = block.workspace.getVariableMap();
  const oldVar = varmap.getVariableById(oldId);
  if (!oldVar || oldVar.getType() !== '') return;
  const newVar = varmap.getVariableById(newId);
  if (!newVar) return;
  const idx = block.argumentVarModels_.findIndex((v: Blockly.VariableModel) => v.getId() === oldId);
  if (idx === -1) return;
  const oldName = oldVar.getName();
  const newName = newVar.getName();
  block.arguments_[idx] = newName;
  block.argumentVarModels_[idx] = newVar;
  afterChange(block, oldName, newName);
}

/** updateVarName 共享逻辑（afterChange 注入）。 */
function updateVarNameCommon(
  block: AnyBlock,
  variable: Blockly.VariableModel,
  afterChange: (block: AnyBlock, oldName: string) => void,
): void {
  const name = variable.getName();
  let changed = false;
  let oldName = '';
  for (let i = 0; i < block.argumentVarModels_.length; i++) {
    if (block.argumentVarModels_[i].getId() === variable.getId()) {
      oldName = block.arguments_[i];
      block.arguments_[i] = name;
      changed = true;
    }
  }
  if (changed) afterChange(block, oldName);
}

/** getVars / getVarModels（def/call 完全相同，直接共享）。 */
function procedureGetVars(this: AnyBlock): string[] {
  return this.arguments_;
}

function procedureGetVarModels(this: AnyBlock): Blockly.VariableModel[] {
  return this.argumentVarModels_;
}

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
      serializeArgsToDom(this, container, opt_saveId);
      if (this.hasStatements_ === false) container.setAttribute('statements', 'false');
      return container;
    },
    domToMutation: function (this: AnyBlock, xmlElement: Element) {
      parseArgsFromDom(this, xmlElement);
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
        const v = Blockly.Variables.getOrCreateVariablePackage(this.workspace, block.id, name, '') as unknown as Blockly.VariableModel | null;
        if (v) this.argumentVarModels_.push(v);
        else console.warn(`Failed to create variable "${name}", ignoring.`);
        block = block.getNextBlock();
      }
      this.updateParams_();
      Blockly.Procedures.mutateCallers(this);
    },
    saveExtraState: function (this: AnyBlock): Record<string, unknown> | null {
      if (!this.argumentVarModels_.length && this.hasStatements_ !== false) return null;
      const state: Record<string, unknown> = {};
      const paramsState = argsExtraState(this);
      if (paramsState) state.params = paramsState.params;
      if (this.hasStatements_ === false) state.hasStatements = false;
      return state;
    },
    loadExtraState: function (this: AnyBlock, state: Record<string, unknown>) {
      loadArgsExtraState(this, state);
      this.updateParams_();
      Blockly.Procedures.mutateCallers(this);
      if (state.hasStatements === false) this.setStatements_(false);
    },
    getVars: procedureGetVars,
    getVarModels: procedureGetVarModels,
    renameVarById: function (this: AnyBlock, oldId: string, newId: string) {
      renameVarByIdCommon(this, oldId, newId, (block, oldName, newName) => {
        block.displayRenamedVar_(oldName, newName);
        Blockly.Procedures.mutateCallers(block);
      });
    },
    updateVarName: function (this: AnyBlock, variable: Blockly.VariableModel) {
      updateVarNameCommon(this, variable, (block, oldName) => {
        block.displayRenamedVar_(oldName, variable.getName());
        Blockly.Procedures.mutateCallers(block);
      });
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
    // 生命周期联动：改名（BLOCK_CHANGE field NAME）按旧名匹配 call 块并同步（删除由 call 块侧 onchange 处理——
    // def 的 change listener 在 dispose 时被移除，BLOCK_DELETE 派发时 def 侧已收不到）
    onchange: function (this: AnyBlock, event: Blockly.Events.Abstract) {
      const evt = event as unknown as { blockId?: string; element?: string; name?: string; oldValue?: string; newValue?: string };
      if (evt.blockId !== this.id) return;
      if (event.type !== Blockly.Events.BLOCK_CHANGE) return;
      if (evt.element !== 'field' || evt.name !== 'NAME') return;
      // mutateCallers 按新名匹配会落空（callers 仍为旧名），直接用事件 oldValue 匹配并同步
      const oldName = evt.oldValue;
      const newName = evt.newValue;
      try {
        if (oldName && newName && oldName !== newName) {
          for (const b of this.workspace.getAllBlocks(false)) {
            if ((b.type === 'procedures_callreturn' || b.type === 'procedures_callnoreturn') &&
                (b.getFieldValue('NAME') as string) === oldName) {
              // 刷新下拉选项缓存（getOptions(true) 走缓存，不刷则拒绝新选项）
              const nameField = b.getField('NAME') as unknown as { getOptions?: (u: boolean) => unknown };
              if (nameField && typeof nameField.getOptions === 'function') {
                nameField.getOptions(false);
              }
              b.setFieldValue(newName, 'NAME');
            }
          }
        }
        // 参数同步（改名后 callers 已更新，mutateCallers 可匹配）
        Blockly.Procedures.mutateCallers(this);
      } catch (e) { console.warn('[procedure] rename propagation failed:', e); }
    },
  };

  DEF.callType_ = hasReturn ? 'procedures_callreturn' : 'procedures_callnoreturn';
  return DEF;
}

Blockly.Blocks['procedures_defreturn'] = makeDefBlock(true);
Blockly.Blocks['procedures_defnoreturn'] = makeDefBlock(false);

// ─────────────────────────────────────────────────────────
// procedures_defreturn / procedures_defnoreturn
// 完整独立实现，通过 mutateCallers 与 def 同步
// ─────────────────────────────────────────────────────────

/** 函数名/参数名标识符校验（拒绝非法字符输入）。 */
const identifierValidator = (value: string): string | null =>
  /^[A-Za-z_][A-Za-z0-9_]*$/.test(value) ? value : null;


/** 构建 call 块 NAME 下拉选项：工作区函数 + 拖出的模板 + Manager 添加到 toolbox 的模板。 */
/** 下拉选项缓存：按块缓存 + 模板集合 key；工作区函数变化时由 call 块 onchange 失效（防每次点开下拉全量扫描） */
const callOptionsCache = new WeakMap<
  AnyBlock,
  { key: string; options: Array<[string, string]> }
>();

function invalidateCallOptions(block: AnyBlock): void {
  callOptionsCache.delete(block);
}

function buildCallOptions(block: AnyBlock): Array<[string, string]> {
  try {
    // Manager 模板集合变化用廉价 key 表达（join 28 个名字 vs 全量扫描）
    const tplKey = toolboxTemplates.value.join(',');
    const cached = callOptionsCache.get(block);
    if (cached && cached.key === tplKey) return cached.options;

    const ws = (block.workspace as unknown as { targetWorkspace?: Blockly.Workspace }).targetWorkspace || block.workspace;
    const tuples = Blockly.Procedures.allProcedures(ws);
    const names = tuples[0].concat(tuples[1]).map((t) => t[0]);
    // 工作区中拖出的模板（有 FUNC_NAME 字段的模板块）
    const wsTemplateNames = ws.getAllBlocks(false)
      .filter(function (b: Blockly.Block) { return b.getField('FUNC_NAME') !== null && b.type !== 'procedures_defreturn' && b.type !== 'procedures_defnoreturn'; })
      .map(function (b: Blockly.Block) { return (b.getFieldValue('FUNC_NAME') as string) || b.type; });
    // Manager 添加到 toolbox 的模板
    const toolboxNames = toolboxTemplates.value;
    const all = Array.from(new Set(names.concat(wsTemplateNames, toolboxNames)));
    const options: Array<[string, string]> = !all.length
      ? [[Blockly.Msg.PROCEDURES_UNNAMED || 'unnamed', '']]
      : all.map((n): [string, string] => [n, n]);
    callOptionsCache.set(block, { key: tplKey, options });
    return options;
  } catch {
    return [[Blockly.Msg.PROCEDURES_UNNAMED || 'unnamed', '']];
  }
}

/** call 块选择函数后同步参数行（支持工作区自定义函数 + 模板）。 */
function syncCallParams(block: AnyBlock, funcName: string) {
  const ws = (block.workspace as unknown as { targetWorkspace?: Blockly.Workspace }).targetWorkspace || block.workspace;
  const def = Blockly.Procedures.getDefinition(funcName, ws);
  let args: string[] = [];
  let types: string[] = [];
  if (def) {
    const defRec = def as unknown as Record<string, unknown>;
    args = Array.isArray(defRec.arguments_) ? (defRec.arguments_ as string[]) : [];
    types = Array.isArray(defRec.paramTypes_) ? (defRec.paramTypes_ as string[]) : [];
  } else {
    // 模板函数：优先按工作区中模板块的实际字段（支持 FUNC_NAME 改名后按新名查找），再查注册表
    const wsTemplate = ws.getAllBlocks(false).find(function (b: Blockly.Block) {
      return b.getField('FUNC_NAME') !== null && (b.getFieldValue('FUNC_NAME') as string) === funcName;
    });
    if (wsTemplate) {
      args = [(wsTemplate.getFieldValue('PARAM_NAME') as string) || 'param'];
      types = [(wsTemplate.getFieldValue('PARAM_TYPE') as string) || 'bytes'];
    } else {
      const tpl = Object.values(TEMPLATE_REGISTRY).find(function (t) { return t.name === funcName; });
      if (tpl) {
        args = [tpl.paramName];
        types = [tpl.paramType];
      }
    }
  }
  block.arguments_ = args;
  block.paramTypes_ = types;
  block.argumentVarModels_ = [];
  args.forEach(function (name) {
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
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const block: AnyBlock = this;
      const title = hasReturn
        ? (msg.PROCEDURES_CALLRETURN_TITLE || 'call')
        : (msg.PROCEDURES_CALLNORETURN_TITLE || 'call');
      // NAME 用下拉：列出工作区中所有已定义函数，供用户选择调用（惰性生成，打开菜单时刷新选项）
      const nameField = new Blockly.FieldDropdown(() => buildCallOptions(block));
      nameField.setValidator(function (this: Blockly.Field, newName: string) {
        // 选择函数后同步参数
        const src = this.getSourceBlock();
        if (src && newName) {
          syncCallParams(src as AnyBlock, newName);
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
    // 删除联动：所引用函数被删除后自清为 unnamed（def 的 change listener 在 dispose 时被移除，
    // BLOCK_DELETE 派发时只能由 call 块侧兜底；事件异步派发，此时 def 已从工作区移除）
    onchange: function (this: AnyBlock, event: Blockly.Events.Abstract) {
      // 下拉选项缓存失效：函数定义/模板的新建、删除、改名都可能改变可选函数集合
      const evt0 = event as unknown as { element?: string; name?: string; blockId?: string };
      if (event.type === Blockly.Events.BLOCK_CREATE || event.type === Blockly.Events.BLOCK_DELETE) {
        invalidateCallOptions(this);
      } else if (
        event.type === Blockly.Events.BLOCK_CHANGE &&
        evt0.element === 'field'
      ) {
        const src = evt0.blockId
          ? this.workspace.getBlockById(evt0.blockId)
          : null;
        if (
          src &&
          (src.type === 'procedures_defreturn' ||
            src.type === 'procedures_defnoreturn' ||
            src.getField('FUNC_NAME') !== null)
        ) {
          invalidateCallOptions(this);
        }
      }
      if (event.type !== Blockly.Events.BLOCK_DELETE) return;
      try {
        // 性能门：仅当被删块是函数定义/模板时才扫描（普通块删除零开销，免 K×M×N 全工作区遍历）
        const delEvt = event as unknown as {
          blockId?: string;
          oldJson?: { type?: string };
        };
        if (delEvt.blockId === this.id) return;
        const deletedType = delEvt.oldJson?.type;
        if (
          deletedType !== 'procedures_defreturn' &&
          deletedType !== 'procedures_defnoreturn' &&
          !(deletedType && deletedType in TEMPLATE_PREFILL)
        ) {
          return;
        }
        const name = this.getFieldValue('NAME') as string;
        if (!name) return;
        const ws = (this.workspace as unknown as { targetWorkspace?: Blockly.Workspace }).targetWorkspace || this.workspace;
        const tuples = Blockly.Procedures.allProcedures(ws);
        const defNames = tuples[0].concat(tuples[1]).map((t) => t[0]);
        const wsTemplateNames = ws.getAllBlocks(false)
          .filter((b: Blockly.Block) => b.getField('FUNC_NAME') !== null)
          .map((b: Blockly.Block) => (b.getFieldValue('FUNC_NAME') as string) || b.type);
        const stillValid = defNames.includes(name) || wsTemplateNames.includes(name) || toolboxTemplates.value.includes(name);
        if (!stillValid) {
          const nameField = this.getField('NAME') as unknown as {
            doValueUpdate_?: (v: string) => void; getOptions?: (u: boolean) => Array<[string, string]>;
            selectedOption?: [string, string] | null; markDirty?: () => void; getSourceBlock?: () => Blockly.Block;
          };
          if (nameField && typeof nameField.doValueUpdate_ === 'function' && typeof nameField.getOptions === 'function') {
            // 刷新选项缓存后置值（doValueUpdate_ 内部 getOptions(true) 同步 selectedOption）
            nameField.getOptions(false);
            nameField.doValueUpdate_('');
            // '' 可能不在选项列表（其他函数存在时）——显式对齐 selectedOption 并重渲染，避免 UI 残留旧函数名
            const refreshed = nameField.getOptions(false);
            const unnamed = refreshed.find((o) => o[1] === '');
            nameField.selectedOption = unnamed || null;
            if (typeof nameField.markDirty === 'function') nameField.markDirty();
            const srcBlock = typeof nameField.getSourceBlock === 'function' ? nameField.getSourceBlock() : null;
            if (srcBlock && typeof (srcBlock as unknown as { queueRender?: () => void }).queueRender === 'function') {
              (srcBlock as unknown as { queueRender: () => void }).queueRender();
            }
          }
        }
      } catch (e) { console.warn('[procedure] call orphan cleanup failed:', e); }
    },
    mutationToDom: function (this: AnyBlock): Element {
      const container = Blockly.utils.xml.createElement('mutation');
      serializeArgsToDom(this, container);
      return container;
    },
    domToMutation: function (this: AnyBlock, xmlElement: Element) {
      // 改名传播：mutation 携带 name 时同步 NAME 字段（def 改名经 mutateCallers 到达）
      const mutatedName = xmlElement.getAttribute('name');
      if (mutatedName) {
        // 刷新下拉选项缓存（getOptions(true) 走缓存，不刷则拒绝新选项）
        const nameField = this.getField('NAME');
        if (nameField && typeof (nameField as unknown as { getOptions: (u: boolean) => unknown }).getOptions === 'function') {
          (nameField as unknown as { getOptions: (u: boolean) => unknown }).getOptions(false);
        }
        try { this.setFieldValue(mutatedName, 'NAME'); } catch (e) { console.warn('[procedure] call name sync failed:', e); }
      }
      parseArgsFromDom(this, xmlElement);
      this.updateShape_();
    },
    saveExtraState: function (this: AnyBlock): Record<string, unknown> | null {
      return argsExtraState(this);
    },
    loadExtraState: function (this: AnyBlock, state: Record<string, unknown>) {
      loadArgsExtraState(this, state);
      this.updateShape_();
    },
    getVars: procedureGetVars,
    getVarModels: procedureGetVarModels,
    renameVarById: function (this: AnyBlock, oldId: string, newId: string) {
      renameVarByIdCommon(this, oldId, newId, (block) => {
        block.updateShape_();
      });
    },
    updateVarName: function (this: AnyBlock, variable: Blockly.VariableModel) {
      updateVarNameCommon(this, variable, (block) => {
        block.updateShape_();
      });
    },
  };
  return CALL;
}

Blockly.Blocks['procedures_callreturn'] = makeCallBlock(true);
Blockly.Blocks['procedures_callnoreturn'] = makeCallBlock(false);

// ─────────────────────────────────────────────────────────
// Template blocks (single-param inline)
// ─────────────────────────────────────────────────────────

interface TemplatePrefill {
  /** RETURN 表达式链：从叶子到根的块类型序列（最后一个是根）。 */
  returnChain?: string[];
  /** 链中 variables_get 引用的参数变量名。 */
  paramVarName?: string;
  /** 链块字段覆盖：blockType → { fieldName: 值 }（如 hash_hmac → { HASH: 'SM3' }）。 */
  chainFields?: Record<string, Record<string, string>>;
  /** BODY statement 预填的块 state（如 ctrl_iterate 循环）。 */
  bodyState?: Blockly.serialization.blocks.State;
}

/** 各模板的预填内容定义。 */
const TEMPLATE_PREFILL: Record<string, TemplatePrefill> = {
  // AES 轮：AddRoundKey(MixColumns(ShiftRows(SubBytes(state))), rk) — rk 输入留空待用户接
  proc_aes_round: {
    returnChain: ['variables_get', 'aes_sub_bytes', 'aes_shift_rows', 'aes_mix_columns', 'aes_add_round_key'],
    paramVarName: 'state',
  },
  // AES 最后一轮：AddRoundKey(ShiftRows(SubBytes(state)), rk) — rk 输入留空
  proc_aes_last_round: {
    returnChain: ['variables_get', 'aes_sub_bytes', 'aes_shift_rows', 'aes_add_round_key'],
    paramVarName: 'state',
  },
  // SHA-256：pad(msg) → compress — W/V 输入留空
  proc_sha256_hash: {
    returnChain: ['variables_get', 'hash_sha256_pad'],
    paramVarName: 'msg',
  },
  // SM3：pad(msg) → compress — W/WP/V 输入留空
  proc_sm3_hash: {
    returnChain: ['variables_get', 'hash_sm3_pad'],
    paramVarName: 'msg',
  },
  // NTT：NTT(vec)
  proc_ntt_vec: {
    returnChain: ['variables_get', 'pq_ntt'],
    paramVarName: 'vec',
  },
  // CBD 采样：SamplePolyCBD(seed) — η/q 下拉预设
  proc_pq_cbd: {
    returnChain: ['variables_get', 'pq_sample_poly_cbd'],
    paramVarName: 'seed',
  },
  // NTT 采样：SampleNTT(seed)
  proc_pq_sample: {
    returnChain: ['variables_get', 'pq_sample_ntt'],
    paramVarName: 'seed',
  },
  // 向量加法：PolyAdd(a, b) — b 输入留空
  proc_pq_vec_add: {
    returnChain: ['variables_get', 'pq_poly_add'],
    paramVarName: 'a',
  },
  // 向量减法：PolySub(a, b) — b 输入留空
  proc_pq_vec_sub: {
    returnChain: ['variables_get', 'pq_poly_sub'],
    paramVarName: 'a',
  },
  // 矩阵×向量：MatVecMul(mat, v) — v 输入留空
  proc_pq_mat_mul: {
    returnChain: ['variables_get', 'pq_mat_vec_mul'],
    paramVarName: 'mat',
  },
  // ECB：ECB-Encrypt(data, key) — key 输入留空
  proc_mode_ecb: {
    returnChain: ['variables_get', 'mode_ecb_encrypt'],
    paramVarName: 'data',
  },
  // CBC：CBC-Encrypt(data, key, iv) — key/iv 输入留空
  proc_mode_cbc: {
    returnChain: ['variables_get', 'mode_cbc_encrypt'],
    paramVarName: 'data',
  },
  // CTR：CTR-Encrypt(data, key, nonce) — key/nonce 输入留空
  proc_mode_ctr: {
    returnChain: ['variables_get', 'mode_ctr_encrypt'],
    paramVarName: 'data',
  },
  // GCM：CTR-Encrypt(data, key, iv) 骨架 — GHASH 组合留待用户
  proc_mode_gcm: {
    returnChain: ['variables_get', 'mode_ctr_encrypt'],
    paramVarName: 'data',
  },
  // PBKDF2：迭代 HMAC 骨架（password 参数）
  proc_pbkdf2: {
    bodyState: iterateState(1000),
    returnChain: ['variables_get'],
    paramVarName: 'password',
  },
  // HKDF：提取-扩展骨架
  proc_hkdf: {
    bodyState: iterateState(2),
    returnChain: ['variables_get'],
    paramVarName: 'ikm',
  },
  // 通用哈希函数：SHA-256 pad 链
  crypto_hash_func: {
    returnChain: ['variables_get', 'hash_sha256_pad'],
    paramVarName: 'message',
  },
  // 通用加密函数：ECB 链（key 输入留空）
  crypto_encrypt_func: {
    returnChain: ['variables_get', 'mode_ecb_encrypt'],
    paramVarName: 'message',
  },
  // 通用解密函数：ECB 解密链（key 输入留空）
  crypto_decrypt_func: {
    returnChain: ['variables_get', 'mode_ecb_decrypt'],
    paramVarName: 'ciphertext',
  },
  // 海绵海绵挤压：squeeze(state) — outlen 留空
  proc_sponge_duplex: {
    returnChain: ['variables_get', 'sponge_squeeze'],
    paramVarName: 'state',
  },
  // SM4 轮：F(state, x1, x2, x3, rk) — 仅 X0 连 state，其余留空
  proc_sm4_round: {
    returnChain: ['variables_get', 'sm4_round_func'],
    paramVarName: 'state',
  },
  // HMAC-SHA256：HMAC(key, msg) — key 连参数，msg 留空
  proc_hmac_sha256: {
    returnChain: ['variables_get', 'hash_hmac'],
    paramVarName: 'key',
  },
  // HMAC-SM3：HMAC(key, msg) — key 连参数，msg 留空，HASH 强制 SM3
  proc_sm3_hmac: {
    returnChain: ['variables_get', 'hash_hmac'],
    paramVarName: 'key',
    chainFields: { hash_hmac: { HASH: 'SM3' } },
  },
  // ML-KEM KeyGen：NTT(CBD(seed))
  proc_mlkem_keygen: {
    returnChain: ['variables_get', 'pq_sample_poly_cbd', 'pq_ntt'],
    paramVarName: 'seed',
  },
  // ZUC 密钥流：Keystream(key, iv, len) — key 连参数，iv/len 留空
  proc_zuc_keystream: {
    returnChain: ['variables_get', 'zuc_keystream'],
    paramVarName: 'key',
  },
  // AES 密钥扩展：10 轮迭代循环骨架
  proc_aes_key_schedule: {
    bodyState: iterateState(10),
    returnChain: ['variables_get'],
    paramVarName: 'key',
  },
  // SM4 密钥扩展：32 轮迭代循环骨架
  proc_sm4_key_schedule: {
    bodyState: iterateState(32),
    returnChain: ['variables_get'],
    paramVarName: 'key',
  },
  // 消息摘要迭代：16 轮迭代循环骨架
  proc_md_iterate: {
    bodyState: iterateState(16),
    returnChain: ['variables_get'],
    paramVarName: 'iv',
  },
};

/** 构建 RETURN 表达式链：chain 从叶子到根（如 [variables_get, aes_sub_bytes, ...]），
 *  每个新块把前一块（子）连到自己的第一个 VALUE input。返回根块。 */
function buildReturnChain(
  ws: Blockly.Workspace,
  chain: string[],
  varName: string,
  chainFields?: Record<string, Record<string, string>>,
): Blockly.BlockSvg | null {
  let root: Blockly.BlockSvg | null = null;
  let child: Blockly.BlockSvg | null = null;
  // 确保变量存在（FieldVariable 用 id 引用）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let varModel: any = ws.getVariableMap().getVariable(varName, '');
  if (!varModel) varModel = ws.createVariable(varName, '');
  for (const type of chain) {
    const b = ws.newBlock(type) as Blockly.BlockSvg;
    if (type === 'variables_get' && varModel) {
      b.setFieldValue(varModel.getId(), 'VAR');
    }
    // 链块字段覆盖（如 hash_hmac 的 HASH 下拉）
    const fields = chainFields && chainFields[type];
    if (fields) {
      for (const [fieldName, fieldValue] of Object.entries(fields)) {
        if (b.getField(fieldName)) b.setFieldValue(fieldValue, fieldName);
      }
    }
    b.initSvg();
    if (child && child.outputConnection) {
      const valInput = b.inputList.find((i) => i.type === Blockly.inputs.inputTypes.VALUE);
      if (valInput && valInput.connection) {
        valInput.connection.connect(child.outputConnection);
      }
    }
    child = b;
    root = b;
  }
  if (root) {
    root.render();
  }
  return root;
}

/** 向模板块注入预填内容（RETURN 表达式链 / BODY 语句）。 */
function injectPrefill(block: AnyBlock, prefill: TemplatePrefill | undefined, paramName: string) {
  if (!prefill) return;
  const ws = block.workspace;
  // 确保参数变量存在
  if (prefill.paramVarName && !ws.getVariableMap().getVariable(prefill.paramVarName, '')) {
    ws.createVariable(prefill.paramVarName, '');
  }
  if (prefill.returnChain) {
    try {
      const valueBlock = buildReturnChain(ws, prefill.returnChain, prefill.paramVarName || paramName, prefill.chainFields);
      if (valueBlock) {
        const retInput = block.getInput('RETURN');
        if (retInput && valueBlock.outputConnection) {
          retInput.connection.connect(valueBlock.outputConnection);
        }
      }
    } catch (e) {
      console.warn('[prefill] ' + block.type + ' inject failed:', e);
    }
  }
  if (prefill.bodyState) {
    try {
      const state = JSON.parse(JSON.stringify(prefill.bodyState));
      const bodyBlock = Blockly.serialization.blocks.append(
        state as Blockly.serialization.blocks.State,
        ws,
      ) as unknown as Blockly.BlockSvg | null;
      if (bodyBlock) {
        bodyBlock.initSvg();
        bodyBlock.render();
        const bodyInput = block.getInput('BODY');
        if (bodyInput && bodyBlock.previousConnection) {
          bodyInput.connection.connect(bodyBlock.previousConnection);
        }
      }
    } catch (e) {
      console.warn('[prefill] ' + block.type + ' body inject failed:', e);
    }
  }
}

/** 构建 ctrl_iterate 循环块 state（BODY 预填用）。 */
function iterateState(times: number, varName = 'i', bodyBlocks?: Blockly.serialization.blocks.State[]): Blockly.serialization.blocks.State {
  const state: Record<string, unknown> = {
    type: 'ctrl_iterate',
    fields: { VAR: varName, TIMES: String(times) },
    inputs: {},
  };
  if (bodyBlocks && bodyBlocks.length) {
    (state.inputs as Record<string, unknown>).DO = { block: bodyBlocks[0] };
    for (let i = 0; i < bodyBlocks.length - 1; i++) {
      const b = bodyBlocks[i];
      const next = bodyBlocks[i + 1];
      const rec = b as unknown as { next?: { block: Blockly.serialization.blocks.State } };
      rec.next = { block: next };
    }
  }
  return state as unknown as Blockly.serialization.blocks.State;
}

/** 模板注册表：type → 默认函数名 + 参数信息（供 call 块下拉和参数同步用）。
 * 同时是模板清单的唯一事实源（生成器/面板从此派生）。 */
export interface TemplateInfo { name: string; paramName: string; paramType: string; category: string }
export const TEMPLATE_REGISTRY: Record<string, TemplateInfo> = {};

function _makeTemplateBlock(
  presetName: string, paramName: string, paramType: string, label: string,
  category: string,
): void {
  TEMPLATE_REGISTRY[presetName] = { name: presetName, paramName, paramType, category };
  const msg = Blockly.Msg as Record<string, string>;
  Blockly.Blocks[presetName] = {
    init: function () {
      const funcNameField = new Blockly.FieldTextInput(presetName);
      funcNameField.setValidator(identifierValidator);
      funcNameField.setSpellcheck(false);
      const paramNameField = new Blockly.FieldTextInput(paramName);
      paramNameField.setValidator(identifierValidator);
      paramNameField.setSpellcheck(false);
      this.appendDummyInput('NAME_INPUT')
        .appendField(label)
        .appendField(funcNameField, 'FUNC_NAME');
      this.appendDummyInput('PARAM_INPUT')
        .appendField(msg.CRYPTO_PROCEDURES_PARAM_MSG || 'param:')
        .appendField(paramNameField, 'PARAM_NAME')
        .appendField(':')
        .appendField(new Blockly.FieldDropdown(CRYPTO_PARAM_TYPES), 'PARAM_TYPE');
      this.appendStatementInput('BODY').setCheck(null).appendField(msg.CRYPTO_ITERATE_DO || 'Do');
      this.appendValueInput('RETURN').setCheck(null).appendField(msg.PROCEDURES_DEFRETURN_RETURN || '\u2699 return');
      this.setInputsInline(false);
      this.setColour(290);
      this.setTooltip(msg.CRYPTO_PROCEDURES_TEMPLATE_TOOLTIP || 'Pre-configured crypto function template.');
      this.setHelpUrl('');
    },
    onchange: function (event: Blockly.Events.Abstract) {
      // 改名联动：模板 FUNC_NAME 变更 → 同步引用 call 块（与 def 改名同路径）。
      // 模板参数在注册表存默认名，改名后按新名查不到，必须按模板块实际 PARAM_NAME/PARAM_TYPE 重建。
      const evt = event as unknown as {
        blockId?: string; element?: string; name?: string; oldValue?: string; newValue?: string;
      };
      if (
        evt.blockId === this.id &&
        event.type === Blockly.Events.BLOCK_CHANGE &&
        evt.element === 'field' &&
        evt.name === 'FUNC_NAME' &&
        evt.oldValue && evt.newValue && evt.oldValue !== evt.newValue
      ) {
        try {
          for (const b of (this as unknown as Blockly.Block).workspace.getAllBlocks(false)) {
            if ((b.type === 'procedures_callreturn' || b.type === 'procedures_callnoreturn') &&
                (b.getFieldValue('NAME') as string) === evt.oldValue) {
              // 刷新下拉选项缓存（getOptions(true) 走缓存，不刷则拒绝新选项）
              const nameField = b.getField('NAME') as unknown as { getOptions?: (u: boolean) => unknown };
              if (nameField && typeof nameField.getOptions === 'function') nameField.getOptions(false);
              b.setFieldValue(evt.newValue, 'NAME');
              syncCallParams(b as AnyBlock, evt.newValue);
            }
          }
        } catch (e) { console.warn('[procedure] template rename propagation failed:', e); }
        return;
      }
      // 拖出到主 workspace 后注入预填内容（flyout 预览不展开，保持紧凑）
      const self = this as unknown as { __prefilled?: boolean; isInFlyout?: boolean };
      if (self.isInFlyout) return;
      if (self.__prefilled) return;
      // 防御：RETURN 或 BODY 已有内容视为已注入（兼容旧损坏工作区，防止二次注入）
      const retInput = (this as unknown as Blockly.Block).getInput('RETURN');
      const bodyInput = (this as unknown as Blockly.Block).getInput('BODY');
      if (
        (retInput && retInput.connection && retInput.connection.targetBlock()) ||
        (bodyInput && bodyInput.connection && bodyInput.connection.targetBlock())
      ) {
        self.__prefilled = true;
        return;
      }
      self.__prefilled = true;
      injectPrefill(this as unknown as AnyBlock, TEMPLATE_PREFILL[presetName], paramName);
    },
    // 预填标记随序列化持久化：保存→重载后 onchange 不再重复注入
    saveExtraState: function (this: Blockly.Block) {
      const self = this as unknown as { __prefilled?: boolean };
      return self.__prefilled ? { prefilled: true } : null;
    },
    loadExtraState: function (this: Blockly.Block, state: Record<string, unknown>) {
      const self = this as unknown as { __prefilled?: boolean };
      if (state && state.prefilled) self.__prefilled = true;
    },
  };
}

_makeTemplateBlock('crypto_encrypt_func', 'message', 'message', Blockly.Msg.CRYPTO_PROCEDURES_ENCRYPT_LABEL || '🔐 encrypt', 'base');
_makeTemplateBlock('crypto_decrypt_func', 'ciphertext', 'message', Blockly.Msg.CRYPTO_PROCEDURES_DECRYPT_LABEL || '🔓 decrypt', 'base');
_makeTemplateBlock('crypto_hash_func', 'message', 'message', Blockly.Msg.CRYPTO_PROCEDURES_HASH_LABEL || '#️⃣ hash', 'base');

const MSG = Blockly.Msg as Record<string, string>;
_makeTemplateBlock('proc_aes_round', 'state', 'int_list', MSG.PROC_AES_ROUND_LABEL || '🔧 AES_Round', 'symmetric');
_makeTemplateBlock('proc_aes_last_round', 'state', 'int_list', MSG.PROC_AES_LAST_ROUND_LABEL || '🔧 AES_LastRound', 'symmetric');
_makeTemplateBlock('proc_aes_key_schedule', 'key', 'bytes', MSG.PROC_AES_KEY_SCHEDULE_LABEL || '🔧 AES_KeySchedule', 'symmetric');
_makeTemplateBlock('proc_sm4_round', 'state', 'int_list', MSG.PROC_SM4_ROUND_LABEL || '🔧 SM4_Round', 'symmetric');
_makeTemplateBlock('proc_sm4_key_schedule', 'key', 'bytes', MSG.PROC_SM4_KEY_SCHEDULE_LABEL || '🔧 SM4_KeySchedule', 'symmetric');
_makeTemplateBlock('proc_sha256_hash', 'msg', 'message', MSG.PROC_SHA256_HASH_LABEL || '🔧 SHA256_Hash', 'hash');
_makeTemplateBlock('proc_sm3_hash', 'msg', 'message', MSG.PROC_SM3_HASH_LABEL || '🔧 SM3_Hash', 'hash');
_makeTemplateBlock('proc_hmac_sha256', 'key', 'bytes', MSG.PROC_HMAC_SHA256_LABEL || '🔧 HMAC_SHA256', 'hash');
_makeTemplateBlock('proc_sm3_hmac', 'key', 'bytes', MSG.PROC_SM3_HMAC_LABEL || '🔧 HMAC_SM3', 'hash');
_makeTemplateBlock('proc_pbkdf2', 'password', 'bytes', MSG.PROC_PBKDF2_LABEL || '🔧 PBKDF2', 'hash');
_makeTemplateBlock('proc_hkdf', 'ikm', 'bytes', MSG.PROC_HKDF_LABEL || '🔧 HKDF', 'hash');
_makeTemplateBlock('proc_md_iterate', 'iv', 'int_list', MSG.PROC_MD_ITERATE_LABEL || '🔧 MD_Iterate', 'pqc');
_makeTemplateBlock('proc_sponge_duplex', 'state', 'int_list', MSG.PROC_SPONGE_DUPLEX_LABEL || '🔧 Sponge_Duplex', 'pqc');
_makeTemplateBlock('proc_mlkem_keygen', 'seed', 'seed', MSG.PROC_MLKEM_KEYGEN_LABEL || '🔧 ML_KEM_KeyGen', 'pqc');
_makeTemplateBlock('proc_zuc_keystream', 'key', 'bytes', MSG.PROC_ZUC_KEYSTREAM_LABEL || '🔧 ZUC_Keystream', 'pqc');
_makeTemplateBlock('proc_mode_ecb', 'data', 'bytes', MSG.PROC_MODE_ECB_LABEL || '🔧 ECB', 'mode');
_makeTemplateBlock('proc_mode_cbc', 'data', 'bytes', MSG.PROC_MODE_CBC_LABEL || '🔧 CBC', 'mode');
_makeTemplateBlock('proc_mode_ctr', 'data', 'bytes', MSG.PROC_MODE_CTR_LABEL || '🔧 CTR', 'mode');
_makeTemplateBlock('proc_mode_gcm', 'data', 'bytes', MSG.PROC_MODE_GCM_LABEL || '🔧 GCM', 'mode');
_makeTemplateBlock('proc_ntt_vec', 'vec', 'int_list', MSG.PROC_NTT_VEC_LABEL || '🔧 NTT_Vec', 'pqc');
_makeTemplateBlock('proc_pq_cbd', 'seed', 'seed', MSG.PROC_PQ_CBD_LABEL || '🔧 CBD_NTT_Vec', 'pqc');
_makeTemplateBlock('proc_pq_mat_mul', 'mat', 'int_list', MSG.PROC_PQ_MAT_MUL_LABEL || '🔧 Mat×Vec_NTT', 'pqc');
_makeTemplateBlock('proc_pq_sample', 'seed', 'seed', MSG.PROC_PQ_SAMPLE_LABEL || '🔧 SampleNTT_Mat', 'pqc');
_makeTemplateBlock('proc_pq_vec_add', 'a', 'int_list', MSG.PROC_PQ_VEC_ADD_LABEL || '🔧 Vec_Add', 'pqc');
_makeTemplateBlock('proc_pq_vec_sub', 'a', 'int_list', MSG.PROC_PQ_VEC_SUB_LABEL || '🔧 Vec_Sub', 'pqc');

/** 模板类型清单（单一数据源，派生自注册表；生成器/面板从此导入）。 */
export const TEMPLATE_TYPES: readonly string[] = Object.keys(TEMPLATE_REGISTRY);
