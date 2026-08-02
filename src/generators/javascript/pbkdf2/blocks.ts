/**
 * PBKDF2 原子块 JavaScript 代码生成器
 * RFC 8018 / SP 800-132（SM3 路径 = GM/T 0091 同构）
 *
 * SHA-256 复用 hash/hmac-sha256 共享模块（同步）；SM3 注册 sm3Hmac（与 remaining.ts
 * hash_hmac SM3 分支同体，provideFunction_ 按名去重不会双份）。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerHmacSha256, registerSha256Hash } from '../hash/hmac-sha256';

/** SM3-HMAC（与 hash_hmac SM3 分支完全同体） */
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
    '    for(var i=0;i<8;i++) padded[padded.length-1-i]=Math.floor(mLenBits/Math.pow(2,8*i))&0xFF;',
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

/** 完整 PBKDF2（PRF 作为参数，返回派生密钥字节数组） */
function registerPbkdf2(): string {
  return javascriptGenerator.provideFunction_('pbkdf2', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(pw, salt, iter, dklen, prf) {',
    '  var out = [], block = 1;',
    '  while (out.length < dklen) {',
    '    var u = prf(pw, Array.from(salt).concat([Math.floor(block / 16777216) & 0xFF, (block >>> 16) & 0xFF, (block >>> 8) & 0xFF, block & 0xFF]));',
    '    var T = u.slice();',
    '    for (var i = 1; i < iter; i++) {',
    '      u = prf(pw, u);',
    '      for (var j = 0; j < T.length; j++) T[j] ^= u[j];',
    '    }',
    '    for (var j = 0; j < T.length && out.length < dklen; j++) out.push(T[j]);',
    '    block++;',
    '  }',
    '  return out;',
    '}',
  ]);
}

javascriptGenerator.forBlock['pbkdf2'] = function (block: Block): [string, number] {
  const pw = javascriptGenerator.valueToCode(block, 'PASSWORD', Order.ATOMIC) || '[]';
  const salt = javascriptGenerator.valueToCode(block, 'SALT', Order.ATOMIC) || '[]';
  const iter = javascriptGenerator.valueToCode(block, 'ITER', Order.ATOMIC) || '1000';
  const keylen = javascriptGenerator.valueToCode(block, 'KEYLEN', Order.ATOMIC) || '32';
  const hash = block.getFieldValue('HASH') || 'sha256';
  const fn = registerPbkdf2();
  if (hash === 'sm3') {
    const hmac = registerSm3Hmac();
    return [fn + '(' + pw + ', ' + salt + ', ' + iter + ', ' + keylen + ', ' + hmac + ')', Order.ATOMIC];
  }
  registerHmacSha256();
  return [fn + '(' + pw + ', ' + salt + ', ' + iter + ', ' + keylen + ', hmacSha256)', Order.ATOMIC];
};
