# 能力 A：可视化 DEBUG-HTML 批注（前端 + 后端）· 全局方案与模板

本文件是 `eng-ui-tooling` 能力 A 的**按需详档**。仅在用户选定「可视化 DEBUG-HTML 批注」时由 `eng-ui-tooling` 加载；SKILL.md 只做能力描述，不内联本内容。

> 前端注入层所需资产（annotate.js / data-ui 规范 / 注入方式）**已内置**于本技能 `assets/` 与 `references/`（从 `live-annotate` 合并，自包含、无外部依赖）。本能力真正的新增是**后端批注服务**与**端到端全局架构**。

## 一、全局架构（端到端数据流）

```
┌─────────────────────────┐        ① 右键标注             ┌──────────────────────────┐
│  浏览器页面              │  ──── (data-ui 路径 + text) ──▶│  前端批注层 (annotate.js)  │
│  (业务源码 + 注入层)     │                                └────────────┬─────────────┘
└─────────────────────────┘                                            │ ② POST /api/annotations
                                                                       ▼
                                                                  ┌──────────────────┐
                                                                  │  后端批注服务      │
                                                                  │  (收集/存储/检索)  │
                                                                  └────────┬─────────┘
                                                                          │ ③ 持久化
                                                                          ▼
                                                                  ┌──────────────────┐
                                                                  │  存储             │
                                                                  │ (JSON / SQLite)   │
                                                                  └────────┬─────────┘
                                                                          │ ④ GET /api/annotations
┌─────────────────────────┐         ⑤ 按 data-ui 定位 Edit          ▲
│  AI agent               │ ─── Grep data-ui="<ui>" 改源码 + 热更新 ──┘
│  (eng-develop 实现)      │
└─────────────────────────┘         ⑥ DELETE /api/annotations 清空
```

要点：
- **前端**只负责"采集 + 呈现"，不碰业务源码（除按需加 `data-ui` 埋点）。
- **后端**是 live-annotate 没有的新增层：把"复制 JSON 给 AI"变成"服务化收集/检索/清空"，支持多人、多会话、持久化。
- **AI 侧**走 `eng-develop`：从后端拉批注 → 按 `data-ui` 精准改源码 → 落实后调后端清空。

## 二、目录结构（落地形态）

```
<项目根>/
├── public/annotate.js              # 内置 assets/annotate.js（本技能自带）
├── vite.config.js                  # 引入 vite-annotate-plugin（或 nginx sub_filter）
└── annotation-service/             # 新增：后端批注服务（独立小服务）
    ├── server.js                   # Express / Fastify（或 Python FastAPI）
    ├── store.json                   # 默认存储（或 annotation.db SQLite）
    └── README.md                   # 启动方式：node server.js :8787
```

- 前端资产已**内置**于本技能 `assets/annotate.js` 与 `references/data-ui-convention.md`（从 `live-annotate` 合并，自包含、无外部依赖）。
- 后端服务独立成目录，与业务代码解耦，可单独部署/测试。

## 三、前端模板（集成口径，内置资产）

1. **注入方式**（三选一，详见本技能 `references/inject-options.md`）：
   - A. Vite 插件（推荐）：`vite.config.js` 引入 `vite-annotate-plugin.js`，`annotate.js` 放 `public/`。
   - B. Nginx `sub_filter`：`</body>` 前注入 `<script src="/annotate.js">`，源码零改动。
   - C. 浏览器扩展/书签：标注第三方/生产环境。
   访问 `?annotate=1` 启用，`?annotate=0` 关闭。
2. **埋点规范**（data-ui）：给可批注组件加 `data-ui="page.module.component"` + `data-label="可读名"`（规范见本技能 `references/data-ui-convention.md`）：
   - 格式 `page.module.component`，全局唯一，与组件名对齐。
   - AI 收批注后先 `Grep data-ui="<ui>"` 校验命中，未命中即反馈、不静默丢改。
3. **导出**：前端工具栏「复制」→ 瘦身 JSON `[{ui, text}, ...]`，改为**直接 POST 到后端**（见第四节）。

## 四、后端批注服务方案（新增，本能力核心增量）

### 4.1 API 设计
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/annotations` | 新增批注。body：`{ui, text, label?, meta?}` |
| GET  | `/api/annotations` | 列出全部（支持 `?status=open` 过滤） |
| GET  | `/api/annotations/:id` | 取单条 |
| PATCH| `/api/annotations/:id` | 更新（如 `status: resolved`） |
| DELETE | `/api/annotations/:id` | 删除单条 |
| DELETE | `/api/annotations` | 批量清空（落实后调用） |

### 4.2 数据形状
```json
{
  "id": "a1b2c3",
  "ui": "checkout.form.payment.method",
  "text": "支付方式间距太窄，应 ≥12px",
  "label": "支付方式",
  "status": "open",
  "createdAt": "2026-09-03T18:00:00Z",
  "meta": { "page": "/checkout", "selector": ".pay-method" }
}
```

### 4.3 存储选型
- 默认：`store.json`（数组追加，零依赖，适合开发期）。
- 进阶：`SQLite`（`annotations` 表）或 Redis（多实例）。
- 设计约束：存储只存 `{ui,text,label,status,meta}`，**不存页面快照/DOM**，保持瘦身。

### 4.4 AI 消费方式（接 eng-develop）
1. `GET /api/annotations?status=open` → 拿到全部未处理批注。
2. 每条 `ui` 先 `Grep data-ui="<ui>"` 校验命中；未命中反馈并跳过。
3. 按 `ui` 定位源码 Edit；同文件相邻改动合并一轮。
4. 改完 `PATCH` 该条 `status: resolved`（或 `DELETE`）。
5. 本轮全部落实 → `DELETE /api/annotations` 清空，页面回干净态，再进下一轮。

## 五、硬约束（继承 live-annotate + 后端新增）
- AI 不截图 / 不打开网页 / 不 DOM 探测，只按 `ui` 路径改代码。
- 注入层不修改业务源码（除按需加 `data-ui` 埋点）。
- 批注**落实后必须清空**（DELETE），不带旧批注进下一轮。
- 后端仅做收集/存储/检索，不持有渲染逻辑；存储保持瘦身。

## 六、隔离测试页/分支原则（防污染源码）

**核心原则**：批注、`data-ui` 埋点、AI 的源码改动，**全部发生在隔离的测试实例/分支**，不落在你维护的「原本」主干上；验证通过后，只把「干净修复」合回原本。

**为什么必须隔离**（机制澄清）：
- 注入层（annotate.js）本身是**运行时注入、`?annotate=1` 才启用**，不修改任何源文件——它天然不污染「原本」。
- 真正会进源码的是两类落点：**`data-ui` 属性**（精准定位必需，至少边界要有，无法完全避免）+ **AI 按批注改的修复代码**。
- 因此「不要在原本里批注」精确成：隔离这两类落点，而非担心注入层。

**推荐工作流**：
1. 开 annotation **测试分支**（或预览部署 / dev server 实例），不要在主干预览上直接批注。
2. 在该分支加 `data-ui`（边界级：页面/模块/卡片/主要组件），跑批注层。
3. AI 按 `data-ui` 定位源码 Edit + 热更新验证。
4. 验证通过后，把修复合回主干；`data-ui` 可保留（无害标准属性）或在合回时剥离。

**污染控制补充**：
- `data-ui` 是标准 HTML 属性、无害；若介意，合回主干时随修复剥离，或构建期 codemod 统一去掉。
- 禁止在主干 / 生产分支直接加 `data-ui` 并批注，避免污染与误改。

## 七、与 live-annotate / engineer 的关系
- **前端注入层 + data-ui 规范**：已**内置**于本技能（从 `live-annotate` 合并至 `assets/annotate.js` 与 `references/`，自包含、无需外部 `live-annotate` 共存）。
- 本能力 A：在其上加**后端批注服务**，把"复制 JSON"升级为"服务化闭环"，并给出端到端全局架构。
- `eng-develop`：实现阶段按本方案的 API 与消费方式落地，受「确认定稿才开工」闸门约束。

## 八、维护：新增 UI 时同步 data-ui 埋点（贯穿项目生命周期）

能力 A 在某节点启用后，**不是当次设计完就结束**，而是贯穿整个项目——后续该节点每加一个 UI（新按钮、新卡片、新页面），都必须同步补 `data-ui` 埋点，否则新组件不可被批注层定位、AI 改源码时 `Grep data-ui="<ui>"` 会漏命中。

**规则**
- 给新增 / 改动的组件加 `data-ui="page.module.component"` + `data-label="可读名"`（格式规范见本技能 `references/data-ui-convention.md`）。
- 边界级即可：页面 / 模块 / 卡片 / 主要组件；不必每个叶子都标。
- 在**隔离测试分支**上加（见 §六），验证通过再合回；`data-ui` 可保留（无害标准属性）或合回时剥离。
- 批注映射若记在节点 `## 设计`，一并刷新，保持"设计里的 UI 清单 = 实际埋点"一致。
- 由 `eng-develop` 执行（见 `eng-develop` 流程 2 的 UI 变更维护）；未补埋点视为开发不完整，不得翻 `status: x`。
