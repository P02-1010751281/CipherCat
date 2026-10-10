import { javascriptGenerator } from 'blockly/javascript';

export function registerHexToBytes(): string {
  return javascriptGenerator.provideFunction_('hexToBytes', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(hex){',
    '  if (typeof hex !== "string" || hex.length % 2 !== 0) throw new TypeError("expected an even-length hexadecimal string");',
    '  for (var i = 0; i < hex.length; i++) {',
    '    var code = hex.charCodeAt(i);',
    '    if (!((code >= 48 && code <= 57) || (code >= 65 && code <= 70) || (code >= 97 && code <= 102))) throw new TypeError("expected an even-length hexadecimal string");',
    '  }',
    '  var out = new Uint8Array(hex.length/2);',
    '  for (var i=0;i<out.length;i++) {',
    '    out[i] = parseInt(hex.substring(i*2,i*2+2),16);',
    '  }',
    '  return out;',
    '}'
  ]);
}

export function registerUtf8ToBytes(): string {
  return javascriptGenerator.provideFunction_('utf8ToBytes', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(text) {',
    '  if (typeof text !== "string") throw new TypeError("expected UTF-8 text");',
    '  for (var i = 0; i < text.length; i++) {',
    '    var code = text.charCodeAt(i);',
    '    if (code >= 0xD800 && code <= 0xDBFF) {',
    '      var next = text.charCodeAt(i + 1);',
    '      if (!(next >= 0xDC00 && next <= 0xDFFF)) throw new TypeError("text contains an unpaired surrogate");',
    '      i++;',
    '    } else if (code >= 0xDC00 && code <= 0xDFFF) {',
    '      throw new TypeError("text contains an unpaired surrogate");',
    '    }',
    '  }',
    '  return new TextEncoder().encode(text);',
    '}',
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
