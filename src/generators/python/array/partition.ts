import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['arr_partition_to_array'] = function (
  block: Block,
): string {
  const src = pythonGenerator.valueToCode(block, 'SRC', Order.ATOMIC) || '[]';
  const count =
    pythonGenerator.valueToCode(block, 'COUNT', Order.ATOMIC) || '0';
  const target =
    pythonGenerator.valueToCode(block, 'TARGET', Order.ATOMIC) || 'W';
  // 对于字节容器变量（B / Block），保留原始字节切片；其他变量转换为 int
  const targetTrimmed = String(target).trim();
  const isByteContainer = /^B(?:lock)?$/.test(targetTrimmed);
  if (isByteContainer) {
    const code = `
_blk = ${src}
if isinstance(_blk, int):
    _bl = (_blk.bit_length() + 7) // 8
    _blk = _blk.to_bytes(_bl, 'big')
_total = len(_blk)
_n = int(${count})
if _n <= 0:
    raise ValueError("partition count must be positive")
if _total % _n != 0:
    raise ValueError("data length %d not divisible by count %d" % (_total, _n))
_sz = _total // _n
for _i in range(_n):
    ${target}[_i] = _blk[_i*_sz:(_i+1)*_sz]
`;
    return code;
  } else {
    // 对于 int 容器（如 W, Comp, H），转换为整数便于后续算术运算
    const code = `
_blk = ${src}
if isinstance(_blk, int):
    _bl = (_blk.bit_length() + 7) // 8
    _blk = _blk.to_bytes(_bl, 'big')
_total = len(_blk)
_n = int(${count})
if _n <= 0:
    raise ValueError("partition count must be positive")
if _total % _n != 0:
    raise ValueError("data length %d not divisible by count %d" % (_total, _n))
_sz = _total // _n
for _i in range(_n):
    ${target}[_i] = int.from_bytes(_blk[_i*_sz:(_i+1)*_sz], 'big')
`;
    return code;
  }
};
