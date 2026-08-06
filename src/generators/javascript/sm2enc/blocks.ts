/**
 * SM2 公钥加密原子块 JavaScript 代码生成器
 * GB/T 32918.4-2016（附录 A 示例 2，Fp-256 测试曲线）
 *
 * 内嵌全套（一次 provideFunction_ 注册去重）：
 *   sm3Hash —— 与 sm2sig 生成器同体（GB/T 32905）
 *   sm2Params/sm2ToBig/sm2BigToBytes/sm2Mod/sm2ModInverse/
 *   sm2PointDouble/sm2PointAdd/sm2PointMul —— Fp-256 点运算（BigInt）
 *   sm2Kdf  —— GB/T 32918.3 SM3-KDF（ct 4 字节大端计数，从 1 起）
 *   sm2Encrypt —— C1 = 04‖x1‖y1，C2 = M⊕KDF(x2‖y2,klen)，C3 = SM3(x2‖M‖y2)，
 *                 输出 C1‖C3‖C2 hex 字符串
 *   sm2Decrypt —— [d]C1 还原 x2,y2，M' = C2⊕t，校验 C3 后输出明文字节数组
 * 全部 BigInt。官方向量（附录 A 示例 2）C1C3C2 精确匹配。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

/** SM2 加密全套内嵌函数（sm2Encrypt/sm2Decrypt 均在模块作用域，driver 可直接调用） */
function registerSm2Enc(): string {
  return javascriptGenerator.provideFunction_('sm2Encrypt', [
    '// SM3 (GB/T 32905, same body as sm2sig generator)',
    'function sm3Hash(input){',
    '  if (typeof input==="string") input=new TextEncoder().encode(input);',
    '  else if (Array.isArray(input)) input=Uint8Array.from(input);',
    '  var IV=[0x7380166f,0x4914b2b9,0x172442d7,0xda8a0600,0xa96f30bc,0x163138aa,0xe38dee4d,0xb0fb0e4e];',
    '  var P0=function(x){return x^((x<<9)|(x>>>23))^((x<<17)|(x>>>15));};',
    '  var P1=function(x){return x^((x<<15)|(x>>>17))^((x<<23)|(x>>>9));};',
    '  var FF0=function(x,y,z){return x^y^z;},FF1=function(x,y,z){return (x&y)|(x&z)|(y&z);};',
    '  var GG0=function(x,y,z){return x^y^z;},GG1=function(x,y,z){return (x&y)|(~x&z);};',
    '  var T=[0x79cc4519,0x7a879d8a];',
    '  var mLen=input.length,mLenBits=mLen*8;',
    '  var kk=(448-mLenBits-1)%512; if(kk<0)kk+=512;',
    '  var padded=new Uint8Array(mLen+1+Math.floor(kk/8)+8);',
    '  padded.set(input); padded[mLen]=0x80;',
    '  // 512 位长度字段 8 字节大端（Math.floor 防 >>> 位移回绕）',
    '  for(var i=0;i<8;i++) padded[padded.length-1-i]=Math.floor(mLenBits/Math.pow(2,8*i))&0xFF;',
    '  var V=IV.slice();',
    '  for(var off=0;off<padded.length;off+=64){',
    '    var B=new Array(16);',
    '    for(var j=0;j<16;j++){var bj=off+j*4;B[j]=((padded[bj]<<24)|(padded[bj+1]<<16)|(padded[bj+2]<<8)|padded[bj+3])>>>0;}',
    '    var W=new Array(68);',
    '    for(var j=0;j<16;j++) W[j]=B[j];',
    '    for(var j=16;j<68;j++) W[j]=(P1(W[j-16]^W[j-9]^((W[j-3]<<15)|(W[j-3]>>>17)))^((W[j-13]<<7)|(W[j-13]>>>25))^W[j-6])>>>0;',
    '    var A=V[0],B2=V[1],C=V[2],D=V[3],E=V[4],F=V[5],G=V[6],H=V[7];',
    '    for(var j=0;j<64;j++){',
    '      var SS1=(((A<<12)|(A>>>20))+E+((T[j<16?0:1]<<j)|(T[j<16?0:1]>>>(32-j))))>>>0;',
    '      SS1=((SS1<<7)|(SS1>>>25))>>>0;',
    '      var SS2=(SS1^((A<<12)|(A>>>20)))>>>0;',
    '      var W1=(W[j]^W[j+4])>>>0;',
    '      var TT1,TT2;',
    '      if(j<16){TT1=(FF0(A,B2,C)+D+SS2+W1)>>>0;TT2=(GG0(E,F,G)+H+SS1+W[j])>>>0;}',
    '      else{TT1=(FF1(A,B2,C)+D+SS2+W1)>>>0;TT2=(GG1(E,F,G)+H+SS1+W[j])>>>0;}',
    '      D=C;C=((B2<<9)|(B2>>>23))>>>0;B2=A;A=TT1>>>0;H=G;',
    '      G=((F<<19)|(F>>>13))>>>0;F=E;E=P0(TT2)>>>0;',
    '    }',
    '    V=[(A^V[0])>>>0,(B2^V[1])>>>0,(C^V[2])>>>0,(D^V[3])>>>0,(E^V[4])>>>0,(F^V[5])>>>0,(G^V[6])>>>0,(H^V[7])>>>0];',
    '  }',
    '  var out=[];',
    '  for(var i=0;i<8;i++) out.push((V[i]>>>24)&0xFF,(V[i]>>>16)&0xFF,(V[i]>>>8)&0xFF,V[i]&0xFF);',
    '  return out;',
    '}',
    '',
    '// ── SM2 Fp-256 测试曲线（GB/T 32918.4-2016 附录 A 示例 2）──',
    'function sm2Params() {',
    '  return {',
    '    p: BigInt("0x8542d69e4c044f18e8b92435bf6ff7de457283915c45517d722edb8b08f1dfc3"),',
    '    a: BigInt("0x787968b4fa32c3fd2417842e73bbfeff2f3c848b6831d7e0ec65228b3937e498"),',
    '    b: BigInt("0x63e4c6d3b23b0c849cf84241484bfe48f61d59a5b16ba06e6e12d1da27c5249a"),',
    '    n: BigInt("0x8542d69e4c044f18e8b92435bf6ff7dd297720630485628d5ae74ee7c32e79b7"),',
    '    gx: BigInt("0x421debd61b62eab6746434ebc3cc315e32220b3badd50bdc4c4e6c147fedd43d"),',
    '    gy: BigInt("0x0680512bcbb42c07d47349d2153b70c4e5d7fdfcbfa36ea1a85841b9e46e09a2")',
    '  };',
    '}',
    '',
    'function sm2ToBig(v) {',
    '  if (typeof v==="bigint") return v;',
    '  if (typeof v==="string") return BigInt("0x"+v.replace(/^0x/,""));',
    '  var r=0n;',
    '  for (var i=0;i<v.length;i++) r=(r<<8n)|BigInt(v[i]);',
    '  return r;',
    '}',
    '',
    'function sm2BigToBytes(x,len) {',
    '  var out=new Array(len);',
    '  for (var i=0;i<len;i++) out[len-1-i]=Number((x>>BigInt(8*i))&0xFFn);',
    '  return out;',
    '}',
    '',
    'function sm2Mod(a,m) { return ((a%m)+m)%m; }',
    '',
    '// BigInt 扩展欧几里得模逆',
    'function sm2ModInverse(a,m) {',
    '  a=sm2Mod(a,m);',
    '  var old_r=a,r=m,old_s=1n,s=0n,q,tmp;',
    '  while (r!==0n) {',
    '    q=old_r/r;',
    '    tmp=r; r=old_r-q*r; old_r=tmp;',
    '    tmp=s; s=old_s-q*s; old_s=tmp;',
    '  }',
    '  return sm2Mod(old_s,m);',
    '}',
    '',
    'function sm2PointDouble(P) {',
    '  var C=sm2Params();',
    '  if (P===null||P.y===0n) return null;',
    '  var lam=sm2Mod((3n*P.x*P.x+C.a)*sm2ModInverse(2n*P.y,C.p),C.p);',
    '  var x3=sm2Mod(lam*lam-2n*P.x,C.p);',
    '  var y3=sm2Mod(lam*(P.x-x3)-P.y,C.p);',
    '  return {x:x3,y:y3};',
    '}',
    '',
    'function sm2PointAdd(P,Q) {',
    '  var C=sm2Params();',
    '  if (P===null) return Q;',
    '  if (Q===null) return P;',
    '  if (P.x===Q.x) {',
    '    if (sm2Mod(P.y+Q.y,C.p)===0n) return null;',
    '    return sm2PointDouble(P);',
    '  }',
    '  var lam=sm2Mod((Q.y-P.y)*sm2ModInverse(sm2Mod(Q.x-P.x,C.p),C.p),C.p);',
    '  var x3=sm2Mod(lam*lam-P.x-Q.x,C.p);',
    '  var y3=sm2Mod(lam*(P.x-x3)-P.y,C.p);',
    '  return {x:x3,y:y3};',
    '}',
    '',
    'function sm2PointMul(k,P) {',
    '  var R=null,Q=P;',
    '  while (k>0n) {',
    '    if (k&1n) R=sm2PointAdd(R,Q);',
    '    Q=sm2PointDouble(Q);',
    '    k>>=1n;',
    '  }',
    '  return R;',
    '}',
    '',
    '// GB/T 32918.3 SM3-KDF：t = H(Z‖00000001) ‖ H(Z‖00000002) ‖ ... 截断到 klen 位',
    'function sm2Kdf(z,klen) {',
    '  var out=[],ct=1;',
    '  while (out.length*8<klen) {',
    '    var ctr=[(ct>>>24)&0xFF,(ct>>>16)&0xFF,(ct>>>8)&0xFF,ct&0xFF];',
    '    out=out.concat(sm3Hash(z.concat(ctr)));',
    '    ct++;',
    '  }',
    '  var nbytes=Math.ceil(klen/8);',
    '  out=out.slice(0,nbytes);',
    '  if (klen%8) out[nbytes-1]&=(0xFF<<(8-klen%8))&0xFF;',
    '  return out;',
    '}',
    '',
    '// -- main entry (provideFunction_ registry name = sm2Encrypt) --',
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(msg,px,py,k) {',
    '  var C=sm2Params();',
    '  var kk=sm2ToBig(k);',
    '  if (kk<=0n||kk>=C.n) throw new Error("SM2: k out of range [1, n-1]");',
    '  var M;',
    '  if (typeof msg==="string") M=Array.from(new TextEncoder().encode(msg));',
    '  else M=Array.from(msg);',
    '  var klen=M.length*8;',
    '  var pt=sm2PointMul(kk,{x:C.gx,y:C.gy});',
    '  var c1=[0x04].concat(sm2BigToBytes(pt.x,32),sm2BigToBytes(pt.y,32));',
    '  var q=sm2PointMul(kk,{x:sm2ToBig(px),y:sm2ToBig(py)});',
    '  var x2b=sm2BigToBytes(q.x,32),y2b=sm2BigToBytes(q.y,32);',
    '  var t=sm2Kdf(x2b.concat(y2b),klen);',
    '  var allZero=true;',
    '  for (var i=0;i<t.length;i++) { if (t[i]!==0) { allZero=false; break; } }',
    '  if (allZero) throw new Error("SM2: KDF output all-zero, retry with new k");',
    '  var c2=new Array(M.length);',
    '  for (var i=0;i<M.length;i++) c2[i]=M[i]^t[i];',
    '  var c3=sm3Hash(x2b.concat(M,y2b));',
    '  var ct=c1.concat(c3,c2);',
    '  var hex="";',
    '  for (var i=0;i<ct.length;i++) hex+=ct[i].toString(16).padStart(2,"0");',
    '  return hex;',
    '}',
    '',
    'function sm2Decrypt(ct,d) {',
    '  var C=sm2Params();',
    '  var dd=sm2ToBig(d);',
    '  if (dd<=0n||dd>=C.n) throw new Error("SM2: invalid private key");',
    '  var bytes;',
    '  if (typeof ct==="string") {',
    '    bytes=[];',
    '    for (var i=0;i<ct.length;i+=2) bytes.push(parseInt(ct.substr(i,2),16));',
    '  } else bytes=Array.from(ct);',
    '  if (bytes.length<98) throw new Error("SM2: ciphertext too short");',
    '  if (bytes[0]!==0x04) throw new Error("SM2: unsupported C1 encoding");',
    '  var c1=bytes.slice(0,65),c3=bytes.slice(65,97),c2=bytes.slice(97);',
    '  var q=sm2PointMul(dd,{x:sm2ToBig(c1.slice(1,33)),y:sm2ToBig(c1.slice(33,65))});',
    '  var x2b=sm2BigToBytes(q.x,32),y2b=sm2BigToBytes(q.y,32);',
    '  var t=sm2Kdf(x2b.concat(y2b),c2.length*8);',
    '  var m2=new Array(c2.length);',
    '  for (var i=0;i<c2.length;i++) m2[i]=c2[i]^t[i];',
    '  var u=sm3Hash(x2b.concat(m2,y2b));',
    '  var ok=true;',
    '  for (var i=0;i<32;i++) { if (u[i]!==c3[i]) { ok=false; break; } }',
    '  if (!ok) throw new Error("SM2: C3 mismatch (ciphertext tampered)");',
    '  return m2;',
    '}',
    '',
    'function sm2KeyExchange(dB, rB, pax, pay, RA, RBP, ZA, ZB, klen) {',
    '  // GB/T 32918.3-2016 §6.2 B 侧（B1-B9）',
    '  var C=sm2Params();',
    '  var db=sm2ToBig(dB), rb=sm2ToBig(rB);',
    '  var hexToBytes=function(h){var b=[];for(var i=0;i<h.length;i+=2)b.push(parseInt(h.substr(i,2),16));return b;};',
    '  var RAp={x:sm2ToBig(hexToBytes(RA).slice(1,33)),y:sm2ToBig(hexToBytes(RA).slice(33,65))};',
    '  var Rbp={x:sm2ToBig(hexToBytes(RBP).slice(1,33)),y:sm2ToBig(hexToBytes(RBP).slice(33,65))};',
    '  var PA={x:sm2ToBig(pax),y:sm2ToBig(pay)};',
    '  // w = ceil(ceil(log2 n)/2) - 1；x̄ = 2^w + (x & (2^w - 1))',
    '  var w=Math.ceil((C.n.toString(2).length-1)/2)-1;',
    '  var xb1=2n**BigInt(w)+(RAp.x&(2n**BigInt(w)-1n));',
    '  var xb2=2n**BigInt(w)+(Rbp.x&(2n**BigInt(w)-1n));',
    '  var tb=(db+xb2*rb)%C.n;',
    '  var sum=sm2PointAdd(PA,sm2PointMul(xb1,RAp));',
    '  var V=sm2PointMul(tb,sum);',
    '  if (V.x===0n&&V.y===0n) throw new Error("SM2-KEX: V at infinity");',
    '  var xVb=sm2BigToBytes(V.x,32),yVb=sm2BigToBytes(V.y,32);',
    '  var ZAb=hexToBytes(ZA),ZBb=hexToBytes(ZB);',
    '  var K=sm2Kdf(xVb.concat(yVb,ZAb,ZBb),klen);',
    '  var hex="";',
    '  for (var i=0;i<K.length;i++) hex+=K[i].toString(16).padStart(2,"0");',
    '  return hex;',
    '}',
    '',
  ]);
}

javascriptGenerator.forBlock['sm2_encrypt'] = function (block: Block): [string, number] {
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const px = javascriptGenerator.valueToCode(block, 'PX', Order.ATOMIC) || '""';
  const py = javascriptGenerator.valueToCode(block, 'PY', Order.ATOMIC) || '""';
  const k = javascriptGenerator.valueToCode(block, 'K', Order.ATOMIC) || '""';
  registerSm2Enc();
  return ['sm2Encrypt(' + msg + ', ' + px + ', ' + py + ', ' + k + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['sm2_decrypt'] = function (block: Block): [string, number] {
  const ct = javascriptGenerator.valueToCode(block, 'CT', Order.ATOMIC) || '\"\"';
  const da = javascriptGenerator.valueToCode(block, 'DA', Order.ATOMIC) || '\"\"';
  registerSm2Enc();
  return ['sm2Decrypt(' + ct + ', ' + da + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['sm2_key_exchange'] = function (block: Block): [string, number] {
  const db = javascriptGenerator.valueToCode(block, 'DB', Order.ATOMIC) || '\"\"';
  const rb = javascriptGenerator.valueToCode(block, 'RBVAL', Order.ATOMIC) || '\"\"';
  const pax = javascriptGenerator.valueToCode(block, 'PAX', Order.ATOMIC) || '\"\"';
  const pay = javascriptGenerator.valueToCode(block, 'PAY', Order.ATOMIC) || '\"\"';
  const ra = javascriptGenerator.valueToCode(block, 'RA', Order.ATOMIC) || '\"\"';
  const rbp = javascriptGenerator.valueToCode(block, 'RBP', Order.ATOMIC) || '\"\"';
  const za = javascriptGenerator.valueToCode(block, 'ZA', Order.ATOMIC) || '\"\"';
  const zb = javascriptGenerator.valueToCode(block, 'ZB', Order.ATOMIC) || '\"\"';
  const wlen = javascriptGenerator.valueToCode(block, 'WLEN', Order.ATOMIC) || '128';
  registerSm2Enc();
  return [
    'sm2KeyExchange(' + db + ', ' + rb + ', ' + pax + ', ' + pay + ', ' + ra + ', ' + rbp + ', ' + za + ', ' + zb + ', ' + wlen + ')',
    Order.ATOMIC,
  ];
};
