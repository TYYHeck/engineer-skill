---
name: eng-test
description: engineer 子技能。负责写 engineer_doc/ 三级文档的「## 测试」节（MODULE 集成用例、PROGRESS 功能用例与结果），判定功能/模块测试通过以驱动回弹门槛。当用户要测试/验证/修 bug/调试，或 engineer hub 路由到测试阶段时触发。
agent_created: true
---

# eng-test · 测试子技能

engineer 家族的**测试入口**。本技能写「测试」并**参与回弹门槛判定**。

## 依赖
- 沿用 `engineer` 锚点系统。
- 开发应已完成（`eng-develop` 翻了状态）；若功能未开发完，先回 `eng-develop`。

## 职责：写哪一级的「## 测试」（模板见 engineer SKILL.md 第二节）
| 节点 | 写什么 |
|------|--------|
| `<模块>/MODULE.md §测试` | 测试策略(单测/集成/边界) / 用例清单·结果（模块级集成测试，状态列保留） |
| `<模块>/<功能>/PROGRESS.md §测试` | 测试用例(用例·预期·实际·状态) / 测试结果汇总 |

## 流程
1. **定位活跃节点**：`Grep "active: true" engineer_doc/` 或用户意图。
2. **写/执行测试**：
   - `PROGRESS §测试`：列用例，执行后填「实际」「状态」；全 `[x]` 即功能测试通过。
   - `MODULE §测试`：模块级集成测试（跨功能联动），填用例结果。
3. **驱动回弹门槛（本技能只判定，状态翻转交 eng-develop）**：
   - 功能用例全 `[x]` → 判定该 `PROGRESS` 测试通过，**交由 `eng-develop` 按 engineer 3.3② 翻 `PROGRESS` 头部 `x` 并触发级联**（本技能不直接改 `status`）。
   - 模块级 `§测试` 用例全通过 **且** 该模块所有 `PROGRESS` 头部全 `x` → 通知 `eng-develop` 翻 `MODULE` 头部 `x`（双条件门槛，见 `engineer` 3.3②）。
   - 所有模块头部全 `x` → 通知 `eng-develop` 翻 `GLOBAL` 头部 `x`。
4. **修 bug**：测试中发现的缺陷 → 回到对应 `PROGRESS §开发` 追加修复记录，必要时回 `eng-develop`。

## 不做
- 不写 `§设计` / `§开发` 主体（进度在 eng-develop）。
- 不直接把 `§开发` 状态翻 `x`（那是 eng-develop 职责；本技能只判定测试通过、通知回弹）。
