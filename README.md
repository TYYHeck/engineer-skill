# Engineer Skill — 规范化 Agent 协作开发流程

[English](#english) · [中文](#chinese)

<a id="chinese"></a>
## 中文

**engineer** 是一个 WorkBuddy / Claude-style Agent 技能（skill），提供一套**规范化 Agent 协作开发流程**：设计 → 开发（含自测）→ 测试（按需），并配套结构化项目文档体系，保证 AI 跨会话记忆、不丢进度。

### 核心特性

- **三块流程**：设计（产出总设计文档 `project_plan.md`）→ 开发（按模块逐步实现，自带自测）→ 测试（按需进入：优化 / 修 bug / 补用例 / 深度测试）。
- **任务状态机**：待设计 / 设计中 / 待开发 / 开发中 / 待测试 / 测试中 / 通过 / 停滞；任务类型：完整 / 设计 / 实现 / 验证 / 修复 / 重构。
- **结构化文档体系** `engineer_doc/`：主文档 + 同名记录文件夹；命名不带 `_doc` 尾缀，类型由父文件夹决定；`rg` 可秒定位，无记忆也能找。
- **状态单一事实源**：`<点>/work.md` 唯一事实源，`project_plan.md` 只在收尾回写。
- **高效提问规范**：优先询问工具（选项 + 自定义输入）、无依赖问题一批多问、推荐/建议/自定义格式、用户已说的不重复问。
- **UI 可视化设计**：精细档下渲染交互式预览（含控制面板），可配置样式/位置、可搜索精美 UI 参考，边看边打磨。
- **轻量可调**：文档按需建（小任务只建 work.md），测试块按需进，避免过度文档化。

### 安装

将 `SKILL.md`、`references/`、`assets/` 放入技能目录（如 `~/.workbuddy/skills/engineer/`），或直接导入 `engineer.zip`。

### 使用

对 AI 说一句即可触发：

- "帮我做个 XX（全新项目）" → 全流程：设计 → 开发
- "已有项目，帮我实现登录功能" → 只进开发块
- "帮我修个 bug / 加些测试用例" → 按需进测试块

### 目录结构

```
engineer/
├── SKILL.md                    # 核心：路由 + 三块入口 + 状态机/提问规范导读
├── references/                 # 按需加载的流程文档
│   ├── doc_system.md           # 文档体系与查找方式
│   ├── state_machine.md        # 状态机与任务类型
│   ├── questioning.md          # 提问规范
│   ├── design_block.md         # 设计块流程
│   ├── develop_block.md        # 开发块流程
│   ├── test_block.md           # 测试块流程（按需）
│   └── ui_design.md            # UI 可视化设计机制
└── assets/                     # 可直接复用的模板
    ├── project_plan_template.md
    ├── point_template.md
    ├── work_template.md
    └── mode_template.md
```

### 许可证

MIT

---

<a id="english"></a>
## English

**engineer** is a WorkBuddy / Claude-style agent skill that provides a **standardized Agent collaborative development workflow**: Design → Develop (with self-testing) → Test (on-demand), backed by a structured project documentation system that keeps the AI's memory and progress across sessions.

### Highlights

- **Three blocks**: Design (produces `project_plan.md`) → Develop (module-by-module, self-tested) → Test (on-demand: optimization / bug fix / test cases / deep testing).
- **Task state machine**: pending-design / designing / pending-dev / developing / pending-test / testing / passed / stalled; task types: full / design / implement / verify / fix / refactor.
- **Structured docs** `engineer_doc/`: main doc + same-name record folder; no `_doc` suffix, type determined by parent folder; `rg`-findable without memory.
- **Single source of truth**: `<point>/work.md` is the source; `project_plan.md` synced only on completion.
- **Efficient questioning**: prefer the question tool (options + free input), batch independent questions, recommend/suggest/custom format, never re-ask what the user already stated.
- **Visual UI design**: interactive preview with control panel for style/layout, web search for UI references, iterate visually.
- **Lightweight & tunable**: docs created on demand, test block entered on demand.

### Install

Place `SKILL.md`, `references/`, `assets/` into your skills directory (e.g. `~/.workbuddy/skills/engineer/`), or import `engineer.zip`.

### Usage

Just tell the AI:

- "Build me an X (new project)" → full flow: design → develop
- "Add a login feature to my existing project" → develop block only
- "Fix a bug / add test cases" → test block on demand

### License

MIT
