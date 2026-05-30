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
import * as Blockly from 'blockly/core';

export const SHA3_BLOCK_TYPES = [
  'hash_sha3_pad_text',
  'hash_sha3_pad_hex',
  'hash_sha3_pad',
  'hash_sha3_keccak_f',
  'hash_sha3_absorb',
  'hash_sha3_squeeze',
  'hash_sha3_state_init'
] as const;

export type Sha3BlockType = typeof SHA3_BLOCK_TYPES[number];

// SHA-3 文本字符串填充：将 UTF-8 文本输入按 pad10*1 规则填充
// 默认参数: r=1088 (SHA3-256), suffix=0x06 (SHA-3 域分离)
Blockly.Blocks['hash_sha3_pad_text'] = {
  init: function() {
    this.appendValueInput('LEFT').setCheck(null);
    this.appendDummyInput().appendField(Blockly.Msg.CRYPTO_SHA3_PAD_TEXT || '= SHA-3 Text Pad(');
    this.appendValueInput('RIGHT').setCheck(null);
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_SHA3_PAD_TEXT_TOOLTIP || 'SHA-3 pad10*1 padding (UTF-8 text input), aligned to rate r');
    this.setHelpUrl('https://csrc.nist.gov/pubs/fips/202/final');
  }
};

// SHA-3 十六进制字符串填充：将十六进制输入转换为字节后按 pad10*1 规则填充
Blockly.Blocks['hash_sha3_pad_hex'] = {
  init: function() {
    this.appendValueInput('LEFT').setCheck(null);
    this.appendDummyInput().appendField(Blockly.Msg.CRYPTO_SHA3_PAD_HEX || '= SHA-3 Hex Pad(');
    this.appendValueInput('RIGHT').setCheck(null);
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_SHA3_PAD_HEX_TOOLTIP || 'SHA-3 pad10*1 padding (hex input), aligned to rate r');
    this.setHelpUrl('https://csrc.nist.gov/pubs/fips/202/final');
  }
};

// SHA-3 通用填充：支持自定义比特率 r 和域分离后缀 d
// pad10*1 规则: M || d || 0x00…0x00 ⊕ 0x00…0x80
// 当 q=1 时需额外补一个块 (FIPS 202 §5.1)
Blockly.Blocks['hash_sha3_pad'] = {
  init: function() {
    this.appendValueInput('LEFT').setCheck(null);
    this.appendDummyInput().appendField(Blockly.Msg.CRYPTO_SHA3_PAD || '= SHA-3 Pad(');
    this.appendValueInput('RIGHT').setCheck(null);
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_SHA3_RATE || ', Rate r=')
      .appendField(new Blockly.FieldDropdown([
        ['1088 (SHA3-256)', '1088'],
        ['576 (SHA3-512)', '576'],
        ['1152 (SHA3-224)', '1152'],
        ['832 (SHA3-384)', '832'],
        ['1344 (SHAKE128)', '1344'],
      ]), 'RATE');
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_SHA3_SUFFIX || 'Suffix d=')
      .appendField(new Blockly.FieldDropdown([
        ['0x06 (SHA-3)', '0x06'],
        ['0x1F (SHAKE)', '0x1F'],
      ]), 'SUFFIX');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_SHA3_PAD_TOOLTIP || 'SHA-3 pad10*1 padding: M || d || 0x00…0x00 xor 0x00…0x80, aligned to rate r (FIPS 202)');
    this.setHelpUrl('https://csrc.nist.gov/pubs/fips/202/final');
  }
};

// Keccak-f[b] 置换函数
// b=1600 时执行 24 轮，每轮包含 5 个步骤:
//   θ (theta) — 列校验和扩散: C[x]=⊕A[x,y], D[x]=C[x-1]⊕rot(C[x+1],1)
//   ρ (rho)   — lane 内循环移位: 使用 FIPS 202 Table 2 的旋转偏移量
//   π (pi)    — lane 位置置换: B[y,2x+3y]=rot(A[x,y],r[x,y])
//   χ (chi)   — 非线性运算: A[x,y]=B[x,y]⊕((¬B[x+1,y])∧B[x+2,y])
//   ι (iota)  — 轮常数异或: A[0,0]⊕=RC[round]
// 状态表示: 5×5 lanes 数组，每 lane 为 64-bit (b=1600)
Blockly.Blocks['hash_sha3_keccak_f'] = {
  init: function() {
    this.appendValueInput('OUT').setCheck(null);
    this.appendDummyInput().appendField('= Keccak-f[');
    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        ['1600', '1600'],
        ['800', '800'],
        ['400', '400'],
        ['200', '200'],
      ]), 'WIDTH');
    this.appendDummyInput().appendField('](');
    this.appendValueInput('STATE').setCheck(null);
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_SHA3_KECCAK_F_TOOLTIP || 'Keccak-f[b] permutation: 24 rounds (θ→ρ→π→χ→ι), state is 5×5 lanes array (FIPS 202)');
    this.setHelpUrl('https://csrc.nist.gov/pubs/fips/202/final');
  }
};

// 海绵结构吸收阶段 (FIPS 202 §4)
// 将消息块 Pi 异或到状态的前 r/w 个 lanes，然后执行 Keccak-f 置换
// State[x,y] ^= Pi[x+5*y], for x+5*y < r/w
// State = Keccak-f[r+c](State)
Blockly.Blocks['hash_sha3_absorb'] = {
  init: function() {
    this.appendValueInput('STATE').setCheck(null);
    this.appendDummyInput().appendField(Blockly.Msg.CRYPTO_SHA3_ABSORB || '= Absorb(');
    this.appendValueInput('BLOCK').setCheck(null);
    this.appendDummyInput().appendField(Blockly.Msg.CRYPTO_SHA3_RATE || ', Rate r=');
    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        ['1088', '1088'],
        ['576', '576'],
        ['1152', '1152'],
        ['832', '832'],
        ['1344', '1344'],
      ]), 'RATE');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_SHA3_ABSORB_TOOLTIP || 'Sponge absorb phase: State ^= Pi, then State = Keccak-f(State)');
    this.setHelpUrl('https://csrc.nist.gov/pubs/fips/202/final');
  }
};

// 海绵结构挤压阶段 (FIPS 202 §4)
// 从状态中读取前 r/w 个 lanes 作为输出
// 若输出长度不足，再执行 Keccak-f 置换后继续读取
// Z = Z || S[x,y], for x+5*y < r/w
Blockly.Blocks['hash_sha3_squeeze'] = {
  init: function() {
    this.appendValueInput('OUT').setCheck(null);
    this.appendDummyInput().appendField(Blockly.Msg.CRYPTO_SHA3_SQUEEZE || '= Squeeze(');
    this.appendValueInput('STATE').setCheck(null);
    this.appendDummyInput().appendField(Blockly.Msg.CRYPTO_SHA3_OUTLEN || ', Output Bytes=');
    this.appendValueInput('OUTLEN').setCheck(null);
    this.appendDummyInput().appendField(Blockly.Msg.CRYPTO_SHA3_RATE || ', Rate r=');
    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        ['1088', '1088'],
        ['576', '576'],
        ['1152', '1152'],
        ['832', '832'],
        ['1344', '1344'],
      ]), 'RATE');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_SHA3_SQUEEZE_TOOLTIP || 'Sponge squeeze phase: read r bits from state, re-run Keccak-f if more output needed');
    this.setHelpUrl('https://csrc.nist.gov/pubs/fips/202/final');
  }
};

Blockly.Blocks['hash_sha3_state_init'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Keccak State Init [0]*25');
    this.setOutput(true, null);
    this.setColour(200);
    this.setTooltip('Initialize Keccak-f[1600] state as 25 zero lanes. Required before sha3_absorb.');
    this.setHelpUrl('https://csrc.nist.gov/pubs/fips/202/final');
  }
};
