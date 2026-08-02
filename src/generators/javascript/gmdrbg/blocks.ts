/**
 * GM-RNG 原子块 JavaScript 代码生成器
 * SM3-HMAC-DRBG（SP 800-90A §10.1.2 结构 + GM/T 0103 框架，PRF = SM3）
 *
 * sm3Hmac 与 remaining.ts hash_hmac SM3 分支逐行同体（provideFunction_ 按名去重），
 * gmDrbg 与 /tmp/vectors/gmdrbg_check.{js,py} 验证脚本同构。
 * 验证：SHA-256 版同构实现对拍 NIST CAVS 14.3（240 例）+ Botan vec（240 例）；SM3 版 JS/Python
 * 交叉一致；底层 SM3 由 GB/T 32905 官方向量背书（SM3-Hash demo）。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

/** SM3-HMAC（与 remaining.ts hash_hmac SM3 分支完全同体） */
function registerSm3Hmac(): string {
  return javascriptGenerator.provideFunction_('sm3Hmac', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key,msg){',
    '  function sm3Hash(input){',
    '    if (typeof input==="string") input=new TextEncoder().encode(input);',
    '    else if (Array.isArray(input)) input=Uint8Array.from(input);',
    '    var IV=[0x7380166f,0x4914b2b9,0x172442d7,0xda8a0600,0xa96f30bc,0x163138aa,0xe38dee4d,0xb0fb0e4e];',
    '    var P0=function(x){return x^((x<<9)|(x>>>23))^((x<<17)|(x>>>15));};',
    '    var P1=function(x){return x^((x<<15)|(x>>>17))^((x<<23)|(x>>>9));};',
    '    var FF0=function(x,y,z){return x^y^z;},FF1=function(x,y,z){return (x&y)|(x&z)|(y&z);};',
    '    var GG0=function(x,y,z){return x^y^z;},GG1=function(x,y,z){return (x&y)|(~x&z);};',
    '    var T=[0x79cc4519,0x7a879d8a];',
    '    var mLen=input.length,mLenBits=mLen*8;',
    '    var kk=(448-mLenBits-1)%512; if(kk<0)kk+=512;',
    '    var padded=new Uint8Array(mLen+1+Math.floor(kk/8)+8);',
    '    padded.set(input); padded[mLen]=0x80;',
    '    for(var i=0;i<4;i++) padded[padded.length-1-i]=(mLenBits>>>(8*i))&0xFF;',
    '    var V=IV.slice();',
    '    for(var off=0;off<padded.length;off+=64){',
    '      var B=new Array(16);',
    '      for(var j=0;j<16;j++){var bj=off+j*4;B[j]=((padded[bj]<<24)|(padded[bj+1]<<16)|(padded[bj+2]<<8)|padded[bj+3])>>>0;}',
    '      var W=new Array(68);',
    '      for(var j=0;j<16;j++) W[j]=B[j];',
    '      for(var j=16;j<68;j++) W[j]=(P1(W[j-16]^W[j-9]^((W[j-3]<<15)|(W[j-3]>>>17)))^((W[j-13]<<7)|(W[j-13]>>>25))^W[j-6])>>>0;',
    '      var A=V[0],B2=V[1],C=V[2],D=V[3],E=V[4],F=V[5],G=V[6],H=V[7];',
    '      for(var j=0;j<64;j++){',
    '        var SS1=(((A<<12)|(A>>>20))+E+((T[j<16?0:1]<<j)|(T[j<16?0:1]>>>(32-j))))>>>0;',
    '        SS1=((SS1<<7)|(SS1>>>25))>>>0;',
    '        var SS2=(SS1^((A<<12)|(A>>>20)))>>>0;',
    '        var W1=(W[j]^W[j+4])>>>0;',
    '        var TT1,TT2;',
    '        if(j<16){TT1=(FF0(A,B2,C)+D+SS2+W1)>>>0;TT2=(GG0(E,F,G)+H+SS1+W[j])>>>0;}',
    '        else{TT1=(FF1(A,B2,C)+D+SS2+W1)>>>0;TT2=(GG1(E,F,G)+H+SS1+W[j])>>>0;}',
    '        D=C;C=((B2<<9)|(B2>>>23))>>>0;B2=A;A=TT1>>>0;H=G;',
    '        G=((F<<19)|(F>>>13))>>>0;F=E;E=P0(TT2)>>>0;',
    '      }',
    '      V=[(A^V[0])>>>0,(B2^V[1])>>>0,(C^V[2])>>>0,(D^V[3])>>>0,(E^V[4])>>>0,(F^V[5])>>>0,(G^V[6])>>>0,(H^V[7])>>>0];',
    '    }',
    '    var out=[];',
    '    for(var i=0;i<8;i++) out.push((V[i]>>>24)&0xFF,(V[i]>>>16)&0xFF,(V[i]>>>8)&0xFF,V[i]&0xFF);',
    '    return out;',
    '  }',
    '  if(typeof key==="string") key=new TextEncoder().encode(key);',
    '  else if(Array.isArray(key)) key=Uint8Array.from(key);',
    '  if(typeof msg==="string") msg=new TextEncoder().encode(msg);',
    '  else if(Array.isArray(msg)) msg=Uint8Array.from(msg);',
    '  var kk=Array.from(key);',
    '  if(kk.length>64) kk=sm3Hash(kk);',
    '  while(kk.length<64) kk.push(0);',
    '  var ipad=kk.map(function(x){return x^0x36;}),opad=kk.map(function(x){return x^0x5c;});',
    '  return sm3Hash(opad.concat(sm3Hash(ipad.concat(Array.from(msg)))));',
    '}',
  ]);
}

/** 完整 GM-RNG（SM3-HMAC-DRBG，返回请求字节数的确定输出 number[]） */
function registerGmDrbg(): string {
  registerSm3Hmac();
  return javascriptGenerator.provideFunction_('gmDrbg', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(entropy, nonce, perso, len) {',
    '  var seed = Array.from(entropy||[]).concat(Array.from(nonce||[])).concat(Array.from(perso||[]));',
    '  var K=[],V=[],i;',
    '  for(i=0;i<32;i++){K.push(0);V.push(1);}',
    '  function upd(provided){',
    '    K=sm3Hmac(K,V.concat([0x00]).concat(provided));',
    '    V=sm3Hmac(K,V);',
    '    K=sm3Hmac(K,V.concat([0x01]).concat(provided));',
    '    V=sm3Hmac(K,V);',
    '  }',
    '  upd(seed);',
    '  var out=[];',
    '  while(out.length<len){V=sm3Hmac(K,V);out=out.concat(V);}',
    '  K=sm3Hmac(K,V.concat([0x00]));',
    '  V=sm3Hmac(K,V);',
    '  return out.slice(0,len);',
    '}',
  ]);
}

javascriptGenerator.forBlock['gm_rng'] = function (block: Block): [string, number] {
  const entropy = javascriptGenerator.valueToCode(block, 'ENTROPY', Order.ATOMIC) || '[]';
  const nonce = javascriptGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const perso = javascriptGenerator.valueToCode(block, 'PERSO', Order.ATOMIC) || '[]';
  const len = javascriptGenerator.valueToCode(block, 'LEN', Order.ATOMIC) || '32';
  const fn = registerGmDrbg();
  return [fn + '(' + entropy + ', ' + nonce + ', ' + perso + ', ' + len + ')', Order.ATOMIC];
};
