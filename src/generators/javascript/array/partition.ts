import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['arr_partition_to_array'] = function(block: Block): string {
  const src = javascriptGenerator.valueToCode(block, 'SRC', Order.ATOMIC) || '[]';
  const count = javascriptGenerator.valueToCode(block, 'COUNT', Order.ATOMIC) || '0';
  const target = javascriptGenerator.valueToCode(block, 'TARGET', Order.ATOMIC) || 'W';

  // 与 Python 版对齐：字节容器保持 Uint8Array，int 容器转为 32-bit 字
  const targetTrimmed = String(target).trim();
  const isByteContainer = /^(?:B|Block|padded|data|state)$/.test(targetTrimmed);

  if (isByteContainer) {
    return `
// 均匀划分 — 字节容器（保持 Uint8Array）
(function() {
  var __crypto_data__ = ${src};
  if (__crypto_data__ instanceof Uint8Array) {
    // 已是 Uint8Array，无需转换
  } else if (typeof __crypto_data__ === 'number') {
    var __crypto_num__ = __crypto_data__ >>> 0;
    var __crypto_bytes__ = Math.max(1, (32 - Math.clz32(__crypto_num__) + 7) / 8 | 0);
    __crypto_data__ = new Uint8Array(__crypto_bytes__);
    for (var __j__ = 0; __j__ < __crypto_bytes__; __j__++) {
      __crypto_data__[__crypto_bytes__ - 1 - __j__] = (__crypto_num__ >>> (__j__ * 8)) & 0xFF;
    }
  } else if (Array.isArray(__crypto_data__)) {
    __crypto_data__ = new Uint8Array(__crypto_data__);
  } else {
    ${target} = new Uint8Array(0);
    return;
  }

  var __crypto_total__ = __crypto_data__.length;
  var __crypto_n__ = parseInt(${count});
  if (__crypto_n__ <= 0 || __crypto_total__ % __crypto_n__ !== 0) {
    ${target} = new Uint8Array(0);
    return;
  }
  var __crypto_chunk_size__ = __crypto_total__ / __crypto_n__;
  ${target} = [];
  for (var __crypto_i__ = 0; __crypto_i__ < __crypto_n__; __crypto_i__++) {
    ${target}[__crypto_i__] = __crypto_data__.slice(
      __crypto_i__ * __crypto_chunk_size__,
      (__crypto_i__ + 1) * __crypto_chunk_size__
    );
  }
})();
`;
  }

  return `
// 均匀划分 — int 容器（转换为 32-bit 字）
(function() {
  var __crypto_data__ = ${src};

  // 处理不同输入类型
  if (__crypto_data__ instanceof Uint8Array) {
    __crypto_data__ = Array.from(__crypto_data__);
  } else if (typeof __crypto_data__ === 'number') {
    // 如果是32位整数，转换为4字节数组（大端序）
    var __crypto_num__ = __crypto_data__ >>> 0;
    __crypto_data__ = [
      (__crypto_num__ >>> 24) & 0xFF,
      (__crypto_num__ >>> 16) & 0xFF,
      (__crypto_num__ >>> 8) & 0xFF,
      __crypto_num__ & 0xFF
    ];
  } else if (!Array.isArray(__crypto_data__)) {
    console.warn("arr_partition_to_array: 输入必须是数组、Uint8Array或数字，得到:", typeof __crypto_data__);
    ${target} = [];
    return;
  }

  var __crypto_total__ = __crypto_data__.length;
  var __crypto_n__ = parseInt(${count});

  if (__crypto_n__ <= 0) {
    console.warn("arr_partition_to_array: 分块数必须大于0");
    ${target} = [];
    return;
  }

  var __crypto_chunk_size__ = Math.floor(__crypto_total__ / __crypto_n__);

  if (__crypto_chunk_size__ === 0) {
    console.warn("arr_partition_to_array: 数据长度不足以分成", __crypto_n__, "块");
    ${target} = [];
    return;
  }

  ${target} = [];

  for (var __crypto_i__ = 0; __crypto_i__ < __crypto_n__; __crypto_i__++) {
    var __crypto_start__ = __crypto_i__ * __crypto_chunk_size__;
    var __crypto_end__ = (__crypto_i__ + 1) * __crypto_chunk_size__;
    var __crypto_chunk__ = __crypto_data__.slice(__crypto_start__, __crypto_end__);

    // 根据块大小决定输出格式
    if (__crypto_chunk_size__ === 4) {
      // 4字节块：转换为32位无符号整数（大端序）
      var __crypto_word__ = (
        (__crypto_chunk__[0] << 24) |
        (__crypto_chunk__[1] << 16) |
        (__crypto_chunk__[2] << 8) |
        __crypto_chunk__[3]
      ) >>> 0;
      ${target}[__crypto_i__] = __crypto_word__;
    } else {
      // 其他大小：保持字节数组格式
      ${target}[__crypto_i__] = __crypto_chunk__;
    }
  }
})();
`;
};
