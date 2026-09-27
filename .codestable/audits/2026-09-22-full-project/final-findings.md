# 最终问题清单与验收矩阵

## A. CipherCat：必须先修

| ID | 等级 | 位置 | 问题 | 最小验收 |
|---|---|---|---|---|
| CC-01 | P1 | `src/utils/workspace/serialization.ts:174-190,405-429` | 反序列化失败清空旧 workspace，无 rollback | 旧 workspace 有块；导入语法合法但 Blockly 拒绝的 XML/JSON；返回 false 后旧块仍在 |
| CC-02 | P1 | `src/utils/workspace/serialization.ts:439-463` | JSON 导出删除 `next`，语句链断裂 | A→B 导出再导入，断言 A.getNextBlock() 为 B 且只有一个顶层链 |
| CC-03 | P1 | `src/composables/useEditorProject.ts:40-72` | 保存期间新编辑可能丢失；createdAt 被重置 | mock 慢 save，保存中编辑；最终 DB 为最后内容且 createdAt 不变 |
| CC-04 | P1 | `src/blocks/procedure/category.ts:40-53`, `blocks.ts:475-479` | 多参数模板 flyout/registry fallback 只生成一参数 | `proc_mlkem_encaps` flyout call 必须有 `ek,m` 两个 ARG，JS/Python 生成和调用一致 |
| CC-05 | P1 | `src/composables/useEditorProject.ts:108-126` | loadProject 失败仍可能显示 saved 并继续保存 | mock get/load 失败；状态为 error，不能把空工作区覆盖原项目 |
| CC-06 | P2 | `scripts/verify-demo.ts`, `verify-templates.ts`, `verify-demos.mjs` | 子进程无 timeout | 注入死循环 driver；在固定时间内失败退出并清理子进程 |
| CC-07 | P2 | `src/utils/migration.ts:88-131` | 旧 S-box XML 引号兼容不对称 | 双引号和单引号旧 XML 各做 round-trip；若不支持，明确拒绝而不能静默导入 |

## B. metacrypt_server：可信测评阻塞

| ID | 等级 | 位置 | 问题 | 最小验收 |
|---|---|---|---|---|
| MC-01 | P0 | `docker-compose.yml:105-116,149-156`; `randomness_sandbox.py`; `randomness_runner.py` | 用户 primitive 可接触共享 `/sandbox/jobs`，跨任务读写边界不足 | 两个并发 job；恶意 primitive 不能列举、读、改、删另一个 job 的 request/result |
| MC-02 | P1 | `controller/blockly/randomness.py:235-280`; task worker | worker 已完成后 controller 仍无条件写 running | mock/实测 worker 先完成；终态不能回退，DB 更新失败有可见处理 |
| MC-03 | P1 | `tasks/randomness_tasks.py:346-371,595-603` | 异常/超时/解析失败路径泄漏临时目录 | 每种异常后 `rdd_celery_*` 均删除，包含 soft timeout 和写库异常 |
| MC-04 | P1 | `controller/blockly/randomness.py:1001-1056` | compare 无终态门槛，zip/None/空结果可假一致 | pending/无结果直接拒绝；测试集合长度/名称/顺序一致；None 不算匹配 |
| MC-05 | P1 | `env_collector.py:188-212`; task/result/compare/reproduce | input/code/sample/effective environment hash 未统一绑定 | 保存并核对规范化输入、代码、样本、检测器/镜像和执行路径证据 |
| MC-06 | P1 | compose、队列、`force_cpu` 路径 | GPU/CPU 默认镜像、队列和 force_cpu 语义不一致 | CPU、GPU、GPU 不可用和 force_cpu true/false 分别实测 effective mode |
| MC-07 | P1/运行态 | security util、serializer、frontend request interceptor | HTTP 401 和业务 code 401 行为不一致 | 无 token/过期/token 缺失经 backend+nginx 均返回并被前端正确处理 |
| MC-08 | P1 | status/list 映射 | pending 在列表可能显示失败，详情显示进行中 | pending 在列表和详情均为未完成语义 |

## C. 文档、标准和交付

| ID | 等级 | 位置 | 问题 | 最小处理 |
|---|---|---|---|---|
| DOC-01 | Blocking（按当前验收标准） | `src/utils/markdown.ts:205-225`; `DocsView.vue:255-267` | SETUP/TYPE-SYSTEM 实际落入 user-guides，与 README 分组不一致 | 建立 canonical 分类并补 `getGuideCategory`/UI 回归测试 |
| DOC-02 | Important | `docs/README.md:39-89`, `.en.md` | 37 目录表同时列 `papers/`，导航项数为 38 | 单独列研究材料，或明确“37 个算法/标准目录 + 1 个 papers 目录” |
| DOC-03 | Important | `public/docs-assets/tutorials/*.png`; TUTORIALS/SETUP | 截图缺 provenance | 增加资产清单：路由、日期、commit/build、浏览器、分辨率、页面状态 |
| DOC-04 | Important | `docs/README.en.md`; `CAPABILITY-MAP*` | 英文标签、Ascon/ASCON、码基/编码基等口径不统一 | 同步 `.en.md` 标签，统一 canonical casing 和分类名 |
| DOC-05 | Blocking if container delivery is in scope | `docker/Dockerfile:41-43`; `.npmrc`; SETUP/docker scripts | Dockerfile 不复制 `.npmrc`，文档声称 Podman 兼容但脚本硬编码 docker | 复制 `.npmrc` 或显式 `npm ci --legacy-peer-deps`；收窄文档或加入 runtime 变量 |
| DOC-06 | Important | `check-bundle-budget.mjs` | 只保护入口 chunk，动态 chunk 无预算 | 明确命名为首屏预算；只有确定产品阈值后再加最小动态预算 |
| DOC-07 | Important | `verify-templates.ts`, parity surfaces | 缺少自动 block/toolbox/JS/Python parity gate，模板语义向量有限 | 最小加入注册清单对账；交付报告保持“结构/可执行性、部分向量”表述 |

## D. 已通过或不应误报

- 37/227/215/6/4 的标准结构统计和 379/0 文档链接统计一致；4 个 source gap 已诚实声明。
- `standards:split-check` 123/123、公式字段 227/227 只能证明结构门禁，不证明全部公式语义/视觉核验。
- 用户/开发文档的目标架构正确，但 UI 分类实现仍需修正。
- ZUC 属于流密码；ML-KEM/ML-DSA 属于格基后量子密码；SLH-DSA 属于哈希基；McEliece/Goppa 属于码基。
- 不要求所有动态 chunk 压到 64 KiB、不要求 29 个模板全部变成官方 KAT、不要求前端承担可信测评、不要求本轮引入复杂 DSL/AST。
