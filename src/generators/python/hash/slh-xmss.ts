/**
 * FIPS 205 XMSS 树根 Python 代码生成器（SHAKE 变体，simple thash）。
 * 与 JS 生成器同构：thash = SHAKE256(PK.seed‖ADRS‖M, n)，PRF 用 ADRS type 5，
 * 叶子压缩 type 1，节点合并 type 2（treeHeight=h、treeIndex=位置>>1），layer/tree 由调用方给出。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

function registerSlhXmssRoot(): string {
  return pythonGenerator.provideFunction_('slh_xmss_root', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(sk_seed, pk_seed, h_prime, layer, tree):',
    '    import hashlib',
    '    sk = bytes(sk_seed)',
    '    pk = bytes(pk_seed)',
    '    n = len(sk)',
    '    if n not in (16, 24, 32):',
    '        raise ValueError("SLH-DSA sk_seed must be 16, 24 or 32 bytes")',
    '    if len(pk) != n:',
    '        raise ValueError("SLH-DSA pk_seed length must match sk_seed")',
    '    if isinstance(h_prime, bool) or not isinstance(h_prime, (int, float)) or int(h_prime) != h_prime or not 0 <= h_prime <= 20:',
    '        raise ValueError("SLH-DSA h_prime must be an integer from 0 to 20")',
    '    if isinstance(layer, bool) or not isinstance(layer, (int, float)) or int(layer) != layer or not 0 <= layer <= 2**32 - 1:',
    '        raise ValueError("SLH-DSA layer address must be an integer from 0 to 2^32-1")',
    '    if isinstance(tree, bool) or not isinstance(tree, (int, float)) or int(tree) != tree or tree < 0:',
    '        raise ValueError("SLH-DSA tree address must be a non-negative integer")',
    '    h_prime = int(h_prime); layer = int(layer); tree = int(tree)',
    '    W = 16',
    '    length = 2 * n + 3',
    '    def base(typ):',
    '        x = bytearray(32)',
    '        x[0:4] = layer.to_bytes(4, "big")',
    '        x[4:16] = tree.to_bytes(12, "big")',
    '        x[16:20] = typ.to_bytes(4, "big")',
    '        return x',
    '    def addr_wots(typ, kp, chain, hsh):',
    '        x = base(typ)',
    '        x[20:24] = kp.to_bytes(4, "big")',
    '        x[24:28] = chain.to_bytes(4, "big")',
    '        x[28:32] = hsh.to_bytes(4, "big")',
    '        return bytes(x)',
    '    def addr_pk(kp):',
    '        x = base(1); x[20:24] = kp.to_bytes(4, "big"); return bytes(x)',
    '    def addr_tree(height, index):',
    '        x = base(2); x[24:28] = height.to_bytes(4, "big"); x[28:32] = index.to_bytes(4, "big"); return bytes(x)',
    '    def th(adrs, msg):',
    '        return hashlib.shake_256(pk + adrs + bytes(msg)).digest(n)',
    '    def prf(adrs):',
    '        return hashlib.shake_256(pk + adrs + sk).digest(n)',
    '    def wots_pk(kp):',
    '        chains = []',
    '        for i in range(length):',
    '            v = prf(addr_wots(5, kp, i, 0))',
    '            for j in range(W - 1):',
    '                v = th(addr_wots(0, kp, i, j), v)',
    '            chains.append(v)',
    '        return th(addr_pk(kp), b"".join(chains))',
    '    nodes = [wots_pk(i) for i in range(1 << h_prime)]',
    '    height = 0',
    '    while len(nodes) > 1:',
    '        height += 1',
    '        nodes = [th(addr_tree(height, k >> 1), nodes[k] + nodes[k + 1]) for k in range(0, len(nodes), 2)]',
    '    return list(nodes[0])',
  ]);
}

pythonGenerator.forBlock['slh_xmss_root'] = function (block: Block): [string, number] {
  const skSeed = pythonGenerator.valueToCode(block, 'SK_SEED', Order.ATOMIC) || "b''";
  const pkSeed = pythonGenerator.valueToCode(block, 'PK_SEED', Order.ATOMIC) || "b''";
  const hPrime = pythonGenerator.valueToCode(block, 'H_PRIME', Order.ATOMIC) || '0';
  const layer = pythonGenerator.valueToCode(block, 'LAYER', Order.ATOMIC) || '0';
  const tree = pythonGenerator.valueToCode(block, 'TREE', Order.ATOMIC) || '0';
  const fn = registerSlhXmssRoot();
  return ['bytes(' + fn + '(' + skSeed + ', ' + pkSeed + ', ' + hPrime + ', ' + layer + ', ' + tree + '))', Order.ATOMIC];
};

/** FIPS 205 §10.1 + §11.1：pure SLH-DSA 的消息随机数 R（SHAKE 变体） */
export function registerSlhMsgRandomness(): string {
  return pythonGenerator.provideFunction_('slh_msg_randomness', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(sk_prf, opt_rand, msg, ctx):',
    '    import hashlib',
    '    sk = bytes(sk_prf)',
    '    opt = bytes(opt_rand)',
    '    n = len(sk)',
    '    if n not in (16, 24, 32):',
    '        raise ValueError("SLH-DSA sk_prf must be 16, 24 or 32 bytes")',
    '    if len(opt) != n:',
    '        raise ValueError("SLH-DSA opt_rand length must match sk_prf")',
    '    context = b"" if ctx is None else bytes(ctx)',
    '    if len(context) > 255:',
    '        raise ValueError("SLH-DSA context must be at most 255 bytes")',
    '    body = bytes(msg) if not isinstance(msg, str) else msg.encode("utf-8")',
    '    prefix = b"\\x00" + bytes([len(context)]) + context + body',
    '    return list(hashlib.shake_256(sk + opt + prefix).digest(n))',
  ]);
}

pythonGenerator.forBlock['slh_msg_randomness'] = function (block: Block): [string, number] {
  const skPrf = pythonGenerator.valueToCode(block, 'SK_PRF', Order.ATOMIC) || "b''";
  const optRand = pythonGenerator.valueToCode(block, 'OPT_RAND', Order.ATOMIC) || "b''";
  const msg = pythonGenerator.valueToCode(block, 'MESSAGE', Order.ATOMIC) || "b''";
  const ctx = pythonGenerator.valueToCode(block, 'CONTEXT', Order.ATOMIC) || "b''";
  const fn = registerSlhMsgRandomness();
  return ['bytes(' + fn + '(' + skPrf + ', ' + optRand + ', ' + msg + ', ' + ctx + '))', Order.ATOMIC];
};
