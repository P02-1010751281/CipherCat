# 第二轮审查报告：独立复核与问题收窄

## 确认的问题

### CipherCat

1. `src/utils/workspace/serialization.ts:174-190,405-429`：加载前清空 workspace，底层反序列化失败后不恢复旧状态。
2. `src/utils/workspace/serialization.ts:439-463`：`exportJson` 逐块遍历后删除每个块的 `next`，导致语句链重新加载后成为多个顶层块。
3. `src/composables/useEditorProject.ts:40-72`：autosave 保存期间的修改可能没有 trailing save；`createdAt` 每次保存重置。
4. `src/blocks/procedure/category.ts:40-53` 与 `src/blocks/procedure/blocks.ts:475-479`：多参数模板 `proc_mlkem_encaps` 的 flyout 和 registry fallback 没有消费完整 `params[]`。
5. `src/utils/migration.ts:88-131`、`src/utils/workspace/serialization.ts:359-378`：旧 S-box XML 的引号兼容路径不对称；第二轮把它定为兼容性缺口，需回归测试，不在未验证普通导出路径前夸大为确定性数据损坏。
6. `scripts/verify-demo.ts`、`verify-templates.ts`、`verify-demos.mjs`：同步子进程没有 timeout。

### metacrypt_server

- 入队后无条件写 `running` 可能覆盖 worker 已写入的 `success/fail`。
- 共享 sandbox volume 和组权限使不可信 primitive 具备访问其他 job 目录的静态可能性；实际 named volume owner/mode 仍需运行态验证。
- rddetector 临时目录在异常、解析失败、写文件失败和超时路径可能泄漏。
- `pending` 在列表接口和详情接口的状态映射不一致。
- 默认 backend GPU 镜像、CPU worker、GPU profile 和队列契约不一致。
- HTTP 401 真实状态与业务体 `code=401` 的前端处理不一致。
- `force_cpu`、compare 终态/`zip`/`None` 和 input/sample/code hash 证据未形成完整契约。

### 文档/交付

- 英文入口链接多处显示中文/非 `.en.md` 文件名。
- 截图缺少 provenance 清单。
- `CAPABILITY-MAP` 的 ASCON/Ascon、模式/MAC/AEAD 和码基术语需要统一。
- 动态 chunk 无预算；`verify:all` 不是完整 CI 门禁；缺少 parity gate。
- SETUP/TYPE-SYSTEM 的真实分类需要直接看 UI 代码，不能以 README 表格代替。

## 第二轮批驳结论

- 57 个 Demo 与 29 个模板通过不能覆盖多参数 flyout → call block 路径。
- 37 个目录的脚本统计本身一致，但 README 把 `papers/` 放入同一目录表后，读者会数出 38 个链接；应拆表或改表题。
- 401 的“不得伪造”边界已经写明；缺的是可执行的排错/provenance，不是边界原则本身。
- 动态 chunk 超大是性能/预算范围问题，不应要求所有 chunk 都压到首屏 64 KiB。
