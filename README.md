# engineer · 树状三级项目文档协作技能族

一套轻量、自包含的 AI 协作开发流程技能（WorkBuddy / CodeBuddy Skill）。
配合 `engineer_doc/` 树状项目文档：**设计 → 开发 → 测试**，跨会话不断档。

## 为什么

旧版 engineer 臃肿（1 hub + 8 references + 7 模板，强制每次读多个文件）。
本族改为 **方案 B**：

- **位置交给文件夹**：层级 / 父子关系由 `engineer_doc/` 目录结构天然表达，`Glob` 一次拿全树。
- **状态交给节点头部**：每个节点文件头部一行注释记录 `anchor / parent / status / active / design / path`，状态唯一真源，无中央索引、无双写、不陈旧。
- **快速取数靠 Grep**：取全图 = `Glob` + `Grep "status:"`；定位 / 读节 / 回弹全用 Grep 命中头部单行。

## 技能组成

| 技能 | 角色 |
|------|------|
| `engineer` | hub：结构 / 锚点系统 / 路由 / 确认定稿闸门 / 级联回弹 |
| `eng-design` | 设计子技能（平级）：写各级 `## 设计` |
| `eng-develop` | 开发子技能（平级）：写 `## 开发` + 改头部 status + 触发回弹 |
| `eng-test` | 测试子技能（平级）：写 `## 测试` + 判定通过驱动门槛 |
| `eng-ui-tooling` | UI 可视化 / 调试（按需加载）：① 可视化 DEBUG-HTML 批注（前端注入层 + 后端批注服务，资产已内置）② 内嵌式可视化设计 |

## 安装

把这 5 个目录整体复制到你的 skills 目录（用户级 `~/.workbuddy/skills/` 或项目级 `.workbuddy/skills/`）：

```
engineer/
eng-design/
eng-develop/
eng-test/
eng-ui-tooling/
```

5 个必须一起存在（hub 通过 Skill 工具路由到子技能）。`eng-ui-tooling` 的
能力 A 前端注入层资产（annotate.js / data-ui 规范 / 注入方式）已**内置**于
自身 `assets/` 与 `references/`，无需额外安装 `live-annotate`。

## 关键约定

- **三态**：`[ ]` 待做 / `[~]` 进行中 / `[x]` 完成；阻塞 / 待审写在正文，不进头部状态。
- **确认定稿才开工**：对应节点 `## 设计` 未经用户确认定稿（`design: confirmed`），`eng-develop` 不得开始实现。
- **贯穿维护**：一旦某节点启用 UI 可视化能力（A/B），后续加 UI 须同步回写（`data-ui` 埋点 / 可视化设计子节），标记写在节点 `## 设计` 正文。
- **零绝对路径**：全族可移植，换机器 / 改目录都能用。

## 文档树

```
<项目根>/engineer_doc/
├── GLOBAL.md        # 层级0 全局：分三块（设计/开发/测试），只列模块概览
├── DISCUSS.md       # 层级0 同目录：设计怎么得出的（来源/决策/被否方案）
├── <模块>/MODULE.md # 层级1：本模块具体分工设计
└── <模块>/<功能>/PROGRESS.md  # 层级2：单功能设计/开发/测试
```
