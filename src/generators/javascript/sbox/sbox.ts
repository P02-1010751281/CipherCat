import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['sbox'] = function (
  block: Block,
): [string, number] {
  const rowCount = Number(block.getFieldValue('ROW')) || 4;
  const colCount = Number(block.getFieldValue('COL')) || 4;
  const outputFormat = block.getFieldValue('OUTPUT_FORMAT') || '2d';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gd = (block as any).gridData as string[] | undefined;
  const values: string[] = [];

  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      const val = gd?.[r * colCount + c] || '0';
      values.push(`0x${val}`);
    }
  }

  if (outputFormat === '1d') {
    return [`[${values.join(', ')}]`, Order.ATOMIC];
  }

  const rows2d: string[] = [];
  for (let r = 0; r < rowCount; r++) {
    const rowValues: string[] = [];
    for (let c = 0; c < colCount; c++) {
      rowValues.push(values[r * colCount + c]);
    }
    rows2d.push(`[${rowValues.join(', ')}]`);
  }
  return [`[${rows2d.join(', ')}]`, Order.ATOMIC];
};

javascriptGenerator.forBlock['sbox_sub'] = function (block: Block): string {
  const inputVar =
    javascriptGenerator.valueToCode(block, 'INPUT_VAR', Order.ATOMIC) || '0';
  const sboxVar =
    javascriptGenerator.valueToCode(block, 'SBOX_VAR', Order.ATOMIC) || 'sbox';
  const outputVar =
    javascriptGenerator.valueToCode(block, 'OUTPUT_VAR', Order.ATOMIC) ||
    'result';

  return `
if (typeof ${sboxVar} === 'undefined') {
  throw new Error("Global variable '${sboxVar}' is not defined. Please define it first using an S-box definition block.");
}
var _sboxRef = ${sboxVar};
if (Array.isArray(_sboxRef) && _sboxRef.length > 0 && Array.isArray(_sboxRef[0])) {
  _sboxRef = _sboxRef.flat();
}
if (!Array.isArray(_sboxRef) || _sboxRef.length < 256) {
  throw new Error("Global variable '${sboxVar}' must be an array containing at least 256 elements.");
}

var _input_val = ${inputVar};
var _b0 = (_input_val >>> 24) & 0xFF;
var _b1 = (_input_val >>> 16) & 0xFF;
var _b2 = (_input_val >>> 8) & 0xFF;
var _b3 = _input_val & 0xFF;

var _s_b0 = _sboxRef[_b0];
var _s_b1 = _sboxRef[_b1];
var _s_b2 = _sboxRef[_b2];
var _s_b3 = _sboxRef[_b3];

${outputVar} = ((_s_b0 << 24) | (_s_b1 << 16) | (_s_b2 << 8) | _s_b3) >>> 0;
`;
};

javascriptGenerator.forBlock['sbox_variables_get'] = function (
  block: Block,
): [string, Order] {
  // Variable getter.
  const code = javascriptGenerator.getVariableName(block.getFieldValue('VAR'));
  return [code, Order.ATOMIC];
};

javascriptGenerator.forBlock['sbox_variables_set'] = function (
  block: Block,
): string {
  const argument0 =
    javascriptGenerator.valueToCode(block, 'VALUE', Order.ASSIGNMENT) || '0';
  const varName = javascriptGenerator.getVariableName(
    block.getFieldValue('VAR'),
  );
  return varName + ' = ' + argument0 + ';\n';
};
