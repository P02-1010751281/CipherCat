# Blockly v13 升级专项完成记录（2026-08-04）

## 结论

CipherCat + metacrypt_server 双仓 Blockly **12.5.1 → 13.2.0** 升级完成，全量回归通过。评估见本文件（评估先行，2026-08-04 实测 API 面后执行）。

## 实测破坏点与修复（仅 3 类，全部小而集中）

| # | 破坏点 | 根因（v13 行为变化） | 修复 | 文件 |
|---|---|---|---|---|
| 1 | `Workspace.createVariable` 不存在 | v13 将变量创建移到 `VariableMap.createVariable` | 3 处改 `workspace.getVariableMap().createVariable`；变量模型类型改 `IVariableModel<IVariableState>`（v13 接口化） | `blocks/procedure/blocks.ts` |
| 2 | `Block.getVars()` 已移除 | 13.0 deprecate → 13.2 删除（内部统一走 `getVarModels`） | 删 def/call 覆盖块的 `getVars` override + `procedureGetVars` helper（死代码） | 同上 |
| 3 | 生成 `Input "RETURN" doesn't exist` 抛错 | v13 `valueToCode` 对**不存在的 input** 抛错（12.x 静默返回 ''） | defreturn 生成器加 `block.getInput('RETURN')` 守卫（defnoreturn 块无 RETURN input） | `generators/{javascript,python}/procedure/blocks.ts` |

**幸存 API**（d.ts 实测，无需改动）：`registerToolboxCategoryCallback` / `registerButtonCallback`（3 自定义类目）、`Blockly.Procedures.*`（allProcedures/findLegalName/rename/mutateCallers/getDefinition 全在）、`saveExtraState/loadExtraState`、`Events.disable/enable`、`serialization.blocks.append`、`Blockly.utils.xml/toolbox`、`Order`（每语言独立 enum，import 不变）、`updateToolbox`。

## 配置项（v13 行为变化应对）

- **renderer 锁定 geras**：v13 默认改 thrasos → `WORKSPACE_OPTIONS.renderer: 'geras'`（双仓）保持教学视觉稳定（geras 在 v13 保留）
- **media 同步**：v13 新增 `drop.mp3`（drop 音效）+ `sprites.png` 移除（图标全 SVG 化）→ 双仓 `public/blockly/media/` 同步 16 文件；**metacrypt 此前缺本地 media 目录**（既有缺口，本次补齐）
- **harness 消息加载**：v13 `msg/*.mjs` 只 `export const` 不自动设置 `Blockly.Msg` → 必须 `setLocale(await import('blockly/msg/en'))`（`scripts/verify-demo.ts` + `verify-templates.ts` 双仓）；项目前端 `locale.ts` 的 `Blockly.setLocale` 在 v13 浏览器入口可用（无需改）

## 验证矩阵（全绿）

| 项 | CipherCat | metacrypt |
|---|---|---|
| vue-tsc | 0 errors | features 域 0（341 全 RuoYi 基线） |
| vite build | ✓ | ✓ |
| 官方向量 harness | 44/44 | 44/44 |
| 模板 harness | 28/28 | 28/28 |
| vitest | — | 668/668 |
| 浏览器（dev 3001 / prod 8080） | 17 类目、拖块、S-box/Functions/Templates flyout、面板 updateToolbox、Py/JS 生成、保存、键盘导航零错误 | 登录→编辑器 17 类目、三语言、**MCL 生成 `SHA256_PAD(MESSAGE)` 正确**、media 资源 200、零 console 错误 |

## Commits

- CipherCat `6d9afd4` — chore(deps): Blockly 12.5.1 → 13.2.0 升级专项
- metacrypt `ce804e9` — chore(deps): Blockly 12.5.1 → 13.2.0 升级（镜像 CipherCat 6d9afd4，23 文件）

## 后续观察项

- thrasos renderer 可作为后续可选（性能更好），当前 geras 锁定
- v13 键盘导航默认开启（无障碍收益），浏览器实测无冲突；未来可做键盘导航/读屏专项验收
- 12.x 遗留安全修复窗口已关闭——升级消除了 12.x 停滞风险
