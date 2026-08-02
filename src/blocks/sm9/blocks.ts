/**
 * SM9 数字签名原子块定义 (GB/T 38635.2-2020 / GM/T 0044.2-2016)
 *
 * - sm9_master_key: KGC 签名主公钥 Ppub = [ks]P2（G2 点，128 字节 = x0‖x1‖y0‖y1，u²=-2）
 * - sm9_user_key:   用户签名私钥 ds = [ks·(H1(ID‖hid)+ks)⁻¹]P1（G1 点，64 字节 = x‖y）
 * - sm9_sign:       签名 (h, S) = (H2(M‖w), [l]ds)，w = e(P1, Ppub)^r，输出 h(32)‖S(65, 04 前缀)
 * - sm9_verify:     验签 Q = [H1(ID‖hid)]P2 + Ppub，w' = e(S, Q)·g^h，h' = H2(M‖w') == h?
 *
 * 官方向量（GB/T 38635.2-2020 附录 A，ks/IDA=Alice/hid=01/M="Chinese IBS standard"）双语言通过。
 * 双线性对为 BN 曲线 R-ate pairing（Fp12 塔域 u²=-2, s³=u, t²=s）。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_BOOLEAN } from '@/constants/block-types';

export const SM9_BLOCK_TYPES = [
  'sm9_master_key',
  'sm9_user_key',
  'sm9_sign',
  'sm9_verify',
] as const;
export type Sm9BlockType = (typeof SM9_BLOCK_TYPES)[number];

/** 签名私钥生成函数标识符下拉（GB/T 41389-2022：0x01 签名 / 0x03 加密） */
function hidDropdown(): Blockly.FieldDropdown {
  const d = new Blockly.FieldDropdown([
    ['01 签名', '1'],
    ['03 加密', '3'],
  ]);
  d.setValue('1');
  return d;
}

Blockly.Blocks['sm9_master_key'] = {
  init: function () {
    this.appendValueInput('KS')
      .setCheck(TYPE_BYTES)
      .appendField('SM9-MasterKey(');
    this.appendDummyInput().appendField('ks:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'SM9 签名主公钥生成 (GB/T 38635.2-2020)：Ppub = [ks]P2 ∈ G2，输出 128 字节（x0‖x1‖y0‖y1，Fp2 塔域 u²=-2）。官方向量验证通过。',
    );
    this.setHelpUrl('https://openstd.samr.gov.cn/');
  },
};

Blockly.Blocks['sm9_user_key'] = {
  init: function () {
    this.appendValueInput('KS')
      .setCheck(TYPE_BYTES)
      .appendField('SM9-UserKey(');
    this.appendValueInput('ID').setCheck(TYPE_BYTES).appendField(' id:');
    this.appendDummyInput().appendField(hidDropdown(), 'HID').appendField(' hid:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'SM9 用户签名私钥生成 (GB/T 38635.2-2020)：ds = [ks·(H1(ID‖hid)+ks)⁻¹]P1 ∈ G1，输出 64 字节（x‖y）。官方向量验证通过。',
    );
    this.setHelpUrl('https://openstd.samr.gov.cn/');
  },
};

Blockly.Blocks['sm9_sign'] = {
  init: function () {
    this.appendValueInput('MSG')
      .setCheck(TYPE_BYTES)
      .appendField('SM9-Sign(');
    this.appendValueInput('DS').setCheck(TYPE_BYTES).appendField(' ds:');
    this.appendValueInput('PPUB').setCheck(TYPE_BYTES).appendField(' Ppub:');
    this.appendValueInput('R').setCheck(TYPE_BYTES).appendField(' r:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'SM9 数字签名 (GB/T 38635.2-2020)：g = e(P1,Ppub)，w = g^r，h = H2(M‖w)，l = (r-h) mod N，S = [l]ds。输出 h(32)‖S(65, 0x04‖x‖y)。r 传 32 字节固定随机数，空数组则自动随机。官方向量验证通过。',
    );
    this.setHelpUrl('https://openstd.samr.gov.cn/');
  },
};

Blockly.Blocks['sm9_verify'] = {
  init: function () {
    this.appendValueInput('MSG')
      .setCheck(TYPE_BYTES)
      .appendField('SM9-Verify(');
    this.appendValueInput('ID').setCheck(TYPE_BYTES).appendField(' id:');
    this.appendValueInput('H').setCheck(TYPE_BYTES).appendField(' h:');
    this.appendValueInput('S').setCheck(TYPE_BYTES).appendField(' S:');
    this.appendValueInput('PPUB').setCheck(TYPE_BYTES).appendField(' Ppub:');
    this.appendDummyInput().appendField(hidDropdown(), 'HID').appendField(' hid:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BOOLEAN);
    this.setColour(190);
    this.setTooltip(
      'SM9 验签 (GB/T 38635.2-2020)：Q = [H1(ID‖hid)]P2 + Ppub，w\' = e(S,Q)·g^h，h\' = H2(M‖w\') 与 h 比对。官方向量验证通过。',
    );
    this.setHelpUrl('https://openstd.samr.gov.cn/');
  },
};
