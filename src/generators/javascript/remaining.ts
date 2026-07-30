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

// HMAC
javascriptGenerator.forBlock['hash_hmac'] = function(b:Block):[string,number]{
  const k=javascriptGenerator.valueToCode(b,'KEY',Order.ATOMIC)||'[]',m=javascriptGenerator.valueToCode(b,'MSG',Order.ATOMIC)||'[]';
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
