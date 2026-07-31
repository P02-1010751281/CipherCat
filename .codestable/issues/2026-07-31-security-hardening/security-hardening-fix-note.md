---
doc_type: issue-fix
issue: 2026-07-31-security-hardening
status: confirmed
path: standard
fix_date: 2026-07-31
related: [security-hardening-analysis.md]
tags: [security, tauri, capabilities, validation]
---

# 安全纵深加固（3 类）修复记录

## 1. 根因摘要

1. **写权限过宽**（finding-07）：capabilities `fs:allow-write-text-file` 含 `$HOME/**` + `withGlobalTauri: true` 暴露 `window.__TAURI__` + `lastExportPath` 缓存免确认覆写
2. **ECB 无警告**（finding-08）：`mode_ecb_encrypt` tooltip 纯陈述
3. **key/IV 无校验**（finding-09）：AES 模式函数无长度守卫（仅 `cipher_key_from_seed` 有）

## 2. 实际采用方案

**方案 A**（owner 批准）：
1. capabilities 移除 `$HOME/**`（保留 `$DOWNLOAD/$DESKTOP/$DOCUMENT`）；`withGlobalTauri: false`（核验前端无 `window.__TAURI__` 直接使用）；`serialization.ts` 移除 `lastExportPath` 免确认覆写——每次导出经保存对话框（路径即用户授权）
2. ECB tooltip 加 ⚠️ 教学警告
3. JS/PY 双生成器 mode 函数加运行时校验：key=16（ECB/CBC/CTR enc + ECB dec）、iv=16（CBC）、nonce=16（CTR）——`throw new Error` / `raise ValueError`

## 3. 改动文件清单

| 文件 | 改动 |
|---|---|
| `src-tauri/capabilities/default.json` | 移除 `$HOME/**` |
| `src-tauri/tauri.conf.json` | `withGlobalTauri: false` |
| `src/utils/workspace/serialization.ts` | 删除 `lastExportPath` 变量 + 快速覆写分支 |
| `src/blocks/symmetric/modes/blocks.ts` | ECB tooltip 加 ⚠️ |
| `src/generators/{js,py}/symmetric/modes/helpers.ts` | 4 个模式函数加 key/iv/nonce 长度校验 |

## 4. 验证结果

- `vue-tsc` 0 errors / `eslint` 0 errors / `vite build` ✓ / `cargo check` ✓（tauri.conf/capabilities 变更编译通过）
- 全仓 grep `window.__TAURI__` 零直接使用（withGlobalTauri 可关）
- grep `lastExportPath` 零残留
- Chromium 实测：生成代码含 `key must be 16 bytes` / `IV must be 16 bytes` 校验 ✅

## 5. 遗留事项

1. 权限收敛后，保存到白名单外目录（如自定义深层路径）会失败——保存对话框内用户选择路径超出 `$DOWNLOAD/$DESKTOP/$DOCUMENT` 时 `writeTextFile` 报权限错误；教学场景可接受，如需扩展走 capabilities 白名单更新
