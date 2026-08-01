---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "bug-02"
nature: bug
severity: P1
confidence: high
suggested_action: cs-issue
---

# Finding 02：编辑器内"新建工作区"同路由复用 → 保存静默全失败

## 速答

`handleNewWorkspace` 清空工作区后 `router.push('/editor/${newId}')`，但路由是单一 `/editor/:id` 记录，参数变化不触发组件重挂载 → `loadProject`（onMounted 内）不再执行 → `projectId` 恒 null → `doSave` 守卫 `projectId.value === null` 直接 return，新项目内容保存静默全失败（无 toast、无请求）。

## 关键证据

- `src/composables/useEditorProject.ts:80-102` — `handleNewWorkspace`：清空后 `router.push('/editor/${newId}')`
- `src/composables/useEditorProject.ts:40-41` — `doSave` 首行 `if (saving.value || projectId.value === null) return false`
- `src/composables/useEditorProject.ts:104-131` — `loadProject` 只在 `onMounted` 调用，同路由参数变化不重跑
- `src/router/index.ts:11-15` — `/editor/:id` 单路由记录，无 `:key` 强制重挂载

## 影响

用户点击"新建工作区"后开始编辑，所有自动保存/手动保存静默失败——已编辑内容在切换项目或关闭窗口时丢失。与 metacrypt_server 2026-08-01 修的 editorRefs 保存失效同症状族（静默失败，无任何提示），但根因不同：这里是路由生命周期。

## 修复方向

`router.push` 后手动调用 `loadProject()`，或路由加 `:key="route.params.id"` 强制重挂载，或 `handleNewWorkspace` 直接走 `loadProject(newId)` 路径。

## 建议动作

`cs-issue`，主流程静默丢数据，浏览器实测"新建→编辑→保存→刷新"可复现。
