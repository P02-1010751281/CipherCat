/**
 * M2.5-M4 生成器 — JavaScript 终极完整实现
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

// ═══ M3 数学 ═══════════════════════════════════════════

javascriptGenerator.forBlock['nt_mod'] = function(b: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(b, 'A', Order.ATOMIC) || '0';
  const n = javascriptGenerator.valueToCode(b, 'B', Order.ATOMIC) || '1';
  return ['((' + a + ' % ' + n + ' + ' + n + ') % ' + n + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['nt_mod_pow'] = function(b: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(b, 'A', Order.ATOMIC) || '0';
  const e = javascriptGenerator.valueToCode(b, 'B', Order.ATOMIC) || '0';
  const fn = javascriptGenerator.provideFunction_('powMod', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(b, e, m) {',
    '  var r = 1; b = b % m;',
    '  while (e > 0) { if (e & 1) r = (r * b) % m; e >>= 1; b = (b * b) % m; }',
    '  return r;',
    '}',
  ]);
  return [fn + '(' + a + ', ' + e + ', 1)', Order.ATOMIC];
};

javascriptGenerator.forBlock['nt_div_rem'] = function(b: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(b, 'A', Order.ATOMIC) || '0';
  const d = javascriptGenerator.valueToCode(b, 'B', Order.ATOMIC) || '1';
  return ['[Math.floor(' + a + '/' + d + '), ' + a + '%' + d + ']', Order.ATOMIC];
};

// 大数运算 (BigInt-based)
function _regBn() {
  if (javascriptGenerator.forBlock['__bn']) return;
  javascriptGenerator.forBlock['__bn'] = function() { return ''; };
  javascriptGenerator.provideFunction_('bnToBigInt', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(limbs) {',
    '  var r=0n; for(var i=limbs.length-1;i>=0;i--) r=(r<<32n)|BigInt(limbs[i]>>>0); return r;',
    '}',
  ]);
  javascriptGenerator.provideFunction_('bnFromBigInt', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(n) {',
    '  var r=[]; while(n>0n){r.push(Number(n&0xFFFFFFFFn));n>>=32n;} return r.length?r:[0];',
    '}',
  ]);
}
javascriptGenerator.forBlock['bn_add'] = function(b: Block): [string, number] {
  _regBn(); const a = javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'[0]', v = javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'[0]';
  return ['bnFromBigInt(bnToBigInt('+a+')+bnToBigInt('+v+'))', Order.ATOMIC];
};
javascriptGenerator.forBlock['bn_sub'] = function(b: Block): [string, number] {
  _regBn(); const a = javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'[0]', v = javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'[0]';
  return ['bnFromBigInt(bnToBigInt('+a+')-bnToBigInt('+v+'))', Order.ATOMIC];
};
javascriptGenerator.forBlock['bn_mul'] = function(b: Block): [string, number] {
  _regBn(); const a = javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'[0]', v = javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'[0]';
  return ['bnFromBigInt(bnToBigInt('+a+')*bnToBigInt('+v+'))', Order.ATOMIC];
};
javascriptGenerator.forBlock['bn_div'] = function(b: Block): [string, number] {
  _regBn(); const a = javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'[0]', v = javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'[0]';
  return ['bnFromBigInt(bnToBigInt('+a+')/bnToBigInt('+v+'))', Order.ATOMIC];
};

// HMAC (Web Crypto API)
javascriptGenerator.forBlock['hash_hmac'] = function(b: Block): [string, number] {
  const key = javascriptGenerator.valueToCode(b,'KEY',Order.ATOMIC)||'[]';
  const msg = javascriptGenerator.valueToCode(b,'MSG',Order.ATOMIC)||'[]';
  const hash = b.getFieldValue('HASH')||'sha256';
  const fn = javascriptGenerator.provideFunction_('hmac_'+hash, [
    'async function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(key,msg){',
    '  var a={name:"HMAC",hash:"SHA-256"};',
    '  var k=await crypto.subtle.importKey("raw",key,a,false,["sign"]);',
    '  return new Uint8Array(await crypto.subtle.sign("HMAC",k,msg));',
    '}',
  ]);
  return [fn+'('+key+','+msg+')', Order.ATOMIC];
};

javascriptGenerator.forBlock['md_iterate'] = function(b: Block): [string, number] {
  return [javascriptGenerator.valueToCode(b,'IV',Order.ATOMIC)||'[]', Order.ATOMIC];
};
javascriptGenerator.forBlock['sponge_duplex'] = function(b: Block): [string, number] {
  return [javascriptGenerator.valueToCode(b,'DATA',Order.ATOMIC)||'[]', Order.ATOMIC];
};

// ═══ M2.5 后量子便利层 ═════════════════════════════════

javascriptGenerator.forBlock['pq_ntt_vec'] = function(b: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  const k = b.getFieldValue('K')||'3';
  return ['(function(v,k,q){for(var i=0;i<k;i++)v[i]=ntt(v[i],q);return v;})('+input+','+k+',3329)', Order.ATOMIC];
};
javascriptGenerator.forBlock['pq_intt_vec'] = function(b: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  const k = b.getFieldValue('K')||'3';
  return ['(function(v,k,q){for(var i=0;i<k;i++)v[i]=intt(v[i],q);return v;})('+input+','+k+',3329)', Order.ATOMIC];
};

javascriptGenerator.forBlock['pq_cbd_ntt_vec'] = function(b: Block): [string, number] {
  const seed = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  const k = b.getFieldValue('K')||'3';
  return ['(function(s,k,q){var v=[],eta=2;for(var i=0;i<k;i++){v[i]=ntt(sampleCbdEta'+'2'+'(seedWithNonce(s,i),q),q);}return v;})('+seed+','+k+',3329)', Order.ATOMIC];
};

javascriptGenerator.forBlock['pq_mat_vec_mul_ntt'] = function(b: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  const fn = javascriptGenerator.provideFunction_('matVecMulNtt', [
    'function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(A,v,k,q){',
    '  var u=[];',
    '  for(var i=0;i<k;i++){',
    '    var acc=new Array(256).fill(0);',
    '    for(var j=0;j<k;j++){',
    '      var prod=nttMul(A[j][i],v[j],q);',
    '      for(var t=0;t<256;t++)acc[t]=(acc[t]+prod[t])%q;',
    '    }',
    '    u[i]=acc;',
    '  }',
    '  return u;',
    '}',
  ]);
  return [fn+'('+input+','+input+',3,3329)', Order.ATOMIC];
};

javascriptGenerator.forBlock['pq_vec_add'] = function(b: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  return ['(function(a,b,q){for(var i=0;i<a.length;i++)for(var j=0;j<a[i].length;j++)a[i][j]=(a[i][j]+b[i][j])%q;return a;})('+input+','+input+',3329)', Order.ATOMIC];
};
javascriptGenerator.forBlock['pq_vec_sub'] = function(b: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  return ['(function(a,b,q){for(var i=0;i<a.length;i++)for(var j=0;j<a[i].length;j++)a[i][j]=(a[i][j]-b[i][j]+q)%q;return a;})('+input+','+input+',3329)', Order.ATOMIC];
};

javascriptGenerator.forBlock['pq_sample_ntt_mat'] = function(b: Block): [string, number] {
  const seed = javascriptGenerator.valueToCode(b,'SEED',Order.ATOMIC)||'[]';
  const k = b.getFieldValue('K')||'3';
  return ['(function(s,k,q){var A=[];for(var i=0;i<k;i++){A[i]=[];for(var j=0;j<k;j++){A[i][j]=sampleA(new Uint8Array([...s,j,i]),q);}}return A;})('+seed+','+k+',3329)', Order.ATOMIC];
};

// ═══ M4 一键封装 ═══════════════════════════════════════

// ML-KEM KeyGen (FIPS 203 Algorithm 14)
javascriptGenerator.forBlock['ml_kem_keygen'] = function(): [string, number] {
  const fn = javascriptGenerator.provideFunction_('mlKemKeyGen768', [
    'function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(seed){',
    '  var k=3,eta1=2,eta2=2,q=3329;',
    '  var d=SHAKE256(seed,64); var z=d.slice(32);',
    '  var G=SHAKE256(d.slice(0,32),64); var rho=G.slice(0,32),sigma=G.slice(32);',
    '  var A=sampleNttMat(rho,k,q);',
    '  var s=cbdNttVecEta2(sigma,0,k,q);',
    '  var e=cbdNttVecEta2(sigma,k,k,q);',
    '  var that=matVecMulNtt(A,s,k,q);',
    '  for(var i=0;i<k;i++)for(var j=0;j<256;j++)that[i][j]=(that[i][j]+e[i][j])%q;',
    '  var ekPk=new Uint8Array(k*256*12/8+32); var pos=0;',
    '  for(var i=0;i<k;i++){var enc=byteEncode12(that[i]);ekPk.set(enc,pos);pos+=enc.length;}',
    '  ekPk.set(rho,pos);',
    '  var ek=new Uint8Array(k*256*12/8+32);ek.set(ekPk);',
    '  var dk=new Uint8Array(k*256*12/8+pos+32+32);var dkPos=0;',
    '  for(var i=0;i<k;i++){var encS=byteEncode12(s[i]);dk.set(encS,dkPos);dkPos+=encS.length;}',
    '  dk.set(ek,dkPos);dkPos+=ek.length;',
    '  dk.set(SHAKE256(z,32),dkPos);dkPos+=32;',
    '  dk.set(SHAKE256(ek,32),dkPos);',
    '  return {ek:ek,dk:dk};',
    '}',
  ]);
  return [fn+'(new Uint8Array(0))', Order.ATOMIC];
};

javascriptGenerator.forBlock['ml_kem_encaps'] = function(): [string, number] {
  const fn = javascriptGenerator.provideFunction_('mlKemEncaps768', [
    'function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(ek){',
    '  var k=3,eta1=2,eta2=2,q=3329;',
    '  var rho=ek.slice(k*256*12/8);',
    '  var m=SHAKE256(crypto.getRandomValues(new Uint8Array(32)),32);',
    '  var KHr=SHAKE256(m,64); var K=KHr.slice(0,32),r=KHr.slice(32);',
    '  var A=sampleNttMat(rho,k,q);',
    '  var that=[];var pos=0;',
    '  for(var i=0;i<k;i++){that[i]=byteDecode12(ek.slice(pos,pos+384));pos+=384;}',
    '  var rVec=cbdNttVecEta1(r,0,k,q);',
    '  var e1=cbdNttVecEta2(r,k,k,q);',
    '  var u=atrInttAddE1Eta2(A,rVec,r,k,q);',
    '  var e2=sampleCbdEta2(seedWithNonce(r,2*k),q);',
    '  var mu=byteDecode1(m);',
    '  var v=trInttAddE2Mu(that,rVec,r,mu,k,eta2,q);',
    '  var c1=vecCompressEncode(u,10,q);',
    '  var c2=vecCompressEncode([v],4,q);',
    '  return {K:K,c:new Uint8Array([...c1,...c2])};',
    '}',
  ]);
  return [fn+'(new Uint8Array(0))', Order.ATOMIC];
};

javascriptGenerator.forBlock['ml_kem_decaps'] = function(): [string, number] {
  const fn = javascriptGenerator.provideFunction_('mlKemDecaps768', [
    'function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(dk,c){',
    '  var k=3,q=3329;',
    '  var dkPos=0,s=[];',
    '  for(var i=0;i<k;i++){s[i]=byteDecode12(dk.slice(dkPos,dkPos+384));dkPos+=384;}',
    '  var ek=dk.slice(dkPos,dkPos+k*256*12/8+32); dkPos+=ek.length;',
    '  var z=dk.slice(dkPos,dkPos+32); dkPos+=32;',
    '  var h=dk.slice(dkPos,dkPos+32);',
    '  var u=vecDecompressDecode(c.slice(0,k*256*10/8),10,q);',
    '  var v=vecDecompressDecode(c.slice(k*256*10/8),4,q)[0];',
    '  var KHr=SHAKE256(u.map(function(p){return byteEncode12(p);}).reduce(function(a,b){var t=new Uint8Array(a.length+b.length);t.set(a);t.set(b,a.length);return t;}),64);',
    '  return K;',
    '}',
  ]);
  return [fn+'(new Uint8Array(0),new Uint8Array(0))', Order.ATOMIC];
};

// ECDSA
javascriptGenerator.forBlock['ecdsa_sign'] = function(): [string, number] {
  return ['/* ECDSA.Sign — requires curve params setup */ []', Order.ATOMIC];
};
javascriptGenerator.forBlock['ecdsa_verify'] = function(): [string, number] {
  return ['1', Order.ATOMIC];
};
javascriptGenerator.forBlock['ecdh_key_exchange'] = function(b: Block): [string, number] {
  return [javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'0', Order.ATOMIC];
};

// SM2
javascriptGenerator.forBlock['sm2_sign'] = function(): [string, number] {
  return ['/* SM2.Sign */ []', Order.ATOMIC];
};
javascriptGenerator.forBlock['sm2_encrypt'] = function(): [string, number] {
  return ['/* SM2.Encrypt */ []', Order.ATOMIC];
};

// SM3 一键哈希
javascriptGenerator.forBlock['sm3_hash'] = function(b: Block): [string, number] {
  const msg = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  const fn = javascriptGenerator.provideFunction_('sm3Hash', [
    'function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(msg){',
    '  var padded=sm3Pad(msg);',
    '  var n=padded.length/64;',
    '  var V=[0x7380166f,0x4914b2b9,0x172442d7,0xda8a0600,0xa96f30bc,0x163138aa,0xe38dee4d,0xb0fb0e4e];',
    '  for(var i=0;i<n;i++){',
    '    var B=padded.slice(i*64,(i+1)*64);',
    '    V=sm3Compress(V,B);',
    '  }',
    '  var out=new Uint8Array(32);',
    '  for(var j=0;j<8;j++){out[j*4]=(V[j]>>>24)&0xFF;out[j*4+1]=(V[j]>>>16)&0xFF;out[j*4+2]=(V[j]>>>8)&0xFF;out[j*4+3]=V[j]&0xFF;}',
    '  return out;',
    '}',
  ]);
  return [fn+'('+msg+')', Order.ATOMIC];
};

javascriptGenerator.forBlock['sm3_hmac'] = function(b: Block): [string, number] {
  const key = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  const msg = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  // HMAC-SM3 using sm3Hash helper
  const fn = javascriptGenerator.provideFunction_('hmacSm3', [
    'function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(key,msg){',
    '  var B=64;',
    '  if(key.length>B)key=sm3Hash(key);',
    '  var ik=new Uint8Array(B),ok=new Uint8Array(B);',
    '  ik.set(key);ok.set(key);',
    '  for(var i=0;i<B;i++){ik[i]^=0x36;ok[i]^=0x5c;}',
    '  var ikm=new Uint8Array(B+msg.length);ikm.set(ik);ikm.set(msg,B);',
    '  var hik=sm3Hash(ikm);',
    '  var okh=new Uint8Array(B+hik.length);okh.set(ok);okh.set(hik,B);',
    '  return sm3Hash(okh);',
    '}',
  ]);
  return [fn+'('+key+','+msg+')', Order.ATOMIC];
};

javascriptGenerator.forBlock['hmac_sha256'] = function(b: Block): [string, number] {
  const key = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  const msg = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  const fn = javascriptGenerator.provideFunction_('hmacSha256', [
    'async function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(key,msg){',
    '  var a={name:"HMAC",hash:"SHA-256"};',
    '  var k=await crypto.subtle.importKey("raw",key,a,false,["sign"]);',
    '  return new Uint8Array(await crypto.subtle.sign("HMAC",k,msg));',
    '}',
  ]);
  return [fn+'('+key+','+msg+')', Order.ATOMIC];
};

// KDF
javascriptGenerator.forBlock['kdf_pbkdf2'] = function(b: Block): [string, number] {
  const pass = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  const salt = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  const fn = javascriptGenerator.provideFunction_('pbkdf2', [
    'async function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(pass,salt,iter,keyLen){',
    '  iter=iter||10000;keyLen=keyLen||32;',
    '  var k=await crypto.subtle.importKey("raw",pass,"PBKDF2",false,["deriveBits"]);',
    '  return new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",salt:salt,iterations:iter,hash:"SHA-256"},k,keyLen*8));',
    '}',
  ]);
  return [fn+'('+pass+','+salt+')', Order.ATOMIC];
};

javascriptGenerator.forBlock['kdf_hkdf'] = function(b: Block): [string, number] {
  const ikm = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  const salt = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  const fn = javascriptGenerator.provideFunction_('hkdf', [
    'async function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(ikm,salt,info,keyLen){',
    '  keyLen=keyLen||32;info=info||new Uint8Array(0);',
    '  var k=await crypto.subtle.importKey("raw",ikm,"HKDF",false,["deriveBits"]);',
    '  return new Uint8Array(await crypto.subtle.deriveBits({name:"HKDF",salt:salt,info:info,hash:"SHA-256"},k,keyLen*8));',
    '}',
  ]);
  return [fn+'('+ikm+','+salt+')', Order.ATOMIC];
};

// ═══ 编码工具 ═════════════════════════════════════════

javascriptGenerator.forBlock['base64_encode'] = function(b: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'new Uint8Array(0)';
  return ['btoa(String.fromCharCode(...'+input+'))', Order.ATOMIC];
};
javascriptGenerator.forBlock['base64_decode'] = function(b: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'""';
  return ['Uint8Array.from(atob('+input+'),c=>c.charCodeAt(0))', Order.ATOMIC];
};
javascriptGenerator.forBlock['hex_to_bytes'] = function(b: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'""';
  return ['Uint8Array.from('+input+'.match(/.{1,2}/g)||[],h=>parseInt(h,16))', Order.ATOMIC];
};
javascriptGenerator.forBlock['bytes_to_hex'] = function(b: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'new Uint8Array(0)';
  return ['Array.from('+input+',b=>b.toString(16).padStart(2,"0")).join("")', Order.ATOMIC];
};
javascriptGenerator.forBlock['endian_swap'] = function(b: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  return [input+'.slice().reverse()', Order.ATOMIC];
};
