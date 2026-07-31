/**
 * 函数工具箱共享状态 — Function Manager 通过它管理 toolbox 中的模板可见性。
 */
import { ref } from 'vue';

/** 已添加到工具箱的模板块类型列表（如 'proc_aes_round'）。 */
export const toolboxTemplates = ref<string[]>([]);

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
