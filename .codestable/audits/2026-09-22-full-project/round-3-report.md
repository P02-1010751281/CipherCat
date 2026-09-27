# 第三轮审查报告：最终主审与最终批驳

## 最终确认的 CipherCat 问题

- P1 数据完整性：导入 XML/JSON 失败不回滚旧 workspace。
- P1 数据完整性：JSON 导出破坏 statement `next` 链。
- P1 数据完整性：autosave race 可能丢最后修改；`createdAt` 被覆盖。
- P1 功能：多参数模板 flyout/call 只传第一个参数；模板 harness 没覆盖这条链路。
- P1/P2 交付：`loadProject` 导入失败没有把状态置为 error，仍可能显示 saved 并继续覆盖项目。
- P2 交付：模板/Demo 验证子进程没有 timeout。

S-box 单引号/双引号：最终批驳认为“兼容性不完整、应补回归”，但未证明正常 Blockly 导出路径必然产生用户可见的数据丢失，故不列为已证实 P1。

## 最终确认的后端问题

- P0 边界风险：共享 sandbox job 根目录和组权限不是任务隔离边界；静态代码支持跨任务枚举/读写的可能，需在容器运行态用两个并发任务验证。
- P1：pending → running 无条件回写可能覆盖终态；DB 更新异常被吞和维护任务不处理 pending 会放大悬挂风险。
- P1：异常路径缺少 tmpdir finally。
- P1：compare 缺终态门槛、按 zip 截断、跳过 None/空结果，可能产生假一致。
- P1：input_hash、projectCodeHash、实际样本/执行环境没有形成一致的 compare/reproduce 证据链。
- P1：默认 GPU/CPU 镜像、队列和 `force_cpu` 契约不一致。
- P1/运行态：真实 HTTP 401 与业务 code 401 的前端处理不一致，需要 backend+nginx 实测。

## 最终确认的文档/交付问题

- Blocking（按当前文档中心验收标准）：`docs/README.md` 把 `SETUP`、`TYPE-SYSTEM` 列入开发/规划区，但 `src/utils/markdown.ts:205-225` 只把 `DEVELOPMENT`、`ARCHITECTURE` 列入开发区，`SETUP` 和 `TYPE-SYSTEM` 实际落到 `user-guides`；`DocsView.vue` 直接使用该分类。缺少回归测试。
- Important：README 的 37 个算法/标准目录表又列入 `papers/`，导航链接总数为 38，应拆出研究材料目录或明确“37+1”。
- Important：截图没有 capture date、URL、commit/build、浏览器和页面状态 provenance。
- Important：英文入口标签、Ascon/码基等术语和文档口径需要统一。
- Important：Dockerfile 没复制 `.npmrc` 却执行裸 `npm ci`；SETUP 声称 Docker/Podman 兼容但脚本硬编码 `docker`。若容器构建是发布要求，这一项升级为阻塞。

## 最终批驳排除的过度结论

- 没有证据证明所有动态 chunk 都必须小于 64 KiB；现有门禁准确地只是首屏入口预算。
- 没有证据证明所有 29 个模板已经完成官方 KAT；应写成结构/可执行性通过，部分有向量。
- 没有证据证明 57 个 Demo 覆盖所有参数、负例、拒绝路径或形式化/认证要求。
- 没有必要为了本轮引入复杂 DSL/AST、全量跨仓 parity 或跨平台 Tauri 发布矩阵。
- ZUC、ML-KEM/ML-DSA 的分类和“前端不负责可信测评”的总体架构结论是正确的。
