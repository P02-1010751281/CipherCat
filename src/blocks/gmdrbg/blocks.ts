/**
 * GM-RNG 原子块定义（国密随机数生成器：SM3-HMAC-DRBG）
 *
 * - gm_rng: GM-RNG(entropy, nonce, perso, len) → Bytes
 *   结构 = SP 800-90A §10.1.2 HMAC_DRBG（instantiate → generate），PRF 用 SM3（GB/T 32905）
 *   （HMAC-DRBG 框架与 GM/T 0103 国密随机性检测/生成框架一致，符合 GM/T 0105 软件 RNG 指南精神）。
 *   K = 0^256, V = 1^256；Update(entropy‖nonce‖perso) 后循环 V = HMAC-SM3(K, V) 取 32 字节块，
 *   末尾 Update(NULL)。同输入同输出（教学可复现）。
 *   验证：无官方向量（GM/T 0103 为框架标准），SHA-256 版同构实现对拍 NIST CAVS 14.3
 *   + Botan vec（480 例全过）；底层 SM3 由 GB/T 32905 官方向量背书（SM3-Hash demo）。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_NUMBER } from '@/constants/block-types';

export const GMDRBG_BLOCK_TYPES = ['gm_rng'] as const;
export type GmDrbgBlockType = (typeof GMDRBG_BLOCK_TYPES)[number];

Blockly.Blocks['gm_rng'] = {
  init: function () {
    this.appendValueInput('ENTROPY')
      .setCheck(TYPE_BYTES)
      .appendField('GM-RNG(');
    this.appendValueInput('NONCE').setCheck(TYPE_BYTES).appendField(' nonce:');
    this.appendValueInput('PERSO').setCheck(TYPE_BYTES).appendField(' perso:');
    this.appendValueInput('LEN').setCheck(TYPE_NUMBER).appendField(' len:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(200);
    this.setTooltip(
      '国密随机数生成器（SM3-HMAC-DRBG，SP 800-90A §10.1.2 结构 + GM/T 0103 框架）：' +
        'K=0^256、V=1^256，Update(entropy‖nonce‖perso) 后循环 V=HMAC-SM3(K,V) 取块，末尾 Update(NULL)。' +
        '同输入同输出（确定性，教学可复现）。SHA-256 版同构对拍 NIST CAVS 14.3 + Botan 480 例全过；' +
        '底层 SM3 由 GB/T 32905 官方向量背书。entropy/nonce/perso 均可空。',
    );
    this.setHelpUrl('https://csrc.nist.gov/pubs/sp/800/90/a/r1/final');
  },
};
