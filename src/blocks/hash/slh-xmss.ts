/**
 * FIPS 205 XMSS 树根原子块。
 *
 * - slh_xmss_root: SLH_XMSS_Root(sk_seed, pk_seed, h_prime, layer, tree) → n 字节树根
 *   FIPS 205 §7.2 Algorithm 9（treeHash）+ Algorithm 10（wots_PKgen）+ §11.1 的
 *   SHAKE 变体哈希（simple thash：SHAKE256(PK.seed‖ADRS‖M, n)）。
 *   与 `hashbased.ts` 的教学哈希辅助（无密钥 SHAKE256 结构件）不同：本块按标准使用
 *   PRF（ADRS type 5）、WOTS_PK（type 1）与 TREE（type 2）地址。
 *   官方向量：NIST ACVP SLH-DSA-keyGen-FIPS205（SHAKE 参数集）的 pk 根字段。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_NUMBER } from '@/constants/block-types';

export const SLH_XMSS_BLOCK_TYPES = ['slh_xmss_root', 'slh_msg_randomness'] as const;
export type SlhXmssBlockType = (typeof SLH_XMSS_BLOCK_TYPES)[number];

const FIPS205_URL = 'https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.205.pdf';

Blockly.Blocks['slh_xmss_root'] = {
  init: function () {
    this.appendValueInput('SK_SEED').setCheck(TYPE_BYTES).appendField('SLH_XMSS_Root( sk_seed:');
    this.appendValueInput('PK_SEED').setCheck(TYPE_BYTES).appendField(' pk_seed:');
    this.appendValueInput('H_PRIME').setCheck(TYPE_NUMBER).appendField(' h′:');
    this.appendValueInput('LAYER').setCheck(TYPE_NUMBER).appendField(' layer:');
    this.appendValueInput('TREE').setCheck(TYPE_NUMBER).appendField(' tree:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(230);
    this.setTooltip(
      'XMSS 树根（FIPS 205 §7.2 Algorithm 9/10，SHAKE 变体）：按 ADRS 分层地址计算高度 h′ 的 XMSS 树根，n 由种子长度决定（16/24/32）。SLH-DSA 顶层树取 layer = d−1、tree = 0，其根即公钥的 PK.root（ACVP SLH-DSA-keyGen 向量核对）。本块只算树根，不产生签名。',
    );
    this.setHelpUrl(FIPS205_URL);
  },
};

/** FIPS 205 §10.1/§11.1：pure SLH-DSA 的消息随机数 R。 */
Blockly.Blocks['slh_msg_randomness'] = {
  init: function () {
    this.appendValueInput('SK_PRF').setCheck(TYPE_BYTES).appendField('SLH 消息随机数 R( sk_prf:');
    this.appendValueInput('OPT_RAND').setCheck(TYPE_BYTES).appendField(' opt_rand:');
    this.appendValueInput('MESSAGE').setCheck(TYPE_BYTES).appendField(' msg:');
    this.appendValueInput('CONTEXT').setCheck(TYPE_BYTES).appendField(' ctx:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(230);
    this.setTooltip(
      'pure SLH-DSA 的消息随机数 R（FIPS 205 §10.1 + §11.1，SHAKE 变体）：先按 M′ = 0x00 ‖ |ctx| ‖ ctx ‖ M 编码（|ctx| ≤ 255），再算 R = SHAKE256(SK.prf ‖ opt_rand ‖ M′, n)。确定性签名取 opt_rand = PK.seed；R 是签名串的前 n 字节，已用 ACVP sigGen 向量核对。',
    );
    this.setHelpUrl(FIPS205_URL);
  },
};
