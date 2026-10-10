/**
 * SM2 公钥加密原子块定义（GB/T 32918.4-2016）
 *
 * - sm2_encrypt: SM2 加密。内嵌 Fp-256 测试曲线（标准附录 A 示例 2）：
 *   C1 = 04‖x1‖y1（[k]G，65 字节），[k]PB = (x2,y2)，
 *   t = KDF(x2‖y2, klen)（GB/T 32918.3 SM3-KDF），C2 = M ⊕ t，
 *   C3 = SM3(x2‖M‖y2)，输出 C1‖C3‖C2 十六进制字符串。
 * - sm2_decrypt: SM2 解密。[d]C1 = (x2,y2)，t = KDF(x2‖y2, klen)，
 *   M' = C2 ⊕ t，u = SM3(x2‖M'‖y2) 校验 == C3，输出明文字节。
 *   官方向量：GB/T 32918.4-2016 附录 A 示例 2（M = "encryption standard"），
 *   加密输出 C1C3C2 与官方一致、解密还原 M，JS/Python 双语言全 PASS。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_NUMBER, TYPE_STRING } from '@/constants/block-types';

export const SM2ENC_BLOCK_TYPES = [
  'sm2_encrypt',
  'sm2_decrypt',
  'sm2_key_exchange',
] as const;
export type Sm2EncBlockType = (typeof SM2ENC_BLOCK_TYPES)[number];
Blockly.Blocks['sm2_encrypt'] = {
  init: function () {
    this.appendValueInput('MSG')
      .setCheck(TYPE_BYTES)
      .appendField('SM2-Encrypt( msg:');
    this.appendValueInput('PX').setCheck(TYPE_STRING).appendField(' pax:');
    this.appendValueInput('PY').setCheck(TYPE_STRING).appendField(' pay:');
    this.appendValueInput('K').setCheck(TYPE_STRING).appendField(' k:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_STRING);
    this.setColour(190);
    this.setTooltip(
      'SM2 公钥加密 (GB/T 32918.4-2016)。msg = 明文字节，pax/pay = 接收方公钥 PB 坐标 hex(32B)，k = 随机数 hex(32B)（须在 [1, n-1]，必填以便向量确定性）。' +
        '内部：C1 = 04‖x1‖y1（[k]G），t = KDF(x2‖y2, klen)，C2 = M⊕t，C3 = SM3(x2‖M‖y2)。' +
        '输出 C1‖C3‖C2 十六进制字符串。官方向量（附录 A 示例 2）全 PASS。',
    );
    this.setHelpUrl('https://std.samr.gov.cn/gb/search/gbDetailed?id=71F772D8055ED3A7E05397BE0A0AB82A');
  },
};

Blockly.Blocks['sm2_decrypt'] = {
  init: function () {
    this.appendValueInput('CT')
      .setCheck(TYPE_STRING)
      .appendField('SM2-Decrypt( ct:');
    this.appendValueInput('DA').setCheck(TYPE_STRING).appendField(' da:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'SM2 公钥解密 (GB/T 32918.4-2016)。ct = 密文 hex（C1‖C3‖C2，C1 为 04‖x1‖y1 共 65 字节），da = 私钥 hex(32B)。' +
        '内部：[d]C1 = (x2,y2)，t = KDF(x2‖y2, klen)，M\' = C2⊕t，校验 u = SM3(x2‖M\'‖y2) == C3，' +
        '不一致抛错（密文被篡改）。输出明文字节。官方向量（附录 A 示例 2）全 PASS。',
    );
    this.setHelpUrl('https://std.samr.gov.cn/gb/search/gbDetailed?id=71F772D8055ED3A7E05397BE0A0AB82A');
  },
};

// SM2 密钥交换（GB/T 32918.3-2016 §6.1，响应方 B 侧 B1-B7 共享密钥派生）
// 输入：dB = B 私钥 hex(32B)，rB = B 临时随机数 hex(32B)，
//   PAX/PAY = A 公钥坐标 hex，RA = A 临时点 hex(65B 04‖x1‖y1)，RB = B 临时点 hex(65B)，
//   ZA/ZB = 杂凑值 hex，WLEN = 共享密钥位数。
// 内部：RB = [rB]G；tB = (dB + x̄2·rB) mod n；V = [h·tB](PA + [x̄1]RA)；
//   K = KDF(xV‖yV‖ZA‖ZB, klen)。验证标量范围、曲线点、RB/rB 一致性、ZA/ZB 长度及 KDF 长度。
// 输出：共享密钥 K hex；不实现可选密钥确认 B8/B9，也不实现发起方 A 侧。
Blockly.Blocks['sm2_key_exchange'] = {
  init: function () {
    this.appendValueInput('DB')
      .setCheck(TYPE_STRING)
      .appendField('SM2-KeyExchange( dB:');
    this.appendValueInput('RBVAL').setCheck(TYPE_STRING).appendField(' rB:');
    this.appendValueInput('PAX').setCheck(TYPE_STRING).appendField(' pax:');
    this.appendValueInput('PAY').setCheck(TYPE_STRING).appendField(' pay:');
    this.appendValueInput('RA').setCheck(TYPE_STRING).appendField(' RA:');
    this.appendValueInput('RBP').setCheck(TYPE_STRING).appendField(' RB:');
    this.appendValueInput('ZA').setCheck(TYPE_STRING).appendField(' ZA:');
    this.appendValueInput('ZB').setCheck(TYPE_STRING).appendField(' ZB:');
    this.appendValueInput('WLEN').setCheck(TYPE_NUMBER).appendField(' wlen:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_STRING);
    this.setColour(190);
    this.setTooltip(
      'SM2 密钥交换 (GB/T 32918.3-2016 §6.1，响应方 B 侧 B1-B7)。dB/rB 为 32 字节 hex 标量且须在 [1,n−1]；' +
        'pax/pay 是 A 的曲线公钥坐标；RA/RB 是 04 前缀的 65 字节未压缩点，RB 必须等于 [rB]G；ZA/ZB 为 32 字节 hex；' +
        'wlen 为小于 (2^32−1)×256 的正安全整数位数。输出 K=KDF(xV‖yV‖ZA‖ZB,wlen)。不实现可选密钥确认 B8/B9 或发起方 A 侧。' +
        'GB/T 32918.3-2016 附录 A.2 示例 1 的 B 侧共享密钥向量通过；不表示完整密钥交换符合性。',
    );
    this.setHelpUrl('https://std.samr.gov.cn/gb/search/gbDetailed?id=71F772D8055ED3A7E05397BE0A0AB82A');
  },
};
