/**
 * SLH-DSA ADRS 教学地址块（部分字段映射）
 *
 * slh_adrs_full(layer, tree, type, keypair, height, index) → 32 字节地址
 *
 * 字段映射：
 *   a[0:4] layer | a[4:16] tree | a[16:20] type | a[20:24] keypair
 *   type = WOTS_HASH(0)/WOTS_PRF(5)：a[24:28] chain, a[28:32] hash/zero
 *   type = TREE(2)/FORS_TREE(3)：a[24:28] tree_height, a[28:32] tree_index
 *   type = FORS_PRF(6)：a[24:28] zero, a[28:32] tree_index
 *   其他 type：a[24:32] 置零
 *
 * 该块只接受非负安全整数，无法精确表达所有 96-bit tree address；不能视作完整 FIPS 205 实现。
 * 性质向量：固定输入下的字节位置和双语言一致性。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES } from '@/constants/block-types';

export const ADRS_BLOCK_TYPES = ['slh_adrs_full'] as const;
export type AdrsBlockType = (typeof ADRS_BLOCK_TYPES)[number];

const ADRS_COLOUR = 230;
const FIPS205_URL = 'https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.205.pdf';

Blockly.Blocks['slh_adrs_full'] = {
  init: function () {
    this.appendValueInput('LAYER')
      .setCheck(null)
      .appendField('SLH-ADRS(layer:');
    this.appendValueInput('TREE')
      .setCheck(null)
      .appendField(' tree:');
    this.appendDummyInput()
      .appendField(' type:')
      .appendField(
        new Blockly.FieldDropdown([
          ['WOTS_HASH', '0'],
          ['WOTS_PK', '1'],
          ['TREE', '2'],
          ['FORS_TREE', '3'],
          ['FORS_ROOTS', '4'],
          ['WOTS_PRF', '5'],
          ['FORS_PRF', '6'],
        ]),
        'TYPE',
      );
    this.appendValueInput('KEYPAIR')
      .setCheck(null)
      .appendField(' kp:');
    this.appendValueInput('HEIGHT')
      .setCheck(null)
      .appendField(' word5:');
    this.appendValueInput('INDEX')
      .setCheck(null)
      .appendField(' word6:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(ADRS_COLOUR);
    this.setTooltip(
      'SLH-DSA ADRS 教学编码。word5/word6 随类型表示 chain/hash、tree height/index 或 FORS_PRF 地址字段；TREE 类型将 kp 字置零。' +
        '输入限非负安全整数，Number 精度不足以覆盖完整 96-bit tree address；不是完整 FIPS 205 实现。',
    );
    this.setHelpUrl(FIPS205_URL);
  },
};
