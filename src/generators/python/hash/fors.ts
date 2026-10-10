/**
 * FORS-inspired teaching-variant Python generator; not FIPS 205-compatible.
 *
 * Uses project-specific SHAKE concatenation, not the FIPS 205 PRF/F/T_k functions.
 * Fixed parameters are n=32, k=4, a=4; tests establish only internal consistency.
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

/** Project teaching variant (closure returning sign, verify, and public-key helpers). */
function registerForsCore(): string {
  return pythonGenerator.provideFunction_('fors_core', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '():',
    '    import hashlib',
    '    def to_bytes(x):',
    '        if isinstance(x, str):',
    '            return x.encode("utf-8")',
    '        if isinstance(x, (bytes, bytearray)):',
    '            return bytes(x)',
    '        if isinstance(x, list):',
    '            if any(isinstance(b, bool) or not isinstance(b, (int, float)) or not 0 <= b <= 255 or int(b) != b for b in x):',
    '                raise ValueError("FORS byte arrays must contain integers from 0 to 255")',
    '            return bytes(int(b) for b in x)',
    '        raise TypeError("FORS inputs must be strings, byte arrays, bytes, or bytearray values")',
    '    def seed_bytes(x):',
    '        seed = to_bytes(x)',
    '        if len(seed) != 32:',
    '            raise ValueError("FORS teaching seed must be 32 bytes")',
    '        return seed',
    '    def h32(*parts):',
    '        data = b"".join(to_bytes(p) for p in parts)',
    '        return hashlib.shake_256(data).digest(32)',
    '    def adrs(kp, typ, height, idx):',
    '        a = bytearray(32)',
    '        a[16:20] = typ.to_bytes(4, "big")',
    '        a[20:24] = kp.to_bytes(4, "big")',
    '        if typ == 3:  # FORS_TREE: height + index',
    '            a[24:28] = height.to_bytes(4, "big")',
    '            a[28:32] = idx.to_bytes(4, "big")',
    '        elif typ == 6:  # FORS_PRF: word 5 is zero; word 6 is the tree index',
    '            a[28:32] = idx.to_bytes(4, "big")',
    '        return bytes(a)',
    '    def fors_sk(sk_seed, tree_i, leaf_j):',
    '        # Project-specific derivation; type 6 identifies the FORS_PRF address word.',
    '        return h32(sk_seed, adrs(tree_i, 6, 0, leaf_j))',
    '    def fors_tree(sk_seed, tree_i, idx):',
    '        # Project-specific 16-leaf tree; nodes hash the custom ADRS/child concatenation.',
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
    '        # M is split into fixed 4-bit chunks; sig contains one leaf and path per tree.',
    '        sk_seed = seed_bytes(sk_seed)',
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
    '        # Project-specific public key: SHAKE(project FORS_ROOTS address || concatenated roots).',
    '        sk_seed = seed_bytes(sk_seed)',
    '        roots = [fors_tree(sk_seed, i, 0)[0] for i in range(4)]',
    '        return h32(adrs(0, 4, 0, 0), b"".join(roots))',
    '    def fors_verify(pk, m, sig):',
    '        # Rebuild project tree roots from the signature and compare with the project public key.',
    '        pk = to_bytes(pk)',
    '        m = to_bytes(m)',
    '        sig = to_bytes(sig)',
    '        if len(pk) != 32:',
    '            raise ValueError("FORS teaching public key must be 32 bytes")',
    '        if len(m) != 2:',
    '            raise ValueError("FORS M must be 2 bytes (k*a = 16 bits)")',
    '        if len(sig) != 640:',
    '            raise ValueError("FORS teaching signature must be 640 bytes")',
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
