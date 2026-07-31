/**
 * 函数工具箱共享状态 — Function Manager 通过它管理 toolbox 中的模板可见性。
 */
import { ref } from 'vue';

/** 已添加到工具箱的模板块类型列表（如 'proc_aes_round'）。 */
export const toolboxTemplates = ref<string[]>([]);

/** 全部可选模板（Manager 面板展示用）。 */
export const ALL_TEMPLATE_TYPES: string[] = [
  'crypto_encrypt_func',
  'crypto_decrypt_func',
  'crypto_hash_func',
  'proc_aes_round',
  'proc_aes_last_round',
  'proc_aes_key_schedule',
  'proc_sm4_round',
  'proc_sm4_key_schedule',
  'proc_sha256_hash',
  'proc_sm3_hash',
  'proc_hmac_sha256',
  'proc_sm3_hmac',
  'proc_pbkdf2',
  'proc_hkdf',
  'proc_mlkem_keygen',
  'proc_md_iterate',
  'proc_sponge_duplex',
  'proc_mode_ecb',
  'proc_mode_cbc',
  'proc_mode_ctr',
  'proc_mode_gcm',
  'proc_ntt_vec',
  'proc_pq_cbd',
  'proc_pq_mat_mul',
  'proc_pq_sample',
  'proc_pq_vec_add',
  'proc_pq_vec_sub',
];

/** 添加模板到工具箱。 */
export function addTemplate(type: string): void {
  if (!toolboxTemplates.value.includes(type)) {
    toolboxTemplates.value.push(type);
  }
}

/** 从工具箱移除模板。 */
export function removeTemplate(type: string): void {
  toolboxTemplates.value = toolboxTemplates.value.filter((t) => t !== type);
}

/** 切换模板在工具箱的可见性，返回新状态（是否已添加）。 */
export function toggleTemplate(type: string): boolean {
  if (toolboxTemplates.value.includes(type)) {
    removeTemplate(type);
    return false;
  }
  addTemplate(type);
  return true;
}
