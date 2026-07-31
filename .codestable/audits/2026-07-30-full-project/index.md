---
doc_type: audit-index
date: 2026-07-30
slug: full-project
scope:
  - area: src/
    files: 182
    dimensions: [bug, security, performance, maintainability]
  - area: src-tauri/
    files: 4
    dimensions: [bug, security]
  - area: docs/
    files: 176
    dimensions: [maintainability]
  - area: configs
    files: 10
    dimensions: [security, maintainability]
status: superseded
superseded-by: 2026-07-31-procedure-system
---

# 全项目审计 — 2026-07-30

## 范围

| 区域 | 文件数 | 扫描维度 |
|------|--------|----------|
| `src/` | 182 `.ts`/`.vue` | bug, security, performance, maintainability |
| `src-tauri/` | 4 `.rs`/`.toml` | bug, security |
| `docs/` | 176 `.md` | maintainability |
| 配置文件 | 10 | security, maintainability |

架构偏离维度跳过：`.codestable/requirements/adrs/` 未建立。8 个并行只读 scout 完成扫描。
> 旧审计 `2026-07-ciphercat-audit.md` 是密码原语覆盖审计，本审计是代码质量/安全审计，互补不覆盖。

## 发现总览

| # | 标题 | 区域 | 性质 | 严重度 | 置信度 | 建议 |
|---|------|------|------|--------|--------|------|
| 1 | Binary op generators read single INPUT twice | src/ | bug | **P0** | high | cs-issue |
| 2 | CSP disabled everywhere — XSS to Tauri IPC chain | tauri/config | security | **P1** | high | cs-issue |
| 3 | Unsanitized markdown rendered via v-html | src/ | security | **P1** | high | cs-issue |
| 4 | SBox orphaned event listener — memory leak | src/ | performance | **P1** | high | cs-issue |
| 5 | JS/Python generator code fully duplicated (27 files) | src/ | maintainability | **P1** | high | cs-refactor |
| 6 | Algorithm READMEs have widespread broken links | docs/ | maintainability | **P1** | high | cs-issue |
| 7 | sponge_duplex generator ignores PERM field | src/ | bug | **P1** | high | cs-issue |
| 8 | data_convert_bits_to_bytes produces single int | src/ | bug | **P1** | high | cs-issue |
| 9 | cipher_key_from_seed no bounds check | src/ | bug | **P1** | medium | cs-issue |
| 10 | remaining.ts blocks missing from ALL_BLOCK_TYPES | src/ | maintainability | **P2** | high | cs-issue |
| 11 | ECB mode block without security warning | src/ | security | P2 | high | cs-issue |
| 12 | Console unrestricted + `any` only warns | config | security | P2 | high | cs-issue |
| 13 | DevTools enabled in production Tauri builds | tauri | security | P2 | high | cs-issue |
| 14 | Stale "CipherCat" branding across all docs | docs/ | maintainability | P2 | high | cs-issue |
| 15 | Debug-content README stubs (sp800-90a, sp800-38b, etc.) | docs/ | maintainability | P2 | high | cs-issue |
| 16 | blocks/INDEX.md references missing ctrl-procedure.md | docs/ | maintainability | P2 | high | cs-issue |
| 17 | Generator string split/join thrashing | src/ | performance | P2 | medium | cs-refactor |
| 18 | Toast timer race condition in App.vue | src/ | performance | P2 | medium | cs-issue |
| 19 | `as any` violations in serialization.ts | src/ | maintainability | P2 | high | cs-issue |
| 20 | Module-level `let` in locale.ts (R-BAN-02) | src/ | maintainability | P2 | high | cs-issue |
| 21 | blocks/bitwise vs generators/\*/bit naming mismatch | src/ | maintainability | P2 | high | cs-refactor |
| 22 | Tauri .expect() crashes on any init error | tauri | bug | P2 | medium | cs-issue |
| 23 | Unbounded content String in save_workspace | tauri | bug | P2 | medium | cs-issue |
| 24 | loadExtraState unsafe `as string` cast | src/ | bug | P2 | medium | cs-issue |
| 25 | refreshBlocks full reload on locale change | src/ | performance | P2 | medium | cs-refactor |
| 26 | No runtime key/IV length validation on AES/SM4 | src/ | bug | P2 | medium | cs-issue |

### 按严重度统计

| 严重度 | 数量 |
|--------|------|
| P0 (必须修) | 1 |
| P1 (应该修) | 8 |
| P2 (可以修) | 17 |

### 按维度统计

| 维度 | P0 | P1 | P2 | 合计 |
|------|----|----|-----|------|
| bug | 1 | 3 | 4 | 8 |
| security | — | 2 | 3 | 5 |
| performance | — | 1 | 3 | 4 |
| maintainability | — | 2 | 7 | 9 |

## 总评

CipherCat 代码库整体质量良好——TypeScript strict 模式、ESLint 配置完善、模块分层清晰。三个系统性问题值得优先关注：

1. **代码生成正确性**（P0/P1）：`remaining.ts` 中二元操作的 INPUT-twice 模式影响 10+ 个块，生成代码静默错误。sponge_duplex 和 bits_to_bytes 也存在逻辑缺陷。这些是用户可见的功能性 bug。
2. **安全纵深缺失**（P1）：CSP 完全禁用 + markdown v-html + Tauri 完整 IPC 桥 + `$HOME/**` FS 写入权限，构成完整的 XSS→系统攻击链。对密码学教学平台而言风险被低估。
3. **维护性债务**（P1）：JS/Python 生成器 27 文件完全镜像——每加一个块就要维护两份近乎相同的代码，未来规模翻倍时成本不可持续。

## 建议下一步

- **P0 立刻修**：finding-01（INPUT-twice），影响 10+ 个块
- **P1 安全 2 条一起修**：CSP + markdown sanitizer（finding-02 + finding-03），同一攻击链
- **P1 bug 3 条**（finding-07/08/09）：sponge_duplex 优先
- **P1 维护性 2 条**：generator 去重排下个迭代；README 断链快速修
- **P2 配置类 3 条**（#12/13/20）：devtools + console + eslint，一次清掉
