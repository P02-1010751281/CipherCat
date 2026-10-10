/**
 * 哈希基密码教学结构件；不构成 SLH-DSA、XMSS 或 LMS 的标准算法实现。
 *
 * 教学研究用途：简化哈希链、通用 Merkle 树和地址前缀构造。内部 SHAKE-256
 * 拼接函数不含 FIPS 205 所需的 PK.seed、函数专用域分隔及完整地址语义。
 *
 * - hash_chain:    WOTS+ 链式哈希 c^i(x) = H(⋯H(x)⋯)（迭代 ITERATIONS 次）
 * - merkle_leaf:   叶子 = H(ADRS ‖ MSG)
 * - merkle_node:   节点 = H(ADRS ‖ LEFT ‖ RIGHT)
 * - merkle_root:   整树根（LEAVES 为按 LEAF_LEN 字节拼接的叶子，叶子数需 2 的幂）
 * - slh_addr:      ADRS 前缀教学编码（layer/tree/type/keypair；最后 8 字节置零）
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_NUMBER } from '@/constants/block-types';

export const HASHBASED_BLOCK_TYPES = [
  'hash_chain',
  'merkle_leaf',
  'merkle_node',
  'merkle_root',
  'merkle_auth_path',
  'fors_leaf_index',
  'slh_addr',
  'fors_root',
] as const;
export type HashBasedBlockType = (typeof HASHBASED_BLOCK_TYPES)[number];

const HASH_BASED_COLOUR = 230;
const FIPS205_URL = 'https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.205.pdf';

/** WOTS+ 哈希链：c^i(x) = H^i(x)，SHAKE-256 */
Blockly.Blocks['hash_chain'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(TYPE_BYTES)
      .appendField('HashChain(');
    this.appendValueInput('ITERATIONS')
      .setCheck(TYPE_NUMBER)
      .appendField(' iters:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(HASH_BASED_COLOUR);
    this.setTooltip(
      '教学哈希链：重复调用项目 SHAKE-256 摘要。未使用 FIPS 205 chain 的 F(PK.seed, ADRS, ...) 与逐步地址更新。',
    );
    this.setHelpUrl(FIPS205_URL);
  },
};

/** Merkle 叶子：leaf = H(ADRS ‖ MSG) */
Blockly.Blocks['merkle_leaf'] = {
  init: function () {
    this.appendValueInput('MSG')
      .setCheck(TYPE_BYTES)
      .appendField('MerkleLeaf(msg,');
    this.appendValueInput('ADRS')
      .setCheck(TYPE_BYTES)
      .appendField(' adrs:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(HASH_BASED_COLOUR);
    this.setTooltip(
      '通用教学叶子：SHAKE256(ADRS ‖ MSG, 32)。不是 FIPS 205 XMSS/FORS 的标准叶生成。',
    );
    this.setHelpUrl(FIPS205_URL);
  },
};

/** Merkle 节点：node = H(ADRS ‖ LEFT ‖ RIGHT) */
Blockly.Blocks['merkle_node'] = {
  init: function () {
    this.appendValueInput('LEFT')
      .setCheck(TYPE_BYTES)
      .appendField('MerkleNode(l,');
    this.appendValueInput('RIGHT')
      .setCheck(TYPE_BYTES)
      .appendField(' r,');
    this.appendValueInput('ADRS')
      .setCheck(TYPE_BYTES)
      .appendField(' adrs:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(HASH_BASED_COLOUR);
    this.setTooltip(
      '通用教学节点：SHAKE256(ADRS ‖ LEFT ‖ RIGHT, 32)。不是 FIPS 205 XMSS/FORS 的标准节点函数。',
    );
    this.setHelpUrl(FIPS205_URL);
  },
};

/** Merkle 整树根：叶子拼接输入，叶子数需 2 的幂 */
Blockly.Blocks['merkle_root'] = {
  init: function () {
    this.appendValueInput('LEAVES')
      .setCheck(TYPE_BYTES)
      .appendField('MerkleRoot(leaves,');
    this.appendValueInput('LEAF_LEN')
      .setCheck(TYPE_NUMBER)
      .appendField(' leafLen:');
    this.appendValueInput('ADRS')
      .setCheck(TYPE_BYTES)
      .appendField(' adrs:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(HASH_BASED_COLOUR);
    this.setTooltip(
      '通用教学 Merkle 根：对完整叶序列自底向上应用项目 SHAKE256 节点组合；不是 FIPS 205 XMSS/FORS 树构造。',
    );
    this.setHelpUrl(FIPS205_URL);
  },
};

/** FIPS 205 ADRS 前缀教学编码；不填 type 专用的 word5/word6。 */
Blockly.Blocks['slh_addr'] = {
  init: function () {
    this.appendDummyInput().appendField('SLH_ADRS(');
    this.appendValueInput('LAYER')
      .setCheck(TYPE_NUMBER)
      .appendField(' layer:');
    this.appendValueInput('TREE')
      .setCheck(TYPE_NUMBER)
      .appendField(' tree:');
    this.appendValueInput('LEAF')
      .setCheck(TYPE_NUMBER)
      .appendField(' leaf:');
    this.appendDummyInput()
      .appendField(' type:')
      .appendField(
        new Blockly.FieldDropdown([
          ['WOTS_HASH(0)', '0'],
          ['WOTS_PK(1)', '1'],
          ['TREE(2)', '2'],
          ['FORS_TREE(3)', '3'],
          ['FORS_ROOTS(4)', '4'],
          ['WOTS_PRF(5)', '5'],
          ['FORS_PRF(6)', '6'],
        ]),
        'TYPE',
      );
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(HASH_BASED_COLOUR);
    this.setTooltip(
      'ADRS 前缀教学编码：大端写入 layer/tree/type/keypair 四个标准字，末尾 8 字节置零；不含 type 专用地址字段。',
    );
    this.setHelpUrl(FIPS205_URL);
  },
};

/** FORS 森林根：k 棵 FORS 树根的哈希组合（SPHINCS+ 少时签名结构件） */
Blockly.Blocks['fors_root'] = {
  init: function () {
    this.appendValueInput('ROOTS')
      .setCheck(TYPE_BYTES)
      .appendField('ForsRoot(');
    this.appendValueInput('ADRS').setCheck(TYPE_BYTES).appendField(' adrs:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(230);
    this.setTooltip(
      '教学森林根：SHAKE256(ADRS ‖ roots, 32)。未实现 FIPS 205 的 T_k(PK.seed, ADRS, roots) 函数。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.205.pdf');
  },
};

/** Merkle 认证路径：全叶子 + 目标索引 → 每层兄弟拼接（与 merkle_root 同组合约定） */
Blockly.Blocks['merkle_auth_path'] = {
  init: function () {
    this.appendValueInput('LEAVES')
      .setCheck(TYPE_BYTES)
      .appendField('MerkleAuthPath(leaves,');
    this.appendValueInput('LEAF_LEN')
      .setCheck(TYPE_NUMBER)
      .appendField(' leafLen:');
    this.appendValueInput('ADRS')
      .setCheck(TYPE_BYTES)
      .appendField(' adrs:');
    this.appendValueInput('INDEX')
      .setCheck(TYPE_NUMBER)
      .appendField(' idx:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(HASH_BASED_COLOUR);
    this.setTooltip(
      'Merkle 认证路径：自底向上每层取目标叶子索引 idx 的兄弟节点（h32(ADRS‖L‖R) 组合），' +
        '输出按层拼接（h × leafLen 字节）。与 merkle_root 同约定——leaf + auth 可重建根（Merkle 证明）。',
    );
    this.setHelpUrl(FIPS205_URL);
  },
};

/** FORS 选叶索引：消息 M 的第 i 个 4-bit 块（块 0 最高位，k=4/a=4）→ 叶子索引 0..15 */
Blockly.Blocks['fors_leaf_index'] = {
  init: function () {
    this.appendValueInput('M')
      .setCheck(TYPE_BYTES)
      .appendField('FORSLeafIndex(');
    this.appendValueInput('I')
      .setCheck(TYPE_NUMBER)
      .appendField(' block#:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_NUMBER);
    this.setColour(HASH_BASED_COLOUR);
    this.setTooltip(
      '固定教学参数下的 FORS 选叶：2 字节输入按 4-bit 分块（块 0 最高位），返回第 I 块；不代表任意 FIPS 205 参数集。',
    );
    this.setHelpUrl(FIPS205_URL);
  },
};
