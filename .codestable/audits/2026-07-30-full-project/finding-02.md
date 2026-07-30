---
doc_type: audit-finding
id: 2
title: "CSP disabled everywhere — XSS to Tauri IPC chain"
severity: P1
nature: security
confidence: high
recommendation: cs-issue
---

## 描述

CipherCat 在两层都禁用了 Content Security Policy：Tauri 桌面应用设置 `csp: null`，Web 端 `index.html` 无 `<meta>` CSP 标签。Tauri 配置同时启用 `withGlobalTauri: true`，将完整 IPC 桥暴露给所有 JS 上下文。结合项目中 `unsanitized markdown → v-html` 的 XSS 向量（见 finding-03），构成 XSS → 任意文件写入的完整攻击链。

## 证据

**Tauri 层**: `src-tauri/tauri.conf.json:12,25-27`
```json
"app": {
    "withGlobalTauri": true,     // 完整 IPC 桥全局可访问
    ...
    "security": {
      "csp": null                 // 无 CSP 保护
    }
}
```

**Web 层**: `index.html:1-13` — 无 `<meta http-equiv="Content-Security-Policy">` 标签。

**FS 权限**: `src-tauri/capabilities/default.json:9-15`
```json
"fs:allow-write-text-file",
"allow": [
    { "path": "$HOME/**" },
    { "path": "$DOWNLOAD/**" },
    { "path": "$DESKTOP/**" },
    { "path": "$DOCUMENT/**" }
]
```

**攻击链**: 用户打开恶意 Blockly workspace → markdown 文档中的恶意脚本注入 v-html → 执行任意 JS → `window.__TAURI__` 可写任意文件到 `$HOME/**`。

## 影响

密码学教学平台的桌面应用中，XSS 可导致：
1. 用户文件系统被写入恶意内容
2. 工作区数据被窃取/篡改
3. 以用户权限执行任意命令（通过 `.desktop` 文件、`.bashrc` 写入等）

## 修复方向

1. Tauri: `csp: "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'"` 
2. Web: 添加 `<meta>` CSP 标签
3. 为 markdown 渲染添加 HTML sanitizer（如 DOMPurify）
4. 收窄 FS 写入权限到 `$DOCUMENT/CipherCat/` 子目录
