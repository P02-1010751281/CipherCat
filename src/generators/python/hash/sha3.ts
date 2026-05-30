import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { registerSha3Pad, registerKeccakF1600 } from './helpers';

/** SHA-3 padding (pad10*1) — pad text input. */
pythonGenerator.forBlock['hash_sha3_pad_text'] = function (block: Block): string {
  const left = pythonGenerator.valueToCode(block, 'LEFT', Order.ATOMIC) || 'm_padded';
  const right = pythonGenerator.valueToCode(block, 'RIGHT', Order.ATOMIC) || 'm';
  const padFuncName = registerSha3Pad();
  return left + ' = ' + padFuncName + '(' + right + ', rate_bytes=136, suffix=0x06)\n';
};

/** SHA-3 padding — pad hex input (converted to bytes first). */
pythonGenerator.forBlock['hash_sha3_pad_hex'] = function (block: Block): string {
  const left = pythonGenerator.valueToCode(block, 'LEFT', Order.ATOMIC) || 'm_padded';
  const right = pythonGenerator.valueToCode(block, 'RIGHT', Order.ATOMIC) || 'hexstr';
  const padFuncName = registerSha3Pad();
  return left + ' = ' + padFuncName + '(bytes.fromhex(' + right + ') if isinstance(' + right + ', str) else ' + right + ', rate_bytes=136, suffix=0x06)\n';
};

/** SHA-3 padding — pad raw bytes input with configurable rate and suffix. */
pythonGenerator.forBlock['hash_sha3_pad'] = function (block: Block): string {
  const left = pythonGenerator.valueToCode(block, 'LEFT', Order.ATOMIC) || 'm_padded';
  const right = pythonGenerator.valueToCode(block, 'RIGHT', Order.ATOMIC) || 'm';
  const rateBits = block.getFieldValue('RATE') || '1088';
  const suffix = block.getFieldValue('SUFFIX') || '0x06';
  const rateBytes = Math.floor(parseInt(rateBits) / 8);
  const padFuncName = registerSha3Pad();
  return left + ' = ' + padFuncName + '(' + right + ', rate_bytes=' + rateBytes + ', suffix=' + suffix + ')\n';
};

/** Keccak-f[1600] or other width permutation — 24-round core of SHA-3/SHAKE. */
pythonGenerator.forBlock['hash_sha3_keccak_f'] = function (block: Block): string {
  const out = pythonGenerator.valueToCode(block, 'OUT', Order.ATOMIC) || 'state';
  const state = pythonGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || 'state';
  const width = block.getFieldValue('WIDTH') || '1600';

  if (width !== '1600') {
    return out + ' = keccak_f' + width + '(' + state + ')\n';
  }

  const funcName = registerKeccakF1600();
  return out + ' = ' + funcName + '(' + state + ')\n';
};

/**
 * Sponge absorb phase — XOR padded blocks into state, permuting after each block.
 */
pythonGenerator.forBlock['hash_sha3_absorb'] = function (block: Block): string {
  const state = pythonGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || 'state';
  const block_ = pythonGenerator.valueToCode(block, 'BLOCK', Order.ATOMIC) || 'block';
  const rateBits = block.getFieldValue('RATE') || '1088';
  const rateBytes = Math.floor(parseInt(rateBits) / 8);

  const keccakName = registerKeccakF1600();

  const absorbName = pythonGenerator.provideFunction_('sha3_absorb', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(state, block, rate_bytes=136):',
    '    rate_lanes = rate_bytes // 8',
    '    s = list(state)',
    '    for i in range(rate_lanes):',
    '        lane = 0',
    '        for j in range(8):',
    '            lane |= (block[i*8+j] if i*8+j < len(block) else 0) << (j*8)',
    '        s[i] ^= lane',
    '    return ' + keccakName + '(s)',
  ]);
  return state + ' = ' + absorbName + '(' + state + ', ' + block_ + ', rate_bytes=' + rateBytes + ')\n';
};

/**
 * Sponge squeeze phase — extract output bytes from state, permuting as needed.
 */
pythonGenerator.forBlock['hash_sha3_squeeze'] = function (block: Block): string {
  const out = pythonGenerator.valueToCode(block, 'OUT', Order.ATOMIC) || 'output';
  const state = pythonGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || 'state';
  const outlen = pythonGenerator.valueToCode(block, 'OUTLEN', Order.ATOMIC) || '32';
  const rateBits = block.getFieldValue('RATE') || '1088';
  const rateBytes = Math.floor(parseInt(rateBits) / 8);

  const keccakName = registerKeccakF1600();

  const squeezeName = pythonGenerator.provideFunction_('sha3_squeeze', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(state, out_len, rate_bytes=136):',
    '    rate_lanes = rate_bytes // 8',
    '    s = list(state)',
    '    output = bytearray()',
    '    while len(output) < out_len:',
    '        for i in range(rate_lanes):',
    '            for j in range(8):',
    '                if len(output) >= out_len:',
    '                    break',
    '                output.append((s[i] >> (j*8)) & 0xFF)',
    '            if len(output) >= out_len:',
    '                break',
    '        if len(output) < out_len:',
    '            s = ' + keccakName + '(s)',
    '    return bytes(output[:out_len])',
  ]);
  return out + ' = ' + squeezeName + '(' + state + ', ' + outlen + ', rate_bytes=' + rateBytes + ')\n';
};

/** State initialization — 25 zero integers in little-endian. */
pythonGenerator.forBlock['hash_sha3_state_init'] = function(_block: Block): [string, number] {
  return ['[0] * 25', Order.ATOMIC];
};