# RSA Probabilistic Primality Testing (FIPS 186-5)

## Entry Metadata

| Field | Value |
|---|---|
| Type | RSA probabilistic primality-testing primitive |
| Standard position | FIPS 186-5 Appendices B.3 and B.3.1; rounds are specified by Table B.1 and Appendix C.1 |
| Source evidence | [Complete source extraction](./00-Standard-Source.md); [NIST publication page](https://csrc.nist.gov/pubs/fips/186-5/final) |
| Source location | B.3: [extraction from line 2724](./00-Standard-Source.md#L2724); B.3.1: [from line 2779](./00-Standard-Source.md#L2779), PDF physical pages 66–67 (printed pages 57–58) |
| Project status | Reference only; the current test is embedded in the educational RSA key generator and is not claimed to conform to FIPS 186-5 |

## Standard Definition

Appendix B.3 requires an approved robust probabilistic primality test. B.3.1 and B.3.2 define two Miller–Rabin tests. The standard also permits iterated Miller–Rabin followed by one Lucas test. The DRBG used for Miller–Rabin bases must be approved. Optional trial division may precede the probabilistic test, with a limit `L` between `10^3` and `10^5`.

The required rounds depend on the algorithm, candidate-prime length, security strength, target error probability, and any subsequent test. The RSA values from Table B.1 are listed in the [RSA key-generation entry](./05-RSA-Key-Generation.en.md#standard-definition). A fixed round count cannot be converted into an error probability independent of these conditions.

This entry structures only the B.3.1 Miller–Rabin test. The enhanced Miller–Rabin test in B.3.2 and Lucas test in B.3.3 are not expanded here.

## Source Location and Citation

The complete B.3.1 inputs, outputs, and steps appear in the “Source Excerpt” section below. Exponents lost in the text extraction were restored against the PDF layout; the formula and step order have not been replaced by a summary. See the [NIST.FIPS.186-5.pdf](./NIST.FIPS.186-5.pdf).

## Formula or Pseudocode

```text
Input: odd integer w; iteration count iterations consistent with Table B.1.
Output: status ∈ {PROBABLY PRIME, COMPOSITE}.

1. Let a be the largest integer such that 2^a divides w−1.
2. m = (w−1) / 2^a.
3. wlen = len(w).
4. For i = 1 to iterations:
   4.1 Obtain a wlen-bit string b from the approved DRBG and convert b using B.2.1.
   4.2 If b ≤ 1 or b ≥ w−1, repeat step 4.1.
   4.3 z = b^m mod w.
   4.4 If z = 1 or z = w−1, continue at step 4.7.
   4.5 For j = 1 to a−1:
       4.5.1 z = z^2 mod w.
       4.5.2 If z = w−1, continue at step 4.7.
       4.5.3 If z = 1, continue at step 4.6.
   4.6 Return COMPOSITE.
   4.7 Continue.
5. Return PROBABLY PRIME.
```

## Inputs and Outputs

Inputs are an odd candidate `w` (which may be `p`, `q`, or an auxiliary prime in a conditional-prime construction) and an `iterations` count consistent with Table B.1. The result is `PROBABLY PRIME` or `COMPOSITE`; `PROBABLY PRIME` is a probabilistic-test result, not a mathematical proof.

## Project Mapping

- Standalone Blockly block: none. The test is implemented inside the `rsa_keygen` generator.
- JavaScript generator: `rsaIsPrime`, which obtains random bases from `crypto.getRandomValues`.
- Python generator: `rsa_is_prime`, which obtains random bases from `secrets.randbelow`.
- Related test: `tests/unit/rsa-randomness.test.ts` checks sampling bounds and the 20 base-sampling calls in the Python path; it is not a FIPS algorithm-validation suite.

## Verification and Gaps

- Both generators use 20 random-base Miller–Rabin rounds and small-prime trial division. Similarity to B.3.1 does not establish FIPS 186-5 validation.
- Use of system randomness APIs does not prove use of an approved DRBG; there is no laboratory test, validation certificate, or approved cryptographic-module boundary evidence.
- Although the round count exceeds the Table B.1 count for the currently used RSA `p/q` sizes, this does not replace evidence for candidate size, DRBG, target error probability, implementation validation, or the remaining key-generation requirements.
- Trial division is currently controlled by a fixed small-prime list; there is no evidence that an `L` parameter is selected as specified in B.3. The B.3.2 and B.3.3 paths are also not implemented as verifiable flows.

## Source Excerpt

The complete B.3.1 inputs, outputs, and test steps are preserved below. Exponents are normalized to match the PDF layout. Context and Table B.1 are in the [complete source extraction](./00-Standard-Source.md#L2724).

```text
B.3.1 Miller-Rabin Probabilistic Primality Test
Let DRBG be an approved deterministic random bit generator.
Input:
   1. w                   The odd integer to be tested for primality. This will be either p or
                          q, or one of the auxiliary primes p1, p2, q1, or q2.
   2. iterations          The number of iterations of the test to be performed; the value
                          shall be consistent with Table B.1.
Output:
   1. status              The status returned from the validation procedure where status is
                          either PROBABLY PRIME or COMPOSITE.
Process:
   1. Let a be the largest integer such that 2^a divides w−1.
   2. m = (w−1) / 2^a.
   3. wlen = len (w).
   4. For i = 1 to iterations do
         4.1   Obtain a string b of wlen bits from a DRBG. Convert b to an integer using the
               algorithm in B.2.1.
         4.2   If ((b ≤ 1) or (b ≥ w − 1)), then go to step 4.1.
         4.3   z = b^m mod w.
         4.4   If ((z = 1) or (z = w − 1)), then go to step 4.7.
         4.5   For j = 1 to a − 1 do.
               4.5.1   z = z^2 mod w.
               4.5.2   If (z = w − 1), then go to step 4.7.
               4.5.3   If (z = 1), then go to step 4.6.
         4.6 Return COMPOSITE.
         4.7 Continue.
   5. Return PROBABLY PRIME.
```
