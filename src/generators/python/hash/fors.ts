/**
 * FORS 完整签名 Python 代码生成器（FIPS 205 §8）
 *
 * 内嵌完整 FORS（fors_core 闭包）：SHAKE-256 作 PRF/H（标准库 hashlib），
 * ADRS 布局沿用项目 slh_addr 约定（layer 1B | tree 12B | type 4B | keypair 4B |
 * FORS_TREE 追加 height 4B | index 4B）。教学参数 n=32 / k=4 / a=4（每树 16 叶）。
 * 验证用性质向量：确定性、签名-验证往返、篡改检测。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

/** FORS 完整实现（闭包，返回 {fors_sign, fors_verify, fors_pk}） */
function registerForsCore(): string {
  return pythonGenerator.provideFunction_('fors_core', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '():',
    '    import hashlib',
    '    def to_bytes(x):',
    '        if isinstance(x, str):',
    '            return x.encode("utf-8")',
    '        return bytes(x)',
    '    def h32(*parts):',
    '        data = b"".join(to_bytes(p) for p in parts)',
    '        return hashlib.shake_256(data).digest(32)',
    '    def adrs(kp, typ, height, idx):',
    '        a = bytearray(32)',
    '        a[13:17] = typ.to_bytes(4, "big")',
    '        a[17:21] = kp.to_bytes(4, "big")',
    '        if typ == 3:  # FORS_TREE: height + index',
    '            a[21:25] = height.to_bytes(4, "big")',
    '            a[25:29] = idx.to_bytes(4, "big")',
    '        return bytes(a)',
    '    def fors_sk(sk_seed, tree_i, leaf_j):',
    '        # FIPS 205 Alg 12: sk = PRF(SK.seed, ADRS(FORS_TREE, kp=i, h=0, idx=j))',
    '        return h32(sk_seed, adrs(tree_i, 3, 0, leaf_j))',
    '    def fors_tree(sk_seed, tree_i, idx):',
    '        # 16 叶树（叶 = sk），返回 (root, auth_path)；节点 H(ADRS(h, jj) || l || r)',
    '        level = [fors_sk(sk_seed, tree_i, j) for j in range(16)]',
    '        auth = []',
    '        h = 1',
    '        while len(level) > 1:',
    '            auth.append(level[(idx >> (h - 1)) ^ 1])',
    '            nxt = []',
    '            for j in range(0, len(level), 2):',
    '                nxt.append(h32(adrs(tree_i, 3, h, j // 2), level[j], level[j + 1]))',
    '            level = nxt',
    '            h += 1',
    '        return level[0], auth',
    '    def fors_sign(sk_seed, m):',
    '        # FIPS 205 Alg 13: M 按 a-bit 分块（块 0 最高位）选叶；sig = 每树 (sk, auth)',
    '        m = to_bytes(m)',
    '        if len(m) != 2:',
    '            raise ValueError("FORS M must be 2 bytes (k*a = 16 bits)")',
    '        mv = int.from_bytes(m, "big")',
    '        idxs = [(mv >> (12 - 4 * i)) & 0xF for i in range(4)]',
    '        sig = b""',
    '        for i in range(4):',
    '            root, auth = fors_tree(sk_seed, i, idxs[i])',
    '            sig += fors_sk(sk_seed, i, idxs[i]) + b"".join(auth)',
    '        return sig',
    '    def fors_pk(sk_seed):',
    '        # 根与消息无关：pk = H(ADRS(FORS_ROOTS) || root_0 || ... || root_3)',
    '        roots = [fors_tree(sk_seed, i, 0)[0] for i in range(4)]',
    '        return h32(adrs(0, 4, 0, 0), b"".join(roots))',
    '    def fors_verify(pk, m, sig):',
    '        # PkFromSig 语义：sk + auth 重建每树根 → pk 比对',
    '        m = to_bytes(m)',
    '        sig = to_bytes(sig)',
    '        mv = int.from_bytes(m, "big")',
    '        idxs = [(mv >> (12 - 4 * i)) & 0xF for i in range(4)]',
    '        roots = []',
    '        off = 0',
    '        for i in range(4):',
    '            idx = idxs[i]',
    '            node = sig[off:off + 32]',
    '            off += 32',
    '            for h in range(4):',
    '                sibling = sig[off:off + 32]',
    '                off += 32',
    '                jj = idx >> (h + 1)',
    '                if (idx >> h) & 1:',
    '                    node = h32(adrs(i, 3, h + 1, jj), sibling, node)',
    '                else:',
    '                    node = h32(adrs(i, 3, h + 1, jj), node, sibling)',
    '            roots.append(node)',
    '        pk2 = h32(adrs(0, 4, 0, 0), b"".join(roots))',
    '        return pk2 == to_bytes(pk)',
    '    return {"fors_sign": fors_sign, "fors_verify": fors_verify, "fors_pk": fors_pk}',
    '',
  ]);
}

pythonGenerator.forBlock['fors_sign'] = function (block: Block): [string, number] {
  const skSeed = pythonGenerator.valueToCode(block, 'SK_SEED', Order.ATOMIC) || 'b\'\'';
  const m = pythonGenerator.valueToCode(block, 'MESSAGE', Order.ATOMIC) || 'b\'\'';
  const fn = registerForsCore();
  return [fn + '()["fors_sign"](' + skSeed + ', ' + m + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['fors_verify'] = function (block: Block): [string, number] {
  const pk = pythonGenerator.valueToCode(block, 'PUBLIC_KEY', Order.ATOMIC) || 'b\'\'';
  const m = pythonGenerator.valueToCode(block, 'MESSAGE', Order.ATOMIC) || 'b\'\'';
  const sig = pythonGenerator.valueToCode(block, 'SIGNATURE', Order.ATOMIC) || 'b\'\'';
  const fn = registerForsCore();
  return [fn + '()["fors_verify"](' + pk + ', ' + m + ', ' + sig + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['fors_pk_from_sk'] = function (block: Block): [string, number] {
  const skSeed = pythonGenerator.valueToCode(block, 'SK_SEED', Order.ATOMIC) || 'b\'\'';
  const fn = registerForsCore();
  return [fn + '()["fors_pk"](' + skSeed + ')', Order.ATOMIC];
};
