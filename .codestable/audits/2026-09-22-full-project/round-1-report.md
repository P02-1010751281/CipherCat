# 第一轮审查报告：基线发现与第一次批驳

## 主审发现

- 工作区 XML/JSON 反序列化在清空后失败时没有 rollback。
- 自动保存在保存期间发生修改时可能静默丢掉 trailing save，且每次覆盖 `createdAt`。
- 原生 procedure 名称/参数/类型边界不完整，生成器存在直接拼接风险；随后批驳将其缩小为需要重点核对的 procedure 输入边界。
- 验证脚本的同步子进程没有 timeout。
- 后端 rddetector 临时目录只在成功路径清理。
- 统计不通过和执行失败共享外部 `fail` 语义；参数 `input_hash` 不包含代码/样本证据。
- sandbox 共享任务目录存在跨任务访问风险；查询类接口的 HTTP 401/业务错误语义不一致。
- 文档中心 `SETUP` 分类、英文开发文档、截图 provenance 和标准统计口径需要核对。
- 首屏 bundle budget 只检查入口，不保护动态 chunks；缺少 blocks/toolbox/generator parity gate。

## 批驳后的收敛

- “所有未登录接口都吞成 500/200”是过宽表述；准确结论是部分查询/GPU路径语义不一致。
- “系统完全不能区分统计失败和执行失败”是过宽表述；内部 `result_json/error.techCode` 仍有间接证据，但外部状态契约粗糙。
- `injectPrimitives` 未被生产调用，不能当成当前线上生成故障；只能作为 dead/legacy API 决策项。
- 大文件、App.vue 体积、多个注册树本身不是缺陷；只列为门禁/维护缺口。
- 标准 source gap 和章节锚点已经诚实声明，不应为了统计通过而补假链接。

## 第一轮结论

第一轮没有形成最终放行结论，进入第二轮，重点验证数据完整性、过程块调用链、后端状态/隔离和文档中心实际分类。
