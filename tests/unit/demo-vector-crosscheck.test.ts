// @vitest-environment node
/**
 * Demo 官方向量的独立复算（ITEM-2）。
 *
 * 目的：把「期望值来自标准附录」这一声明从“文档自述”变成可重复的第三方复算证据。
 * 做法：用 Python 标准库（hashlib / hmac）与 `cryptography` 独立实现重算同一组参数，
 * 再与 `demos/tests.json` 中登记的期望值逐字节比较。
 *
 * 环境不可用时（无 python3 或未安装 cryptography）整组跳过，不做“通过”记录；
 * 本测试只核对所列参数集，不替代官方完整测试套件，也不构成认证证据。
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

interface Expectation {
  demo: string;
  line: number;
}

const EXPECTATIONS: Expectation[] = [
  // SP 800-38C 附录 C：工作区函数为 Example 3，两条直接调用分别为 Example 1、Example 2
  { demo: 'procedures/CCM-Encrypt.json', line: 0 },
  { demo: 'procedures/CCM-Encrypt.json', line: 1 },
  { demo: 'procedures/CCM-Encrypt.json', line: 2 },
  // SP 800-38D：工作区函数为 TC13（空 AAD、64B 明文），直接调用为 TC2
  { demo: 'procedures/GCM-Encrypt.json', line: 0 },
  { demo: 'procedures/GCM-Encrypt.json', line: 1 },
  // FIPS 180-4 / FIPS 202 / FIPS 198-1 / RFC 5869 / RFC 8018 派生与散列量
  // （SHA224-Hash 的期望值是 driver 内部断言后的 'SHA224-OK' 标记，向量本身在 driver 内核对，故不在此比对）
  { demo: 'procedures/SHA256-Hash.json', line: 0 },
  { demo: 'procedures/SHA384-Hash.json', line: 0 },
  { demo: 'procedures/SHA512-Hash.json', line: 0 },
  { demo: 'procedures/SHA3-Hash.json', line: 0 },
  { demo: 'procedures/HMAC-SHA256.json', line: 0 },
  { demo: 'procedures/HKDF-SHA256.json', line: 0 },
  { demo: 'procedures/PBKDF2-SHA256.json', line: 0 },
  // RFC 5903 §8.1 P-256 ECDH 共享密钥（i→r 与 r→i 两方向）
  { demo: 'procedures/ECDH.json', line: 0 },
  { demo: 'procedures/ECDH.json', line: 1 },
];

// 独立复算脚本：只使用标准参数集，输出与 EXPECTATIONS 顺序一致的十六进制值。
const PYTHON_PROBE = `
import binascii, hashlib, hmac, json

def aes_ccm(k, n, a, p, taglen):
    from cryptography.hazmat.primitives.ciphers.aead import AESCCM
    return AESCCM(k, tag_length=taglen).encrypt(n, p, a)

def aes_gcm(k, iv, a, p):
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    return AESGCM(k).encrypt(iv, p, a)

def pbkdf2_sha256(pw, salt, c, dk):
    return hashlib.pbkdf2_hmac("sha256", pw, salt, c, dk)

def ecdh_p256_x(private_hex, peer_x_hex, peer_y_hex):
    from cryptography.hazmat.primitives.asymmetric import ec
    curve = ec.SECP256R1()
    peer = ec.EllipticCurvePublicNumbers(
        int(peer_x_hex, 16), int(peer_y_hex, 16), curve
    ).public_key()
    private = ec.derive_private_key(int(private_hex, 16), curve)
    shared = private.exchange(ec.ECDH(), peer)
    return shared

def hkdf_sha256(ikm, salt, info, length):
    prk = hmac.new(salt, ikm, hashlib.sha256).digest()
    okm, block, counter = b"", b"", 1
    while len(okm) < length:
        block = hmac.new(prk, block + info + bytes([counter]), hashlib.sha256).digest()
        okm += block
        counter += 1
    return okm[:length]

K = bytes(range(0x40, 0x50))
N7, N8, N12 = bytes(range(0x10, 0x17)), bytes(range(0x10, 0x18)), bytes(range(0x10, 0x1C))
A8, A16, A20 = bytes(range(0x00, 0x08)), bytes(range(0x00, 0x10)), bytes(range(0x00, 0x14))
P4, P16, P24 = bytes(range(0x20, 0x24)), bytes(range(0x20, 0x30)), bytes(range(0x20, 0x38))

tc13_key = bytes.fromhex("feffe9928665731c6d6a8f9467308308")
tc13_iv = bytes.fromhex("cafebabefacedbaddecaf888")
tc13_plaintext = bytes.fromhex(
    "d9313225f88406e5a55909c5aff5269a86a7a9531534f7da2e4c303d8a318a72"
    "1c3c0c95956809532fcf0e2449a6b525b16aedf5aa0de657ba637b391aafd255"
)

results = [
    aes_ccm(K, N12, A20, P24, 8),
    aes_ccm(K, N7, A8, P4, 4),
    aes_ccm(K, N8, A16, P16, 6),
    aes_gcm(tc13_key, tc13_iv, b"", tc13_plaintext),
    aes_gcm(bytes(16), bytes(12), b"", bytes(16)),
    hashlib.sha256(b"abc").digest(),
    hashlib.sha384(b"abc").digest(),
    hashlib.sha512(b"abc").digest(),
    hashlib.sha3_256(b"abc").digest(),
    hmac.new(bytes([0x0B]) * 20, b"Hi There", hashlib.sha256).digest(),
    hkdf_sha256(bytes([0x0B]) * 22, bytes(range(13)), bytes(range(0xF0, 0xFA)), 42),
    pbkdf2_sha256(b"password", b"salt", 2, 32),
    ecdh_p256_x(
        "6c7cf735485ec76607fb91ef9c33101cc62c3e3e2bd80483e49242b4939f6195",
        "beb3df748695ae7171115ac6bf126cedd64b97535eabd01954c72bc3df37c8f0",
        "29aca2d51a714413b812f000b49139cd9e2720b77b3db0cb95f40cd70f3fbcea",
    ),
    ecdh_p256_x(
        "c88f01f510d9ac3f70a292daa2316de544e9aab8afe84049c62a9c57862d1433",
        "d12dfb5289c8d4f81208b70270398c342296970a0bccb74c736fc7554494bf63",
        "56fbf3ca366cc23e8157854c13c58d6aac23f046ada30f8353e74f33039872ab",
    ),
]
print(json.dumps([binascii.hexlify(value).decode() for value in results]))
`;

function pythonAvailable(): boolean {
  try {
    execFileSync(process.platform === 'win32' ? 'python' : 'python3', ['-c', 'import cryptography'], {
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    return true;
  } catch {
    return false;
  }
}

describe('demo vector cross-check', () => {
  const registry = JSON.parse(readFileSync(resolve(process.cwd(), 'demos/tests.json'), 'utf8')) as Record<
    string,
    { py?: { expect?: string } }
  >;

  it.skipIf(!pythonAvailable())('recomputes each declared official vector with an independent implementation', () => {
    const recomputed = JSON.parse(execFileSync(
      process.platform === 'win32' ? 'python' : 'python3',
      ['-c', PYTHON_PROBE],
      { encoding: 'utf8' },
    )) as string[];
    expect(recomputed).toHaveLength(EXPECTATIONS.length);

    EXPECTATIONS.forEach(({ demo, line }, index) => {
      const expected = (registry[demo]?.py?.expect || '').split('\n')[line]?.trim();
      expect(expected, `${demo} 缺少第 ${line} 行期望值`).toBeTruthy();
      expect(recomputed[index], `${demo} 第 ${line} 行与独立复算不一致`).toBe(expected);
    });
  });
});
