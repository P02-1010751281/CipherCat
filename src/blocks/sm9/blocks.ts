/**
 * SM9 数字签名原子块定义 (GB/T 38635.2-2020 / GM/T 0044.2-2016)
 *
 * - sm9_master_key: KGC 签名主公钥 Ppub = [ks]P2（G2 点，128 字节 = x0‖x1‖y0‖y1，u²=-2）
 * - sm9_user_key:   用户签名私钥 ds = [ks·(H1(ID‖0x01)+ks)⁻¹]P1（G1 点，64 字节 = x‖y）
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

/** 签名专用 HID；加密用途需要由独立加密块实现。 */
function hidDropdown(): Blockly.FieldDropdown {
  const d = new Blockly.FieldDropdown([['01 签名', '1']]);
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
      'SM9 签名主公钥生成 (GB/T 38635.2-2020)：Ppub = [ks]P2 ∈ G2，输出 128 字节（x0‖x1‖y0‖y1，Fp2 塔域 u²=-2）。已核对附录 A 向量；不是完整标准测试集。',
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
      'SM9 用户签名私钥生成 (GB/T 38635.2-2020)：签名用途 hid 固定为 0x01；ds = [ks·(H1(ID‖0x01)+ks)⁻¹]P1 ∈ G1，输出 64 字节（x‖y）。已核对附录 A 向量；不是完整标准测试集。',
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
      'SM9 数字签名 (GB/T 38635.2-2020)：g = e(P1,Ppub)，w = g^r，h = H2(M‖w)，l = (r-h) mod N，S = [l]ds。输出 h(32)‖S(65, 0x04‖x‖y)。r 插槽留空时使用安全随机数；连接输入时须提供 32 字节且满足 1 ≤ r < N。已核对附录 A 向量；不是完整标准测试集。',
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
      'SM9 验签 (GB/T 38635.2-2020)：签名用途 hid 固定为 0x01；Q = [H1(ID‖0x01)]P2 + Ppub，w\' = e(S,Q)·g^h，h\' = H2(M‖w\') 与 h 比对。已核对附录 A 向量；不是完整标准测试集。',
    );
    this.setHelpUrl('https://openstd.samr.gov.cn/');
  },
};
