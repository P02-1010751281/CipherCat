import { ref, type Ref } from 'vue';
import * as Blockly from 'blockly/core';

import * as en from 'blockly/msg/en';
import * as zhHans from 'blockly/msg/zh-hans';

export type BlocklyLocale = 'en' | 'zh-hans';

export const BLOCKLY_LOCALES: Record<
  BlocklyLocale,
  { name: string; label: string }
> = {
  en: { name: 'English', label: 'English' },
  'zh-hans': { name: '简体中文', label: '中文' },
};

const LOCALE_MESSAGES: Record<BlocklyLocale, Record<string, string>> = {
  en: en as unknown as Record<string, string>,
  'zh-hans': zhHans as unknown as Record<string, string>,
};

const BLOCKLY_OVERRIDES_ZH_HANS: Record<string, string> = {
  LOGIC_COMPARE_TOOLTIP: '比较两个值。',
  LOGIC_COMPARE_TOOLTIP_EQ: '如果两个输入相等，则返回真。',
  LOGIC_COMPARE_TOOLTIP_NEQ: '如果两个输入不相等，则返回真。',
  LOGIC_COMPARE_TOOLTIP_LT: '如果第一个输入小于第二个输入，则返回真。',
  LOGIC_COMPARE_TOOLTIP_LTE: '如果第一个输入小于等于第二个输入，则返回真。',
  LOGIC_COMPARE_TOOLTIP_GT: '如果第一个输入大于第二个输入，则返回真。',
  LOGIC_COMPARE_TOOLTIP_GTE: '如果第一个输入大于等于第二个输入，则返回真。',
  LOGIC_OPERATION_TOOLTIP_AND: '如果两个输入都为真，则返回真。',
  LOGIC_OPERATION_TOOLTIP_OR: '如果至少有一个输入为真，则返回真。',
  LOGIC_NEGATE_TOOLTIP: '如果输入为假，则返回真；如果输入为真，则返回假。',
  LOGIC_BOOLEAN_TRUE: '真',
  LOGIC_BOOLEAN_FALSE: '假',
  LOGIC_BOOLEAN_TOOLTIP: '返回真或假。',
  LOGIC_NULL: '空',
  LOGIC_NULL_TOOLTIP: '返回空值。',
  LOGIC_TERNARY_CONDITION: '条件',
  LOGIC_TERNARY_IF_TRUE: '如果为真',
  LOGIC_TERNARY_IF_FALSE: '如果为假',
  LOGIC_TERNARY_TOOLTIP:
    '检查条件。如果条件为真，则返回第一个值；否则返回第二个值。',

  CONTROLS_REPEAT_TITLE: '重复 %1 次',
  CONTROLS_REPEAT_INPUT_DO: '执行',
  CONTROLS_REPEAT_TOOLTIP: '多次执行指定语句。',
  CONTROLS_WHILEUNTIL_OPERATOR_WHILE: '当',
  CONTROLS_WHILEUNTIL_OPERATOR_UNTIL: '直到',
  CONTROLS_WHILEUNTIL_TOOLTIP_WHILE: '只要值为真，就执行语句。',
  CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL: '只要值为假，就执行语句。',
  CONTROLS_FOR_TOOLTIP: '从起始数到结束数，以指定间隔计数，并执行指定语句。',
  CONTROLS_FOR_INPUT_DO: '执行',
  CONTROLS_FOREACH_TOOLTIP:
    '遍历列表中的每个项目，将变量设置为该项目，然后执行语句。',
  CONTROLS_FOREACH_INPUT_DO: '执行',
  CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK: '跳出循环',
  CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE: '继续下一次循环',
  CONTROLS_FLOW_STATEMENTS_TOOLTIP_BREAK: '跳出包含的循环。',
  CONTROLS_FLOW_STATEMENTS_TOOLTIP_CONTINUE:
    '跳过该循环的剩余部分，继续下一次循环。',

  MATH_NUMBER_TOOLTIP: '一个数字。',
  MATH_ARITHMETIC_TOOLTIP_ADD: '返回两个数之和。',
  MATH_ARITHMETIC_TOOLTIP_MINUS: '返回两个数之差。',
  MATH_ARITHMETIC_TOOLTIP_MULTIPLY: '返回两个数之积。',
  MATH_ARITHMETIC_TOOLTIP_DIVIDE: '返回两个数之商。',
  MATH_ARITHMETIC_TOOLTIP_POWER: '返回第一个数的第二个数次幂。',
  MATH_SINGLE_TOOLTIP_ROOT: '返回数的平方根。',
  MATH_SINGLE_TOOLTIP_ABS: '返回数的绝对值。',
  MATH_SINGLE_TOOLTIP_NEG: '返回数的相反数。',
  MATH_SINGLE_TOOLTIP_LN: '返回数的自然对数。',
  MATH_SINGLE_TOOLTIP_LOG10: '返回数的以10为底的对数。',
  MATH_SINGLE_TOOLTIP_EXP: '返回e的指定次幂。',
  MATH_SINGLE_TOOLTIP_POW10: '返回10的指定次幂。',
  MATH_TRIG_TOOLTIP_SIN: '返回角度的正弦值。',
  MATH_TRIG_TOOLTIP_COS: '返回角度的余弦值。',
  MATH_TRIG_TOOLTIP_TAN: '返回角度的正切值。',
  MATH_TRIG_TOOLTIP_ASIN: '返回数的反正弦值。',
  MATH_TRIG_TOOLTIP_ACOS: '返回数的反余弦值。',
  MATH_TRIG_TOOLTIP_ATAN: '返回数的反正切值。',
  MATH_CONSTANT_TOOLTIP:
    '返回一个常用常数值：π (3.14159…)、e (2.71828…)、φ (1.61803…)、sqrt(2) (1.41421…)、sqrt(½) (0.70710…) 或无穷大。',
  MATH_MODULO_TOOLTIP: '返回除法的余数。',
  MATH_CONSTRAIN_TOOLTIP: '将数值限制在指定的下限和上限之间（包含）。',
  MATH_ROUND_TOOLTIP: '将数值向上或向下取整。',
  MATH_RANDOM_INT_TOOLTIP: '返回一个介于两个指定限值之间（包含）的随机整数。',
  MATH_RANDOM_FLOAT_TOOLTIP:
    '返回一个介于0.0（包含）和1.0（不包含）之间的随机浮点数。',

  LISTS_CREATE_EMPTY_TITLE: '创建空列表',
  LISTS_CREATE_EMPTY_TOOLTIP: '返回一个空列表。',
  LISTS_CREATE_WITH_TOOLTIP: '建立一个具有任意数量项目的列表。',
  LISTS_REPEAT_TOOLTIP: '创建一个列表，其中包含给定值重复指定次数。',
  LISTS_LENGTH_TOOLTIP: '返回列表的长度。',
  LISTS_ISEMPTY_TOOLTIP: '如果列表为空，则返回真。',
  LISTS_INDEX_OF_TOOLTIP: '返回列表中第一个/最后一个匹配项的索引。',
  LISTS_GET_INDEX_TOOLTIP: '返回列表中指定位置的值。',
  LISTS_SET_INDEX_TOOLTIP: '将列表中指定位置的值设置为给定值。',
  LISTS_GET_SUBLIST_TOOLTIP: '返回列表的指定部分。',

  TEXT_TEXT_TOOLTIP: '一个字母、单词或一行文字。',
  TEXT_JOIN_TOOLTIP: '将任意数量的项目连接成一段文本。',
  TEXT_APPEND_TOOLTIP: '将一些文本追加到变量"%1"中。',
  TEXT_LENGTH_TOOLTIP: '返回文本的字符数（包括空格）。',
  TEXT_ISEMPTY_TOOLTIP: '如果文本为空，则返回真。',
  TEXT_INDEXOF_TOOLTIP: '返回第一个/第二个文本在另一个文本中的索引位置。',
  TEXT_CHARAT_TOOLTIP: '返回位于指定位置的字符。',
  TEXT_GET_SUBSTRING_TOOLTIP: '返回文本的指定部分。',
  TEXT_CHANGECASE_TOOLTIP: '以不同的大小写形式返回文本的副本。',
  TEXT_TRIM_TOOLTIP: '删除文本两端的空白。',
  TEXT_PRINT_TOOLTIP: '打印指定的文本到控制台。',

  VARIABLES_GET_TOOLTIP: '返回此变量的值。',
  VARIABLES_SET_TOOLTIP: '将此变量设置为输入值。',
  PROCEDURES_DEFNORETURN_TOOLTIP: '创建一个不带返回值的函数。',
  PROCEDURES_DEFRETURN_TOOLTIP: '创建一个带返回值的函数。',
};

export const MESSAGES_ZH_HANS: Record<string, string> = {
  CRYPTO_LOGIC_XOR_XOR: '异或^异或',
  CRYPTO_LOGIC_OR_XOR: '或^异或',
  CRYPTO_LOGIC_AND_XOR: '与^异或',
  CRYPTO_LOGIC_XOR_OR: '异或^或',
  CRYPTO_LOGIC_OR_OR: '或^或',
  CRYPTO_LOGIC_AND_OR: '与^或',
  CRYPTO_LOGIC_XOR_AND: '异或^与',
  CRYPTO_LOGIC_OR_AND: '或^与',
  CRYPTO_LOGIC_AND_AND: '与^与',
  CRYPTO_LOGIC_XOR: '异或',
  CRYPTO_LOGIC_OR: '或',
  CRYPTO_LOGIC_AND: '与',
  CRYPTO_LOGIC_NOT: '非运算',
  CRYPTO_LOGIC_COMPOUND_TOOLTIP: '执行复合逻辑运算',
  CRYPTO_LOGIC_TOOLTIP: '对输入值执行逻辑运算',
  CRYPTO_LOGIC_NOT_TOOLTIP: '对输入值进行非运算',
  CRYPTO_LOGIC_OUTPUT_VAR: '输出变量',

  CRYPTO_BITWISE_AND: '按位与(&)',
  CRYPTO_BITWISE_OR: '按位或(|)',
  CRYPTO_BITWISE_XOR: '按位异或(^)',
  CRYPTO_BITWISE_RIGHT_SHIFT: '按位右移(>>)',
  CRYPTO_BITWISE_LEFT_SHIFT: '按位左移(<<)',
  CRYPTO_BITWISE_RIGHT_ROTATE: '循环右移(>>>)',
  CRYPTO_BITWISE_LEFT_ROTATE: '循环左移(<<<)',
  CRYPTO_BITWISE_TOOLTIP: '对输入执行按位逻辑运算，可前后拼接',
  CRYPTO_BIT_OPERATION_TOOLTIP:
    '对输入执行按位运算（逻辑/移位/循环），可前后拼接',
  CRYPTO_BIT_NOT32: 'NOT32(',
  CRYPTO_BIT_NOT32_TOOLTIP: '对输入值进行32位按位取反',
  CRYPTO_ASSIGN_TOOLTIP: '赋值模块：左值等于右值',
  CRYPTO_EXPR_INFIX_TOOLTIP: '可插入表达式块：支持XOR、AND、OR=',

  CRYPTO_ROTATE_LEFT: '32位循环左移 输入',
  CRYPTO_ROTATE_LEFT_BIT: '位数',
  CRYPTO_ROTATE_LEFT_OP: '32位循环左移与操作 输入',
  CRYPTO_ROTATE_LEFT_TOOLTIP: '对输入进行指定位数的循环左移',
  CRYPTO_ROTATE_LEFT_OP_TOOLTIP: '循环左移后执行特定操作(异或、与、或、加)',
  CRYPTO_ROTATE_RIGHT: '32位循环右移 输入',
  CRYPTO_ROTATE_RIGHT_OP: '32位循环右移与操作 输入',
  CRYPTO_ROTATE_RIGHT_TOOLTIP: '对输入进行指定位数的循环右移',
  CRYPTO_ROTATE_RIGHT_OP_TOOLTIP: '循环右移后执行特定操作(异或、与、或、加)',
  CRYPTO_BYTE_SUBSTITUTE: '字节替换 输入',
  CRYPTO_BYTE_SUBSTITUTE_OUTPUT: '输出变量',
  CRYPTO_BYTE_SUBSTITUTE_TOOLTIP: '将输入字节替换为输出字节',

  CRYPTO_ITERATE: '迭代',
  CRYPTO_ITERATE_TIMES: '次',
  CRYPTO_ITERATE_DO: '执行',
  CRYPTO_ITERATE_TOOLTIP: '自定义迭代循环',

  CRYPTO_CURVE_PARAMS: '椭圆曲线参数',
  CRYPTO_CURVE_PARAMS_TOOLTIP: '依次设置椭圆曲线的a, b, p参数',
  CRYPTO_CURVE_POINT: '椭圆曲线点',
  CRYPTO_CURVE_POINT_TOOLTIP: '定义一个椭圆曲线上的点',
  CRYPTO_CURVE_DOUBLE_POINT: '椭圆曲线的2倍点',
  CRYPTO_CURVE_DOUBLE_POINT_TOOLTIP: '计算椭圆曲线上点的2倍点',
  CRYPTO_CURVE_ADD: '椭圆曲线点加法',
  CRYPTO_CURVE_ADD_TOOLTIP: '在椭圆曲线上执行点加法运算',
  CRYPTO_CURVE_MULTIPLY: '椭圆曲线多倍点乘',
  CRYPTO_CURVE_MULTIPLY_TOOLTIP: '在椭圆曲线上执行点的k倍乘法运算',

  CRYPTO_SBOX_SIZE: 'S-box 大小',
  CRYPTO_SBOX_ROW: '行',
  CRYPTO_SBOX_TOOLTIP: '定义一个 S-box 查找表，点击 + 号导入CSV',
  CRYPTO_SBOX_SUB: 'S-box 替换 输入变量',
  CRYPTO_SBOX_SUB_VAR: 'S-box',
  CRYPTO_SBOX_SUB_TOOLTIP: '对32位输入变量执行S-box替换（按字节）',

  CRYPTO_SM3_PAD_TEXT: 'SM3 Text Pad',
  CRYPTO_SM3_PAD_TEXT_TOOLTIP: 'SM3 文本字符串填充(UTF-8)',
  CRYPTO_SM3_PAD_HEX: 'SM3 Hex Pad',
  CRYPTO_SM3_PAD_HEX_TOOLTIP: 'SM3 十六进制字符串填充(每2位HEX为1字节)',
  CRYPTO_SM3_PAD: 'SM3 Pad',
  CRYPTO_SM3_PAD_TOOLTIP: 'SM3消息填充：将消息填充为512位的倍数',
  CRYPTO_SM3_COMPRESS: 'SM3 Compress',
  CRYPTO_SM3_COMPRESS_TOOLTIP: "SM3压缩函数：OUT = CF(V, B) 使用扩展消息 W, W'",

  CRYPTO_SHA256_PAD: 'SHA-256 Pad',
  CRYPTO_SHA256_PAD_TOOLTIP: 'SHA-256 文本填充',
  CRYPTO_SHA256_PAD_HEX: 'SHA-256 Hex Pad',
  CRYPTO_SHA256_PAD_HEX_TOOLTIP: 'SHA-256 十六进制字符串填充',
  CRYPTO_SHA256_PAD_TEXT: 'SHA-256 Text Pad',
  CRYPTO_SHA256_PAD_TEXT_TOOLTIP: 'SHA-256 文本字符串填充(UTF-8)',
  CRYPTO_SHA256_COMPRESS: 'SHA-256 Compress',
  CRYPTO_SHA256_COMPRESS_TOOLTIP: 'SHA-256压缩函数：OUT = CF(V, B)',

  CRYPTO_SHA3_PAD_TEXT: 'SHA-3 Text Pad',
  CRYPTO_SHA3_PAD_TEXT_TOOLTIP:
    'SHA-3 pad10*1填充(UTF-8文本输入)，按比特率r对齐',
  CRYPTO_SHA3_PAD_HEX: 'SHA-3 Hex Pad',
  CRYPTO_SHA3_PAD_HEX_TOOLTIP: 'SHA-3 pad10*1填充(十六进制输入)，按比特率r对齐',
  CRYPTO_SHA3_PAD: 'SHA-3 Pad',
  CRYPTO_SHA3_PAD_TOOLTIP:
    'SHA-3 pad10*1填充：M || d || 0x00…0x00 xor 0x00…0x80，按比特率r对齐(FIPS 202)',
  CRYPTO_SHA3_RATE: ', rate=',
  CRYPTO_SHA3_SUFFIX: 'suffix=',
  CRYPTO_SHA3_KECCAK_F_TOOLTIP:
    'Keccak-f[b]置换函数：24轮(θ→ρ→π→χ→ι)，状态为5×5 lanes数组(FIPS 202)',
  CRYPTO_SHA3_ABSORB: 'Absorb',
  CRYPTO_SHA3_ABSORB_TOOLTIP:
    '海绵结构吸收阶段：State ^= Pi，然后State = Keccak-f(State)',
  CRYPTO_SHA3_SQUEEZE: 'Squeeze',
  CRYPTO_SHA3_SQUEEZE_TOOLTIP:
    '海绵结构挤压阶段：从状态中读取r位输出，不足则再执行Keccak-f',
  CRYPTO_SHA3_OUTLEN: ', outLen=',

  CRYPTO_ITERATE_VAR: '变量',
  CRYPTO_ITERATE_LOOP: '循环',

  CRYPTO_CONVERT_TO_INT: '转换为整数',
  CRYPTO_CONVERT_TO_INT_TOOLTIP: '将变量转换为整数类型，结果赋值给自身',
  CRYPTO_CONVERT_VAR: '变量',
  CRYPTO_CONVERT_BYTES: '字节',
  CRYPTO_CONVERT_BITS: '比特串',
  CRYPTO_CONVERT_BITS_TO_BYTES_TOOLTIP: '将比特串转换为字节类型',
  CRYPTO_CONVERT_BYTES_TO_BITS_TOOLTIP: '将字节转换为比特串类型',

  CRYPTO_MEASURE_BIT_LENGTH: '位长度(',
  CRYPTO_MEASURE_BIT_LENGTH_TOOLTIP: '返回输入的位长度',
  CRYPTO_MEASURE_BYTE_LENGTH: '字节长度(',
  CRYPTO_MEASURE_BYTE_LENGTH_TOOLTIP: '返回输入的字节长度',

  CRYPTO_NUMBER_TOOLTIP: '输入数值或表达式',

  CRYPTO_PARTITION_SPLIT: '分割',
  CRYPTO_PARTITION_INTO: '为',
  CRYPTO_PARTITION_COUNT: '个',
  CRYPTO_PARTITION_TOOLTIP: '将输入数据按指定分割，并写入目标数组',

  CRYPTO_MOD_INVERSE_ASSIGN: '模逆赋值 d',
  CRYPTO_MOD_INVERSE_TOOLTIP: '计算 d = e 的模逆元 mod φ(n)',

  CRYPTO_FIELD_ADD_TOOLTIP: '有限域运算：对A和B执行加减乘后对P取模',

  CRYPTO_NTT_TOOLTIP:
    '数论变换(NTT)：Cooley-Tukey蝶形运算，将多项式从系数形式转为NTT评估形式(FIPS 203)',
  CRYPTO_INTT_TOOLTIP:
    '逆数论变换(INTT)：Gentleman-Sande蝶形运算，将NTT评估形式转回系数形式(FIPS 203)',
  CRYPTO_NTT_MUL: 'NTT乘法(',
  CRYPTO_NTT_MUL_TOOLTIP:
    'NTT域逐点乘法：在NTT评估形式下进行坐标相乘，O(n)复杂度(FIPS 203)',
  CRYPTO_NTT_BUTTERFLY: '蝶形(',
  CRYPTO_NTT_BUTTERFLY_TOOLTIP:
    '蝶形运算：CT=(a+ζ·b, a-ζ·b)用于NTT，GS=((a+b)/2, ζ·(b-a)/2)用于INTT',
  CRYPTO_NTT_ZETA: ', ζ=',
  CRYPTO_NTT_TYPE: ', 类型=',

  CRYPTO_XOF_TOOLTIP:
    'XOF(SHAKE128)：可扩展输出函数，从种子生成任意长度伪随机字节流(FIPS 202)',
  CRYPTO_PRF_TOOLTIP:
    'PRF(SHAKE256)：伪随机函数，seed || nonce → 输出字节，用于CBD采样(FIPS 203 Alg 8)',

  CRYPTO_CATEGORY_CTRL: '控制流编排',
  CRYPTO_CATEGORY_VARIABLE: '基础变量',
  CRYPTO_CATEGORY_MATH: '基础数学',
  CRYPTO_CATEGORY_ARRAY: '数组空间',
  CRYPTO_CATEGORY_DATA: '数据处理与转换',
  CRYPTO_CATEGORY_BIT: '位运算单元',
  CRYPTO_CATEGORY_LOGIC: '逻辑运算单元',
  CRYPTO_CATEGORY_SBOX: '非线性运算单元',
  CRYPTO_CATEGORY_HASH: '哈希与填充单元',
  CRYPTO_CATEGORY_NUMTHEORY: '数论与密钥推导单元',
  CRYPTO_CATEGORY_ECC: '椭圆曲线运算单元',
  CRYPTO_CATEGORY_POSTQUANTUM: '后量子密码',
  CRYPTO_CATEGORY_POSTQUANTUM_BASIC: '后量子基础块',
  CRYPTO_CATEGORY_POSTQUANTUM_ADVANCED: '后量子高级块',
  CRYPTO_CATEGORY_PROCEDURE: '函数封装空间',

  CRYPTO_SBOX_SIZE_LIMIT: 'S-box大小限制为32x32',
  CRYPTO_SBOX_ARRAY_1D: '一维数组',
  CRYPTO_SBOX_ARRAY_2D: '二维数组',
  CRYPTO_SBOX_IMPORT_CSV: '导入CSV',
  CRYPTO_SBOX_EXPORT_CSV: '导出CSV',
  CRYPTO_SBOX_CREATE_VARIABLE: '创建SBox变量',
  CRYPTO_SBOX_CSV_COUNT_ERROR:
    'CSV文件必须包含正好 {0} 个值，但找到了 {1} 个。',
  CRYPTO_SBOX_CSV_INVALID_VALUE: '第 {0} 个值 "{1}" 不是有效的十六进制格式。',
  CRYPTO_SBOX_CSV_READ_ERROR: '读取CSV文件失败',
};

export const MESSAGES_EN: Record<string, string> = {
  CRYPTO_LOGIC_XOR_XOR: 'XOR^XOR',
  CRYPTO_LOGIC_OR_XOR: 'OR^XOR',
  CRYPTO_LOGIC_AND_XOR: 'AND^XOR',
  CRYPTO_LOGIC_XOR_OR: 'XOR^OR',
  CRYPTO_LOGIC_OR_OR: 'OR^OR',
  CRYPTO_LOGIC_AND_OR: 'AND^OR',
  CRYPTO_LOGIC_XOR_AND: 'XOR^AND',
  CRYPTO_LOGIC_OR_AND: 'OR^AND',
  CRYPTO_LOGIC_AND_AND: 'AND^AND',
  CRYPTO_LOGIC_XOR: 'XOR',
  CRYPTO_LOGIC_OR: 'OR',
  CRYPTO_LOGIC_AND: 'AND',
  CRYPTO_LOGIC_NOT: 'NOT',
  CRYPTO_LOGIC_COMPOUND_TOOLTIP: 'Execute compound logic operation',
  CRYPTO_LOGIC_TOOLTIP: 'Execute logic operation on inputs',
  CRYPTO_LOGIC_NOT_TOOLTIP: 'Execute NOT operation on input',
  CRYPTO_LOGIC_OUTPUT_VAR: 'Output Var',

  CRYPTO_BITWISE_AND: 'Bitwise AND(&)',
  CRYPTO_BITWISE_OR: 'Bitwise OR(|)',
  CRYPTO_BITWISE_XOR: 'Bitwise XOR(^)',
  CRYPTO_BITWISE_RIGHT_SHIFT: 'Right Shift(>>)',
  CRYPTO_BITWISE_LEFT_SHIFT: 'Left Shift(<<)',
  CRYPTO_BITWISE_RIGHT_ROTATE: 'Right Rotate(>>>)',
  CRYPTO_BITWISE_LEFT_ROTATE: 'Left Rotate(<<<)',
  CRYPTO_BITWISE_TOOLTIP:
    'Execute bitwise logic operation on two inputs, can be chained',
  CRYPTO_BIT_OPERATION_TOOLTIP:
    'Execute bitwise operation (logic/shift/rotate) on two inputs, can be chained',
  CRYPTO_BIT_NOT32: 'NOT32(',
  CRYPTO_BIT_NOT32_TOOLTIP: '32-bit bitwise NOT on input',
  CRYPTO_ASSIGN_TOOLTIP: 'Assignment: left value equals right value',
  CRYPTO_EXPR_INFIX_TOOLTIP: 'Expression block: supports XOR, AND, OR, =',

  CRYPTO_ROTATE_LEFT: '32-bit Rotate Left Input',
  CRYPTO_ROTATE_LEFT_BIT: 'Bits',
  CRYPTO_ROTATE_LEFT_OP: '32-bit Rotate Left with Op Input',
  CRYPTO_ROTATE_LEFT_TOOLTIP: 'Rotate left by specified bits',
  CRYPTO_ROTATE_LEFT_OP_TOOLTIP:
    'Rotate left then execute operation (XOR, AND, OR, ADD)',
  CRYPTO_ROTATE_RIGHT: '32-bit Rotate Right Input',
  CRYPTO_ROTATE_RIGHT_OP: '32-bit Rotate Right with Op Input',
  CRYPTO_ROTATE_RIGHT_TOOLTIP: 'Rotate right by specified bits',
  CRYPTO_ROTATE_RIGHT_OP_TOOLTIP:
    'Rotate right then execute operation (XOR, AND, OR, ADD)',
  CRYPTO_BYTE_SUBSTITUTE: 'Byte Substitute Input',
  CRYPTO_BYTE_SUBSTITUTE_OUTPUT: 'Output Var',
  CRYPTO_BYTE_SUBSTITUTE_TOOLTIP: 'Substitute input byte with output byte',

  CRYPTO_ITERATE: 'Iterate',
  CRYPTO_ITERATE_TIMES: 'times',
  CRYPTO_ITERATE_DO: 'Do',
  CRYPTO_ITERATE_TOOLTIP: 'Custom iteration loop',

  CRYPTO_CURVE_PARAMS: 'Elliptic Curve Params',
  CRYPTO_CURVE_PARAMS_TOOLTIP: 'Set elliptic curve a, b, p parameters',
  CRYPTO_CURVE_POINT: 'Elliptic Curve Point',
  CRYPTO_CURVE_POINT_TOOLTIP: 'Define a point on elliptic curve',
  CRYPTO_CURVE_DOUBLE_POINT: 'Elliptic Curve Double Point',
  CRYPTO_CURVE_DOUBLE_POINT_TOOLTIP: 'Calculate double point on elliptic curve',
  CRYPTO_CURVE_ADD: 'Elliptic Curve Point Addition',
  CRYPTO_CURVE_ADD_TOOLTIP: 'Execute point addition on elliptic curve',
  CRYPTO_CURVE_MULTIPLY: 'Elliptic Curve Scalar Multiply',
  CRYPTO_CURVE_MULTIPLY_TOOLTIP:
    'Execute k-times point multiplication on elliptic curve',

  CRYPTO_SBOX_SIZE: 'S-box Size',
  CRYPTO_SBOX_ROW: 'Row',
  CRYPTO_SBOX_TOOLTIP: 'Define an S-box lookup table, click + to import CSV',
  CRYPTO_SBOX_SUB: 'S-box Substitute Input Var',
  CRYPTO_SBOX_SUB_VAR: 'S-box',
  CRYPTO_SBOX_SUB_TOOLTIP:
    'Execute S-box substitution on 32-bit input variable (by byte)',

  CRYPTO_SM3_PAD_TEXT: 'SM3 Text Pad',
  CRYPTO_SM3_PAD_TEXT_TOOLTIP: 'SM3 text string padding (UTF-8)',
  CRYPTO_SM3_PAD_HEX: 'SM3 Hex Pad',
  CRYPTO_SM3_PAD_HEX_TOOLTIP: 'SM3 hex string padding (2 hex chars = 1 byte)',
  CRYPTO_SM3_PAD: 'SM3 Pad',
  CRYPTO_SM3_PAD_TOOLTIP:
    'SM3 message padding: pad message to multiple of 512 bits',
  CRYPTO_SM3_COMPRESS: 'SM3 Compress',
  CRYPTO_SM3_COMPRESS_TOOLTIP:
    "SM3 compression function: OUT = CF(V, B) with expanded message W, W'",

  CRYPTO_SHA256_PAD: 'SHA-256 Pad',
  CRYPTO_SHA256_PAD_TOOLTIP: 'SHA-256 text padding',
  CRYPTO_SHA256_PAD_HEX: 'SHA-256 Hex Pad',
  CRYPTO_SHA256_PAD_HEX_TOOLTIP: 'SHA-256 hex string padding',
  CRYPTO_SHA256_PAD_TEXT: 'SHA-256 Text Pad',
  CRYPTO_SHA256_PAD_TEXT_TOOLTIP: 'SHA-256 text string padding (UTF-8)',
  CRYPTO_SHA256_COMPRESS: 'SHA-256 Compress',
  CRYPTO_SHA256_COMPRESS_TOOLTIP:
    'SHA-256 compression function: OUT = CF(V, B)',

  CRYPTO_SHA3_PAD_TEXT: 'SHA-3 Text Pad',
  CRYPTO_SHA3_PAD_TEXT_TOOLTIP:
    'SHA-3 pad10*1 padding (UTF-8 text input), aligned to rate r',
  CRYPTO_SHA3_PAD_HEX: 'SHA-3 Hex Pad',
  CRYPTO_SHA3_PAD_HEX_TOOLTIP:
    'SHA-3 pad10*1 padding (hex input), aligned to rate r',
  CRYPTO_SHA3_PAD: 'SHA-3 Pad',
  CRYPTO_SHA3_PAD_TOOLTIP:
    'SHA-3 pad10*1 padding: M || d || 0x00…0x00 xor 0x00…0x80, aligned to rate r (FIPS 202)',
  CRYPTO_SHA3_RATE: ', rate=',
  CRYPTO_SHA3_SUFFIX: 'suffix=',
  CRYPTO_SHA3_KECCAK_F_TOOLTIP:
    'Keccak-f[b] permutation: 24 rounds (θ→ρ→π→χ→ι), state is 5×5 lanes array (FIPS 202)',
  CRYPTO_SHA3_ABSORB: 'Absorb',
  CRYPTO_SHA3_ABSORB_TOOLTIP:
    'Sponge absorb phase: State ^= Pi, then State = Keccak-f(State)',
  CRYPTO_SHA3_SQUEEZE: 'Squeeze',
  CRYPTO_SHA3_SQUEEZE_TOOLTIP:
    'Sponge squeeze phase: read r bits from state, re-run Keccak-f if more output needed',
  CRYPTO_SHA3_OUTLEN: ', outLen=',

  CRYPTO_ITERATE_VAR: 'Var',
  CRYPTO_ITERATE_LOOP: 'Loop',

  CRYPTO_CONVERT_TO_INT: 'Convert to Int',
  CRYPTO_CONVERT_TO_INT_TOOLTIP:
    'Convert variable to integer type, assign result to itself',
  CRYPTO_CONVERT_VAR: 'Var',
  CRYPTO_CONVERT_BYTES: 'Bytes',
  CRYPTO_CONVERT_BITS: 'Bit String',
  CRYPTO_CONVERT_BITS_TO_BYTES_TOOLTIP: 'Convert bit string to bytes',
  CRYPTO_CONVERT_BYTES_TO_BITS_TOOLTIP: 'Convert bytes to bit string',

  CRYPTO_MEASURE_BIT_LENGTH: 'Bit Length(',
  CRYPTO_MEASURE_BIT_LENGTH_TOOLTIP: 'Return the bit length of the input',
  CRYPTO_MEASURE_BYTE_LENGTH: 'Byte Length(',
  CRYPTO_MEASURE_BYTE_LENGTH_TOOLTIP: 'Return the byte length of the input',

  CRYPTO_NUMBER_TOOLTIP: 'Enter a number or expression',

  CRYPTO_PARTITION_SPLIT: 'Split',
  CRYPTO_PARTITION_INTO: 'into',
  CRYPTO_PARTITION_COUNT: 'parts',
  CRYPTO_PARTITION_TOOLTIP:
    'Split input data by specified count and write to target array',

  CRYPTO_MOD_INVERSE_ASSIGN: 'Mod Inverse d',
  CRYPTO_MOD_INVERSE_TOOLTIP: 'Compute d = modular inverse of e mod φ(n)',

  CRYPTO_FIELD_ADD_TOOLTIP:
    'Finite field operation: add/sub/mul A and B then modulo P',

  CRYPTO_NTT_TOOLTIP:
    'Number Theoretic Transform (NTT): Cooley-Tukey butterfly, convert polynomial from coefficient form to NTT evaluation form (FIPS 203)',
  CRYPTO_INTT_TOOLTIP:
    'Inverse NTT (INTT): Gentleman-Sande butterfly, convert NTT evaluation form back to coefficient form (FIPS 203)',
  CRYPTO_NTT_MUL: 'NTT Mul(',
  CRYPTO_NTT_MUL_TOOLTIP:
    'NTT domain pointwise multiplication: coordinate-wise multiply in NTT form, O(n) complexity (FIPS 203)',
  CRYPTO_NTT_BUTTERFLY: 'Butterfly(',
  CRYPTO_NTT_BUTTERFLY_TOOLTIP:
    'Butterfly operation: CT=(a+ζ·b, a-ζ·b) for NTT, GS=((a+b)/2, ζ·(b-a)/2) for INTT',
  CRYPTO_NTT_ZETA: ', ζ=',
  CRYPTO_NTT_TYPE: ', Type=',

  CRYPTO_XOF_TOOLTIP:
    'XOF (SHAKE128): Extendable Output Function. Generates arbitrary-length pseudorandom byte stream from a seed (FIPS 202)',
  CRYPTO_PRF_TOOLTIP:
    'PRF (SHAKE256): Pseudo-Random Function. seed || nonce → output bytes. Used by CBD sampling (FIPS 203 Alg 8)',

  CRYPTO_CATEGORY_CTRL: 'Control Flow',
  CRYPTO_CATEGORY_VARIABLE: 'Variables',
  CRYPTO_CATEGORY_MATH: 'Math',
  CRYPTO_CATEGORY_ARRAY: 'Arrays',
  CRYPTO_CATEGORY_DATA: 'Data Processing',
  CRYPTO_CATEGORY_BIT: 'Bitwise Operations',
  CRYPTO_CATEGORY_LOGIC: 'Logic Operations',
  CRYPTO_CATEGORY_SBOX: 'S-box Unit',
  CRYPTO_CATEGORY_HASH: 'Hash & Padding',
  CRYPTO_CATEGORY_NUMTHEORY: 'Number Theory',
  CRYPTO_CATEGORY_ECC: 'Elliptic Curve',
  CRYPTO_CATEGORY_POSTQUANTUM: 'Post-Quantum',
  CRYPTO_CATEGORY_POSTQUANTUM_BASIC: 'PQC · Basic',
  CRYPTO_CATEGORY_POSTQUANTUM_ADVANCED: 'PQC · Advanced',
  CRYPTO_CATEGORY_PROCEDURE: 'Functions',

  CRYPTO_SBOX_SIZE_LIMIT: 'S-box size limited to 32x32',
  CRYPTO_SBOX_ARRAY_1D: '1D Array',
  CRYPTO_SBOX_ARRAY_2D: '2D Array',
  CRYPTO_SBOX_IMPORT_CSV: 'Import CSV',
  CRYPTO_SBOX_EXPORT_CSV: 'Export CSV',
  CRYPTO_SBOX_CREATE_VARIABLE: 'Create SBox Variable',
  CRYPTO_SBOX_CSV_COUNT_ERROR:
    'CSV file must contain exactly {0} values, but found {1}.',
  CRYPTO_SBOX_CSV_INVALID_VALUE:
    'The {0}th value "{1}" is not a valid hex format.',
  CRYPTO_SBOX_CSV_READ_ERROR: 'Failed to read CSV file',
};

const CUSTOM_MESSAGES: Record<BlocklyLocale, Record<string, string>> = {
  en: MESSAGES_EN,
  'zh-hans': MESSAGES_ZH_HANS,
};

// ---- UI 界面文字翻译 ----
const UI_MESSAGES: Record<BlocklyLocale, Record<string, string>> = {
  'zh-hans': {
    codeGenerator: '代码生成器:',
    autoDetect: '自动检测',
    import: '导入',
    export_: '导出',
    generateCode: '生成',
    code: '代码',
    clearWorkspace: '清空工作区',
    generatedCode: '生成的',
    copyCode: '复制代码',
    codeCopied: '代码已复制到剪贴板',
    copyFailed: '复制失败:',
    workspaceCleared: '// 工作区已清空',
    dragHint: '// 拖放块后将显示生成的代码',
    more: '更多',
    exportWorkspace: '导出工作区',
    importWorkspace: '导入工作区',
    localeChanged: '界面已切换为中文',
    back: '返回',
    projectList: '项目列表',
    newProject: '新建项目',
    deleteProject: '删除项目',
    deleteConfirm: '确定删除此项目？此操作不可恢复',
    noProjects: '暂无项目，点击上方按钮创建',
    save: '保存',
    saving: '保存中...',
    autoSave: '自动保存',
    saved: '已保存',
    unsaved: '● 未保存',
    language: '语言',
    lastModified: '最后修改',
    projectName: '项目名称',
    newWorkspace: '新建工作区',
    newWorkspaceConfirm: '新建工作区将清空当前内容，是否继续？',
    newWorkspaceConfirmTitle: '确认新建',
    unnamed: '未命名',
    saveError: '保存失败',
  },
  en: {
    codeGenerator: 'Code Generator:',
    autoDetect: 'Auto Detect',
    import: 'Import',
    export_: 'Export',
    generateCode: 'Generate',
    code: 'Code',
    clearWorkspace: 'Clear Workspace',
    generatedCode: 'Generated',
    copyCode: 'Copy Code',
    codeCopied: 'Code copied to clipboard',
    copyFailed: 'Copy failed:',
    workspaceCleared: '// Workspace cleared',
    dragHint: '// Drag blocks to see generated code',
    more: 'More',
    exportWorkspace: 'Export Workspace',
    importWorkspace: 'Import Workspace',
    localeChanged: 'Switched to English',
    back: 'Back',
    projectList: 'Projects',
    newProject: 'New Project',
    deleteProject: 'Delete',
    deleteConfirm: 'Delete this project? This cannot be undone.',
    noProjects: 'No projects yet, click the button above to create',
    save: 'Save',
    saving: 'Saving...',
    autoSave: 'Auto Save',
    saved: 'Saved',
    unsaved: '· Unsaved',
    language: 'Language',
    lastModified: 'Last Modified',
    projectName: 'Project Name',
    newWorkspace: 'New Workspace',
    newWorkspaceConfirm: 'New workspace will clear current content. Continue?',
    newWorkspaceConfirmTitle: 'Confirm New',
    unnamed: 'Untitled',
    saveError: 'Save failed',
    exported: 'Workspace exported',
    exportError: 'Export failed',
  },
};

export const uiLocaleRef: Ref<BlocklyLocale> = ref('zh-hans');

export function ui(key: string): string {
  const locale = uiLocaleRef.value;
  return UI_MESSAGES[locale]?.[key] || UI_MESSAGES['zh-hans'][key] || key;
}

export function useUILocale() {
  return { ui, uiLocaleRef };
}

let currentLocale: BlocklyLocale = 'zh-hans';
let isLocaleInitialized = false;

function applyLocale(locale: BlocklyLocale): void {
  const messages = LOCALE_MESSAGES[locale];
  const customMessages = CUSTOM_MESSAGES[locale];

  Blockly.setLocale(messages);

  // 仅在简体中文环境下覆盖 Blockly 核心消息为中文翻译
  if (locale === 'zh-hans') {
    Object.keys(BLOCKLY_OVERRIDES_ZH_HANS).forEach((key) => {
      (Blockly.Msg as Record<string, string>)[key] =
        BLOCKLY_OVERRIDES_ZH_HANS[key];
    });
  }

  Object.keys(customMessages).forEach((key) => {
    (Blockly.Msg as Record<string, string>)[key] = customMessages[key];
  });

  currentLocale = locale;
  uiLocaleRef.value = locale;
  isLocaleInitialized = true;
}

export function useBlocklyLocale() {
  const getBrowserLocale = (): BlocklyLocale => {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) {
      return 'zh-hans';
    }
    return 'en';
  };

  const setLocale = (locale: BlocklyLocale): void => {
    applyLocale(locale);
  };

  const initLocale = (): void => {
    if (!isLocaleInitialized) {
      const browserLocale = getBrowserLocale();
      applyLocale(browserLocale);
    }
  };

  const getCurrentLocale = (): BlocklyLocale => currentLocale;

  const getLocaleLabel = (locale: BlocklyLocale): string =>
    BLOCKLY_LOCALES[locale].label;

  return {
    initLocale,
    setLocale,
    getCurrentLocale,
    getLocaleLabel,
    getBrowserLocale,
    BLOCKLY_LOCALES,
  };
}
