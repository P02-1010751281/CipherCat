/**
 * FIPS 205 完整 ADRS 地址块定义（SPHINCS+/SLH-DSA 域分隔）
 *
 * slh_adrs_full(layer, tree, type, keypair, height, index) → 32 字节地址
 *
 * 布局（与项目 slh_addr 约定一致，补齐 type 相关字段）：
 *   a[0] layer | a[1:13] tree | a[13:17] type | a[17:21] keypair
 *   type = WOTS_HASH(0)：  a[21:25] chain, a[25:29] hash
 *   type = TREE(2)/FORS_TREE(3)：a[21:25] tree_height, a[25:29] tree_index
 *   其余 type：a[21:29] 置零
 *
 * 教学点：SHAKE 域分隔——同一 (layer, tree, keypair) 下不同 type 产生不相交的哈希输入域。
 * 性质向量：32 字节、确定性、type 字段位置、不同 type 输出不同。
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
          ['FORS_PK', '5'],
          ['WOTS_PRF', '6'],
        ]),
        'TYPE',
      );
    this.appendValueInput('KEYPAIR')
      .setCheck(null)
      .appendField(' kp:');
    this.appendValueInput('HEIGHT')
      .setCheck(null)
      .appendField(' h:');
    this.appendValueInput('INDEX')
      .setCheck(null)
      .appendField(' idx:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(ADRS_COLOUR);
    this.setTooltip(
      'FIPS 205 ADRS 32 字节地址：layer/tree/type/keypair 公共前缀 + type 相关字段' +
        '（WOTS_HASH 用 chain/hash，TREE/FORS_TREE 用 height/index）。' +
        'SHAKE 域分隔：不同 type 的哈希输入互不相交。',
    );
    this.setHelpUrl(FIPS205_URL);
  },
};
