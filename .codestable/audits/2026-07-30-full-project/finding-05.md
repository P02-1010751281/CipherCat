---
doc_type: audit-finding
id: 5
title: "JS/Python generator code fully duplicated"
severity: P1
nature: maintainability
confidence: high
recommendation: cs-refactor
---

## 描述

`src/generators/javascript/` 和 `src/generators/python/` 下有 27 个文件结构完全镜像。两个生成器共享相同的逻辑框架（字段读取、值拼接、错误处理），但在字符串模板和运算符上不同。当前每个新块需同时维护两份几乎相同的生成器代码，很容易出现 JS 版的 bug 修复遗漏 Python 版（或反之）。

## 证据

```text
src/generators/javascript/          src/generators/python/
├── index.ts                        ├── index.ts
├── remaining.ts                    ├── remaining.ts
├── data/                           ├── data/
│   ├── convert.ts                  │   ├── convert.ts
│   ├── encoding.ts                 │   ├── encoding.ts
│   ├── measurement.ts              │   ├── measurement.ts
│   └── number.ts                   │   └── number.ts
├── bit/                            ├── bit/
│   ├── expression.ts               │   ├── expression.ts
│   ├── not.ts                      │   ├── not.ts
│   ├── operation.ts                │   ├── operation.ts
│   └── rotate.ts                   │   └── rotate.ts
├── hash/                           ├── hash/
│   ├── sha256.ts                   │   ├── sha256.ts
│   ├── sm3.ts                      │   ├── sm3.ts
│   ├── sha3.ts                     │   ├── sha3.ts
│   └── shake.ts                    │   └── shake.ts
├── symmetric/                      ├── symmetric/
│   ├── aes.ts                      │   ├── aes.ts
│   ├── sm4.ts                      │   ├── sm4.ts
│   ├── modes.ts                    │   ├── modes.ts
│   └── convenience.ts              │   └── convenience.ts
└── ...（numtheory, ecc, sbox, postquantum, procedure）
```

## 影响

- 同一 bug 需要修两份（当前 finding-01 的 INPUT-twice bug 在 JS 和 Python 版本中同时存在）
- 新块添加时需要写两份生成器，开发效率低
- 随着块数量增长，维护成本线性翻倍

## 修复方向

抽取共享抽象层——模板引擎或 DSL——使得"字段读取→值拼接→模板替换"的逻辑只写一次，语言差异通过策略对象注入。或考虑代码生成框架（如 `blockly/generator` 的更高级封装）。
