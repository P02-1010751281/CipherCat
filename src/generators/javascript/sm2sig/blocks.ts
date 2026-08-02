/**
 * SM2 数字签名原子块 JavaScript 代码生成器
 * GB/T 32918.2-2016（附录 A 示例 1，Fp-256 测试曲线）
 *
 * 内嵌全套（一次 provideFunction_ 注册去重）：
 *   sm3Hash —— 与 remaining.ts hash_hmac SM3 分支同体（GB/T 32905）
 *   sm2Za   —— ZA = SM3(ENTLA ‖ IDA ‖ a ‖ b ‖ Gx ‖ Gy ‖ PAx ‖ PAy)
 *   sm2Sign —— e = SM3(ZA ‖ M)；r/s 公式；输出 r‖s 各 32 字节大端
 *   sm2Verify —— t = (r+s) mod n，[s]G + [t]PA，R = (e + x0') mod n == r
 * 全部 BigInt。官方向量 ZA/e/r/s 全 PASS（与 /tmp/vectors/sm2_sig.json 一致）。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

/** SM2 全套内嵌函数（sm3Hash/sm2Za/sm2Sign/sm2Verify 均在模块作用域，driver 可直接调用） */
function registerSm2(): string {
  return javascriptGenerator.provideFunction_('sm2Sign', [
    // ── SM3（GB/T 32905，与 remaining.ts hash_hmac SM3 分支完全同体）──
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
    '// ── SM2 Fp-256 测试曲线（GB/T 32918.2-2016 附录 A 示例 1）──',
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
    '// ZA = SM3(ENTLA ‖ IDA ‖ a ‖ b ‖ Gx ‖ Gy ‖ PAx ‖ PAy)，ENTLA = IDA 比特长度 2 字节大端',
    'function sm2Za(ida,pax,pay) {',
    '  var C=sm2Params();',
    '  var idaBytes=(typeof ida==="string")?new TextEncoder().encode(ida):Array.from(ida);',
    '  var entla=idaBytes.length*8;',
    '  var z=[Math.floor(entla/256)&0xFF,entla&0xFF];',
    '  z=z.concat(Array.from(idaBytes));',
    '  z=z.concat(sm2BigToBytes(C.a,32),sm2BigToBytes(C.b,32),sm2BigToBytes(C.gx,32),sm2BigToBytes(C.gy,32));',
    '  z=z.concat(sm2BigToBytes(sm2ToBig(pax),32),sm2BigToBytes(sm2ToBig(pay),32));',
    '  return sm3Hash(z);',
    '}',
    '',
    // ── 主入口（provideFunction_ 注册名 = sm2Sign）──
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(da,ida,msg,k) {',
    '  var C=sm2Params();',
    '  var d=sm2ToBig(da);',
    '  if (d<=0n||d>=C.n) throw new Error("SM2: invalid private key");',
    '  var PA=sm2PointMul(d,{x:C.gx,y:C.gy});',
    '  var za=sm2Za(ida,PA.x,PA.y);',
    '  var e=sm2ToBig(sm3Hash(za.concat(Array.from(msg))));',
    '  var kk;',
    '  if (k===undefined||k===null||k===""||(typeof k==="string"&&k.length===0)) {',
    '    var rnd=new Uint8Array(32);',
    '    crypto.getRandomValues(rnd);',
    '    kk=sm2ToBig(Array.from(rnd));',
    '  } else {',
    '    kk=sm2ToBig(k);',
    '  }',
    '  kk=sm2Mod(kk,C.n);',
    '  if (kk===0n) kk=1n;',
    '  var x1=sm2PointMul(kk,{x:C.gx,y:C.gy});',
    '  var r=sm2Mod(e+x1.x,C.n);',
    '  var s=sm2Mod(sm2ModInverse(sm2Mod(1n+d,C.n),C.n)*sm2Mod(kk-r*d,C.n),C.n);',
    '  if (r===0n||r+kk===C.n||s===0n) throw new Error("SM2: retry (r or s invalid)");',
    '  return sm2BigToBytes(r,32).concat(sm2BigToBytes(s,32));',
    '}',
    '',
    'function sm2Verify(pax,pay,ida,msg,r,s) {',
    '  var C=sm2Params();',
    '  var rr=sm2Mod(sm2ToBig(r),C.n),ss=sm2Mod(sm2ToBig(s),C.n);',
    '  if (rr===0n||rr>=C.n||ss===0n||ss>=C.n) return false;',
    '  var t=sm2Mod(rr+ss,C.n);',
    '  if (t===0n) return false;',
    '  var za=sm2Za(ida,pax,pay);',
    '  var e=sm2ToBig(sm3Hash(za.concat(Array.from(msg))));',
    '  var G={x:C.gx,y:C.gy};',
    '  var PA={x:sm2ToBig(pax),y:sm2ToBig(pay)};',
    '  var pt=sm2PointAdd(sm2PointMul(ss,G),sm2PointMul(t,PA));',
    '  if (pt===null) return false;',
    '  return sm2Mod(e+pt.x,C.n)===rr;',
    '}',
  ]);
}

javascriptGenerator.forBlock['sm2_sign'] = function (block: Block): [string, number] {
  const da = javascriptGenerator.valueToCode(block, 'DA', Order.ATOMIC) || '""';
  const ida = javascriptGenerator.valueToCode(block, 'IDA', Order.ATOMIC) || '""';
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const k = javascriptGenerator.valueToCode(block, 'K', Order.ATOMIC) || '""';
  registerSm2();
  return ['sm2Sign(' + da + ', ' + ida + ', ' + msg + ', ' + k + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['sm2_verify'] = function (block: Block): [string, number] {
  const pax = javascriptGenerator.valueToCode(block, 'PAX', Order.ATOMIC) || '""';
  const pay = javascriptGenerator.valueToCode(block, 'PAY', Order.ATOMIC) || '""';
  const ida = javascriptGenerator.valueToCode(block, 'IDA', Order.ATOMIC) || '""';
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const r = javascriptGenerator.valueToCode(block, 'R', Order.ATOMIC) || '""';
  const s = javascriptGenerator.valueToCode(block, 'S', Order.ATOMIC) || '""';
  registerSm2();
  return ['sm2Verify(' + pax + ', ' + pay + ', ' + ida + ', ' + msg + ', ' + r + ', ' + s + ')', Order.ATOMIC];
};
