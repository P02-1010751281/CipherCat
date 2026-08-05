/**
 * 哈希基后量子结构件 Python 代码生成器
 *
 * 哈希函数 = SHAKE-256（FIPS 205 的 H），32 字节输出（标准库 hashlib）。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

/** 一次注册全部哈希基结构件函数 */
function registerHashBased(): string {
  return pythonGenerator.provideFunction_('hash_based', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '():',
    '    import hashlib',
    '    def to_bytes(x):',
    '        if isinstance(x, str):',
    '            return x.encode("utf-8")',
    '        return bytes(x)',
    '    def h32(*parts):',
    '        data = b"".join(to_bytes(p) for p in parts)',
    '        return hashlib.shake_256(data).digest(32)',
    '    def hash_chain(inp, iters):',
    '        x = to_bytes(inp)',
    '        for _ in range(iters):',
    '            x = h32(x)',
    '        return x',
    '    def merkle_leaf(msg, adrs):',
    '        return h32(adrs, msg)',
    '    def merkle_node(l, r, adrs):',
    '        return h32(adrs, l, r)',
    '    def merkle_root(leaves, leaf_len, adrs):',
    '        b = to_bytes(leaves)',
    '        level = [b[i * leaf_len:(i + 1) * leaf_len] for i in range(len(b) // leaf_len)]',
    '        while len(level) > 1:',
    '            level = [h32(adrs, level[i], level[i + 1]) for i in range(0, len(level), 2)]',
    '        return level[0]',
    '    def merkle_auth_path(leaves, leaf_len, adrs, idx):',
    '        # 认证路径：自底向上每层取目标叶子索引 idx 的兄弟（与 merkle_root 同组合约定）',
    '        b = to_bytes(leaves)',
    '        level = [b[i * leaf_len:(i + 1) * leaf_len] for i in range(len(b) // leaf_len)]',
    '        auth = []',
    '        h = 0',
    '        while len(level) > 1:',
    '            auth.append(level[(idx >> h) ^ 1])',
    '            level = [h32(adrs, level[i], level[i + 1]) for i in range(0, len(level), 2)]',
    '            h += 1',
    '        return b"".join(auth)',
    '    def fors_leaf_index(m, i):',
    '        # FORS 选叶：消息 M 的第 i 个 4-bit 块（块 0 最高位，与 fors_sign 同约定）',
    '        m = to_bytes(m)',
    '        return (int.from_bytes(m, "big") >> (12 - 4 * i)) & 0xF',
    '    def slh_addr(layer, tree, leaf, typ):',
    '        a = bytearray(32)',
    '        a[0] = layer & 0xFF',
    '        a[1:13] = tree.to_bytes(12, "big")',
    '        a[13:17] = typ.to_bytes(4, "big")',
    '        a[17:21] = leaf.to_bytes(4, "big")',
    '        return bytes(a)',
    '    def fors_root(roots, adrs):',
    '        return h32(adrs, roots)',
    '    return {"hash_chain": hash_chain, "merkle_leaf": merkle_leaf, "merkle_node": merkle_node, "merkle_root": merkle_root, "merkle_auth_path": merkle_auth_path, "fors_leaf_index": fors_leaf_index, "slh_addr": slh_addr, "fors_root": fors_root}',
    '',
  ]);
}

pythonGenerator.forBlock['hash_chain'] = function (block: Block): [string, number] {
  const inp = pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'b\'\'';
  const iters = pythonGenerator.valueToCode(block, 'ITERATIONS', Order.ATOMIC) || '0';
  const fn = registerHashBased();
  return [fn + '()["hash_chain"](' + inp + ', ' + iters + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['merkle_leaf'] = function (block: Block): [string, number] {
  const msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || 'b\'\'';
  const adrs = pythonGenerator.valueToCode(block, 'ADRS', Order.ATOMIC) || 'b\'\'';
  const fn = registerHashBased();
  return [fn + '()["merkle_leaf"](' + msg + ', ' + adrs + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['merkle_node'] = function (block: Block): [string, number] {
  const l = pythonGenerator.valueToCode(block, 'LEFT', Order.ATOMIC) || 'b\'\'';
  const r = pythonGenerator.valueToCode(block, 'RIGHT', Order.ATOMIC) || 'b\'\'';
  const adrs = pythonGenerator.valueToCode(block, 'ADRS', Order.ATOMIC) || 'b\'\'';
  const fn = registerHashBased();
  return [fn + '()["merkle_node"](' + l + ', ' + r + ', ' + adrs + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['merkle_root'] = function (block: Block): [string, number] {
  const leaves = pythonGenerator.valueToCode(block, 'LEAVES', Order.ATOMIC) || 'b\'\'';
  const leafLen = pythonGenerator.valueToCode(block, 'LEAF_LEN', Order.ATOMIC) || '32';
  const adrs = pythonGenerator.valueToCode(block, 'ADRS', Order.ATOMIC) || 'b\'\'';
  const fn = registerHashBased();
  return [fn + '()["merkle_root"](' + leaves + ', ' + leafLen + ', ' + adrs + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['slh_addr'] = function (block: Block): [string, number] {
  const layer = pythonGenerator.valueToCode(block, 'LAYER', Order.ATOMIC) || '0';
  const tree = pythonGenerator.valueToCode(block, 'TREE', Order.ATOMIC) || '0';
  const leaf = pythonGenerator.valueToCode(block, 'LEAF', Order.ATOMIC) || '0';
  const type = block.getFieldValue('TYPE') || '0';
  const fn = registerHashBased();
  return [fn + '()["slh_addr"](' + layer + ', ' + tree + ', ' + leaf + ', ' + type + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['fors_root'] = function (block: Block): [string, number] {
  const roots = pythonGenerator.valueToCode(block, 'ROOTS', Order.ATOMIC) || '[]';
  const adrs = pythonGenerator.valueToCode(block, 'ADRS', Order.ATOMIC) || '[]';
  const fn = registerHashBased();
  return [fn + '()["fors_root"](' + roots + ', ' + adrs + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['merkle_auth_path'] = function (block: Block): [string, number] {
  const leaves = pythonGenerator.valueToCode(block, 'LEAVES', Order.ATOMIC) || 'b\'\'';
  const leafLen = pythonGenerator.valueToCode(block, 'LEAF_LEN', Order.ATOMIC) || '32';
  const adrs = pythonGenerator.valueToCode(block, 'ADRS', Order.ATOMIC) || 'b\'\'';
  const idx = pythonGenerator.valueToCode(block, 'INDEX', Order.ATOMIC) || '0';
  const fn = registerHashBased();
  return [fn + '()["merkle_auth_path"](' + leaves + ', ' + leafLen + ', ' + adrs + ', ' + idx + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['fors_leaf_index'] = function (block: Block): [string, number] {
  const m = pythonGenerator.valueToCode(block, 'M', Order.ATOMIC) || 'b\'\'';
  const i = pythonGenerator.valueToCode(block, 'I', Order.ATOMIC) || '0';
  const fn = registerHashBased();
  return [fn + '()["fors_leaf_index"](' + m + ', ' + i + ')', Order.ATOMIC];
};
