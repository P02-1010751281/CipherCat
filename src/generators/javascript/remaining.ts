/**
 * 数学原语 + HMAC + 编码工具 — JavaScript 生成器
 */

import { javascriptGenerator, Order } from 'blockly/javascript';
import { getTypeCoercion, TYPE_INT_LIST, TYPE_BYTES } from '@/constants/block-types';
import type { Block } from 'blockly/core';

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
javascriptGenerator.forBlock['bn_add']=function(b:Block):[string,number]{_bnReg();const a=javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'[0]',v=javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'[0]';return['bnFromBigInt(bnToBigInt('+a+')+bnToBigInt('+v+'))',Order.ATOMIC];};
javascriptGenerator.forBlock['bn_sub']=function(b:Block):[string,number]{_bnReg();const a=javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'[0]',v=javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'[0]';return['bnFromBigInt(bnToBigInt('+a+')-bnToBigInt('+v+'))',Order.ATOMIC];};
javascriptGenerator.forBlock['bn_mul']=function(b:Block):[string,number]{_bnReg();const a=javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'[0]',v=javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'[0]';return['bnFromBigInt(bnToBigInt('+a+')*bnToBigInt('+v+'))',Order.ATOMIC];};
javascriptGenerator.forBlock['bn_div']=function(b:Block):[string,number]{_bnReg();const a=javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'[0]',v=javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'[0]';return['bnFromBigInt(bnToBigInt('+a+')/bnToBigInt('+v+'))',Order.ATOMIC];};

// HMAC（SHA-256 走 WebCrypto；SM3 走内置纯 JS 实现）
javascriptGenerator.forBlock['hash_hmac'] = function(b:Block):[string,number]{
  const k=javascriptGenerator.valueToCode(b,'KEY',Order.ATOMIC)||'[]',m=javascriptGenerator.valueToCode(b,'MSG',Order.ATOMIC)||'[]';
  const hash=b.getFieldValue('HASH')||'SHA-256';
  if (hash==='SM3') {
    const fn=javascriptGenerator.provideFunction_('sm3Hmac',[
      'function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(key,msg){',
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
    return [fn+'('+k+','+m+')',Order.ATOMIC];
  }
  const fn=javascriptGenerator.provideFunction_('hmac',[
    'async function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(key,msg){',
    '  var a={name:"HMAC",hash:"SHA-256"};',
    '  var k=await crypto.subtle.importKey("raw",key,a,false,["sign"]);',
    '  return new Uint8Array(await crypto.subtle.sign("HMAC",k,msg));',
    '}',
  ]);
  return [fn+'('+k+','+m+')',Order.ATOMIC];
};


// ═══ 编码工具 ═════════════════════════════════════════

javascriptGenerator.forBlock['base64_encode'] = function(b: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(b, 'INPUT', Order.ATOMIC) || 'new Uint8Array(0)';
  // 确保输入为 Bytes 类型
  const coerced = getTypeCoercion(TYPE_INT_LIST, TYPE_BYTES, input, 'javascript');
  return ['btoa(String.fromCharCode(...' + (coerced || input) + '))', Order.ATOMIC];
};
javascriptGenerator.forBlock['base64_decode'] = function(b:Block):[string,number]{return['Uint8Array.from(atob('+(javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'""')+'),c=>c.charCodeAt(0))',Order.ATOMIC];};
javascriptGenerator.forBlock['hex_to_bytes'] = function(b:Block):[string,number]{return['Uint8Array.from(('+(javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'""')+').match(/.{1,2}/g)||[],h=>parseInt(h,16))',Order.ATOMIC];};
javascriptGenerator.forBlock['bytes_to_hex'] = function(b:Block):[string,number]{return['Array.from('+(javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'new Uint8Array(0)')+',b=>b.toString(16).padStart(2,"0")).join("")',Order.ATOMIC];};
javascriptGenerator.forBlock['endian_swap'] = function(b:Block):[string,number]{return[(javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')+'.slice().reverse()',Order.ATOMIC];};
