import './ctrl';
import './data';
import './array';
import './bit';
import './logic';
import './sbox';
import './hash';
import './numtheory';
import './ecc';
import './postquantum';

import { Block } from 'blockly/core';
import { pythonGenerator, Order } from 'blockly/python';
import { getMigrationMap } from '@/utils/migration';

pythonGenerator.forBlock['data_value'] = function (
  block: Block,
): [string, Order] {
  const raw = block.getFieldValue('NUM');
  const value = parseFloat(raw);
  if (!isNaN(value) && String(value) === raw.trim()) {
    const order = value < 0 ? Order.UNARY_SIGN : Order.ATOMIC;
    return [value.toString(), order];
  }
  return [raw, Order.ATOMIC];
};

// Seed 值块生成器
pythonGenerator.forBlock['seed_bytes'] = function (
  _block: Block,
): [string, Order] {
  void _block;
  return ['data', Order.ATOMIC];
};

pythonGenerator.forBlock['seed_hex'] = function (
  _block: Block,
): [string, Order] {
  void _block;
  return ['data.hex()', Order.ATOMIC];
};

pythonGenerator.forBlock['cipher_key_from_seed'] = function (
  _block: Block,
): [string, Order] {
  void _block;
  return [
    '[int.from_bytes(data[0:4].ljust(4,b"\\x00"),"big"), int.from_bytes(data[4:8].ljust(4,b"\\x00"),"big"), int.from_bytes(data[8:12].ljust(4,b"\\x00"),"big"), int.from_bytes(data[12:16].ljust(4,b"\\x00"),"big")]',
    Order.ATOMIC,
  ];
};

const migrationMap = getMigrationMap();
for (const [oldName, newName] of Object.entries(migrationMap)) {
  if (pythonGenerator.forBlock[newName] && !pythonGenerator.forBlock[oldName]) {
    pythonGenerator.forBlock[oldName] = pythonGenerator.forBlock[newName];
  }
}

function configureTextPrintBlock() {
  if (pythonGenerator) {
    pythonGenerator.forBlock['text_print'] = function (block: Block): string {
      const msg =
        pythonGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
      return 'print(' + msg + ')\n';
    };
    return true;
  } else {
    console.warn('Python生成器不可用，无法配置text_print块');
    return false;
  }
}

configureTextPrintBlock();

const _origFinish = pythonGenerator.finish;
pythonGenerator.finish = function (code: string) {
  const lines = (code || '').split('\n');
  const filtered: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*print\(/.test(lines[i].trim())) {
      const prev = i > 0 ? lines[i - 1] : '';
      const prevTrimmed = prev.trimEnd();
      if (prevTrimmed.endsWith(':')) {
        filtered.push(lines[i].replace(/\S.*/, 'pass'));
      }
      continue;
    }
    filtered.push(lines[i]);
  }
  const cleaned = filtered.join('\n');
  return _origFinish ? _origFinish.call(this, cleaned) : cleaned;
};

export { configureTextPrintBlock };
export function injectPrimitives(pyCode: string, algorithmType: string) {
  const code = String(pyCode || '');
  if (!code.trim()) return code;

  if (/(^|\n)\s*def\s+primitive\s*\(/.test(code)) return code;

  const lines = code.split('\n');
  const head: string[] = [];
  const body: string[] = [];

  // 全局变量声明列表。
  // 注意：多线程执行时，全局变量存在数据竞争风险。
  // W（消息扩展数组）被移除出 globalNames，使其成为 algo 的局部变量，
  // 确保多线程调用时每个线程有独立的 W，避免 int+None 错误。
  const globalNames = new Set([
    'data',
    'padded',
    'n',
    'B',
    'W_prime',
    'CVs',
    'blk_idx',
    'sched_idx',
    'x',
  ]);

  let inDef = false;
  let defIndent = 0;

  for (const line of lines) {
    const t = line.trim();
    const indent = line.match(/^\s*/)?.[0].length ?? 0;

    if (inDef) {
      if (t === '') {
        head.push(line);
        continue;
      }
      if (indent > defIndent) {
        head.push(line);
        continue;
      }
      inDef = false;
      defIndent = 0;
    }

    if (/^def\s+/.test(t) || /^@/.test(t)) {
      inDef = /^def\s+/.test(t);
      defIndent = indent;
      head.push(line);
    } else {
      // 只处理模块级别的 global 声明，跳过函数内部的 global（如 Ch/Maj 内的冗余声明）
      const g = line.match(/^\s*global\s+([A-Za-z0-9_,\s]+)/);
      if (g) {
        g[1]
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((name) => globalNames.add(name));
      }
      body.push(line);
    }
  }

  if (body.length === 0) return code;

  const noneVars = [
    'data',
    'padded',
    'n',
    'B',
    'W',
    'W_prime',
    'CVs',
    'blk_idx',
    'sched_idx',
    'x',
  ];
  const bodyFilterVars = [...noneVars];
  const bodyFilterRe = new RegExp(
    `^\\s*(?:${bodyFilterVars.join('|')})\\s*=\\s*(?:None|".*"|'.*'|\\[.*\\])\\s*$`,
  );
  const filteredBody = body.filter((l) => {
    const trimmed = l.trimEnd();
    if (/^\s*(?:global|nonlocal)\s+/.test(trimmed)) {
      return false;
    }
    return !bodyFilterRe.test(trimmed);
  });
  const bodyIndented = filteredBody.map((l) => '    ' + l).join('\n');

  // 提取非哈希算法的输出变量候选（S-box / 分组密码等写入自定义变量）
  const internalVarPatterns = new Set([
    ...noneVars,
    ...globalNames,
    'sbox',
    '_sbox_ref',
    '_input_val',
    '_b0',
    '_b1',
    '_b2',
    '_b3',
    '_s_b0',
    '_s_b1',
    '_s_b2',
    '_s_b3',
  ]);

  const assignedVars = new Set<string>();
  // 更稳健的变量赋值检测：匹配简单赋值语句（排除复合赋值、函数调用、注释等）
  const assignmentRe = /^([A-Za-z_]\w*)\s*=\s*(?![=])/;
  for (const line of filteredBody) {
    const trimmed = line.trim();
    // 跳过空行、注释行、控制流行
    if (
      !trimmed ||
      trimmed.startsWith('#') ||
      /^(if|elif|else|for|while|try|except|finally|with|def|class|return|import|from|raise|assert|pass|break|continue|@|global|nonlocal)\b/.test(
        trimmed,
      )
    ) {
      continue;
    }
    const m = trimmed.match(assignmentRe);
    if (m && !m[1].startsWith('_') && !internalVarPatterns.has(m[1])) {
      assignedVars.add(m[1]);
    }
  }

  const algoName =
    algorithmType && algorithmType !== 'unknown'
      ? `algo_${algorithmType}`
      : 'algo';
  const globalLine = Array.from(globalNames).join(', ');

  // ── 输出变量：优先选择常见的哈希输出变量 ──
  const preferredOutputVars = [
    'H',
    'CVs',
    'digest',
    'hash_out',
    'result',
    'output',
    'hash',
  ];
  const sortedAssignedVars = [...assignedVars].sort((a, b) => {
    const aIdx = preferredOutputVars.indexOf(a);
    const bIdx = preferredOutputVars.indexOf(b);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return 0;
  });

  // ── 生成 _list_to_bytes 辅助函数 ──
  const listToBytesFn = [
    'def _list_to_bytes(_lst):',
    '    _parts = []',
    '    for _x in _lst:',
    '        if isinstance(_x, int):',
    "            _parts.append(_x.to_bytes(4, 'big'))",
    '        elif isinstance(_x, str):',
    '            try:',
    '                _parts.append(bytes.fromhex(_x))',
    '            except Exception:',
    "                _parts.append(_x.encode('utf-8'))",
    '        elif isinstance(_x, (bytes, bytearray)):',
    '            _parts.append(bytes(_x))',
    '        elif isinstance(_x, list):',
    '            _parts.append(_list_to_bytes(_x))',
    "    return b''.join(_parts)",
    '',
  ].join('\n');

  const outputVarCheck =
    sortedAssignedVars.length > 0
      ? [
          '    if _ret is None:',
          `        for _vn in [${sortedAssignedVars.map((v) => `'${v}'`).join(', ')}]:`,
          '            try:',
          '                _v = locals().get(_vn)',
          '                if _v is None:',
          '                    _v = globals().get(_vn)',
          '                if _v is None:',
          '                    continue',
          '                if isinstance(_v, (bytes, bytearray)):',
          '                    _ret = bytes(_v)',
          '                    break',
          '                if isinstance(_v, int):',
          "                    _ret = _v.to_bytes(4, 'big')",
          '                    break',
          '                if isinstance(_v, list) and 0 < len(_v) < 256:',
          '                    try:',
          '                        _ret = _list_to_bytes(_v)',
          '                        break',
          '                    except Exception:',
          '                        pass',
          '            except Exception:',
          '                pass',
        ]
      : [];

  const algo = [
    '',
    listToBytesFn,
    `def ${algoName}(seed: bytes) -> bytes:`,
    `    global ${globalLine}`,
    '    data = seed',
    bodyIndented,
    '    _ret = None',
    '    try:',
    "        if 'CVs' in globals() and 'n' in globals():",
    '            _v = CVs[n] if isinstance(n, int) and n < len(CVs) else CVs[-1]',
    '            if isinstance(_v, str):',
    '                _ret = bytes.fromhex(_v)',
    '            elif isinstance(_v, (bytes, bytearray)):',
    '                _ret = bytes(_v)',
    '            elif isinstance(_v, list):',
    '                _ret = _list_to_bytes(_v)',
    '    except Exception:',
    '        _ret = None',
    ...outputVarCheck,
    '    if _ret is None:',
    '        try:',
    '            if isinstance(data, (bytes, bytearray)):',
    '                _ret = bytes(data)',
    '        except Exception:',
    '            _ret = None',
    '    return _ret or b""',
    '',
  ].join('\n');

  const prim = [
    '',
    'def primitive(_a, _b = b"") -> bytes:',
    '    if isinstance(_a, (bytes, bytearray)):',
    '        n_bytes, seed = int(_b) if not isinstance(_b, (bytes, bytearray)) else 0, _a',
    '    else:',
    '        n_bytes, seed = int(_a), _b if isinstance(_b, (bytes, bytearray)) else b""',
    '    out = bytearray()',
    '    ctr = 0',
    '    s = bytes(seed or b"")',
    '    _max_iter = max(int(n_bytes) + 1, 65536)',
    '    _slen = len(s)',
    '    while len(out) < int(n_bytes):',
    '        _ctr_b = ctr.to_bytes(_slen, "little")',
    '        _mix = bytes(a ^ b for a, b in zip(s, _ctr_b))',
    `        out.extend(${algoName}(_mix))`,
    '        ctr += 1',
    '        if ctr > _max_iter:',
    "            raise RuntimeError('primitive: exceeded max iterations without sufficient output')",
    '    return bytes(out[:int(n_bytes)])',
    '',
  ].join('\n');

  const headJoined = head.join('\n');
  const sep = headJoined && headJoined.slice(-1) !== '\n' ? '\n' : '';
  return headJoined + sep + algo + prim;
}
