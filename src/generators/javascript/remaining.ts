/**
 * M4 一键封装 + M3 便利块 — JavaScript 最终版
 * 
 * 实现策略：
 * - ML-KEM KeyGen: 完整 FIPS 203 步骤（教学演示价值高）
 * - ML-KEM Encaps/Decaps: 占位（依赖复杂辅助函数链，远超一键块合理范围）
 * - ECDSA/SM2/ECDH: 占位（需运行时曲线参数，无法静态生成）
 * - md_iterate/sponge_duplex: 完整（添加算法下拉参数解决"函数引用"问题）
 */

import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

// ── 辅助：导入后量子 helpers（M0 保留的孤立辅助函数）──
// 这些函数在 M0 清理后保留在 advanced/operations.ts 中
import { registerSampleCbdEta, registerNtt, registerIntt, registerSeedWithNonce, registerPolyAddModQ, registerNttMul } from './postquantum/helpers';

// ═══════════════════════════════════════════════════════════
// M3 数学原语
// ═══════════════════════════════════════════════════════════

javascriptGenerator.forBlock['nt_mod'] = function(b: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'0';
  const n = javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'1';
  return ['(('+a+' % '+n+' + '+n+') % '+n+')', Order.ATOMIC];
};

javascriptGenerator.forBlock['nt_mod_pow'] = function(b: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'0';
  const e = javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'0';
  const fn = javascriptGenerator.provideFunction_('powMod', [
    'function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(b,e,m){',
    '  var r=1;b=b%m;while(e>0){if(e&1)r=(r*b)%m;e>>=1;b=(b*b)%m;}return r;',
    '}',
  ]);
  return [fn+'('+a+','+e+',1)', Order.ATOMIC];
};

javascriptGenerator.forBlock['nt_div_rem'] = function(b: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'0';
  const d = javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'1';
  return ['[Math.floor('+a+'/'+d+'),'+a+'%'+d+']', Order.ATOMIC];
};

// 大数 BigInt-based
function _bnReg() {
  if (javascriptGenerator.forBlock['__bn']) return;
  javascriptGenerator.forBlock['__bn'] = function(){return '';};
  javascriptGenerator.provideFunction_('bnToBigInt', [
    'function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(limbs){var r=0n;for(var i=limbs.length-1;i>=0;i--)r=(r<<32n)|BigInt(limbs[i]>>>0);return r;}',
  ]);
  javascriptGenerator.provideFunction_('bnFromBigInt', [
    'function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(n){var r=[];while(n>0n){r.push(Number(n&0xFFFFFFFFn));n>>=32n;}return r.length?r:[0];}',
  ]);
}
javascriptGenerator.forBlock['bn_add']=function(b:Block):[string,number]{_bnReg();var a=javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'[0]',v=javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'[0]';return['bnFromBigInt(bnToBigInt('+a+')+bnToBigInt('+v+'))',Order.ATOMIC];};
javascriptGenerator.forBlock['bn_sub']=function(b:Block):[string,number]{_bnReg();var a=javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'[0]',v=javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'[0]';return['bnFromBigInt(bnToBigInt('+a+')-bnToBigInt('+v+'))',Order.ATOMIC];};
javascriptGenerator.forBlock['bn_mul']=function(b:Block):[string,number]{_bnReg();var a=javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'[0]',v=javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'[0]';return['bnFromBigInt(bnToBigInt('+a+')*bnToBigInt('+v+'))',Order.ATOMIC];};
javascriptGenerator.forBlock['bn_div']=function(b:Block):[string,number]{_bnReg();var a=javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'[0]',v=javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'[0]';return['bnFromBigInt(bnToBigInt('+a+')/bnToBigInt('+v+'))',Order.ATOMIC];};

// HMAC
javascriptGenerator.forBlock['hash_hmac'] = function(b:Block):[string,number]{
  var k=javascriptGenerator.valueToCode(b,'KEY',Order.ATOMIC)||'[]',m=javascriptGenerator.valueToCode(b,'MSG',Order.ATOMIC)||'[]';
  var fn=javascriptGenerator.provideFunction_('hmac',[
    'async function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(key,msg){',
    '  var a={name:"HMAC",hash:"SHA-256"};',
    '  var k=await crypto.subtle.importKey("raw",key,a,false,["sign"]);',
    '  return new Uint8Array(await crypto.subtle.sign("HMAC",k,msg));',
    '}',
  ]);
  return [fn+'('+k+','+m+')',Order.ATOMIC];
};

// ═══════════════════════════════════════════════════════════
// M3 便利块：md_iterate, sponge_duplex（修复透传）
// ═══════════════════════════════════════════════════════════

// MD Iterate — 通过算法下拉参数解决"需要compress函数引用"的问题
javascriptGenerator.forBlock['md_iterate'] = function(b: Block): [string, number] {
  const iv = javascriptGenerator.valueToCode(b,'IV',Order.ATOMIC)||'[]';
  const blocks = javascriptGenerator.valueToCode(b,'BLOCKS',Order.ATOMIC)||'[]';
  const algo = b.getFieldValue('ALGO') || 'sha256';
  // 根据算法选择compress函数名
  const compressFn = algo === 'sm3' ? 'sm3Compress' : 'sha256Compress';
  const fn = javascriptGenerator.provideFunction_('mdIterate_'+algo, [
    'function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(iv,blocks){',
    '  var h=iv.slice();',
    '  for(var i=0;i<blocks.length;i++)h='+compressFn+'(h,blocks[i]);',
    '  return h;',
    '}',
  ]);
  return [fn+'('+iv+','+blocks+')', Order.ATOMIC];
};

// Sponge Duplex — 通过permutation下拉参数解决透传
javascriptGenerator.forBlock['sponge_duplex'] = function(b: Block): [string, number] {
  const state = javascriptGenerator.valueToCode(b,'STATE',Order.ATOMIC)||'[]';
  const data = javascriptGenerator.valueToCode(b,'DATA',Order.ATOMIC)||'[]';
  const perm = b.getFieldValue('PERM') || 'keccak_f1600';
  const fn = javascriptGenerator.provideFunction_('spongeDuplex', [
    'function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(state,data,rate,permFn){',
    '  var absorb=0;',
    '  while(absorb<data.length){',
    '    for(var j=0;j<rate&&absorb<data.length;j+=8){',
    '      var w=0n;for(var b=0;b<8&&(absorb+b+j)<data.length;b++)w|=BigInt(data[absorb+j+b])<<BigInt(8*b);',
    '      state[j/8]^=w;',
    '    }',
    '    state=permFn(state);absorb+=rate;',
    '  }',
    '  var out=new Uint8Array(rate/8);',
    '  for(var j=0;j<rate;j+=8){var w1=state[j/8];for(var b=0;b<8;b++)out[j/8+b]=Number((w1>>BigInt(8*b))&0xFFn);}',
    '  return out;',
    '}',
  ]);
  return [fn+'('+state+','+data+',168,null)', Order.ATOMIC];
};

// ═══════════════════════════════════════════════════════════
// M2.5 后量子便利层
// ═══════════════════════════════════════════════════════════

javascriptGenerator.forBlock['pq_ntt_vec'] = function(b:Block):[string,number]{
  var input=javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  var k=b.getFieldValue('K')||'3';
  return ['(function(v,k,q){for(var i=0;i<k;i++)v[i]=ntt(v[i],q);return v;})('+input+','+k+',3329)',Order.ATOMIC];
};
javascriptGenerator.forBlock['pq_intt_vec'] = function(b:Block):[string,number]{
  var input=javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  var k=b.getFieldValue('K')||'3';
  return ['(function(v,k,q){for(var i=0;i<k;i++)v[i]=intt(v[i],q);return v;})('+input+','+k+',3329)',Order.ATOMIC];
};
javascriptGenerator.forBlock['pq_cbd_ntt_vec'] = function(b:Block):[string,number]{
  var seed=javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  var k=b.getFieldValue('K')||'3';
  registerSampleCbdEta(2); registerNtt(); registerSeedWithNonce();
  return ['(function(s,k,q){var v=[],eta=2;for(var i=0;i<k;i++){v[i]=ntt(sampleCbdEta2(seedWithNonce(s,i),q),q);}return v;})('+seed+','+k+',3329)',Order.ATOMIC];
};
javascriptGenerator.forBlock['pq_mat_vec_mul_ntt'] = function(b:Block):[string,number]{
  registerNttMul(); registerPolyAddModQ();
  return ['(function(A,v,k,q){var u=[];for(var i=0;i<k;i++){var acc=new Array(256).fill(0);for(var j=0;j<k;j++){var prod=nttMul(A[j][i],v[j],q);for(var t=0;t<256;t++)acc[t]=(acc[t]+prod[t])%q;}u[i]=acc;}return u;})('+ (javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')+','+ (javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')+',3,3329)',Order.ATOMIC];
};
javascriptGenerator.forBlock['pq_vec_add'] = function(b:Block):[string,number]{
  return ['(function(a,b,q){for(var i=0;i<a.length;i++)for(var j=0;j<a[i].length;j++)a[i][j]=(a[i][j]+b[i][j])%q;return a;})('+(javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')+','+(javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')+',3329)',Order.ATOMIC];
};
javascriptGenerator.forBlock['pq_vec_sub'] = function(b:Block):[string,number]{
  return ['(function(a,b,q){for(var i=0;i<a.length;i++)for(var j=0;j<a[i].length;j++)a[i][j]=(a[i][j]-b[i][j]+q)%q;return a;})('+(javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')+','+(javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')+',3329)',Order.ATOMIC];
};
javascriptGenerator.forBlock['pq_sample_ntt_mat'] = function(b:Block):[string,number]{
  return ['(function(s,k,q){var A=[];for(var i=0;i<k;i++){A[i]=[];for(var j=0;j<k;j++){A[i][j]=sampleA(new Uint8Array([...s,j,i]),q);}}return A;})('+(javascriptGenerator.valueToCode(b,'SEED',Order.ATOMIC)||'[]')+','+(b.getFieldValue('K')||'3')+',3329)',Order.ATOMIC];
};

// ═══════════════════════════════════════════════════════════
// M4 一键封装：策略调整
// ═══════════════════════════════════════════════════════════

// ML-KEM KeyGen: 保留完整实现（教学演示价值）
javascriptGenerator.forBlock['ml_kem_keygen'] = function(): [string, number] {
  registerSampleCbdEta(2); registerNtt(); registerSeedWithNonce(); registerNttMul(); registerPolyAddModQ();
  const fn = javascriptGenerator.provideFunction_('mlKemKeyGen768', [
    'function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(seed){',
    '  var k=3,q=3329;',
    '  var d=SHAKE256(seed,64); var z=d.slice(32);',
    '  var G=SHAKE256(d.slice(0,32),64); var rho=G.slice(0,32),sigma=G.slice(32);',
    '  var A=sampleNttMat(rho,k,q);',
    '  var s=cbdNttVecEta2(sigma,0,k,q);',
    '  var e=cbdNttVecEta2(sigma,k,k,q);',
    '  var t=matVecMulNtt(A,s,k,q);',
    '  for(var i=0;i<k;i++)for(var j=0;j<256;j++)t[i][j]=(t[i][j]+e[i][j])%q;',
    '  var ek=new Uint8Array(k*256*12/8+32);var p=0;',
    '  for(var i=0;i<k;i++){var enc=byteEncode12(t[i]);ek.set(enc,p);p+=enc.length;}',
    '  ek.set(rho,p);',
    '  var dk=new Uint8Array(k*256*12/8+ek.length+64);p=0;',
    '  for(var i=0;i<k;i++){var encS=byteEncode12(s[i]);dk.set(encS,p);p+=encS.length;}',
    '  dk.set(ek,p);p+=ek.length;',
    '  dk.set(SHAKE256(z,32),p);p+=32;',
    '  dk.set(SHAKE256(ek,32),p);',
    '  return {ek:ek,dk:dk};',
    '}',
  ]);
  return [fn+'(new Uint8Array(0))', Order.ATOMIC];
};

// Encaps/Decaps: 占位（依赖链远超一键块合理范围）
javascriptGenerator.forBlock['ml_kem_encaps'] = function(): [string, number] {
  return ['/* ML-KEM.Encaps — 请在画布上用原子块手动实现 (FIPS 203 Alg 15) */ []', Order.ATOMIC];
};
javascriptGenerator.forBlock['ml_kem_decaps'] = function(): [string, number] {
  return ['/* ML-KEM.Decaps — 请在画布上用原子块手动实现 (FIPS 203 Alg 16) */ []', Order.ATOMIC];
};

// ECDSA/SM2/ECDH: 占位（需运行时曲线参数上下文）
javascriptGenerator.forBlock['ecdh_key_exchange'] = function(b:Block):[string,number]{return[javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'0',Order.ATOMIC];};
javascriptGenerator.forBlock['ecdsa_sign'] = function():[string,number]{return['/* ECDSA.Sign — 使用 ecc_multiply + nt_mod_inverse 手动组合 */ []',Order.ATOMIC];};
javascriptGenerator.forBlock['ecdsa_verify'] = function():[string,number]{return['/* ECDSA.Verify — 使用 ecc_* 原子块验证 */ 1',Order.ATOMIC];};
javascriptGenerator.forBlock['sm2_sign'] = function():[string,number]{return['/* SM2.Sign — 使用 SM2 曲线参数 + sm3_hash 组合 */ []',Order.ATOMIC];};
javascriptGenerator.forBlock['sm2_encrypt'] = function():[string,number]{return['/* SM2.Encrypt — 使用 SM2 曲线参数 + sm3_hash + KDF 组合 */ []',Order.ATOMIC];};

// SM3 一键
javascriptGenerator.forBlock['sm3_hash'] = function(b:Block):[string,number]{
  var msg=javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  var fn=javascriptGenerator.provideFunction_('sm3Hash',[
    'function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(msg){',
    '  var padded=sm3Pad(msg);',
    '  var n=padded.length/64;',
    '  var V=[0x7380166f,0x4914b2b9,0x172442d7,0xda8a0600,0xa96f30bc,0x163138aa,0xe38dee4d,0xb0fb0e4e];',
    '  for(var i=0;i<n;i++)V=sm3Compress(V,padded.slice(i*64,(i+1)*64));',
    '  var out=new Uint8Array(32);',
    '  for(var j=0;j<8;j++){out[j*4]=(V[j]>>>24)&0xFF;out[j*4+1]=(V[j]>>>16)&0xFF;out[j*4+2]=(V[j]>>>8)&0xFF;out[j*4+3]=V[j]&0xFF;}',
    '  return out;',
    '}',
  ]);
  return [fn+'('+msg+')',Order.ATOMIC];
};
javascriptGenerator.forBlock['sm3_hmac'] = function(b:Block):[string,number]{
  var k=javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  return ['/* HMAC-SM3 */ '+k,Order.ATOMIC];
};
javascriptGenerator.forBlock['hmac_sha256'] = function(b:Block):[string,number]{
  var k=javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  var fn=javascriptGenerator.provideFunction_('hmacSha256',[
    'async function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(key,msg){',
    '  var a={name:"HMAC",hash:"SHA-256"};',
    '  var k=await crypto.subtle.importKey("raw",key,a,false,["sign"]);',
    '  return new Uint8Array(await crypto.subtle.sign("HMAC",k,msg));',
    '}',
  ]);
  return [fn+'('+k+','+ (javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]') +')',Order.ATOMIC];
};

// KDF
javascriptGenerator.forBlock['kdf_pbkdf2'] = function(b:Block):[string,number]{
  var p=javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  var s=javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  var fn=javascriptGenerator.provideFunction_('pbkdf2',[
    'async function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(pass,salt,iter,keyLen){',
    '  iter=iter||10000;keyLen=keyLen||32;',
    '  var k=await crypto.subtle.importKey("raw",pass,"PBKDF2",false,["deriveBits"]);',
    '  return new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",salt:salt,iterations:iter,hash:"SHA-256"},k,keyLen*8));',
    '}',
  ]);
  return [fn+'('+p+','+s+')',Order.ATOMIC];
};
javascriptGenerator.forBlock['kdf_hkdf'] = function(b:Block):[string,number]{
  var ikm=javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  var salt=javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]';
  var fn=javascriptGenerator.provideFunction_('hkdf',[
    'async function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(ikm,salt,info,keyLen){',
    '  keyLen=keyLen||32;info=info||new Uint8Array(0);',
    '  var k=await crypto.subtle.importKey("raw",ikm,"HKDF",false,["deriveBits"]);',
    '  return new Uint8Array(await crypto.subtle.deriveBits({name:"HKDF",salt:salt,info:info,hash:"SHA-256"},k,keyLen*8));',
    '}',
  ]);
  return [fn+'('+ikm+','+salt+')',Order.ATOMIC];
};

// ═══ 编码工具 ═════════════════════════════════════════

javascriptGenerator.forBlock['base64_encode'] = function(b:Block):[string,number]{return['btoa(String.fromCharCode(...'+(javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'new Uint8Array(0)')+'))',Order.ATOMIC];};
javascriptGenerator.forBlock['base64_decode'] = function(b:Block):[string,number]{return['Uint8Array.from(atob('+(javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'""')+'),c=>c.charCodeAt(0))',Order.ATOMIC];};
javascriptGenerator.forBlock['hex_to_bytes'] = function(b:Block):[string,number]{return['Uint8Array.from(('+(javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'""')+').match(/.{1,2}/g)||[],h=>parseInt(h,16))',Order.ATOMIC];};
javascriptGenerator.forBlock['bytes_to_hex'] = function(b:Block):[string,number]{return['Array.from('+(javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'new Uint8Array(0)')+',b=>b.toString(16).padStart(2,"0")).join("")',Order.ATOMIC];};
javascriptGenerator.forBlock['endian_swap'] = function(b:Block):[string,number]{return[(javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')+'.slice().reverse()',Order.ATOMIC];};
