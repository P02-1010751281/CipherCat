/**
 * RSA 教学块：项目自定义密钥生成与 RFC 8017 对应方案的教学实现。
 *
 * - rsa_keygen:  RSA-KeyGen(bits) → Bytes
 *   key = n(k)‖e(4)‖d(k)‖p(k/2)‖q(k/2)（定长大端，k = bits/8）
 *   rsa_keygen 不实现或声称符合 FIPS 186-5 的 RSA 签名密钥生成要求。
 * - rsa_encrypt / rsa_decrypt: PKCS#1 v1.5（EM = 0x00‖0x02‖PS(≥8 随机非零)‖0x00‖M）
 * - rsa_sign / rsa_verify: PKCS#1 v1.5 + SHA-256（DigestInfo = SEQUENCE{sha256, hash}）
 *   互操作测试不等于标准符合性测试或正式认证。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_BOOLEAN, TYPE_NUMBER } from '@/constants/block-types';

export const RSA_BLOCK_TYPES = ['rsa_keygen',
  'rsa_encrypt',
  'rsa_decrypt',
  'rsa_sign',
  'rsa_verify',
  'rsa_mgf1',
  'rsa_emsa_pkcs1_v15_encode',
] as const;
export type RsaBlockType = (typeof RSA_BLOCK_TYPES)[number];

Blockly.Blocks['rsa_keygen'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('RSA-KeyGen(')
      .appendField(
        new Blockly.FieldDropdown([
          ['512 (仅教学)', '512'],
          ['1024 (仅教学)', '1024'],
          ['2048 (仅教学)', '2048'],
        ]),
        'BITS',
      )
      .appendField('-bit)');
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'RSA 教学用密钥生成：项目自定义算法，不是 RFC 8017 定义的密钥生成，也不是经验证的 FIPS 186-5 实现。' +
        '演示参数为 512/1024/2048 位；FIPS 186-5 的 RSA 签名模数至少为 2048 位，但 2048 位选项本身不代表满足其密钥生成要求。' +
        '输出 Bytes 为 n‖e‖d‖p‖q 定长大端编码，其中包含私钥材料；勿用于真实密钥或生产场景。',
    );
    this.setHelpUrl('https://csrc.nist.gov/pubs/fips/186-5/final');
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
      'RSA 教学实现，参照 RFC 8017 §7.2 的 PKCS#1 v1.5 加密方案；不构成标准符合性或认证声明。EM = 0x00‖0x02‖PS(≥8 随机非零)‖0x00‖M，C = m^e mod n。' +
        'KEY 取 n‖e‖d‖p‖q 前缀的 n 与 e；明文长度 ≤ k-11（k = bits/8）。' +
        '互操作测试只说明已测输入下的结果一致，不代表通过标准符合性评估。',
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
      'RSA 教学实现，参照 RFC 8017 §7.2 的 PKCS#1 v1.5 解密方案；不构成标准符合性或认证声明。m = C^d mod n，校验 0x00‖0x02‖PS‖0x00 后返回明文 Bytes。' +
        'KEY 取 n‖e‖d‖p‖q 前缀的 n 与 d；填充错误抛异常。' +
        '互操作测试只说明已测输入下的结果一致，不代表通过标准符合性评估。',
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
      'RSA 教学实现，参照 RFC 8017 §8.2 的 PKCS#1 v1.5 + SHA-256 签名方案；FIPS 186-5 对签名密钥及实现另有要求，本块不声明符合。' +
        'DigestInfo 前缀 + SHA-256(msg)，' +
        'EM = 0x00‖0x01‖FF(len)‖0x00‖DigestInfo，S = m^d mod n → 签名 k 字节。' +
        '签名确定性（无随机数）；互操作测试不代表标准符合性评估。',
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
      'RSA 教学实现，参照 RFC 8017 §8.2 的 PKCS#1 v1.5 + SHA-256 验签方案；FIPS 186-5 对签名验证另有要求，本块不声明符合。' +
        'm = S^e mod n，校验 0x00‖0x01‖FF‖0x00‖DigestInfo。' +
        'KEY 取 n‖e‖d‖p‖q 前缀的 n 与 e。签名/长度/结构非法均返回 False。' +
        '互操作测试不代表标准符合性评估。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc8017');
  },
};

/** RSA 编码原语（RFC 8017 §9.2 / 附录 B.2.1）。 */
Blockly.Blocks['rsa_mgf1'] = {
  init: function () {
    this.appendValueInput('SEED').setCheck(TYPE_BYTES).appendField('MGF1( seed:');
    this.appendValueInput('LEN').setCheck(TYPE_NUMBER).appendField(' len:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'MGF1（RFC 8017 附录 B.2.1，SHA-256）：输出 seed‖0x00000000、seed‖0x00000001 … 各段摘要的串联，截断到 len 字节。用于 OAEP/PSS 的掩码生成；本身不是加密或签名。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc8017');
  },
};

Blockly.Blocks['rsa_emsa_pkcs1_v15_encode'] = {
  init: function () {
    this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField('EMSA-PKCS1-v1_5( msg:');
    this.appendValueInput('EMLEN').setCheck(TYPE_NUMBER).appendField(' emLen:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'EMSA-PKCS1-v1_5 编码（RFC 8017 §9.2，SHA-256）：EM = 0x00‖0x01‖0xFF…‖0x00‖DigestInfo(SHA-256, H(msg))。输出定长编码块；本块不做模幂，也不构成签名。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc8017');
  },
};
