import { javascriptGenerator } from 'blockly/javascript';

export function registerHexToBytes(): string {
  return javascriptGenerator.provideFunction_('hexToBytes', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(hex){',
    '  hex = String(hex).replace(/\\s+/g,"");',
    '  if (hex.length % 2 !== 0) throw new Error("hex length must be even");',
    '  var out = new Uint8Array(hex.length/2);',
    '  for (var i=0;i<out.length;i++) {',
    '    var b = parseInt(hex.substring(i*2,i*2+2),16);',
    '    if (Number.isNaN(b)) throw new Error("invalid hex at position "+(i*2));',
    '    out[i] = b;',
    '  }',
    '  return out;',
    '}'
  ]);
}

export function registerBytesConcat(): string {
  return javascriptGenerator.provideFunction_('bytesConcat', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b) {',
    '  if (typeof a === "string") a = new TextEncoder().encode(a);',
    '  if (typeof b === "string") b = new TextEncoder().encode(b);',
    '  var result = new Uint8Array(a.length + b.length);',
    '  result.set(a, 0);',
    '  result.set(b, a.length);',
    '  return result;',
    '}',
  ]);
}

export function registerBytesSlice(): string {
  return javascriptGenerator.provideFunction_('bytesSlice', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(data, start, end) {',
    '  if (typeof data === "string") data = new TextEncoder().encode(data);',
    '  return data.slice(start, end);',
    '}',
  ]);
}