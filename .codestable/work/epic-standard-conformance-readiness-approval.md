---
doc_type: epic-execution-approval
epic: ../epics/standard-conformance-readiness.md
status: approved
created: 2026-09-29
reviewed_revision: 23d0f8b026b25152f84728d53df68fb725f22442d85670da46b6e0980d774448
---
# 全量密码标准符合性准备：执行批准

## 已确认内容

- Owner 已选择 Option A：对仓库全部标准目录及 194 个唯一块、29 个模板注册项、59 个 Demo 做全量符合性准备；不能独立认证的构件用规范语义、契约和组合测试验证，不宣称已取得官方证书。
- 永久 Epic：[`standard-conformance-readiness.md`](../epics/standard-conformance-readiness.md)，当前 SHA-256：`23d0f8b026b25152f84728d53df68fb725f22442d85670da46b6e0980d774448`。
- 独立 design review 两轮完成：第一轮发现的两项 important 已修复；同一 Luna reviewer 对修订后的完整 Epic 复审为“可合”，没有未解决或新增 finding。

## 尚需 owner 决定

批准上述永久 Epic 契约并选择执行策略。未得到明确确认前，不修改算法/测试实现，不提交或 push。

### 选项 A（推荐）

- `item_progression: continuous`：按依赖连续完成已批准子项，不在每个普通里程碑询问“是否继续”。
- `milestone_commit: authorized`：每个语义原子里程碑可创建本地 commit，但只包含本 Epic 自身产物；当前工作树已有未提交的用户改动，必须排除。遇到无法可靠拆分的重叠文件或不确定归属时停下，请 owner 指示，不暂存或提交既有修改。
- `remote_publish: manual`：本 Epic 不 push，不选择或假定 remote/branch；待 owner 另行指示。
- 取舍：适合持续推进长任务，留下逐阶段可审阅的本地提交；需要严格做变更归属和暂存隔离。

### 选项 B

- `item_progression: per-item`：每完成一个子项就暂停，由 owner 决定下一步。
- `milestone_commit: manual`：不自动创建 commit，只交付可审阅 checkpoint。
- `remote_publish: manual`：不 push。
- 取舍：提交和推进控制最强，但每个子项都要 owner 再次恢复；不能理解成 Epic 已授权自动完成后续子项。

## 决策结果

Owner 选择本文件的选项 A（2026-09-29）：`continuous + authorized + manual`。Epic 连续推进；允许按语义里程碑创建仅含本 Epic 变更的本地 commit；远端发布保持手动且本 Epic 不 push。遇到无法可靠隔离既有工作树改动的文件时停止并请求 owner 指示。

已将永久 Epic 状态切换为 `active`；执行游标记录批准版 SHA-256 和策略后启动 ITEM-1。任何目标/范围/验收或子项契约变化都须重新独立审查并再次获批。
