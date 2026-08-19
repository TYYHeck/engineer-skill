# 文档体系（engineer_doc/）

## 总结构

```
<项目根>/
└── engineer_doc/
    ├── project_plan.md              # 总设计主文档（功能清单 + 状态看板）
    ├── project_plan/                # 同名文件夹：总设计讨论记录
    │   ├── design.md                # 设计块工作记录
    │   ├── tech_stack.md            # 技术栈讨论
    │   ├── features.md              # 功能清单讨论
    │   └── ui.md                    # UI 讨论
    ├── develop/                     # 开发块
    │   ├── mode.md                  # 开发模式配置（YAML）
    │   └── <模块>/                  # 模块文件夹（对应 project_plan.md 模块树）
    │       ├── <点>.md              # 功能开发文档（主文档）
    │       └── <点>/                # 同名文件夹：该点记录
    │           ├── process.md       # 讨论/决策过程（需要才建）
    │           └── work.md          # 任务记录（状态唯一事实源）
    └── test/                        # 测试块（按需，同构）
        ├── mode.md
        └── <模块>/<点>.md + <点>/
```

## 命名规则

- `engineer_doc/` 下所有文件与文件夹**不带 `_doc`/`_flow` 尾缀**（顶层 `engineer_doc/` 除外）；**文档类型由父文件夹决定**。
- **主文档 + 同名文件夹**成对：`project_plan.md` + `project_plan/`；`<点>.md` + `<点>/`。
- `<点>/` 内可放多类记录：`process.md`（讨论过程，需要才建）+ `work.md`（任务记录）。
- 文件名英文小写、短横线：如 `agent_list.md`、`tech_stack.md`。

## 查找方式（无记忆也能找）

- `rg "关键词" engineer_doc` —— 按功能名/模块名检索。
- `find engineer_doc -type f -name "*.md"` —— 看全量文档。
- 每层可放 `index.md`（目录索引：该层有什么、各文件一句话）。
- `work.md` 头部"相关文件"字段直接跳转。
- **命名即 ID**：功能点 = 文件夹名 = 文档名，`rg agent_list` 一击命中。

## 初始化步骤

1. 确认项目根（当前工作区文件夹 / 新建项目根文件夹）。
2. 建 `engineer_doc/` 及 `project_plan/`、`develop/`、`test/` 骨架。
3. 建 `project_plan.md`（用 assets/project_plan_template.md）。
