/**
 * 哈希基后量子结构件块定义（SLH-DSA/SPHINCS+、XMSS、LMS 通用结构）
 *
 * 教学研究用途：WOTS+ 哈希链、Merkle 树（叶子/节点/整树根）、FIPS 205 ADRS
 * 地址构造。哈希函数用 SHAKE-256（FIPS 205 的 H 函数），32 字节输出。
 *
 * - hash_chain:    WOTS+ 链式哈希 c^i(x) = H(⋯H(x)⋯)（迭代 ITERATIONS 次）
 * - merkle_leaf:   叶子 = H(ADRS ‖ MSG)
 * - merkle_node:   节点 = H(ADRS ‖ LEFT ‖ RIGHT)
 * - merkle_root:   整树根（LEAVES 为按 LEAF_LEN 字节拼接的叶子，叶子数需 2 的幂）
 * - slh_addr:      FIPS 205 ADRS 32 字节构造（layer/tree/type/keypair 大端填充）
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
      'WOTS+ 哈希链 c^i(x)：迭代 SHAKE-256 共 i 次（32 字节输出）。一次性签名核心结构。FIPS 205 Algorithm 1',
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
      'Merkle 树叶子：leaf = SHAKE256(ADRS ‖ MSG, 32)。ADRS 做域分隔，区分不同树/叶子。FIPS 205 §4.2',
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
      'Merkle 树内部节点：node = SHAKE256(ADRS ‖ LEFT ‖ RIGHT, 32)。左右子节点哈希组合。FIPS 205 §4.2',
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
      'Merkle 整树根：LEAVES 为按 LEAF_LEN 字节拼接的全部叶子（叶子数需为 2 的幂），自底向上 SHAKE256(ADRS‖L‖R, 32) 组合出根。FIPS 205 树结构',
    );
    this.setHelpUrl(FIPS205_URL);
  },
};

/** FIPS 205 ADRS：32 字节地址（layer/tree/type/keypair 大端） */
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
      'FIPS 205 ADRS 地址（32 字节）：layer(1) ‖ tree(12) ‖ type(4) ‖ keypair(4)，大端填充，其余字节 0。SPHINCS+ 所有哈希的域分隔参数。FIPS 205 §4.2.5',
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
      'FORS 森林根：R = H(adrs ‖ root_0 ‖ ... ‖ root_{k-1})——k 棵 FORS 树根拼接后哈希。SPHINCS+ 少时签名（few-time signature）核心结构件（FIPS 205）',
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
      'FORS 选叶索引：消息 M（2 字节）按 4-bit 分块（块 0 最高位），第 I 块值即树内叶子索引。' +
        '与 fors_sign 黑盒选叶同约定（FIPS 205 FORS.SigGen）。',
    );
    this.setHelpUrl(FIPS205_URL);
  },
};
