/**
 * RSA 原子块定义（FIPS 186-4 密钥生成 + PKCS#1 v1.5 加解密/签名，RFC 8017）
 *
 * - rsa_keygen:  RSA-KeyGen(bits) → Bytes
 *   key = n(k)‖e(4)‖d(k)‖p(k/2)‖q(k/2)（定长大端，k = bits/8）
 *   FIPS 186-4 风格：Miller-Rabin + 小素数筛随机素数 p/q，e = 65537，d = e⁻¹ mod λ(n)。
 * - rsa_encrypt / rsa_decrypt: PKCS#1 v1.5（EM = 0x00‖0x02‖PS(≥8 随机非零)‖0x00‖M）
 * - rsa_sign / rsa_verify: PKCS#1 v1.5 + SHA-256（DigestInfo = SEQUENCE{sha256, hash}）
 *   验证：无 RFC 数值向量 → cryptography 49 交叉验证全 PASS（加解密/签名/验签双向
 *   + keygen 输出被 cryptography 接受，1024 位）。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_BOOLEAN } from '@/constants/block-types';

export const RSA_BLOCK_TYPES = [
  'rsa_keygen',
  'rsa_encrypt',
  'rsa_decrypt',
  'rsa_sign',
  'rsa_verify',
] as const;
export type RsaBlockType = (typeof RSA_BLOCK_TYPES)[number];

Blockly.Blocks['rsa_keygen'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('RSA-KeyGen(')
      .appendField(
        new Blockly.FieldDropdown([
          ['512 (教学)', '512'],
          ['1024', '1024'],
          ['2048', '2048'],
        ]),
        'BITS',
      )
      .appendField('-bit)');
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'RSA 密钥生成 (FIPS 186-4)：随机 p/q（Miller-Rabin + 小素数筛），e=65537，d=e⁻¹ mod λ(n)。' +
        '输出 Bytes key = n‖e‖d‖p‖q（定长大端：n/d 各 k 字节、e 4 字节、p/q 各 k/2 字节，k=bits/8）。' +
        '512 位教学可跑（勿用于真实安全）；1024/2048 位生成较慢但支持。keygen 输出已通过 cryptography 1024 位接受性验证。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-4.pdf');
  },
};

Blockly.Blocks['rsa_encrypt'] = {
  init: function () {
    this.appendValueInput('KEY')
      .setCheck(TYPE_BYTES)
      .appendField('RSA-Encrypt(');
    this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField(' msg:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'RSA 公钥加密 (RFC 8017 §7.2, PKCS#1 v1.5)：EM = 0x00‖0x02‖PS(≥8 随机非零)‖0x00‖M，C = m^e mod n。' +
        'KEY 取 n‖e‖d‖p‖q 前缀的 n 与 e；明文长度 ≤ k-11（k = bits/8）。' +
        'cryptography 交叉验证通过（自实现 encrypt → cryptography decrypt）。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc8017');
  },
};

Blockly.Blocks['rsa_decrypt'] = {
  init: function () {
    this.appendValueInput('KEY')
      .setCheck(TYPE_BYTES)
      .appendField('RSA-Decrypt(');
    this.appendValueInput('CT').setCheck(TYPE_BYTES).appendField(' ct:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'RSA 私钥解密 (RFC 8017 §7.2, PKCS#1 v1.5)：m = C^d mod n，校验 0x00‖0x02‖PS‖0x00 后返回明文 Bytes。' +
        'KEY 取 n‖e‖d‖p‖q 前缀的 n 与 d；填充错误抛异常。' +
        'cryptography 交叉验证通过（cryptography encrypt → 自实现 decrypt）。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc8017');
  },
};

Blockly.Blocks['rsa_sign'] = {
  init: function () {
    this.appendValueInput('KEY')
      .setCheck(TYPE_BYTES)
      .appendField('RSA-Sign(');
    this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField(' msg:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'RSA 签名 (RFC 8017 §8.2, PKCS#1 v1.5 + SHA-256)：DigestInfo 前缀 + SHA-256(msg)，' +
        'EM = 0x00‖0x01‖FF(len)‖0x00‖DigestInfo，S = m^d mod n → 签名 k 字节。' +
        '512 位密钥下 FF ≥ 8 满足规范；签名确定性（无随机数），cryptography 交叉验证通过。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc8017');
  },
};

Blockly.Blocks['rsa_verify'] = {
  init: function () {
    this.appendValueInput('KEY')
      .setCheck(TYPE_BYTES)
      .appendField('RSA-Verify(');
    this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField(' msg:');
    this.appendValueInput('SIG').setCheck(TYPE_BYTES).appendField(' sig:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BOOLEAN);
    this.setColour(190);
    this.setTooltip(
      'RSA 验签 (RFC 8017 §8.2, PKCS#1 v1.5 + SHA-256)：m = S^e mod n，校验 0x00‖0x01‖FF‖0x00‖DigestInfo。' +
        'KEY 取 n‖e‖d‖p‖q 前缀的 n 与 e。签名/长度/结构非法均返回 False。' +
        'cryptography 交叉验证通过（cryptography sign → 自实现 verify）。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc8017');
  },
};
