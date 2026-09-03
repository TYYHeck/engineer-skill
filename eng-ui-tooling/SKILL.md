---
name: eng-ui-tooling
description: engineer 子技能（按需加载）。负责 UI 可视化与调试能力的设计与落地：① 可视化 DEBUG-HTML 批注（前端批注层注入 + 后端批注服务，参考 live-annotate 思路）② 内嵌式可视化设计（前端图表/图解内联）。仅在 eng-design 做 UI 设计时、由用户选择启用才用 Skill 加载；采用 perfect-design 式「先问方向→出草稿→多选题确认→未确认回到讨论」的确认闭环，不擅自动工。
agent_created: true
---

# eng-ui-tooling · UI 可视化与调试设计（按需子技能）

engineer 家族的 **UI 可视化 / 调试能力子技能**，只在 `eng-design` 做 UI 设计、且用户选择启用时才加载。本技能**不擅自开工**，遵循 perfect-design 确认闭环。

## 何时加载
- `eng-design` 在 UI 设计分支会**询问**用户：「是否启用可视化 / 调试能力？」
  - 可视化 DEBUG-HTML 批注（前端 + 后端）
  - 内嵌式可视化设计（前端）
- 用户选「是」→ 用 Skill 工具加载本技能；选「否」→ 不加载，继续普通 UI 设计。

## 两种能力（按需取用，不强制全做）
> 每种能力的**具体模板与全局方案**放在 `references/` 下，**只在用户选定该能力时才读取**，保持本 SKILL.md 轻量。

### 能力 A：可视化 DEBUG-HTML 批注（前端 + 后端）
- **前端**：向运行中的页面注入批注层（不碰业务源码），用户右键标注 bug / UI 问题，导出标注（含 UI 定位路径）。
- **后端**：批注收集 / 存储服务（接收前端标注、持久化、供 AI 按 `data-ui` 路径精准修改源码并热更新）。
- 前端注入层所需资产**已内置**于本技能 `assets/`（从 `live-annotate` 合并，自包含）；后端服务与端到端全局架构是本能力新增。
- **详档（按需读）**：`references/debug-html-annotate.md` —— 全局架构图、目录结构、前端集成口径、后端 API/存储/AI 消费方式。

### 能力 B：内嵌式可视化设计（前端）
- 在页面内联图表 / 图解 / 可视化组件（如数据看板、流程图、状态可视化）。
- 设计其数据结构、渲染方式、交互。
- **详档（按需读）**：`references/embedded-viz.md` —— 设计四问、数据结构模板、组件结构、确认闭环。

## 协作：perfect-design 式确认闭环
1. **先问方向**：加载后先和用户确认要做哪种能力、目标与范围，**不默认全做**。
2. **出草稿**：给出设计方案 / 原型，写进对应节点的 `## 设计`（MODULE / PROGRESS §设计 的 UI 分支或专门子节）。
3. **多选题确认**：用 `AskUserQuestion` 呈现方案要点，让用户确认 / 调整。
4. **未确认回到讨论**：用户未确认前**不写实现代码**；要求调整则改方案再确认。
5. **定稿才交开发**：确认后把设计写入 `engineer_doc/`，再交 `eng-develop` 实现（受「确认定稿才开工」闸门约束，见 `engineer` 第八节）。

## 与 engineer_doc 的对接
- 设计产物写进对应节点的 `## 设计`（MODULE / PROGRESS §设计 的 UI 分支或专门子节）。
- 状态 / 头部遵循 `engineer` 锚点系统，不另立规范。
- 本技能只写「设计」；实现交给 `eng-develop`、测试交给 `eng-test`。

## UI 能力标记与贯穿维护（进入设计后持续有效）

能力 A / B 一旦在某节点启用，**不仅当次设计有效，而是贯穿整个项目生命周期**——后续凡是给该节点加 UI（新按钮、新组件、新页面、新图表），都必须记得同步更新对应的可视化产物，否则会漂移、漏标、不可定位。

**标记（让后续阶段"想得起"）**
- 启用能力 A / B 时，`eng-design` 须在该节点 `## 设计` 显式记一行能力标记，例如：
  - A：`UI 可视化能力：A 可视化批注（data-ui 覆盖见批注映射）`
  - B：`UI 可视化能力：B 内嵌可视化（图表/数据见可视化设计子节）`
- 标记写在节点头部之外、`## 设计` 正文里，随文档一起被 `eng-develop` / `eng-test` 读到。

**贯穿维护规则（谁加 UI，谁同步）**
- 能力 A：新增 / 改 UI 组件 → 必须给新组件补 `data-ui` 埋点（边界级：页面/模块/卡片/主要组件），并刷新批注映射；AI 后续按 `data-ui` 才能精准定位。详见 `references/debug-html-annotate.md` §八。
- 能力 B：新增 / 改图表或可视化 UI → 必须同步更新该节点「可视化设计」子节（图表类型、数据形状、交互清单），保持设计与实现一致。详见 `references/embedded-viz.md` §七。
- `eng-develop` 在给带标记的节点加 UI 时执行上述同步（见 `eng-develop` 流程 2）；未做同步视为该次开发不完整，不得翻 `status: x`。

## 按需读取约定（防臃肿）
- 本 SKILL.md **只放能力描述 + 路由**，不内联模板/方案。
- 用户选定能力 A → 读 `references/debug-html-annotate.md`；选定 B → 读 `references/embedded-viz.md`。
- 未选定对应能力时**不读**其 references 文件，保持会话上下文最小。
- 前端注入脚本（annotate.js / data-ui 规范）**已内置**于本技能 `assets/`（从 `live-annotate` 合并，自包含、无外部依赖）。

## 自包含说明（无外部依赖）
- **能力 A（可视化 DEBUG-HTML 批注）已完全自包含**：前端注入层资产 `assets/annotate.js`、`assets/vite-annotate-plugin.js`、`references/data-ui-convention.md`、`references/inject-options.md` 均已**内置**于本技能（从 `live-annotate` 合并），目标机**无需共存 `live-annotate`**。后端批注服务与端到端全局架构由本技能定义。
- **`perfect-design` 软引用**：仅借用其「确认闭环」哲学，不读其文件，缺失不影响功能。
- 本技能与 engineer 家族其余 4 个技能一起迁移；单独存在时只能被 `eng-design` 通过 Skill 工具加载，无法独立触发。
