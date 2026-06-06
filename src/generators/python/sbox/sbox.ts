import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['sbox'] = function (block: Block): [string, number] {
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

pythonGenerator.forBlock['sbox_sub'] = function (block: Block): string {
  const inputVar =
    pythonGenerator.valueToCode(block, 'INPUT_VAR', Order.ATOMIC) || '0';
  const sboxVar =
    pythonGenerator.valueToCode(block, 'SBOX_VAR', Order.ATOMIC) || 'sbox';
  const outputVar =
    pythonGenerator.valueToCode(block, 'OUTPUT_VAR', Order.ATOMIC) || 'result';

  return `
# Apply S-box substitution byte-wise using the user-defined 'sbox'
try:
    _sbox_ref = ${sboxVar}
except NameError:
    raise NameError("Variable '${sboxVar}' is not defined. Please define it first using an S-box definition block.")
if isinstance(_sbox_ref, list) and len(_sbox_ref) > 0 and isinstance(_sbox_ref[0], list):
    _sbox_ref = [item for row in _sbox_ref for item in row]
if not isinstance(_sbox_ref, list) or len(_sbox_ref) < 256:
    raise ValueError("Variable '${sboxVar}' must be a list containing at least 256 elements.")

_input_val = ${inputVar}
if _input_val is None:
    _input_val = 0
if isinstance(_input_val, (bytes, bytearray)):
    _input_val = int.from_bytes(_input_val[:4].ljust(4, b'\\x00'), 'big')
_b0 = (_input_val >> 24) & 0xFF
_b1 = (_input_val >> 16) & 0xFF
_b2 = (_input_val >> 8) & 0xFF
_b3 = _input_val & 0xFF

_s_b0 = _sbox_ref[_b0]
_s_b1 = _sbox_ref[_b1]
_s_b2 = _sbox_ref[_b2]
_s_b3 = _sbox_ref[_b3]

${outputVar} = ((_s_b0 << 24) | (_s_b1 << 16) | (_s_b2 << 8) | _s_b3) & 0xFFFFFFFF
`;
};

pythonGenerator.forBlock['sbox_variables_get'] = function (
  block: Block,
): [string, number] {
  const code = pythonGenerator.getVariableName(block.getFieldValue('VAR'));
  return [code, Order.ATOMIC];
};

pythonGenerator.forBlock['sbox_variables_set'] = function (
  block: Block,
): string {
  const argument0 =
    pythonGenerator.valueToCode(block, 'VALUE', Order.NONE) || '0';
  const varName = pythonGenerator.getVariableName(block.getFieldValue('VAR'));
  return varName + ' = ' + argument0 + '\n';
};
