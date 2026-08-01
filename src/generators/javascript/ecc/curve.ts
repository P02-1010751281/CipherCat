import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

// BigInt 模逆（扩展欧几里得）——SM2 256-bit 域必须用 BigInt，普通 number 精度不足
const MOD_INVERSE_FUNC = `
function modInverse(a, m) {
  a = ((a % m) + m) % m;
  var [old_r, r] = [a, m];
  var [old_s, s] = [1n, 0n];
  while (r !== 0n) {
    var q = old_r / r;
    var tmp = r; r = old_r - q * r; old_r = tmp;
    tmp = s; s = old_s - q * s; old_s = tmp;
  }
  if (old_r !== 1n) return 1n;
  return ((old_s % m) + m) % m;
}
`;

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

  return `
${MOD_INVERSE_FUNC}
var curve = { a: ${a}, b: ${b}, p: ${p} };\n
`;
};

javascriptGenerator.forBlock['ecc_load_point'] = function (block: Block): string {
  const point = javascriptGenerator.valueToCode(block, 'point', Order.ATOMIC) || 'P';
  const x = toBigIntExpr(block.getFieldValue('x'));
  const y = toBigIntExpr(block.getFieldValue('y'));

  return `var ${point} = { x: ${x}, y: ${y} };\n`;
};

javascriptGenerator.forBlock['ecc_point_double'] = function (block: Block): string {
  const value1 = javascriptGenerator.valueToCode(block, 'value1', Order.ATOMIC) || 'P';
  const value2 = javascriptGenerator.valueToCode(block, 'value2', Order.ATOMIC) || 'R';

  return `
// 点倍点运算
var lambda = (3n * ${value1}.x * ${value1}.x + curve.a) * modInverse(2n * ${value1}.y, curve.p) % curve.p;
${value2} = {
  x: (lambda * lambda - 2n * ${value1}.x) % curve.p,
  y: (lambda * (${value1}.x - ((lambda * lambda - 2n * ${value1}.x) % curve.p)) - ${value1}.y) % curve.p
};
if (${value2}.x < 0n) ${value2}.x += curve.p;
if (${value2}.y < 0n) ${value2}.y += curve.p;
`;
};

javascriptGenerator.forBlock['ecc_add'] = function (block: Block): string {
  const value1 = javascriptGenerator.valueToCode(block, 'value1', Order.ATOMIC) || 'P';
  const value2 = javascriptGenerator.valueToCode(block, 'value2', Order.ATOMIC) || 'Q';
  const value3 = javascriptGenerator.valueToCode(block, 'value3', Order.ATOMIC) || 'R';

  return `
// 点加法运算
if (${value1}.x === ${value2}.x && ${value1}.y === ${value2}.y) {
  var lambda = (3n * ${value1}.x * ${value1}.x + curve.a) * modInverse(2n * ${value1}.y, curve.p) % curve.p;
  ${value3} = {
    x: (lambda * lambda - 2n * ${value1}.x) % curve.p,
    y: (lambda * (${value1}.x - ((lambda * lambda - 2n * ${value1}.x) % curve.p)) - ${value1}.y) % curve.p
  };
} else {
  var lambda = (${value2}.y - ${value1}.y) * modInverse(${value2}.x - ${value1}.x, curve.p) % curve.p;
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

  return `
// 点乘法运算 - 使用倍加算法
var k = ${times};
var P = ${value1};
var result = { x: 0n, y: 0n, infinity: true };

while (k > 0n) {
  if (k & 1n) {
    if (result.infinity) {
      result = { x: P.x, y: P.y, infinity: false };
    } else {
      var lambda = (result.y - P.y) * modInverse(result.x - P.x, curve.p) % curve.p;
      var x = (lambda * lambda - result.x - P.x) % curve.p;
      var y = (lambda * (result.x - x) - result.y) % curve.p;
      result = { x: x, y: y, infinity: false };
    }
  }

  var lambda = (3n * P.x * P.x + curve.a) * modInverse(2n * P.y, curve.p) % curve.p;
  var x = (lambda * lambda - 2n * P.x) % curve.p;
  var y = (lambda * (P.x - x) - P.y) % curve.p;
  P = { x: x, y: y };

  k = k >> 1n;

  if (result.x < 0n) result.x += curve.p;
  if (result.y < 0n) result.y += curve.p;
  if (P.x < 0n) P.x += curve.p;
  if (P.y < 0n) P.y += curve.p;
}

${value2} = { x: result.x, y: result.y };
`;
};
