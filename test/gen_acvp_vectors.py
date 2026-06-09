#!/usr/bin/env python3
"""
Generate NIST ACVP-format test vectors for ML-KEM.

Two sources:
  1. C2SP/CCTV intermediate test vectors (bundled, no compilation needed)
  2. Kyber reference implementation KAT output (requires compiling C code)

Usage:
  # From C2SP (fast, already available):
  python3 test/gen_acvp_vectors.py --c2sp test/ML-KEM-768.txt > vectors.json

  # From Kyber reference (compiles C code):
  python3 test/gen_acvp_vectors.py --kyber-ref /path/to/kyber/ref

References:
  - C2SP/CCTV: https://github.com/C2SP/CCTV/tree/main/ML-KEM
  - Kyber ref:  https://github.com/pq-crystals/kyber
  - ACVP spec:  https://pages.nist.gov/ACVP/draft-celi-acvp-ml-kem.html
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile

# ---------------------------------------------------------------------------
# C2SP / CCTV parser
# ---------------------------------------------------------------------------


def parse_c2sp(path: str) -> dict:
    """Parse C2SP intermediate test vector file into dict."""
    data = {}
    with open(path) as f:
        for line in f:
            line = line.strip()
            if " = " not in line:
                continue
            key, _, val = line.partition(" = ")
            data[key.strip()] = val.strip()
    return data


def c2sp_to_acvp(c2sp_path: str, vs_id: int = 1) -> list:
    """Convert C2SP test vector to NIST ACVP prompt format."""
    d = parse_c2sp(c2sp_path)
    param_set = "ML-KEM-768"  # C2SP file is for ML-KEM-768

    return [
        {"acvVersion": "1.0"},
        {
            "vsId": vs_id,
            "algorithm": "ML-KEM",
            "mode": "encapDecap",
            "revision": "FIPS203",
            "testGroups": [
                {
                    "tgId": 1,
                    "testType": "AFT",
                    "parameterSet": param_set,
                    "function": "encapsulation",
                    "tests": [
                        {
                            "tcId": 1,
                            "ek": d["ek"],
                            "m": d["m"],
                            "_c": d["c"],
                            "_k": d["K"],
                        }
                    ],
                }
            ],
        },
    ]


# ---------------------------------------------------------------------------
# Kyber reference KAT parser
# ---------------------------------------------------------------------------


def build_kyber_ref(ref_dir: str) -> str:
    """Compile Kyber reference KAT generator and return path to binary."""
    ref_dir = os.path.abspath(ref_dir)
    kat_c = os.path.join(ref_dir, "PQCgenKAT_kem.c")

    if not os.path.exists(kat_c):
        # Try common locations
        for sub in ["", "ref", "Ref", "Reference_Implementation"]:
            p = os.path.join(ref_dir, sub, "PQCgenKAT_kem.c")
            if os.path.exists(p):
                kat_c = p
                ref_dir = os.path.dirname(p)
                break
        else:
            print("Could not find PQCgenKAT_kem.c in", ref_dir, file=sys.stderr)
            sys.exit(1)

    # Find all .c files in the directory for compilation
    srcs = [kat_c]
    for f in sorted(os.listdir(ref_dir)):
        if f.endswith(".c") and f != os.path.basename(kat_c):
            srcs.append(os.path.join(ref_dir, f))

    # Compile
    binary = os.path.join(tempfile.gettempdir(), "kyber_kat_gen")
    cmd = ["cc", "-O2", "-o", binary] + srcs + ["-lm", "-lcrypto"]
    print("Compiling:", " ".join(cmd), file=sys.stderr)
    subprocess.run(cmd, check=True)
    return binary


def run_kyber_kat(binary: str, param_set: str = "768") -> str:
    """Run Kyber KAT generator and capture output."""
    # Kyber KAT takes no args; it outputs to stdout and writes .rsp/.req files
    result = subprocess.run(
        [binary],
        capture_output=True,
        text=True,
        timeout=60,
    )
    return result.stdout


def parse_kyber_kat_rsp(rsp_path: str) -> list[dict]:
    """Parse Kyber KAT .rsp file into list of test vectors.

    Format (Kyber round-3 submission):
      count = 0
      seed = ...
      pk = ...
      sk = ...
      ct = ...
      ss = ...

    We map pk -> ek, ct -> c, ss -> k (shared secret).
    """
    vectors = []
    current = {}
    with open(rsp_path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if " = " in line:
                key, _, val = line.partition(" = ")
                key = key.strip()
                val = val.strip()
                current[key] = val
                if key == "ss":  # last field in a test case
                    vectors.append(
                        {
                            "ek": current.get("pk", ""),
                            "m": "",  # Kyber KAT doesn't expose m directly
                            "c_expected": current.get("ct", ""),
                            "k_expected": current.get("ss", ""),
                        }
                    )
                    current = {}
    return vectors


def kyberref_to_acvp(
    rsp_path: str, vs_id: int = 1, param_set: str = "ML-KEM-768"
) -> list:
    """Convert Kyber ref KAT .rsp to NIST ACVP prompt format."""
    vectors = parse_kyber_kat_rsp(rsp_path)

    tests = []
    for i, v in enumerate(vectors):
        tests.append(
            {
                "tcId": i + 1,
                "ek": v["ek"],
                "m": v["m"],
                "_c": v["c_expected"],
                "_k": v["k_expected"],
            }
        )

    return [
        {"acvVersion": "1.0"},
        {
            "vsId": vs_id,
            "algorithm": "ML-KEM",
            "mode": "encapDecap",
            "revision": "FIPS203",
            "testGroups": [
                {
                    "tgId": 1,
                    "testType": "AFT",
                    "parameterSet": param_set,
                    "function": "encapsulation",
                    "tests": tests,
                }
            ],
        },
    ]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main():
    parser = argparse.ArgumentParser(
        description="Generate NIST ACVP ML-KEM test vectors"
    )
    parser.add_argument(
        "--c2sp",
        metavar="PATH",
        help="Path to C2SP/CCTV ML-KEM-768.txt intermediate test vector file",
    )
    parser.add_argument(
        "--kyber-ref",
        metavar="DIR",
        help="Path to pq-crystals/kyber reference implementation directory",
    )
    parser.add_argument(
        "--kyber-rsp",
        metavar="PATH",
        help="Path to pre-generated Kyber KAT .rsp file (skip compilation)",
    )
    parser.add_argument(
        "--param-set",
        default="ML-KEM-768",
        choices=["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"],
        help="ML-KEM parameter set (default: ML-KEM-768)",
    )
    parser.add_argument(
        "--vs-id",
        type=int,
        default=1,
        help="Vector set ID (default: 1)",
    )
    parser.add_argument(
        "-o",
        "--output",
        metavar="PATH",
        help="Write output to file (default: stdout)",
    )
    args = parser.parse_args()

    if args.c2sp:
        result = c2sp_to_acvp(args.c2sp, args.vs_id)
    elif args.kyber_rsp:
        result = kyberref_to_acvp(args.kyber_rsp, args.vs_id, args.param_set)
    elif args.kyber_ref:
        binary = build_kyber_ref(args.kyber_ref)
        # Run in the ref directory (KAT output files are created in CWD)
        cwd = (
            os.path.dirname(binary)
            if "/" in binary
            else os.path.dirname(args.kyber_ref)
        )
        subprocess.run([binary], cwd=cwd, check=True)
        # Find the .rsp file
        rsp_files = [f for f in os.listdir(cwd) if f.endswith(".rsp")]
        if not rsp_files:
            print("No .rsp file generated. Check compilation.", file=sys.stderr)
            sys.exit(1)
        rsp_path = os.path.join(cwd, rsp_files[0])
        result = kyberref_to_acvp(rsp_path, args.vs_id, args.param_set)
    else:
        parser.print_help()
        sys.exit(1)

    output = json.dumps(result, indent=2)
    if args.output:
        with open(args.output, "w") as f:
            f.write(output)
            f.write("\n")
        print(
            f"Wrote {len(result[1]['testGroups'][0]['tests'])} vectors to {args.output}",
            file=sys.stderr,
        )
    else:
        print(output)


if __name__ == "__main__":
    main()
