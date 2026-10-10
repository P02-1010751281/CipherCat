import { pythonGenerator } from 'blockly/python';

export function uint32Expression(value: string): string {
  const convert = pythonGenerator.provideFunction_('crypto_to_uint32', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(value):',
    '    import re',
    '    try:',
    '        if isinstance(value, str):',
    '            text = value.strip("\\t\\n\\v\\f\\r \\u00a0\\u1680\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000\\ufeff")',
    '            if not text: return 0',
    '            if text[:1] in ("+", "-") and text[1:3].lower() in ("0x", "0b", "0o"): return 0',
    '            prefix = text[:2].lower()',
    '            if prefix in ("0x", "0b", "0o"):',
    '                digits = text[2:].lower()',
    '                base, valid = {"0x": (16, "0123456789abcdef"), "0b": (2, "01"), "0o": (8, "01234567")}[prefix]',
    '                if not digits or any(digit not in valid for digit in digits): return 0',
    '                number = float(int(digits, base))',
    '            elif text in ("Infinity", "+Infinity", "-Infinity"): ',
    '                number = float(text)',
    '            elif re.fullmatch(r"[+-]?(?:[0-9]+(?:[.][0-9]*)?|[.][0-9]+)(?:[eE][+-]?[0-9]+)?", text):',
    '                number = float(text)',
    '            else:',
    '                return 0',
    '        else:',
    '            number = float(value)',
    '    except (OverflowError, TypeError, ValueError):',
    '        return 0',
    '    if number != number or number == float("inf") or number == float("-inf"):',
    '        return 0',
    '    return int(number) & 0xFFFFFFFF',
    '',
  ]);
  return `${convert}(${value})`;
}
