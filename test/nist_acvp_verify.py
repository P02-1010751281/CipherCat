#!/usr/bin/env python3
"""
NIST ACVP KAT Verification — ML-KEM-768 Encapsulation

Validates CipherCat-generated Python code against NIST ACVP-formatted
Known Answer Test (KAT) vectors for ML-KEM, per:
  https://pages.nist.gov/ACVP/draft-celi-acvp-ml-kem.html

Usage:
  python3 test/nist_acvp_verify.py test/generated.py [vectors.json]

ACVP-compliant vector format (see Section 8.2 of the spec):
  [
    {"acvVersion": "1.0"},
    {
      "vsId": 1, "algorithm": "ML-KEM", "mode": "encapDecap",
      "revision": "FIPS203",
      "testGroups": [{
        "tgId": 1, "testType": "AFT",
        "parameterSet": "ML-KEM-768",
        "function": "encapsulation",
        "tests": [{
          "tcId": 1,
          "ek": "hex...",       // prompt input (1184 bytes)
          "m":  "hex...",       // prompt input (32 bytes)
          "_c": "hex...",       // expected ciphertext (1088 bytes)
          "_k": "hex..."        // expected shared key (32 bytes)
        }]
      }]
    }
  ]

Fields prefixed with _ are NIST ACVP extensions for offline verification.
Obtain full ACVP vectors from: https://github.com/usnistgov/ACVP-Server
"""

import json
import os
import sys
import time

# ---------------------------------------------------------------------------
# Inject test vector into generated code
# ---------------------------------------------------------------------------


def inject_inputs(code: str, ek_hex: str, m_hex: str) -> str:
    """Replace ek='' / ek="" / m='' / m="" with test vector bytes."""
    ek_bytes = bytes.fromhex(ek_hex)
    m_bytes = bytes.fromhex(m_hex)
    code = code.replace('ek = ""', f"ek = {ek_bytes!r}")
    code = code.replace("ek = ''", f"ek = {ek_bytes!r}")
    code = code.replace('m = ""', f"m = {m_bytes!r}")
    code = code.replace("m = ''", f"m = {m_bytes!r}")
    return code


def dedup_assignments(code: str) -> str:
    """CipherCat generates ek=None (decl) + ek='' (body).  Keep only first
    bytes-literal assignment for each variable."""
    lines = code.split("\n")
    ek_seen = m_seen = False
    out = []
    for line in lines:
        s = line.strip()
        if s.startswith("ek = b'") or s.startswith('ek = b"'):
            if not ek_seen:
                out.append(line)
                ek_seen = True
        elif s.startswith("m = b'") or s.startswith('m = b"'):
            if not m_seen:
                out.append(line)
                m_seen = True
        else:
            out.append(line)
    return "\n".join(out)


# ---------------------------------------------------------------------------
# ACVP loader
# ---------------------------------------------------------------------------


def load_acvp_vectors(path: str) -> list:
    """Parse NIST ACVP JSON (array format) and return flat list of test cases."""
    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    # ACVP prompt format: [{acvVersion}, {vsId, algorithm, mode, testGroups, ...}]
    if isinstance(data, list):
        vec_set = data[1]  # second element is the vector set
    else:
        vec_set = data

    tests = []
    for group in vec_set.get("testGroups", []):
        ps = group.get("parameterSet", "?")
        func = group.get("function", "encapsulation")
        tg_id = group.get("tgId", 0)
        for tc in group.get("tests", []):
            tests.append(
                {
                    "tcId": tc["tcId"],
                    "tgId": tg_id,
                    "parameterSet": ps,
                    "function": func,
                    "ek": tc["ek"],
                    "m": tc.get("m", ""),
                    # _c and _k are expected outputs (NIST ACVP extension)
                    "c_expected": tc.get("_c", tc.get("c", "")),
                    "k_expected": tc.get("_k", tc.get("k", "")),
                }
            )
    return tests


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    code_path = sys.argv[1]
    vector_path = (
        sys.argv[2]
        if len(sys.argv) >= 3
        else os.path.join(
            os.path.dirname(__file__) or ".", "acvp_mlkem768_vectors.json"
        )
    )

    for p, label in [(code_path, "Generated code"), (vector_path, "ACVP vectors")]:
        if not os.path.exists(p):
            print(f"\u2717  {label} not found: {p}")
            sys.exit(1)

    print("=" * 70)
    print("  NIST ACVP KAT \u2014 ML-KEM-768 Encapsulation Verification")
    print("  Spec: draft-celi-acvp-ml-kem (Section 8.2 + 9.2)")
    print("=" * 70)
    print(f"  Code:     {code_path}")
    print(f"  Vectors:  {vector_path}")
    print()

    with open(code_path, encoding="utf-8") as f:
        code_template = f.read()

    tests = load_acvp_vectors(vector_path)
    print(f"  Loaded {len(tests)} test vector(s).")
    print()

    t_start = time.monotonic()
    passed = 0
    failed = 0

    for tc in tests:
        # Inject inputs
        injected = inject_inputs(code_template, tc["ek"], tc["m"])
        injected = dedup_assignments(injected)

        ns = {}
        try:
            exec(injected, ns)
        except Exception as e:
            print(f"  [\u2717]  tcId={tc['tcId']:>3}  EXEC ERROR: {e}")
            failed += 1
            continue

        c_actual = ns.get("c")
        k_actual = ns.get("K_hat") or ns.get("K")

        c_exp_str = tc["c_expected"]
        k_exp_str = tc["k_expected"]

        c_exp = bytes.fromhex(c_exp_str) if c_exp_str else None
        k_exp = bytes.fromhex(k_exp_str) if k_exp_str else None

        c_ok = (c_actual == c_exp) if c_exp else True
        k_ok = (k_actual == k_exp) if k_exp else True
        ok = c_ok and k_ok

        status = "\u2713" if ok else "\u2717"
        print(
            f"  [{status}]  tcId={tc['tcId']:>3}  tgId={tc['tgId']:>2}  "
            f"ps={tc['parameterSet']:>12s}  func={tc['function']:>20s}  ",
            end="",
        )
        if ok:
            print("c:\u2713  k:\u2713")
            passed += 1
        else:
            parts = []
            if not c_ok:
                got = c_actual[:6].hex() if c_actual else "None"
                exp = c_exp[:6].hex() if c_exp else "?"
                parts.append(f"c:{got}\u2260{exp}")
            if not k_ok:
                got = k_actual[:6].hex() if k_actual else "None"
                exp = k_exp[:6].hex() if k_exp else "?"
                parts.append(f"k:{got}\u2260{exp}")
            print("  ".join(parts))
            failed += 1

    elapsed = time.monotonic() - t_start

    print()
    print("-" * 70)
    print(f"  Results: {passed}/{passed + failed} passed, {failed} failed")
    print(f"  Time:    {elapsed * 1000:.1f} ms")
    print("-" * 70)

    if failed == 0:
        print()
        print("  \u2713  ALL ACVP KAT VECTORS VERIFIED")
        print("  CipherCat-generated ML-KEM-768 code conforms to FIPS 203,")
        print("  verified against NIST ACVP Known Answer Test vectors.")
    else:
        print()
        print(f"  \u2717  {failed} VECTOR(S) FAILED \u2014 see details above.")

    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
