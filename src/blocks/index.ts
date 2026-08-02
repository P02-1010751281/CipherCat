export * from './ctrl';
export * from './data';
export * from './array';
export * from './logic';
export * from './bitwise';
export * from './sbox';
export * from './hash';
export * from './numtheory';
export * from './ecc';
export * from './zuc';
export * from './cmac';
export * from './ccm';
export * from './xts';
export * from './x25519';
export * from './ascon';
export * from './hkdf';
export * from './pbkdf2';
export * from './gcm';
export * from './post-quantum';
export * from './procedure';
export * from './symmetric';
export * from './remaining';
export * from './eddsa';
export * from './ecdsa';
export * from './sm2sig';
export * from './drbg';
export * from './argon2';
export * from './gmdrbg';
export * from './mldsa';
export * from './sm9';
export * from './rsa';

import { CTRL_BLOCK_TYPES, type CtrlBlockType } from './ctrl';
import { DATA_BLOCK_TYPES, type DataBlockType } from './data';
import { ARRAY_BLOCK_TYPES, type ArrayBlockType } from './array';
import { LOGIC_BLOCK_TYPES, type LogicBlockType } from './logic';
import { BIT_BLOCK_TYPES, type BitBlockType } from './bitwise';
import { ALL_SBOX_BLOCK_TYPES, type AllSBoxBlockType } from './sbox';
import {
  ALL_BLOCK_TYPES as HASH_BLOCK_TYPES,
  type HashBlockType,
} from './hash';
import { NT_BLOCK_TYPES, type NtBlockType } from './numtheory';
import { ECC_BLOCK_TYPES, type EccBlockType } from './ecc';
import { ZUC_BLOCK_TYPES, type ZucBlockType } from './zuc';
import { CMAC_BLOCK_TYPES, type CmacBlockType } from './cmac';
import { CCM_BLOCK_TYPES, type CcmBlockType } from './ccm';
import { XTS_BLOCK_TYPES, type XtsBlockType } from './xts';
import { X25519_BLOCK_TYPES, type X25519BlockType } from './x25519';
import { ASCON_BLOCK_TYPES, type AsconBlockType } from './ascon';
import { HKDF_BLOCK_TYPES, type HkdfBlockType } from './hkdf';
import { PBKDF2_BLOCK_TYPES, type Pbkdf2BlockType } from './pbkdf2';
import { GCM_BLOCK_TYPES, type GcmBlockType } from './gcm';
import { PQ_BLOCK_TYPES, type PostQuantumBlockType } from './post-quantum';
import {
  PROCEDURE_BLOCK_TYPES,
  type ProcedureBlockType,
} from './procedure';
import {
  SYMMETRIC_BLOCK_TYPES,
  type SymmetricBlockType,
} from './symmetric';
import {
  REMAINING_BLOCK_TYPES,
  type RemainingBlockType,
} from './remaining';
import { EDDSA_BLOCK_TYPES, type EddsaBlockType } from './eddsa';
import { ECDSA_BLOCK_TYPES, type EcdsaBlockType } from './ecdsa';
import { SM2SIG_BLOCK_TYPES, type Sm2SigBlockType } from './sm2sig';
import { DRBG_BLOCK_TYPES, type DrbgBlockType } from './drbg';
import { ARGON2_BLOCK_TYPES, type Argon2BlockType } from './argon2';
import { GMDRBG_BLOCK_TYPES, type GmDrbgBlockType } from './gmdrbg';
import { MLDSA_BLOCK_TYPES, type MldsaBlockType } from './mldsa';
import { SM9_BLOCK_TYPES, type Sm9BlockType } from './sm9';
import { RSA_BLOCK_TYPES, type RsaBlockType } from './rsa';

export const ALL_BLOCK_TYPES = [
  ...CTRL_BLOCK_TYPES,
  ...DATA_BLOCK_TYPES,
  ...ARRAY_BLOCK_TYPES,
  ...LOGIC_BLOCK_TYPES,
  ...BIT_BLOCK_TYPES,
  ...ALL_SBOX_BLOCK_TYPES,
  ...HASH_BLOCK_TYPES,
  ...NT_BLOCK_TYPES,
  ...ECC_BLOCK_TYPES,
  ...ZUC_BLOCK_TYPES,
  ...CMAC_BLOCK_TYPES,
  ...CCM_BLOCK_TYPES,
  ...XTS_BLOCK_TYPES,
  ...X25519_BLOCK_TYPES,
  ...ASCON_BLOCK_TYPES,
  ...HKDF_BLOCK_TYPES,
  ...PBKDF2_BLOCK_TYPES,
  ...GCM_BLOCK_TYPES,
  ...PQ_BLOCK_TYPES,
  ...PROCEDURE_BLOCK_TYPES,
  ...SYMMETRIC_BLOCK_TYPES,
  ...REMAINING_BLOCK_TYPES,
  ...EDDSA_BLOCK_TYPES,
  ...ECDSA_BLOCK_TYPES,
  ...SM2SIG_BLOCK_TYPES,
  ...DRBG_BLOCK_TYPES,
  ...ARGON2_BLOCK_TYPES,
  ...GMDRBG_BLOCK_TYPES,
  ...MLDSA_BLOCK_TYPES,
  ...SM9_BLOCK_TYPES,
  ...RSA_BLOCK_TYPES,
] as const;

export type AllBlockType =
  | CtrlBlockType
  | DataBlockType
  | ArrayBlockType
  | LogicBlockType
  | BitBlockType
  | AllSBoxBlockType
  | HashBlockType
  | NtBlockType
  | EccBlockType
  | ZucBlockType
  | CmacBlockType
  | CcmBlockType
  | XtsBlockType
  | X25519BlockType
  | AsconBlockType
  | HkdfBlockType
  | Pbkdf2BlockType
  | GcmBlockType
  | PostQuantumBlockType
  | ProcedureBlockType
  | SymmetricBlockType
  | RemainingBlockType
  | EddsaBlockType
  | EcdsaBlockType
  | Sm2SigBlockType
  | DrbgBlockType
  | Argon2BlockType
  | GmDrbgBlockType
  | MldsaBlockType
  | Sm9BlockType
  | RsaBlockType;
