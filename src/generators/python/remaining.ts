/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * M3-M4 生成器 — Python 最终版
 * 
 * md_iterate/sponge_duplex: 添加算法选择参数，修复透传
 * ML-KEM: KeyGen 保留，Encaps/Decaps 降至占位
 * ECDSA/SM2/ECDH: 占位（需运行时曲线参数）
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

// ═══ M3 数学 ═══════════════════════════════════════════

pythonGenerator.forBlock['nt_mod'] = function(b: Block): [string, number] {
  const a = pythonGenerator.valueToCode(b,'A',Order.ATOMIC)||'0';
  const n = pythonGenerator.valueToCode(b,'B',Order.ATOMIC)||'1';
  return ['('+a+' % '+n+')', Order.ATOMIC];
};
pythonGenerator.forBlock['nt_mod_pow'] = function(b: Block): [string, number] {
  return ['pow('+(pythonGenerator.valueToCode(b,'A',Order.ATOMIC)||'0')+','+(pythonGenerator.valueToCode(b,'B',Order.ATOMIC)||'0')+',1)', Order.ATOMIC];
};
pythonGenerator.forBlock['nt_div_rem'] = function(b: Block): [string, number] {
  return ['divmod('+(pythonGenerator.valueToCode(b,'A',Order.ATOMIC)||'0')+','+(pythonGenerator.valueToCode(b,'B',Order.ATOMIC)||'1')+')', Order.ATOMIC];
};

const _bnPy = (op: string) => (b: Block): [string, number] => {
  const a = pythonGenerator.valueToCode(b,'A',Order.ATOMIC)||'0';
  const v = pythonGenerator.valueToCode(b,'B',Order.ATOMIC)||'0';
  return ['('+a+' '+op+' '+v+')', Order.ATOMIC];
};
pythonGenerator.forBlock['bn_add'] = _bnPy('+');
pythonGenerator.forBlock['bn_sub'] = _bnPy('-');
pythonGenerator.forBlock['bn_mul'] = _bnPy('*');
pythonGenerator.forBlock['bn_div'] = _bnPy('//');

pythonGenerator.forBlock['hash_hmac'] = function(b: Block): [string, number] {
  const key = pythonGenerator.valueToCode(b,'KEY',Order.ATOMIC)||'b""';
  const msg = pythonGenerator.valueToCode(b,'MSG',Order.ATOMIC)||'b""';
  const hash = b.getFieldValue('HASH')||'sha256';
  const h = hash==='sm3'?'\'sm3\'':'\'sha256\'';
  const fn = pythonGenerator.provideFunction_('hmac_'+hash, [
    'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(key,msg):',
    '    import hmac,hashlib',
    '    return hmac.new(key,msg,'+h+').digest()',
  ]);
  return [fn+'('+key+','+msg+')', Order.ATOMIC];
};

// ═══ md_iterate + sponge_duplex（修复透传）═══

pythonGenerator.forBlock['md_iterate'] = function(b: Block): [string, number] {
  const iv = pythonGenerator.valueToCode(b,'IV',Order.ATOMIC)||'[]';
  const blocks = pythonGenerator.valueToCode(b,'BLOCKS',Order.ATOMIC)||'[]';
  const algo = b.getFieldValue('ALGO')||'sha256';
  const compressFn = algo==='sm3'?'sm3_compress':'sha256_compress';
  const fn = pythonGenerator.provideFunction_('md_iterate_'+algo, [
    'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(iv,blocks):',
    '    h=list(iv)',
    '    for b in blocks: h='+compressFn+'(h,b)',
    '    return h',
  ]);
  return [fn+'('+iv+','+blocks+')', Order.ATOMIC];
};

pythonGenerator.forBlock['sponge_duplex'] = function(b: Block): [string, number] {
  const state = pythonGenerator.valueToCode(b,'STATE',Order.ATOMIC)||'[]';
  const data = pythonGenerator.valueToCode(b,'DATA',Order.ATOMIC)||'b""';
  const perm = b.getFieldValue('PERM')||'keccak_f1600';
  const fn = pythonGenerator.provideFunction_('sponge_duplex', [
    'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(state,data,rate,perm_fn):',
    '    absorb=0',
    '    while absorb<len(data):',
    '        for j in range(0,rate,8):',
    '            if absorb+j>=len(data): break',
    '            w=0',
    '            for b in range(min(8,len(data)-absorb-j)): w|=data[absorb+j+b]<<(8*b)',
    '            state[j//8]^=w',
    '        state=perm_fn(state)',
    '        absorb+=rate',
    '    return bytes(state[j//8]>>(8*b)&0xFF for j in range(0,rate,8) for b in range(8))',
  ]);
  return [fn+'('+state+','+data+',168,None)', Order.ATOMIC];
};

// ═══ M2.5 后量子便利层 ════════════════════════════════

pythonGenerator.forBlock['pq_ntt_vec'] = function(b: Block): [string, number] {
  return ['[ntt(p,3329) for p in '+(pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')+']', Order.ATOMIC];
};
pythonGenerator.forBlock['pq_intt_vec'] = function(b: Block): [string, number] {
  return ['[intt(p,3329) for p in '+(pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')+']', Order.ATOMIC];
};
pythonGenerator.forBlock['pq_cbd_ntt_vec'] = function(b: Block): [string, number] {
  const seed = pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'b""';
  const k = b.getFieldValue('K')||'3';
  return ['[ntt(sample_cbd_eta2(seed_with_nonce('+seed+',i),3329),3329) for i in range('+k+')]', Order.ATOMIC];
};
pythonGenerator.forBlock['pq_mat_vec_mul_ntt'] = function(b: Block): [string, number] {
  const input = pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  const fn = pythonGenerator.provideFunction_('mat_vec_mul_ntt', [
    'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(A,v,k,q):',
    '    u=[]',
    '    for i in range(k):',
    '        acc=[0]*256',
    '        for j in range(k):',
    '            prod=ntt_mul(A[j][i],v[j],q)',
    '            for t in range(256): acc[t]=(acc[t]+prod[t])%q',
    '        u.append(acc)',
    '    return u',
  ]);
  return [fn+'('+input+','+input+',3,3329)', Order.ATOMIC];
};
pythonGenerator.forBlock['pq_vec_add'] = function(b: Block): [string, number] {
  return ['[[(a+b)%3329 for a,b in zip(va,vb)] for va,vb in zip(*'+(pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')+')]', Order.ATOMIC];
};
pythonGenerator.forBlock['pq_vec_sub'] = function(b: Block): [string, number] {
  return ['[[(a-b)%3329 for a,b in zip(va,vb)] for va,vb in zip(*'+(pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')+')]', Order.ATOMIC];
};
pythonGenerator.forBlock['pq_sample_ntt_mat'] = function(b: Block): [string, number] {
  const seed = pythonGenerator.valueToCode(b,'SEED',Order.ATOMIC)||'b""';
  const k = b.getFieldValue('K')||'3';
  return ['[[sample_ntt('+seed+'+bytes([j,i]),3329) for j in range('+k+')] for i in range('+k+')]', Order.ATOMIC];
};

// ═══ M4 一键封装 ═══════════════════════════════════════

pythonGenerator.forBlock['ml_kem_keygen'] = function(): [string, number] {
  const fn = pythonGenerator.provideFunction_('ml_kem_keygen', [
    'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(seed):',
    '    k,eta1,eta2,q=3,2,2,3329',
    '    d=SHAKE256(seed,64);z=d[32:]',
    '    G=SHAKE256(d[:32],64);rho,sigma=G[:32],G[32:]',
    '    A=sample_ntt_mat(rho,k,q)',
    '    s=cbd_ntt_vec_eta2(sigma,0,k,q)',
    '    e=cbd_ntt_vec_eta2(sigma,k,k,q)',
    '    that=mat_vec_mul_ntt(A,s,k,q)',
    '    for i in range(k):',
    '        for j in range(256):that[i][j]=(that[i][j]+e[i][j])%q',
    '    ek=b"".join(byte_encode_12(p) for p in that)+rho',
    '    dk=b"".join(byte_encode_12(p) for p in s)+ek+SHAKE256(z,32)+SHAKE256(ek,32)',
    '    return ek,dk',
  ]);
  return [fn+'(b"")', Order.ATOMIC];
};

// SM3 一键
pythonGenerator.forBlock['sm3_hash'] = function(b: Block): [string, number] {
  const msg = pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'b""';
  const fn = pythonGenerator.provideFunction_('sm3_hash', [
    'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(msg):',
    '    padded=sm3_pad(msg)',
    '    n=len(padded)//64',
    '    V=[0x7380166f,0x4914b2b9,0x172442d7,0xda8a0600,0xa96f30bc,0x163138aa,0xe38dee4d,0xb0fb0e4e]',
    '    for i in range(n):',
    '        B=list(padded[i*64:(i+1)*64])',
    '        V=sm3_compress(V,B)',
    '    import struct',
    '    return b"".join(struct.pack(">I",v) for v in V)',
  ]);
  return [fn+'('+msg+')', Order.ATOMIC];
};
pythonGenerator.forBlock['sm3_hmac'] = function(b: Block): [string, number] {
  const key = pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'b""';
  const msg = pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'b""';
  const fn = pythonGenerator.provideFunction_('hmac_sm3', [
    'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(key,msg):',
    '    B=64',
    '    if len(key)>B:key=sm3_hash(key)',
    '    ik=bytes([x^0x36 for x in key.ljust(B,b"\\x00")])',
    '    ok=bytes([x^0x5c for x in key.ljust(B,b"\\x00")])',
    '    return sm3_hash(ok+sm3_hash(ik+msg))',
  ]);
  return [fn+'('+key+','+msg+')', Order.ATOMIC];
};
pythonGenerator.forBlock['hmac_sha256'] = function(b: Block): [string, number] {
  const key = pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'b""';
  const msg = pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'b""';
  const fn = pythonGenerator.provideFunction_('hmac_sha256', [
    'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(key,msg):',
    '    import hmac,hashlib',
    '    return hmac.new(key,msg,hashlib.sha256).digest()',
  ]);
  return [fn+'('+key+','+msg+')', Order.ATOMIC];
};

// KDF
pythonGenerator.forBlock['kdf_pbkdf2'] = function(b: Block): [string, number] {
  const pass = pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'b""';
  const salt = pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'b""';
  const fn = pythonGenerator.provideFunction_('pbkdf2', [
    'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(password,salt,iterations=10000,dklen=32):',
    '    import hashlib',
    '    return hashlib.pbkdf2_hmac("sha256",password,salt,iterations,dklen)',
  ]);
  return [fn+'('+pass+','+salt+')', Order.ATOMIC];
};
pythonGenerator.forBlock['kdf_hkdf'] = function(b: Block): [string, number] {
  const ikm = pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'b""';
  const salt = pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'b""';
  const fn = pythonGenerator.provideFunction_('hkdf', [
    'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(ikm,salt,info=b"",length=32):',
    '    import hashlib,hmac',
    '    prk=hmac.new(salt,ikm,hashlib.sha256).digest()',
    '    out=b"";t=b"";i=1',
    '    while len(out)<length:',
    '        t=hmac.new(prk,t+info+bytes([i]),hashlib.sha256).digest()',
    '        out+=t;i+=1',
    '    return out[:length]',
  ]);
  return [fn+'('+ikm+','+salt+')', Order.ATOMIC];
};

// ═══ 编码工具 ═════════════════════════════════════════

pythonGenerator.forBlock['base64_encode'] = function(b: Block): [string, number] {
  return ['__import__("base64").b64encode('+(pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'b""')+').decode()', Order.ATOMIC];
};
pythonGenerator.forBlock['base64_decode'] = function(b: Block): [string, number] {
  return ['__import__("base64").b64decode('+(pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'""')+')', Order.ATOMIC];
};
pythonGenerator.forBlock['hex_to_bytes'] = function(b: Block): [string, number] {
  return ['bytes.fromhex('+(pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'""')+')', Order.ATOMIC];
};
pythonGenerator.forBlock['bytes_to_hex'] = function(b: Block): [string, number] {
  return ['('+(pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'b""')+').hex()', Order.ATOMIC];
};
pythonGenerator.forBlock['endian_swap'] = function(b: Block): [string, number] {
  return ['list(reversed('+(pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')+'))', Order.ATOMIC];
};
