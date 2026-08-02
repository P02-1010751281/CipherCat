/**
 * SM2 数字签名原子块定义（GB/T 32918.2-2016）
 *
 * - sm2_sign: SM2 签名。内嵌 Fp-256 测试曲线（标准附录 A 示例 1）：
 *   ZA = SM3(ENTLA ‖ IDA ‖ a ‖ b ‖ Gx ‖ Gy ‖ PAx ‖ PAy)（ENTLA = IDA 比特长度 2 字节大端）
 *   e = SM3(ZA ‖ M)，(x1,y1) = [k]G，r = (e + x1) mod n，s = ((1+dA)^-1·(k - r·dA)) mod n
 *   输出 r‖s（各 32 字节大端，共 64 字节）。k 为空时随机生成。
 * - sm2_verify: SM2 验签。t = (r+s) mod n，(x0',y0') = [s]G + [t]PA，R = (e + x0') mod n == r。
 *   官方向量：GB/T 32918.2-2016 附录 A 示例 1（IDA="ALICE123@YAHOO.COM"），
 *   ZA/e/r/s 中间值全部与向量一致，JS/Python 双语言全 PASS。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_STRING, TYPE_BOOLEAN } from '@/constants/block-types';

export const SM2SIG_BLOCK_TYPES = ['sm2_sign', 'sm2_verify'] as const;
export type Sm2SigBlockType = (typeof SM2SIG_BLOCK_TYPES)[number];

Blockly.Blocks['sm2_sign'] = {
  init: function () {
    this.appendValueInput('DA')
      .setCheck(TYPE_STRING)
      .appendField('SM2-Sign( da:');
    this.appendValueInput('IDA').setCheck(TYPE_STRING).appendField(' ida:');
    this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField(' msg:');
    this.appendValueInput('K').setCheck(TYPE_STRING).appendField(' k:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'SM2 数字签名 (GB/T 32918.2-2016)。da = 私钥 hex(32B)，ida = 用户标识字符串，msg = 消息字节，k = 随机数 hex(32B)（留空则随机生成）。' +
        '输出 r‖s 各 32 字节大端（64 字节）。内嵌 Fp-256 测试曲线，官方向量（附录 A 示例 1）ZA/e/r/s 全 PASS。',
    );
    this.setHelpUrl('https://std.samr.gov.cn/gb/search/gbDetailed?id=71F772D8055ED3A7E05397BE0A0AB82A');
  },
};

Blockly.Blocks['sm2_verify'] = {
  init: function () {
    this.appendValueInput('PAX')
      .setCheck(TYPE_STRING)
      .appendField('SM2-Verify( pax:');
    this.appendValueInput('PAY').setCheck(TYPE_STRING).appendField(' pay:');
    this.appendValueInput('IDA').setCheck(TYPE_STRING).appendField(' ida:');
    this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField(' msg:');
    this.appendValueInput('R').setCheck(TYPE_STRING).appendField(' r:');
    this.appendValueInput('S').setCheck(TYPE_STRING).appendField(' s:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BOOLEAN);
    this.setColour(190);
    this.setTooltip(
      'SM2 验签 (GB/T 32918.2-2016)。pax/pay = 公钥 PA 坐标 hex(32B)，ida = 用户标识字符串，msg = 消息字节，r/s = 签名 hex(32B)。' +
        '内部：t = (r+s) mod n，(x0\',y0\') = [s]G + [t]PA，R = (e + x0\') mod n，R == r 则通过。官方向量验证通过。',
    );
    this.setHelpUrl('https://std.samr.gov.cn/gb/search/gbDetailed?id=71F772D8055ED3A7E05397BE0A0AB82A');
  },
};
