import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

function registerCurvePointValidator(): string {
  return javascriptGenerator.provideFunction_('eccValidateCurvePoint', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(point, curve) {',
    '  var a = curve.a, b = curve.b, p = curve.p;',
    '  if (typeof a !== "bigint" || typeof b !== "bigint" || typeof p !== "bigint" || p <= 3n || a < 0n || a >= p || b < 0n || b >= p) throw new RangeError("invalid prime-field curve parameters");',
    '  if ((4n * a * a * a + 27n * b * b) % p === 0n) throw new RangeError("singular curve");',
    '  if (!point || typeof point !== "object") throw new TypeError("point must be an object");',
    '  var hasInfinity = Object.prototype.hasOwnProperty.call(point, "infinity");',
    '  if ("infinity" in point && !hasInfinity) throw new TypeError("infinity marker must be an own property");',
    '  if (hasInfinity && typeof point.infinity !== "boolean") throw new TypeError("infinity marker must be boolean");',
    '  if (hasInfinity && point.infinity) return point;',
    '  if (!Object.prototype.hasOwnProperty.call(point, "x") || !Object.prototype.hasOwnProperty.call(point, "y")) throw new TypeError("point coordinates must be own properties");',
    '  if (!point || typeof point.x !== "bigint" || typeof point.y !== "bigint" || point.x < 0n || point.x >= p || point.y < 0n || point.y >= p) throw new RangeError("point coordinates must be BigInt values in the field");',
    '  if ((point.y * point.y - point.x * point.x * point.x - a * point.x - b) % p !== 0n) throw new RangeError("point is not on the configured curve");',
    '  return point;',
    '}',
  ]);
}

function registerModInverse(): string {
  return javascriptGenerator.provideFunction_('eccModInverse', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, m) {',
    '  a = ((a % m) + m) % m;',
    '  var old_r = a, r = m, old_s = 1n, s = 0n;',
    '  while (r !== 0n) {',
    '    var q = old_r / r;',
    '    var tmp = r; r = old_r - q * r; old_r = tmp;',
    '    tmp = s; s = old_s - q * s; old_s = tmp;',
    '  }',
    '  if (old_r !== 1n) throw new RangeError("modular inverse does not exist");',
    '  return ((old_s % m) + m) % m;',
    '}',
  ]);
}

function toBigIntExpr(field: string | null | undefined, fallback = '0n'): string {
  const v = (field || '').trim();
  if (!v) return fallback;
  // 已是 BigInt 字面量/表达式则原样透传，否则按数值字面量包装
  return `BigInt("${v.replace(/"/g, '')}")`;
}

javascriptGenerator.forBlock['ecc_load_curve_params'] = function (block: Block): string {
  const a = toBigIntExpr(block.getFieldValue('a'));
  const b = toBigIntExpr(block.getFieldValue('b'));
  const p = toBigIntExpr(block.getFieldValue('p'));

  const validate = registerCurvePointValidator();
  return `var curve = { a: ${a}, b: ${b}, p: ${p} };\n${validate}({ infinity: true }, curve);\n`;
};

javascriptGenerator.forBlock['ecc_load_point'] = function (block: Block): string {
  const point = javascriptGenerator.valueToCode(block, 'point', Order.ATOMIC) || 'P';
  const x = toBigIntExpr(block.getFieldValue('x'));
  const y = toBigIntExpr(block.getFieldValue('y'));
  const validate = registerCurvePointValidator();

  return `var ${point} = { x: ${x}, y: ${y} };\n${validate}(${point}, curve);\n`;
};

javascriptGenerator.forBlock['ecc_point_double'] = function (block: Block): string {
  const value1 = javascriptGenerator.valueToCode(block, 'value1', Order.ATOMIC) || 'P';
  const value2 = javascriptGenerator.valueToCode(block, 'value2', Order.ATOMIC) || 'R';
  const validate = registerCurvePointValidator();
  const modInverse = registerModInverse();

  return `
// 点倍点运算
${validate}(${value1}, curve);
if (${value1}.infinity || ${value1}.y % curve.p === 0n) {
  ${value2} = { infinity: true };
} else {
var lambda = (3n * ${value1}.x * ${value1}.x + curve.a) * ${modInverse}(2n * ${value1}.y, curve.p) % curve.p;
${value2} = {
  x: (lambda * lambda - 2n * ${value1}.x) % curve.p,
  y: (lambda * (${value1}.x - ((lambda * lambda - 2n * ${value1}.x) % curve.p)) - ${value1}.y) % curve.p
};
if (${value2}.x < 0n) ${value2}.x += curve.p;
if (${value2}.y < 0n) ${value2}.y += curve.p;
}
`;
};

javascriptGenerator.forBlock['ecc_add'] = function (block: Block): string {
  const value1 = javascriptGenerator.valueToCode(block, 'value1', Order.ATOMIC) || 'P';
  const value2 = javascriptGenerator.valueToCode(block, 'value2', Order.ATOMIC) || 'Q';
  const value3 = javascriptGenerator.valueToCode(block, 'value3', Order.ATOMIC) || 'R';
  const validate = registerCurvePointValidator();
  const modInverse = registerModInverse();

  return `
// 点加法运算
${validate}(${value1}, curve);
${validate}(${value2}, curve);
if (${value1}.infinity) {
  ${value3} = ${value2};
} else if (${value2}.infinity) {
  ${value3} = ${value1};
} else if (${value1}.x === ${value2}.x && (${value1}.y + ${value2}.y) % curve.p === 0n) {
  ${value3} = { infinity: true };
} else if (${value1}.x === ${value2}.x && ${value1}.y === ${value2}.y) {
  var lambda = (3n * ${value1}.x * ${value1}.x + curve.a) * ${modInverse}(2n * ${value1}.y, curve.p) % curve.p;
  ${value3} = {
    x: (lambda * lambda - 2n * ${value1}.x) % curve.p,
    y: (lambda * (${value1}.x - ((lambda * lambda - 2n * ${value1}.x) % curve.p)) - ${value1}.y) % curve.p
  };
} else if (${value1}.x === ${value2}.x) {
  throw new Error("points with equal x must be equal or inverses");
} else {
  var lambda = (${value2}.y - ${value1}.y) * ${modInverse}(${value2}.x - ${value1}.x, curve.p) % curve.p;
  ${value3} = {
    x: (lambda * lambda - ${value1}.x - ${value2}.x) % curve.p,
    y: (lambda * (${value1}.x - ((lambda * lambda - ${value1}.x - ${value2}.x) % curve.p)) - ${value1}.y) % curve.p
  };
}
if (${value3}.x < 0n) ${value3}.x += curve.p;
if (${value3}.y < 0n) ${value3}.y += curve.p;
`;
};

javascriptGenerator.forBlock['ecc_multiply'] = function (block: Block): string {
  const value1 = javascriptGenerator.valueToCode(block, 'value1', Order.ATOMIC) || 'P';
  const value2 = javascriptGenerator.valueToCode(block, 'value2', Order.ATOMIC) || 'R';
  const times = toBigIntExpr(block.getFieldValue('times'));
  const validate = registerCurvePointValidator();
  const modInverse = registerModInverse();

  return `
// 点乘法运算 - 使用倍加算法
${validate}(${value1}, curve);
var k = ${times};
if (k < 0n) throw new Error("scalar must be non-negative");
var P = ${value1};
var result = { infinity: true };

while (k > 0n) {
  if (k & 1n) {
    if (!P.infinity && result.infinity) {
      result = { x: P.x, y: P.y, infinity: false };
    } else if (!P.infinity && result.x === P.x && (result.y + P.y) % curve.p === 0n) {
      result = { infinity: true };
    } else if (!P.infinity && result.x === P.x && result.y === P.y) {
      var lambda = (3n * P.x * P.x + curve.a) * ${modInverse}(2n * P.y, curve.p) % curve.p;
      var x = (lambda * lambda - 2n * P.x) % curve.p;
      var y = (lambda * (P.x - x) - P.y) % curve.p;
      result = { x, y, infinity: false };
    } else if (!P.infinity) {
      var lambda = (result.y - P.y) * ${modInverse}(result.x - P.x, curve.p) % curve.p;
      var x = (lambda * lambda - result.x - P.x) % curve.p;
      var y = (lambda * (result.x - x) - result.y) % curve.p;
      result = { x: x, y: y, infinity: false };
    }
  }

  if (P.infinity || P.y % curve.p === 0n) {
    P = { infinity: true };
  } else {
    var lambda = (3n * P.x * P.x + curve.a) * ${modInverse}(2n * P.y, curve.p) % curve.p;
    var x = (lambda * lambda - 2n * P.x) % curve.p;
    var y = (lambda * (P.x - x) - P.y) % curve.p;
    P = { x: x, y: y };
  }

  k = k >> 1n;

  if (!result.infinity) {
    if (result.x < 0n) result.x += curve.p;
    if (result.y < 0n) result.y += curve.p;
  }
  if (!P.infinity) {
    if (P.x < 0n) P.x += curve.p;
    if (P.y < 0n) P.y += curve.p;
  }
}

${value2} = result.infinity ? { infinity: true } : { x: result.x, y: result.y };
`;
};
