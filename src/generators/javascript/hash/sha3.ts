/**
 * SHA-3 (Keccak) JavaScript 代码生成器
 *
 * 生成符合 FIPS 202 标准的 JavaScript 代码，实现完整的 SHA-3 海绵构造：
 *   - pad10*1 填充 (多域分离后缀: SHA-3 用 0x06, SHAKE 用 0x1F)
 *   - Keccak-f[1600] 置换 (24 轮 θ→ρ→π→χ→ι，使用 BigInt 处理 64-bit lanes)
 *   - 海绵结构吸收/挤压阶段
 *
 * 使用 Blockly provideFunction_ API 注册辅助函数，自动处理去重和名称冲突。
 *
 * 参考: FIPS 202 — https://csrc.nist.gov/pubs/fips/202/final
 *       Keccak 规范 — https://keccak.team/keccak_specs_summary.html
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly';
import { registerHexToBytes } from '../data/helpers';
import { registerKeccakF1600, registerSha3Pad } from './helpers';

/** SHA-3 padding (pad10*1) — pad text input. */
javascriptGenerator.forBlock['hash_sha3_pad_text'] = function (
  block: Block,
): string {
  const left =
    javascriptGenerator.valueToCode(block, 'LEFT', Order.ATOMIC) || 'padded';
  const right =
    javascriptGenerator.valueToCode(block, 'RIGHT', Order.ATOMIC) || "''";
  const rate = block.getFieldValue('RATE') || '136';
  const suffix = block.getFieldValue('SUFFIX') || '0x06';

  const padFn = registerSha3Pad();
  return `${left} = ${padFn}(${right}, ${rate}, ${suffix});\n`;
};

/** SHA-3 padding — pad hex input (converted to bytes first). */
javascriptGenerator.forBlock['hash_sha3_pad_hex'] = function (
  block: Block,
): string {
  const left =
    javascriptGenerator.valueToCode(block, 'LEFT', Order.ATOMIC) || 'padded';
  const right =
    javascriptGenerator.valueToCode(block, 'RIGHT', Order.ATOMIC) || "''";
  const rate = block.getFieldValue('RATE') || '136';
  const suffix = block.getFieldValue('SUFFIX') || '0x06';

  const hexFn = registerHexToBytes();
  const padFn = registerSha3Pad();
  return `${left} = ${padFn}(${hexFn}(${right}), ${rate}, ${suffix});\n`;
};

/** SHA-3 padding — pad raw byte array input. */
javascriptGenerator.forBlock['hash_sha3_pad'] = function (
  block: Block,
): string {
  const left =
    javascriptGenerator.valueToCode(block, 'LEFT', Order.ATOMIC) || 'padded';
  const right =
    javascriptGenerator.valueToCode(block, 'RIGHT', Order.ATOMIC) || '[]';
  const rate = block.getFieldValue('RATE') || '136';
  const suffix = block.getFieldValue('SUFFIX') || '0x06';

  const padFn = registerSha3Pad();
  return `${left} = ${padFn}(${right}, ${rate}, ${suffix});\n`;
};

/** Keccak-f[1600] permutation — 24-round core of SHA-3/SHAKE. */
javascriptGenerator.forBlock['hash_sha3_keccak_f'] = function (
  block: Block,
): string {
  const out =
    javascriptGenerator.valueToCode(block, 'OUT', Order.ATOMIC) || 'keccak_out';
  const state =
    javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || '[]';

  const funcName = registerKeccakF1600();
  return `${out} = ${funcName}(${state});\n`;
};

/**
 * Sponge absorb phase — XOR padded blocks into state, permuting after each block.
 */
javascriptGenerator.forBlock['hash_sha3_absorb'] = function (
  block: Block,
): string {
  const state =
    javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || 'state';
  const blockVal =
    javascriptGenerator.valueToCode(block, 'BLOCK', Order.ATOMIC) || 'data';
  const rateBits = parseInt(block.getFieldValue('RATE') || '1088');
  const rateBytes = Math.floor(rateBits / 8);

  const keccakName = registerKeccakF1600();

  const code = [];
  code.push(`var pad_${state} = ${blockVal};`);
  code.push(
    `for (var i_${state} = 0; i_${state} < pad_${state}.length; i_${state} += ${rateBytes}) {`,
  );
  code.push(
    `  for (var j_${state} = 0; j_${state} < ${rateBytes}; j_${state} += 8) {`,
  );
  code.push(`    var w_${state} = 0n;`);
  code.push(
    `    for (var b_${state} = 0; b_${state} < 8 && (i_${state}+j_${state}+b_${state}) < pad_${state}.length; b_${state}++) {`,
  );
  code.push(
    `      w_${state} |= BigInt(pad_${state}[i_${state}+j_${state}+b_${state}]) << BigInt(8*b_${state});`,
  );
  code.push('    }');
  code.push(`    ${state}[j_${state}/8] ^= w_${state};`);
  code.push('  }');
  code.push(`  ${state} = ${keccakName}(${state});`);
  code.push('}');
  code.push('');

  return code.join('\n');
};

/** State initialization — 25 zero BigInts (Keccak-f 1600-bit state). */
javascriptGenerator.forBlock['hash_sha3_state_init'] = function (
  _block: Block,
): [string, number] {
  return ['new Array(25).fill(0n)', Order.ATOMIC];
};

/**
 * Sponge squeeze phase — extract output bytes from state, permuting as needed.
 */
javascriptGenerator.forBlock['hash_sha3_squeeze'] = function (
  block: Block,
): string {
  const out =
    javascriptGenerator.valueToCode(block, 'OUT', Order.ATOMIC) || 'squeezed';
  const state =
    javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || 'state';
  const outLen =
    javascriptGenerator.valueToCode(block, 'OUTLEN', Order.ATOMIC) || '32';
  const rateBits = parseInt(block.getFieldValue('RATE') || '1088');
  const rateBytes = Math.floor(rateBits / 8);

  const keccakName = registerKeccakF1600();

  const code = [];
  code.push(`var ${out} = new Uint8Array(${outLen});`);
  code.push(`var cur_${out} = 0;`);
  code.push(`while (cur_${out} < ${outLen}) {`);
  code.push(
    `  for (var j_${out} = 0; j_${out} < ${rateBytes} && cur_${out} < ${outLen}; j_${out} += 8) {`,
  );
  code.push(`    var w_${out} = ${state}[j_${out}/8];`);
  code.push(
    `    for (var b_${out} = 0; b_${out} < 8 && cur_${out} < ${outLen}; b_${out}++) {`,
  );
  code.push(
    `      ${out}[cur_${out}++] = Number((w_${out} >> BigInt(8*b_${out})) & 0xFFn);`,
  );
  code.push('    }');
  code.push('  }');
  code.push(`  if (cur_${out} < ${outLen}) {`);
  code.push(`    ${state} = ${keccakName}(${state});`);
  code.push('  }');
  code.push('}');
  code.push('');

  return code.join('\n');
};
