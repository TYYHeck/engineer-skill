# data-ui 命名规范（大项目）

目的：让批注 `ui` 路径能**直接映射到源码**，AI 拿到路径即可 Edit。

## 格式
`page.module.component`（点分层级，与代码结构一一对应）

示例：
- `home.banner.cta` 首页 Banner 的 Call-To-Action 按钮
- `checkout.form.payment.method` 结算页表单的支付方式
- `settings.nav.account` 设置页侧栏账户项

## 规则
- **全局唯一**：禁止 `btn-1`/`box-2`/`item`（AI 无法映射到代码）。
- **与组件名对齐**：尽量用组件/模块的真实名，如 React 组件 `PaymentMethod` → `checkout.form.payment.method`。
- 容器级（如整页、整卡）埋一个兜底 data-ui 即可，脚本会向上找最近祖先。
- **批量补点**：大项目可用脚本/codemod 给主要组件自动加 `data-ui`，命名从路由表 + 组件树推导。

## 校验
- AI 收批注后先 Grep `data-ui="<ui>"` 确认命中；未命中即反馈，不静默丢改。
