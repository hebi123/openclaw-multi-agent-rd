# 四角色协作 — 共享核心

与《四Agent协作-完整需求文档.md》对齐，本目录为**共享核心**：流程定义、上下文结构、四 Agent 定义。不改变 OpenClaw 整体架构，Agent 通过 skill-four-roles 按流程以多 Agent 方式协作。

## 目录结构

- `flow.json` — 阶段与角色映射、下一阶段规则、回流上限
- `context-schema.md` — 上下文字段说明
- `roles/pm.md`, `architect.md`, `dev.md`, `qa.md` — 四角色说明与输出要求
- `flow-engine.mjs` — 流程引擎脚本：查询当前阶段/角色、初始化 context
- `context.json` — 当前运行的上下文（由 Agent 或脚本创建/更新，可不提交）
- **`RUN-LOG-SCHEMA.md`** — 每次运行的日志规范（输入、各阶段输出、工具调用）；日志落盘在 `runs/<runId>.json`
- **`runs/`** — 运行日志目录，每次四角色协作生成一份 `<runId>.json`，便于测试与回溯
- **`artifacts/`** — 各角色产出与变更记录：产品需求变更记录、架构变更记录、测试记录、测试报告、测试文档变更记录；见 `artifacts/ARTIFACTS-README.md`

**架构关键节点说明**：开发实现（dev）与测试执行（test）不单独设 phase 给「架构师把关」；每轮 dev 完成后须先由架构师产出并写入 `context.architectGates["dev_"+N]` 再进入 test，每轮 test 完成后须先写入 `context.architectGates["test_"+N]` 再进入 accept。N 为 `context.devTestRound`。

## 使用

- **在 OpenClaw / 飞书**：用户说「按四角色流程做 XXX」或「四角色协作」时，Agent 加载 skill-four-roles，按本目录的 flow 与 roles 推进，读写 context.json。
- **在 Cursor**：同一套 core 可被引用，效果一致；入口与展示由 Cursor 侧适配。

## 流程引擎 CLI

```bash
# 初始化一次运行（写入 context.json）
node flow-engine.mjs init --instruction="用户指令" [--attachments=path1,path2]

# 查询当前阶段与角色
node flow-engine.mjs status [context路径]

# 查询下一阶段（根据当前 phase 与 acceptResult）
node flow-engine.mjs next-phase [context路径]
```

## E2E 测试（可重复）

验收标准 A3：固定输入指令 → 断言流程能走到目标阶段、关键产出存在且符合最小结构。

- **e2e-flow.mjs**（阶段与产出结构）：`node e2e-flow.mjs` — 初始化 context，写入前段阶段 mock 产出，断言 demand→…→align 及 phase 推进到 dev。
- **e2e-full-flow.mjs**（完整流程与回流）：`node e2e-full-flow.mjs` — 模拟从 demand 到 release（验收通过）及从 demand 到 rollback→dev→test→accept 再次不通过→_end_fail（回流最多 1 次），断言最终阶段。
- 执行层相关测试使用独立环境或 mock，不依赖真实生产仓库/CI。

## 产品经理最终验收

- 按《四Agent协作-完整需求文档》第 5 节执行 A1–A6 验收。
- **验收清单**：`产品经理最终验收清单.md` — 逐项勾选通过/不通过、签字与日期；全部通过后可进入发布决策。
