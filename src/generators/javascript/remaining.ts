/**
 * 数学原语 + HMAC + 编码工具 — JavaScript 生成器
 */

import { javascriptGenerator, Order } from 'blockly/javascript';
import { registerHmacSha256 } from './hash/hmac-sha256';
import { registerUtf8ToBytes } from './data/helpers';
import { registerSm3LengthField } from './hash/sm3';
import { getTypeCoercion, TYPE_INT_LIST, TYPE_BYTES } from '@/constants/block-types';
import type { Block } from 'blockly/core';

// ═══════════════════════════════════════════════════════════
// M3 数学原语
// ═══════════════════════════════════════════════════════════

javascriptGenerator.forBlock['nt_mod'] = function(b: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'0';
  const n = javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'1';
  return ['(function(a,n){if(!Number.isSafeInteger(a)||!Number.isSafeInteger(n))throw new RangeError("modular arithmetic requires safe integers");if(n<=0)throw new RangeError("modulus must be positive");return ((a%n)+n)%n;})('+a+','+n+')', Order.ATOMIC];
};

javascriptGenerator.forBlock['nt_mod_pow'] = function(b: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'0';
  const e = javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'0';
  const m = b.getFieldValue('MODULUS')||'1';
  const fn = javascriptGenerator.provideFunction_('powMod', [
    'function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(base,exponent,modulus){',
    '  if(!Number.isSafeInteger(base)||!Number.isSafeInteger(exponent)||!Number.isSafeInteger(modulus)||exponent<0||modulus<=0)throw new RangeError("expected safe integers, a non-negative exponent, and a positive modulus");',
    '  var b=BigInt(base),e=BigInt(exponent),m=BigInt(modulus),r=1n;b=((b%m)+m)%m;',
    '  while(e>0n){if(e%2n===1n)r=(r*b)%m;e/=2n;b=(b*b)%m;}return Number(r);',
    '}',
  ]);
  return [fn+'('+a+','+e+','+m+')', Order.ATOMIC];
};

javascriptGenerator.forBlock['nt_div_rem'] = function(b: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'0';
  const d = javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'1';
  const divmod = javascriptGenerator.provideFunction_('safeDivmod', [
    'function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(a,d){',
    '  if(!Number.isSafeInteger(a)||!Number.isSafeInteger(d))throw new RangeError("dividend and divisor must be safe integers");',
    '  var A=BigInt(a),D=BigInt(d);if(D===0n)throw new RangeError("division by zero");',
    '  var q=A/D,r=A%D;if(r!==0n&&((r<0n)!==(D<0n))){q-=1n;r+=D;}return[Number(q),Number(r)];',
    '}',
  ]);
  return [divmod+'('+a+','+d+')', Order.ATOMIC];
};

// 大数 BigInt-based
function _bnReg() {
  javascriptGenerator.provideFunction_('bnToBigInt', [
    'function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(limbs){',
    '  if(!Array.isArray(limbs))throw new TypeError("big-number limbs must be an array");',
    '  var r=0n;for(var i=limbs.length-1;i>=0;i--){var limb=limbs[i];if(typeof limb!=="number"||!Number.isInteger(limb)||limb<0||limb>0xFFFFFFFF)throw new RangeError("limbs must be unsigned 32-bit integers");r=(r<<32n)|BigInt(limb);}',
    '  return r;',
    '}',
  ]);
  javascriptGenerator.provideFunction_('bnFromBigInt', [
    'function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(n){var r=[];while(n>0n){r.push(Number(n&0xFFFFFFFFn));n>>=32n;}return r.length?r:[0];}',
  ]);
}
javascriptGenerator.forBlock['bn_add']=function(b:Block):[string,number]{_bnReg();const a=javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'[0]',v=javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'[0]';return['bnFromBigInt(bnToBigInt('+a+')+bnToBigInt('+v+'))',Order.ATOMIC];};
javascriptGenerator.forBlock['bn_sub']=function(b:Block):[string,number]{_bnReg();const a=javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'[0]',v=javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'[0]';return['(function(a,b){a=bnToBigInt(a);b=bnToBigInt(b);if(a<b)throw new RangeError("unsigned big-number underflow");return bnFromBigInt(a-b);})('+a+','+v+')',Order.ATOMIC];};
javascriptGenerator.forBlock['bn_mul']=function(b:Block):[string,number]{_bnReg();const a=javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'[0]',v=javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'[0]';return['bnFromBigInt(bnToBigInt('+a+')*bnToBigInt('+v+'))',Order.ATOMIC];};
javascriptGenerator.forBlock['bn_div']=function(b:Block):[string,number]{_bnReg();const a=javascriptGenerator.valueToCode(b,'A',Order.ATOMIC)||'[0]',v=javascriptGenerator.valueToCode(b,'B',Order.ATOMIC)||'[0]';return['bnFromBigInt(bnToBigInt('+a+')/bnToBigInt('+v+'))',Order.ATOMIC];};

// HMAC-SHA-256 uses the shared synchronous helper; SM3 uses the built-in implementation.
function registerHmacInputBytes(): string {
  const utf8ToBytes = registerUtf8ToBytes();
  return javascriptGenerator.provideFunction_('hmacInputBytes', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(value) {',
    '  if (typeof value === "string") return ' + utf8ToBytes + '(value);',
    '  if (value instanceof Uint8Array) return value;',
    '  if (!Array.isArray(value)) throw new TypeError("HMAC input must be UTF-8 text or byte values from 0 to 255");',
    '  for (let i = 0; i < value.length; i++) { const byte = value[i]; if (typeof byte !== "number" || !Number.isInteger(byte) || byte < 0 || byte > 255) throw new TypeError("HMAC input must be UTF-8 text or byte values from 0 to 255"); }',
    '  return Uint8Array.from(value);',
    '}',
  ]);
}

javascriptGenerator.forBlock['hash_hmac'] = function(b:Block):[string,number]{
  const k=javascriptGenerator.valueToCode(b,'KEY',Order.ATOMIC)||'[]',m=javascriptGenerator.valueToCode(b,'MSG',Order.ATOMIC)||'[]';
  const hash=b.getFieldValue('HASH')||'SHA-256';
  const inputBytes = registerHmacInputBytes();
  if (hash==='SM3') {
    const lengthField = registerSm3LengthField();
    const fn=javascriptGenerator.provideFunction_('sm3Hmac',[
      'function '+javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_+'(key,msg){',
      '  function sm3Hash(input){',
      '    if (Array.isArray(input)) input=Uint8Array.from(input);',
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
      '    padded.set(' + lengthField + '(mLen), padded.length - 8);',
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
      '  key=' + inputBytes + '(key);',
      '  msg=' + inputBytes + '(msg);',
      '  var kk=Array.from(key);',
      '  if(kk.length>64) kk=sm3Hash(kk);',
      '  while(kk.length<64) kk.push(0);',
      '  var ipad=kk.map(function(x){return x^0x36;}),opad=kk.map(function(x){return x^0x5c;});',
      '  return sm3Hash(opad.concat(sm3Hash(ipad.concat(Array.from(msg)))));',
      '}',
    ]);
    return ['Uint8Array.from('+fn+'('+k+','+m+'))',Order.ATOMIC];
  }
  const fn=registerHmacSha256();
  return ['Uint8Array.from('+fn+'('+inputBytes+'('+k+'),'+inputBytes+'('+m+')))',Order.ATOMIC];
};


// ═══ 编码工具 ═════════════════════════════════════════

javascriptGenerator.forBlock['base64_encode'] = function(b: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(b, 'INPUT', Order.ATOMIC) || 'new Uint8Array(0)';
  // 确保输入为 Bytes 类型
  const coerced = getTypeCoercion(TYPE_INT_LIST, TYPE_BYTES, input, 'javascript');
  return ['(function(bytes){const chunks=[];for(let i=0;i<bytes.length;i+=0x8000)chunks.push(String.fromCharCode(...bytes.subarray(i,i+0x8000)));return btoa(chunks.join(""));})(' + (coerced || input) + ')', Order.ATOMIC];
};
javascriptGenerator.forBlock['base64_decode'] = function(b:Block):[string,number]{const input=javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'""';return['(function(value){if(!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value))throw new TypeError("invalid Base64");return Uint8Array.from(atob(value),c=>c.charCodeAt(0));})('+input+')',Order.ATOMIC];};
javascriptGenerator.forBlock['hex_to_bytes'] = function(b:Block):[string,number]{
  const input = javascriptGenerator.valueToCode(b, 'INPUT', Order.ATOMIC) || '""';
  return ['(function(value){if(typeof value!=="string"||value.length%2!==0||!/^[0-9a-fA-F]*$/.test(value))throw new TypeError("expected an even-length hexadecimal string");return Uint8Array.from(value.match(/.{2}/g)||[],h=>parseInt(h,16));})(' + input + ')', Order.ATOMIC];
};
javascriptGenerator.forBlock['bytes_to_hex'] = function(b:Block):[string,number]{return['Array.from('+(javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'new Uint8Array(0)')+',b=>b.toString(16).padStart(2,"0")).join("")',Order.ATOMIC];};
javascriptGenerator.forBlock['endian_swap'] = function(b:Block):[string,number]{return[(javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')+'.slice().reverse()',Order.ATOMIC];};
