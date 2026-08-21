---
name: engineer
description: 规范化 Agent 协作开发流程技能（工程师技能）。当用户要"做一个项目/软件/应用/小程序/网站"（全流程）、"设计/规划一个项目"、"开发/实现/加某个功能"、"继续做/下一步"、"修复 bug/测试/跑起来报错/验证"（单块），或需要结构化项目文档体系（engineer_doc/）+ 任务状态机来保持进度与跨会话记忆时使用。覆盖设计（产出总设计文档 project_plan.md）、开发（按模块逐步实现、自带自测）、测试（按需进入）三块；全程维护任务状态与工作记录文档。
agent_created: true
---

# Engineer（工程师技能）

规范化 Agent 协作开发流程：**设计 → 开发（含自测）→ 测试（按需）**。每次使用可选其中一块，或由 AI 识别意图进入对应块；全程用 `engineer_doc/` 结构化文档保持进度与状态，防止 AI 跨会话遗忘。

> **硬约束：动手前必须先读对应块的 references 文件**（见下方必读清单），否则视为技能未正确加载，行为可能漂移。

## 工作流决策（进哪个块）

按优先级判定：

1. **显式指定**（触发词 → 直接进对应块）：
   - 设计：`设计` `规划` `做计划` `从零开始` `新建项目` `技术栈` `design`
   - 开发：`开发` `实现` `写代码` `加功能` `继续做` `下一步` `build` `coding`
     - ⚠️ **带宾语的新项目表述**（"开发**一个/个** XX"、"实现一个 XX"、"写个 XX"）→ 全新项目，**进设计块**（全流程），不直接进开发块；
     - 指向现有项目的表述（"继续开发"、"给 XX 加个登录"、"写 XX 功能"）→ 开发块。
   - 测试：`测试` `test` `debug` `跑起来` `报错` `修一下` `验证` `bug`
2. **隐式识别两个维度**：
   - **范围**：全流程（"做个 XX" 全新项目 → 设计→开发）vs 单块（"已有项目加个登录" → 只开发）；
   - **块**：落在 设计 / 开发 / 测试 哪一块。
3. **状态护栏**：`engineer_doc/project_plan.md` 不存在时，进开发/测试先提示补设计（**显式指令优先**，护栏只警告不拦截）。
4. **拿不准就反问**，不替用户猜。

## 分档（一句话）

`engineer_doc/` 文档体系按项目规模分 **轻量 / 标准 / 旗舰** 三档，设计块开头由 AI 推荐、用户确认；轻量档单文档内嵌状态，标准/旗舰档用完整体系。详见 references/doc_system.md。

## 全流程衔接

默认自动连续（设计 → 开发），每块结束给摘要 + "继续 / 停下 / 换块"选择权（支持中途跳块）。**测试块按需进入，不自动进、不强制问**。

## git 集成（设计块启用后生效）

- 设计块步骤 2 问"需要 git 版本管理吗"（推荐需要）；需要则 `git init` + `.gitignore`（`engineer_doc/`、`ui-preview/` 提交；`node_modules`、`dist`、`target`、`.idea` 等排除）+ 初始 commit；
- **提交时机**：启用后**每块 / 每批结束提交一次**——`git add -A && git commit -m '<type>(<scope>): <摘要>'`；
- **commit 规范**：type = `feat` / `fix` / `refactor` / `docs` / `chore`；scope = 块或模块。例：`feat(design): 总设计文档`、`feat(dev): 批次A 6点通过`、`fix: 登录页色值`、`chore: 停滞记录`；
- 停滞 / 异常状态也提交（保证跨会话可回滚）。

## 必读清单（动手前按块读，勿跳过）

| 块 | 必读 | 条件性阅读 |
|----|------|-----------|
| 任意块 | references/doc_system.md（分档 + 文档体系）、references/state_machine.md（状态机）、references/questioning.md（提问规范） | — |
| 设计块 | references/design_block.md | UI 参与度 精细/逐页/风格 → references/ui_design.md |
| 开发块 | references/entry_flow.md（通用入口）、references/develop_block.md | 含 UI 实现 → references/ui_design.md |
| 测试块 | references/entry_flow.md、references/test_block.md | — |

## 模板（assets/，按档位取用）

- `assets/project_plan_template.md`：标准/旗舰档总设计文档模板（功能清单 + 状态标注 + 收尾总结 + 变更日志）。
- `assets/project_plan_lite_template.md`：轻量档单文档模板（功能清单即任务清单）。
- `assets/point_template.md`：点主文档模板（开发文档 / 测试用例文档）。
- `assets/work_template.md`：任务记录模板（YAML + 状态表格）。
- `assets/mode_template.md`：块模式配置模板。
