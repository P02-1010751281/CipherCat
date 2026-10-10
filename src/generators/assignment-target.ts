const RESERVED_TARGETS = {
  javascript: new Set(
    'arguments await break case catch class const continue debugger default delete do else enum eval export extends false finally for function if implements import in instanceof interface let new null NaN package private protected public return static super switch this throw true try typeof undefined var void while with yield Infinity'.split(' '),
  ),
  python: new Set(
    'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield __debug__'.split(' '),
  ),
};

const IDENTIFIERS = {
  javascript: /^[$_\p{ID_Start}](?:[$_\p{ID_Continue}]|\u200c|\u200d)*$/u,
  python: /^[_\p{XID_Start}][_\p{XID_Continue}]*$/u,
};

export function requireVariableName(
  target: string,
  language: keyof typeof RESERVED_TARGETS,
  blockType: string,
  input: string,
): string {
  if (!IDENTIFIERS[language].test(target) || RESERVED_TARGETS[language].has(target)) {
    throw new Error(`${blockType}: ${input} must be a variable name`);
  }
  return target;
}
