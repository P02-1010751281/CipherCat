import { pythonGenerator } from 'blockly/python';

export function registerSha3Pad(): string {
  return pythonGenerator.provideFunction_('sha3_pad', [
    'def ' +
      pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(msg, rate_bytes=136, suffix=0x06):',
    '    if isinstance(msg, str):',
    '        msg = msg.encode("utf-8")',
    '    elif isinstance(msg, (list, tuple)):',
    '        if any(isinstance(value, bool) or not isinstance(value, (int, float)) or not 0 <= value <= 255 or int(value) != value for value in msg): raise ValueError("SHA-3 input must contain byte integers from 0 to 255")',
    '        msg = bytes(int(value) for value in msg)',
    '    elif isinstance(msg, (bytes, bytearray)):',
    '        msg = bytes(msg)',
    '    else:',
    '        raise TypeError("SHA-3 input must be UTF-8 text or bytes")',
    '    m_len = len(msg)',
    '    q = rate_bytes - (m_len % rate_bytes)',
    '    padded = bytearray(msg) + bytearray(q)',
    '    padded[m_len] ^= suffix',
    '    padded[m_len + q - 1] ^= 0x80',
    '    return bytes(padded)',
  ]);
}

export function registerSha3PadText(): string {
  const pad = registerSha3Pad();
  return pythonGenerator.provideFunction_('sha3_pad_text', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(text):',
    '    if not isinstance(text, str): raise TypeError("expected UTF-8 text")',
    '    return ' + pad + '(text, rate_bytes=136, suffix=0x06)',
  ]);
}

export function registerKeccakF(): string {
  return pythonGenerator.provideFunction_('keccak_f', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(state, width):',
    '    if width not in (200, 400, 800, 1600): raise ValueError("Unsupported Keccak-f width")',
    '    if not isinstance(state, (list, tuple)) or len(state) != 25: raise TypeError("Keccak-f state must contain 25 lanes")',
    '    lane_bits = width // 25',
    '    mask = (1 << lane_bits) - 1',
    '    if any(isinstance(lane, bool) or not isinstance(lane, int) or not 0 <= lane <= mask for lane in state): raise ValueError("Keccak-f lanes must be integers within the selected width")',
    '    RC = [',
    '        0x0000000000000001, 0x0000000000008082, 0x800000000000808A, 0x8000000080008000,',
    '        0x000000000000808B, 0x0000000080000001, 0x8000000080008081, 0x8000000000008009,',
    '        0x000000000000008A, 0x0000000000000088, 0x0000000080008009, 0x000000008000000A,',
    '        0x000000008000808B, 0x800000000000008B, 0x8000000000008089, 0x8000000000008003,',
    '        0x8000000000008002, 0x8000000000000080, 0x000000000000800A, 0x800000008000000A,',
    '        0x8000000080008081, 0x8000000000008080, 0x0000000080000001, 0x8000000080008008,',
    '    ]',
    '    R = [[0,36,3,41,18],[1,44,10,45,2],[62,6,43,15,61],[28,55,25,21,56],[27,20,39,8,14]]',
    '    s = list(state)',
    '    rounds = 12 + 2 * (lane_bits.bit_length() - 1)',
    '    for rnd in range(rounds):',
    '        C = [s[x] ^ s[x+5] ^ s[x+10] ^ s[x+15] ^ s[x+20] for x in range(5)]',
    '        D = [C[(x+4)%5] ^ (((C[(x+1)%5] << 1) | (C[(x+1)%5] >> (lane_bits-1))) & mask) for x in range(5)]',
    '        s = [(s[i] ^ D[i%5]) & mask for i in range(25)]',
    '        B = [0]*25',
    '        for x in range(5):',
    '            for y in range(5):',
    '                r = R[x][y] % lane_bits',
    '                B[((2*x+3*y)%5)*5+y] = ((s[x+y*5] << r) | (s[x+y*5] >> (lane_bits-r))) & mask',
    '        for x in range(5):',
    '            for y in range(5):',
    '                s[x+y*5] = (B[x+y*5] ^ ((~B[(x+1)%5+y*5]) & B[(x+2)%5+y*5])) & mask',
    '        s[0] = (s[0] ^ RC[rnd]) & mask',
    '    return s',
  ]);
}

export function registerKeccakF1600(): string {
  const keccakName = registerKeccakF();
  return pythonGenerator.provideFunction_('keccak_f1600', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(state):',
    '    return ' + keccakName + '(state, 1600)',
  ]);
}

export function registerSha3Absorb(): string {
  const keccakName = registerKeccakF();
  return pythonGenerator.provideFunction_('sha3_absorb', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(state, block, rate_bytes=136):',
    '    if len(block) % rate_bytes: raise ValueError("Sponge absorb input length must be a multiple of the rate")',
    '    rate_lanes = rate_bytes // 8',
    '    s = list(state)',
    '    for offset in range(0, len(block), rate_bytes):',
    '        chunk = block[offset:offset + rate_bytes]',
    '        for i in range(rate_lanes):',
    '            lane = 0',
    '            for j in range(8):',
    '                lane |= (chunk[i*8+j] if i*8+j < len(chunk) else 0) << (j*8)',
    '            s[i] ^= lane',
    '        s = ' + keccakName + '(s, 1600)',
    '    return s',
  ]);
}

export function registerSha3Squeeze(): string {
  const keccakName = registerKeccakF();
  return pythonGenerator.provideFunction_('sha3_squeeze', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(state, out_len, rate_bytes=136):',
    '    if isinstance(out_len, bool) or not isinstance(out_len, (int, float)) or not 0 <= out_len <= 9007199254740991 or int(out_len) != out_len: raise ValueError("Sponge output length must be a non-negative safe integer value")',
    '    out_len = int(out_len)',
    '    rate_lanes = rate_bytes // 8',
    '    s = list(state)',
    '    output = bytearray()',
    '    while len(output) < out_len:',
    '        for i in range(rate_lanes):',
    '            for j in range(8):',
    '                if len(output) >= out_len:',
    '                    break',
    '                output.append((s[i] >> (j*8)) & 0xFF)',
    '            if len(output) >= out_len:',
    '                break',
    '        if len(output) < out_len:',
    '            s = ' + keccakName + '(s, 1600)',
    '    return bytes(output[:out_len])',
  ]);
}
