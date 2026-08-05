/**
 * WOTS+ 校验和块定义（SPHINCS+/SLH-DSA 结构件）
 *
 * wots_checksum(M) → 校验和 4-bit 块数组（IntList，MSB 在前）
 *
 * WOTS+（w=16，a=4）：消息按 4-bit 分块（每字节高半字节先），len1 = 2·len(M)，
 * csum = Σ(w−1−块值)；校验和编码为 len2 = ⌊log₂(len1·(w−1))/a⌋+1 个 4-bit 块（MSB 在前）。
 *
 * 教学点（WOTS+ 防伪造核心）：消息位翻转（块值增大）→ 校验和块值减小——
 * 校验和链需要更多哈希迭代，攻击者无法同时降低消息链与校验和链。
 * 性质向量：全 0 → csum 最大编码、全 15 → [0,0]、单调性。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_INT_LIST } from '@/constants/block-types';

export const WOTS_BLOCK_TYPES = ['wots_checksum'] as const;
export type WotsBlockType = (typeof WOTS_BLOCK_TYPES)[number];

const WOTS_COLOUR = 230;
const FIPS205_URL = 'https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.205.pdf';

Blockly.Blocks['wots_checksum'] = {
  init: function () {
    this.appendValueInput('M')
      .setCheck(TYPE_BYTES)
      .appendField('WOTS+ Checksum(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(WOTS_COLOUR);
    this.setTooltip(
      'WOTS+ 校验和（w=16）：消息按 4-bit 分块（高半字节先），csum = Σ(15−块值)，' +
        '输出 csum 的 4-bit 块数组（MSB 在前，len2=⌊log₂(len1·15)/4⌋+1）。' +
        '消息块增大 → 校验和减小——WOTS+ 防伪造核心性质。',
    );
    this.setHelpUrl(FIPS205_URL);
  },
};
