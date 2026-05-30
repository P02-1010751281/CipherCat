import * as Blockly from 'blockly/core';
import * as codeGeneratorUtils from './index';

export function inferAlgorithmType(
  workspace: Blockly.WorkspaceSvg | null,
): string {
  if (!workspace) return 'unknown';
  const py = codeGeneratorUtils.generateCode(workspace, 'python') || '';

  // hash — SM3 / SHA-256 / SHA-3 / Keccak
  if (
    /\bdef\s+sha256_compress\b/.test(py) ||
    /\bdef\s+sha3_(pad|absorb|squeeze)\b/.test(py) ||
    /\bdef\s+keccak_f1600\b/.test(py) ||
    /SM3\s*压缩|#\s*SM3\s*压缩/i.test(py) ||
    (/\bdef\s+ee0\b/.test(py) && /\bdef\s+ee1\b/.test(py)) ||
    (/0x6a09e667/.test(py) && /0xbb67ae85/.test(py))
  )
    return 'hash';

  // xof — SHAKE128 / SHAKE256 (可扩展输出函数)
  if (
    /suffix\s*[=:]\s*(0x1[fF]|31)\b/.test(py) ||
    /\bSHAKE128\b|\bSHAKE256\b/i.test(py)
  )
    return 'xof';

  // block_cipher — S-box 替换
  if (
    /sbox_sm4_sub/.test(py) ||
    /\bsbox\s*=\s*\[/.test(py) ||
    /逐字节\s*S-?box\s*替换/i.test(py)
  )
    return 'block_cipher';

  // NOTE: ecc / postquantum / numtheory 算法类型推断暂不启用。
  // 原因：这些算法对应的随机性测试原语匹配逻辑尚未完善，
  // 误判可能导致测试套件选择错误。待原语库丰富后重新启用。
  //
  // 以下为已编写但暂不启用的推断逻辑（保留供后续参考）：
  //
  // -- ecc — 椭圆曲线 ----------------------------------------
  // if (
  //   /curve\s*=\s*\{["']a["']\s*:/.test(py) ||
  //   /\bdef\s+(point_double|scalar_mult)/.test(py) ||
  //   /ecc_/.test(py)
  // ) return 'ecc';
  //
  // -- postquantum — NTT / INTT -------------------------------
  // if (
  //   /\bdef\s+(ntt|intt|ntt_mul|ct_butterfly|gs_butterfly)\b/.test(py) ||
  //   /pq_ntt/.test(py)
  // ) return 'postquantum';
  //
  // -- numtheory — 模逆 / 扩展欧几里得 ------------------------
  // if (
  //   /\bdef\s+(mod_inverse|extended_gcd)\b/.test(py) ||
  //   /nt_field_add/.test(py)
  // ) return 'numtheory';

  // stream_cipher — 输出变长字节的函数
  const defs = [...py.matchAll(/def\s+(\w+)\s*\(([^)]*)\)\s*:/g)];
  for (const m of defs) {
    const params = (m[2] || '').toLowerCase();
    if (/\bn[_]?bytes\b/.test(params)) return 'stream_cipher';
  }
  return 'unknown';
}

export function collectPrimitiveCandidates(
  workspace: Blockly.WorkspaceSvg | null,
  typeHint: string,
): string[] {
  const out: string[] = [];
  if (!workspace) return out;
  const pyCode = codeGeneratorUtils.generateCode(workspace, 'python') || '';
  const matches = [
    ...pyCode.matchAll(/def\s+(\w+)\s*\(([^)]*)\)\s*:\s*([\s\S]*?)\n\s*\n/g),
  ];
  for (const m of matches) {
    const name = m[1];
    const params = (m[2] || '').toLowerCase();
    const body = m[3] || '';
    const returnsBytes =
      /return[\s\S]*bytes\s*\(|return[\s\S]*bytearray\s*\(|return[\s\S]*\.to_bytes\s*\(/.test(
        body,
      ) || /return\s+b['"]/i.test(body);
    if (!returnsBytes) continue;

    const nameLower = name.toLowerCase();
    const hasKey = /\bkey\b/.test(params);
    const hasBlock = /\bblock\b|\bplain|\bcipher/.test(params);
    const hasLen = /\bn[_]?bytes\b|\blen|\bsize/.test(params);

    const isHashName = /hash|sm3|sha|digest/.test(nameLower);
    const isCipherName = /enc|encrypt|decrypt|sm4|aes|des|block/.test(
      nameLower,
    );

    if (typeHint === 'hash') {
      if (isHashName) out.unshift(name);
      else out.push(name);
      continue;
    }

    if (typeHint === 'block_cipher') {
      if ((isCipherName && hasKey) || (hasKey && hasBlock)) out.unshift(name);
      else if (isCipherName) out.splice(Math.min(out.length, 1), 0, name);
      else out.push(name);
      continue;
    }

    if (typeHint === 'stream_cipher') {
      if (hasLen) out.unshift(name);
      else out.push(name);
      continue;
    }

    out.push(name);
  }
  return out;
}
