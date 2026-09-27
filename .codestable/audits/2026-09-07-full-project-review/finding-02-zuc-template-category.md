---
doc_type: audit-finding
audit: 2026-09-07-full-project-review
id: CC-02
dimension: bug/docs-api
severity: P2
confidence: high
status: open
recommendation: cs-issue
---

# CC-02 ZUC 模板显示在错误的子类

## 证据

- [`src/blocks/procedure/blocks.ts:1138`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/src/blocks/procedure/blocks.ts:1138) 将 `proc_zuc_keystream` 注册为 `pqc`：

```ts
_makeTemplateBlock('proc_zuc_keystream', 'key', 'bytes',
  MSG.PROC_ZUC_KEYSTREAM_LABEL || '🔧 ZUC_Keystream', 'pqc');
```

- [`src/components/CryptoFunctionPanel.vue:71-89`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/src/components/CryptoFunctionPanel.vue:71)按 `TemplateInfo.category` 映射子类标题，`pqc` 对应“迭代 / 海绵 / 后量子”。
- 原子 ZUC 类别本身在 [`src/utils/toolbox-config.ts:251-256`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/src/utils/toolbox-config.ts:251)已单独命名为 `ZUC Stream Cipher`，文档也在 [`docs/blocks/INDEX.md:55`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/docs/blocks/INDEX.md:55)单列 ZUC。

## 影响

生成结果不受影响，但用户在函数模板面板中会把 ZUC 误认为后量子模板，造成算法分类和文档/API 语义不一致。

## 建议

为模板注册表增加稳定的 `zuc`/`stream-cipher` 子类及中英文 locale，并让 `proc_zuc_keystream` 使用该子类；同时补一条面板分组测试，防止模板类别和工具箱类别再次漂移。
