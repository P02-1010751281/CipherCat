# CipherCat / metacrypt_server 全面审查（2026-09-22）

> 本目录前三轮结果是 2026-09-22 的历史快照，结论为未通过；当前工作树的修复与后续证据见 [2026-09-26 follow-up](./follow-up-2026-09-26.md)、[2026-09-25 follow-up](./follow-up-2026-09-25.md) 和 [2026-09-24 sandbox follow-up](./follow-up-2026-09-24.md)。

## 结论

本审计已完成三轮“主审 → 独立批驳 → 收敛”闭环。当前不能作最终验收通过：

- CipherCat 的标准元数据、结构化拆分、文档链接、模板和 Demo 机械回归通过；
- CipherCat 前端仍有工作区数据完整性、自动保存、过程模板调用和验证脚本问题；
- 文档中心的 `SETUP` / `TYPE-SYSTEM` 分组与实际 UI 分类不一致；
- metacrypt_server 的可信测评链路仍有任务间 sandbox 隔离、任务状态竞态、临时目录清理、compare/hash 证据和 GPU/CPU 部署契约问题；
- 容器构建文档和 Dockerfile 安装策略不能作为 Docker/Podman 可复现交付证据。

因此当前状态是：**机械门禁通过，可信测评与数据完整性验收不通过，需修复后复审。**

## 审查范围与基线

- CipherCat：`/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat`
- CipherCat HEAD：`46051ed`
- 相邻后端：`/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/metacrypt_server`
- metacrypt_server 审查基线：代理报告标记为 `841e19b837985f73405c337a54eff21f7097a1a4`
- 工作树存在大量此前整理中的未提交变更；本审查没有清理、回滚或覆盖这些变更。

## 过程

三轮均使用 luna 子代理，并且每轮都完成了独立批驳：

1. 第一轮：结构、实现、文档/标准、后端/安全四组主审；四组对应批驳。
2. 第二轮：针对第一轮问题重新逐行取证；四组对应批驳，排除误报并补出 JSON 链断裂、提交状态竞态、Dockerfile 安装策略等问题。
3. 第三轮：最终主审；四组最终批驳。对主审之间的分歧再次直接核对当前代码，确认 `SETUP` / `TYPE-SYSTEM` 分类确实错误，并将 S-box 单引号问题降级为兼容性缺口而非未经验证的确定性数据损坏。

每轮报告只有在对应批驳完成后才收敛；子代理均为只读审查，未代为修改业务代码。

## 当前已验证的正面结果

受控环境中已有以下结果：

- `standards:check`：37 个顶层标准/参考目录、227 条目、无 metadata error；
- `standards:split-check`：123/123；
- `standards:formula-check`：227/227，代码块 207，显式非公式条目 20；
- `standards:inventory`：37/227，行号锚点 215、章节锚点 6、已声明 source gap 4；
- `docs:check-links`：379 个文件、0 个坏链；
- 模板：29/29；Demo：57/57；
- unit：3 个文件、13 个测试通过；
- type-check、lint、cycles、production build、首屏 bundle budget 通过；
- 既有实际后端 CPU 测评曾完成一条已登录任务详情路径：22 项、100% 报告。但这不能覆盖异常状态、权限边界和跨任务隔离。

这些结果只能证明登记的机械/选定路径通过，不能扩展解释为完整标准语义、全块 parity、CAVP/CMVP、侧信道安全或可信测评全链路通过。

## 关键未闭环项

详见 [final-findings.md](./final-findings.md)。最短修复顺序：

1. 先修 CipherCat 的加载回滚、JSON 链、自动保存和多参数模板调用；
2. 修复后端 sandbox 任务间访问和任务终态写入竞态；
3. 给后端临时目录、compare/hash、GPU/CPU/force_cpu 和 HTTP 401 补契约测试；
4. 修正文档中心分类、英文入口名、37 目录表述和截图 provenance；
5. 修正 Dockerfile 的 `.npmrc`/`npm ci` 策略，并明确 Docker/Podman 支持范围；
6. 重新运行三类验证：前端数据完整性、后端隔离/状态、容器实际启动，再进行最终批驳。

## 当前工作树的后续复审

2026-09-24 对 AES/过程生成器、sandbox 单次认领与工作目录清理、模板验证器临时目录做了增量修复和运行验收。该复审只覆盖变更切片，不替代新的全仓三轮审查；具体证据、独立批驳和剩余风险见 [follow-up-2026-09-24.md](./follow-up-2026-09-24.md)。

2026-09-26 进一步定位并修复了 Python 3.13 全量测试退出时 `resource_tracker` 被误杀的问题、sandbox 检测阶段一个临时目录泄漏路径，并将项目自有的 Pydantic `Field(example=...)` 弃用写法改为 `json_schema_extra`，保留原 JSON Schema 示例。controller 快速 worker 状态时序回归也已补充。后端 535 项单测与目标 lint 通过；只读容器检查还发现 GPU worker 因本地未配置 `CELERY_DISTRIBUTED_QUEUES=1` 而退出，未擅自改 `.env` 或重启服务。详细证据与仍未关闭的全项目验收项见 [follow-up-2026-09-26.md](./follow-up-2026-09-26.md)。
