import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

const MOD_INVERSE_FUNC = `
function modInverse(a, m) {
  a = ((a % m) + m) % m;
  for (var x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x;
  }
  return 1;
}
`;

javascriptGenerator.forBlock['ecc_load_curve_params'] = function (block: Block): string {
  const a = block.getFieldValue('a') || '0';
  const b = block.getFieldValue('b') || '0';
  const p = block.getFieldValue('p') || '0';

  return `
${MOD_INVERSE_FUNC}
var curve = { a: ${a}, b: ${b}, p: ${p} };\n
`;
};

javascriptGenerator.forBlock['ecc_load_point'] = function (block: Block): string {
  const point = javascriptGenerator.valueToCode(block, 'point', Order.ATOMIC) || 'P';
  const x = block.getFieldValue('x') || '0';
  const y = block.getFieldValue('y') || '0';

  return `var ${point} = { x: ${x}, y: ${y} };\n`;
};

javascriptGenerator.forBlock['ecc_point_double'] = function (block: Block): string {
  const value1 = javascriptGenerator.valueToCode(block, 'value1', Order.ATOMIC) || 'P';
  const value2 = javascriptGenerator.valueToCode(block, 'value2', Order.ATOMIC) || 'R';

  return `
// 点倍点运算
var lambda = (3 * ${value1}.x * ${value1}.x + curve.a) * modInverse(2 * ${value1}.y, curve.p) % curve.p;
${value2} = {
  x: (lambda * lambda - 2 * ${value1}.x) % curve.p,
  y: (lambda * (${value1}.x - ((lambda * lambda - 2 * ${value1}.x) % curve.p)) - ${value1}.y) % curve.p
};
if (${value2}.x < 0) ${value2}.x += curve.p;
if (${value2}.y < 0) ${value2}.y += curve.p;
`;
};

javascriptGenerator.forBlock['ecc_add'] = function (block: Block): string {
  const value1 = javascriptGenerator.valueToCode(block, 'value1', Order.ATOMIC) || 'P';
  const value2 = javascriptGenerator.valueToCode(block, 'value2', Order.ATOMIC) || 'Q';
  const value3 = javascriptGenerator.valueToCode(block, 'value3', Order.ATOMIC) || 'R';

  return `
// 点加法运算
if (${value1}.x === ${value2}.x && ${value1}.y === ${value2}.y) {
  var lambda = (3 * ${value1}.x * ${value1}.x + curve.a) * modInverse(2 * ${value1}.y, curve.p) % curve.p;
  ${value3} = {
    x: (lambda * lambda - 2 * ${value1}.x) % curve.p,
    y: (lambda * (${value1}.x - ((lambda * lambda - 2 * ${value1}.x) % curve.p)) - ${value1}.y) % curve.p
  };
} else {
  var lambda = (${value2}.y - ${value1}.y) * modInverse(${value2}.x - ${value1}.x, curve.p) % curve.p;
  ${value3} = {
    x: (lambda * lambda - ${value1}.x - ${value2}.x) % curve.p,
    y: (lambda * (${value1}.x - ((lambda * lambda - ${value1}.x - ${value2}.x) % curve.p)) - ${value1}.y) % curve.p
  };
}
if (${value3}.x < 0) ${value3}.x += curve.p;
if (${value3}.y < 0) ${value3}.y += curve.p;
`;
};

javascriptGenerator.forBlock['ecc_multiply'] = function (block: Block): string {
  const value1 = javascriptGenerator.valueToCode(block, 'value1', Order.ATOMIC) || 'P';
  const value2 = javascriptGenerator.valueToCode(block, 'value2', Order.ATOMIC) || 'R';
  const times = block.getFieldValue('times') || '0';

  return `
// 点乘法运算 - 使用倍加算法
var k = ${times};
var P = ${value1};
var result = { x: 0, y: 0, infinity: true };

while (k > 0) {
  if (k & 1) {
    if (result.infinity) {
      result = { x: P.x, y: P.y, infinity: false };
    } else {
      var lambda = (result.y - P.y) * modInverse(result.x - P.x, curve.p) % curve.p;
      var x = (lambda * lambda - result.x - P.x) % curve.p;
      var y = (lambda * (result.x - x) - result.y) % curve.p;
      result = { x: x, y: y, infinity: false };
    }
  }

  var lambda = (3 * P.x * P.x + curve.a) * modInverse(2 * P.y, curve.p) % curve.p;
  var x = (lambda * lambda - 2 * P.x) % curve.p;
  var y = (lambda * (P.x - x) - P.y) % curve.p;
  P = { x: x, y: y };

  k = k >> 1;

  if (result.x < 0) result.x += curve.p;
  if (result.y < 0) result.y += curve.p;
  if (P.x < 0) P.x += curve.p;
  if (P.y < 0) P.y += curve.p;
}

${value2} = { x: result.x, y: result.y };
`;
};
