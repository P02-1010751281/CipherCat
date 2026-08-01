/**
 * SHA-3 (Keccak) 积木块定义
 *
 * 基于 FIPS 202 标准实现，涵盖海绵构造的完整流程：
 *   1. pad10*1 填充 — 按比特率 r 对齐消息，附加域分离后缀 d
 *   2. Keccak-f[b] 置换 — 24 轮迭代 (θ→ρ→π→χ→ι)
 *   3. 吸收 (Absorb) — State ^= Pi, 然后 State = Keccak-f(State)
 *   4. 挤压 (Squeeze) — 从状态中读取 r 位输出
 *
 * 标准实例参数 (FIPS 202 Table 3):
 *   SHA3-256: r=1088, c=512, suffix=0x06
 *   SHA3-512: r=576,  c=1024, suffix=0x06
 *   SHAKE128: r=1344, c=256,  suffix=0x1F
 *   SHAKE256: r=1088, c=512,  suffix=0x1F
 *
 * 参考: https://csrc.nist.gov/pubs/fips/202/final
 *       https://keccak.team/keccak_specs_summary.html
 */
import { TYPE_BYTES, TYPE_INT_LIST, TYPE_NUMBER } from '@/constants/block-types';
import * as Blockly from 'blockly/core';

export const SHA3_BLOCK_TYPES = [
  'keccak_state_init',
  'keccak_f',
  'sponge_pad',
  'hash_sha3_pad_text',
  'hash_sha3_pad_hex',
  'sponge_absorb',
  'sponge_squeeze',
] as const;

export type Sha3BlockType = (typeof SHA3_BLOCK_TYPES)[number];

// SHA-3 pad10*1 — text input, returns padded bytes
Blockly.Blocks['hash_sha3_pad_text'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_SHA3_PAD_TEXT || 'SHA-3 Text Pad');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(200);
    this.setTooltip(
      Blockly.Msg.CRYPTO_SHA3_PAD_TEXT_TOOLTIP ||
        'SHA-3 pad10*1 padding (UTF-8 text input)',
    );
    this.setHelpUrl('https://csrc.nist.gov/pubs/fips/202/final');
  },
};

// SHA-3 pad10*1 — hex input, returns padded bytes
Blockly.Blocks['hash_sha3_pad_hex'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_SHA3_PAD_HEX || 'SHA-3 Hex Pad');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(200);
    this.setTooltip(
      Blockly.Msg.CRYPTO_SHA3_PAD_HEX_TOOLTIP ||
        'SHA-3 pad10*1 padding (hex input)',
    );
    this.setHelpUrl('https://csrc.nist.gov/pubs/fips/202/final');
  },
};

// SHA-3 pad10*1 — configurable rate and suffix, returns padded bytes
Blockly.Blocks['sponge_pad'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_SHA3_PAD || 'SHA-3 Pad');
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_SHA3_RATE || 'rate=')
      .appendField(
        new Blockly.FieldDropdown([
          ['1088 (SHA3-256)', '1088'],
          ['576 (SHA3-512)', '576'],
          ['1152 (SHA3-224)', '1152'],
          ['832 (SHA3-384)', '832'],
          ['1344 (SHAKE128)', '1344'],
        ]),
        'RATE',
      );
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_SHA3_SUFFIX || 'suffix=')
      .appendField(
        new Blockly.FieldDropdown([
          ['0x06 (SHA-3)', '0x06'],
          ['0x1F (SHAKE)', '0x1F'],
        ]),
        'SUFFIX',
      );
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(200);
    this.setTooltip(
      Blockly.Msg.CRYPTO_SHA3_PAD_TOOLTIP ||
        'SHA-3 pad10*1: M || d || 0* || 0x80 (FIPS 202)',
    );
    this.setHelpUrl('https://csrc.nist.gov/pubs/fips/202/final');
  },
};

// Keccak-f[b] permutation — 24 rounds, 5×5 lane state, returns permuted state
// Steps: θ (theta), ρ (rho), π (pi), χ (chi), ι (iota)
Blockly.Blocks['keccak_f'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('Keccak-f[')
      .appendField(
        new Blockly.FieldDropdown([
          ['1600', '1600'],
        ]),
        'WIDTH',
      )
      .appendField(']');
    this.appendValueInput('STATE').setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(200);
    this.setTooltip(
      Blockly.Msg.CRYPTO_SHA3_KECCAK_F_TOOLTIP ||
        'Keccak-f[b] permutation: 24 rounds (θ→ρ→π→χ→ι), state is 5×5 lanes (FIPS 202)',
    );
    this.setHelpUrl('https://csrc.nist.gov/pubs/fips/202/final');
  },
};

// Sponge absorb (FIPS 202 §4): XOR block into state lanes, then Keccak-f
Blockly.Blocks['sponge_absorb'] = {
  init: function () {
    this.appendDummyInput().appendField(
      Blockly.Msg.CRYPTO_SHA3_ABSORB || 'Absorb',
    );
    this.appendValueInput('STATE').setCheck(null).appendField('state=');
    this.appendValueInput('BLOCK').setCheck(TYPE_BYTES).appendField('block=');
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_SHA3_RATE || 'rate=')
      .appendField(
        new Blockly.FieldDropdown([
          ['1088', '1088'],
          ['576', '576'],
          ['1152', '1152'],
          ['832', '832'],
          ['1344', '1344'],
        ]),
        'RATE',
      );
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(200);
    this.setTooltip(
      Blockly.Msg.CRYPTO_SHA3_ABSORB_TOOLTIP ||
        'Sponge absorb: State ^= Pi, then Keccak-f(State)',
    );
    this.setHelpUrl('https://csrc.nist.gov/pubs/fips/202/final');
  },
};

// Sponge squeeze (FIPS 202 §4): read r bits from state, re-permute if needed
Blockly.Blocks['sponge_squeeze'] = {
  init: function () {
    this.appendDummyInput().appendField(
      Blockly.Msg.CRYPTO_SHA3_SQUEEZE || 'Squeeze',
    );
    this.appendValueInput('STATE').setCheck(null).appendField('state=');
    this.appendValueInput('OUTLEN')
      .setCheck(TYPE_NUMBER)
      .appendField(Blockly.Msg.CRYPTO_SHA3_OUTLEN || 'outLen=');
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_SHA3_RATE || 'rate=')
      .appendField(
        new Blockly.FieldDropdown([
          ['1088', '1088'],
          ['576', '576'],
          ['1152', '1152'],
          ['832', '832'],
          ['1344', '1344'],
        ]),
        'RATE',
      );
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(200);
    this.setTooltip(
      Blockly.Msg.CRYPTO_SHA3_SQUEEZE_TOOLTIP ||
        'Sponge squeeze: read r bits from state, re-run Keccak-f if needed',
    );
    this.setHelpUrl('https://csrc.nist.gov/pubs/fips/202/final');
  },
};

// Keccak sponge initial state: 5×5 lanes of zeros
Blockly.Blocks['keccak_state_init'] = {
  init: function () {
    this.appendDummyInput().appendField('Keccak Init');
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(200);
    this.setTooltip('Initialize Keccak-f[1600] state as 25 zero lanes.');
    this.setHelpUrl('https://csrc.nist.gov/pubs/fips/202/final');
  },
};
