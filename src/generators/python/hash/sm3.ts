import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['hash_sm3_pad'] = function (block: Block): string {
  const left =
    pythonGenerator.valueToCode(block, 'LEFT', Order.ATOMIC) || 'm_padded';
  const right =
    pythonGenerator.valueToCode(block, 'RIGHT', Order.ATOMIC) || 'm';
  const code = `
_sm3_pad_src = ${right}
if isinstance(_sm3_pad_src, (bytes, bytearray)):
    _sm3_pad_tmp = bytearray(_sm3_pad_src)
elif isinstance(_sm3_pad_src, str):
    _sm3_pad_tmp = bytearray(_sm3_pad_src.encode('utf-8'))
elif isinstance(_sm3_pad_src, list):
    _sm3_pad_tmp = bytearray(_sm3_pad_src)
else:
    _sm3_pad_tmp = bytearray()
_l_bits = len(_sm3_pad_tmp) * 8
_sm3_pad_tmp.append(0x80)
_curr_bits = (len(_sm3_pad_tmp) * 8) % 512
if _curr_bits <= 448:
    _zero_bits = 448 - _curr_bits
else:
    _zero_bits = 512 - (_curr_bits - 448)
_sm3_pad_tmp.extend(b"\\x00" * (_zero_bits // 8))
_sm3_pad_tmp.extend((_l_bits).to_bytes(8, 'big'))
${left} = bytes(_sm3_pad_tmp)
`;
  return code;
};

pythonGenerator.forBlock['hash_sm3_pad_text'] =
  pythonGenerator.forBlock['hash_sm3_pad'];

pythonGenerator.forBlock['hash_sm3_pad_hex'] = function (block: Block): string {
  const left =
    pythonGenerator.valueToCode(block, 'LEFT', Order.ATOMIC) || 'm_padded';
  const right =
    pythonGenerator.valueToCode(block, 'RIGHT', Order.ATOMIC) || 'hexstr';
  const code = `
_sm3_hex_src = ${right}
if isinstance(_sm3_hex_src, (bytes, bytearray)):
    _sm3_pad_tmp2 = bytearray(_sm3_hex_src)
elif isinstance(_sm3_hex_src, str):
    _sm3_pad_tmp2 = bytearray(bytes.fromhex(_sm3_hex_src))
elif isinstance(_sm3_hex_src, int):
    _sm3_bl = (_sm3_hex_src.bit_length() + 7) // 8
    _sm3_pad_tmp2 = bytearray(_sm3_hex_src.to_bytes(_sm3_bl, 'big'))
else:
    _sm3_pad_tmp2 = bytearray(bytes(_sm3_hex_src))
_l_bits = len(_sm3_pad_tmp2) * 8
_sm3_pad_tmp2.append(0x80)
_curr_bits = (len(_sm3_pad_tmp2) * 8) % 512
if _curr_bits <= 448:
    _zero_bits = 448 - _curr_bits
else:
    _zero_bits = 512 - (_curr_bits - 448)
_sm3_pad_tmp2.extend(b"\\x00" * (_zero_bits // 8))
_sm3_pad_tmp2.extend((_l_bits).to_bytes(8, 'big'))
${left} = bytes(_sm3_pad_tmp2)
`;
  return code;
};

// SM3 压缩函数
pythonGenerator.forBlock['hash_sm3_compress'] = function (
  block: Block,
): string {
  const out = pythonGenerator.valueToCode(block, 'OUT', Order.ATOMIC) || 'y';
  const v = pythonGenerator.valueToCode(block, 'V', Order.ATOMIC) || 'V';
  const w = pythonGenerator.valueToCode(block, 'W', Order.ATOMIC) || 'W';
  const wp = pythonGenerator.valueToCode(block, 'WP', Order.ATOMIC) || 'WP';
  const code = `
# SM3 压缩（单块，V 为64个十六进制字符）
_v_hex = str(${v})
_v_bytes = bytes.fromhex(_v_hex)
if len(_v_bytes) != 32:
    raise ValueError("V must be 64 hex chars (32 bytes)")
_vw = [int.from_bytes(_v_bytes[i:i+4], 'big') for i in range(0, 32, 4)]
_A,_B,_C,_D,_E,_F,_G,_H = _vw[0],_vw[1],_vw[2],_vw[3],_vw[4],_vw[5],_vw[6],_vw[7]
for _j in range(64):
    _T = 0x79cc4519 if _j <= 15 else 0x7a879d8a
    _A12 = ((_A << 12) | (_A >> (32 - 12))) & 0xFFFFFFFF
    _SS1 = ((_A12 + _E + (((_T << (_j % 32)) | (_T >> (32 - (_j % 32)))) & 0xFFFFFFFF)) & 0xFFFFFFFF)
    _SS1 = ((_SS1 << 7) | (_SS1 >> (32 - 7))) & 0xFFFFFFFF
    _SS2 = _SS1 ^ _A12
    if _j <= 15:
        _FF = (_A ^ _B ^ _C) & 0xFFFFFFFF
        _GG = (_E ^ _F ^ _G) & 0xFFFFFFFF
    else:
        _FF = ((_A & _B) | (_A & _C) | (_B & _C)) & 0xFFFFFFFF
        _GG = ((_E & _F) | ((~_E) & _G)) & 0xFFFFFFFF
    _TT1 = (_FF + _D + _SS2 + ${wp}[_j]) & 0xFFFFFFFF
    _TT2 = (_GG + _H + _SS1 + ${w}[_j]) & 0xFFFFFFFF
    _D = _C
    _C = ((_B << 9) | (_B >> (32 - 9))) & 0xFFFFFFFF
    _B = _A
    _A = _TT1
    _H = _G
    _G = ((_F << 19) | (_F >> (32 - 19))) & 0xFFFFFFFF
    _F = _E
    _X = _TT2
    _E = (_X ^ ((_X << 9) | (_X >> (32 - 9))) ^ ((_X << 17) | (_X >> (32 - 17)))) & 0xFFFFFFFF
_y_words = [(_A ^ _vw[0]) & 0xFFFFFFFF, (_B ^ _vw[1]) & 0xFFFFFFFF, (_C ^ _vw[2]) & 0xFFFFFFFF, (_D ^ _vw[3]) & 0xFFFFFFFF,
            (_E ^ _vw[4]) & 0xFFFFFFFF, (_F ^ _vw[5]) & 0xFFFFFFFF, (_G ^ _vw[6]) & 0xFFFFFFFF, (_H ^ _vw[7]) & 0xFFFFFFFF]
_y_bytes = b''.join((x.to_bytes(4, 'big') for x in _y_words))
${out} = _y_bytes.hex()
`;
  return code;
};
