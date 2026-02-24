---
name: skill-four-roles
description: 四角色协作（产品经理、技术架构师、开发经理、测试总监）按既定流程协作。当用户要求「按四角色流程」「四角色协作」「启动四角色」或对需求进行完整的需求→方案→排期→可测性→四方对齐→开发↔测试→产品验收→发布/回流时使用。
---

# 四角色协作（四 Agent 协作）

由 **main** 作为编排者，**pm、architect、dev、qa** 四个独立 Agent 按流程协作。main 通过 **sessions_send** 将当前阶段任务发给对应 Agent，收集其产出后更新 context 并推进阶段。

## 核心位置（共享核心）

- 流程与角色定义、上下文结构位于工作区：`workspace/four-roles-core/`
- 同一套定义可在 Cursor 与 OpenClaw（飞书）共用，保证效果一致。

## 使用方式

1. **启动一次运行**  
   用户给出指令（可带附件说明）。你（main）作为编排者：
   - 在工作区执行或模拟：`node workspace/four-roles-core/flow-engine.mjs init --instruction="用户指令"`，或在无脚本环境下手动创建 `workspace/four-roles-core/context.json`，内容包含 `instruction`、`phase: "demand"`、`outputs: {}`、`rollbackCount: 0`、`runLogPath`。
   - 读取 `workspace/four-roles-core/flow.json` 与 `workspace/four-roles-core/roles/*.md` 中当前阶段对应角色说明。

2. **每一轮（当前阶段）**  
   - 读取 `workspace/four-roles-core/context.json`，得到当前 `phase` 与已有 `outputs`。
   - 根据 `flow.json` 的 `roleByPhase[phase]` 确定当前角色 **role**（pm / architect / dev / qa / all）。
   - **若 role 为 pm、architect、dev、qa 之一**：使用工具 **sessions_send**，**sessionKey** 为 `agent:<role>:main`（例如 `agent:pm:main`），**message** 包含：当前 phase、用户 instruction、context 摘要（含已有 outputs 与 attachmentRefs）、以及「请以你角色身份输出本阶段产出，开头标明【角色名】」。**timeoutSeconds** 建议 300。将返回的 **reply** 作为本阶段产出，写入 `context.outputs[phase]`（或 dev_N/test_N，见下），并更新 `context.phase`。
   - **若 role 为 all**（align、release、rollback）：由你（main）综合或产出该阶段结论，写入 `context.outputs[phase]`，并更新 `context.phase`。
   - 若当前为 **dev** 或 **test** 阶段，使用轮次 N（即 `context.devTestRound`），产出 key 为 `dev_N`、`test_N`；完成本轮回后可自增 `devTestRound`。**架构关键节点**：进入 test 前若有本轮 dev 产出，必须先 **sessions_send** 给 `agent:architect:main` 获取把关结论并写入 `context.architectGates["dev_"+N]`；进入 accept 前必须先 sessions_send 给 architect 获取 `context.architectGates["test_"+N]`。再按 `flow.json` 的 `nextPhase` 更新 `context.phase`。
   - 产品经理（pm）在 **accept** 阶段的产出中须含「验收结论：通过」或「验收结论：不通过」；你根据该产出写入 `context.acceptResult`（"pass" / "fail"）；若不通过且 `rollbackCount < 1`，将 `phase` 置为 `rollback` 再回到 `dev`，并增加 `rollbackCount`；若已回流过一次仍不通过，则结束并输出「未通过」。

3. **流程顺序**（与《四角色协作-完整需求文档.md》一致）  
   demand → design → schedule → testability → align → dev ↔ test（可多轮，每轮后可由架构师把关）→ accept → release（通过）或 rollback（不通过，最多 1 次）→ 结束。

4. **执行层**  
   开发实现、测试执行中涉及代码/仓库/CI 的操作，由运行侧（Cursor 或 OpenClaw）按《执行层对接约定》执行；你仅产出描述或引用执行结果，不在此 skill 内写死具体 CI/仓库。

## 你必须遵守

- 每步向用户展示时明确标注当前**阶段**与**执行角色 Agent**（pm/architect/dev/qa），便于验收 A1、A2。
- 通过 sessions_send 获得的 reply 即该角色产出；accept 阶段须根据 pm 的 reply 解析出通过/不通过并更新 context.acceptResult。
- 回流最多 1 次；再次不通过则流程结束并输出「未通过」。
- 编排仅由 main 负责；pm、architect、dev、qa 四个 Agent 仅响应 main 的 sessions_send 消息并回复产出，不主动读 context 或推进流程。

## 运行日志（每次运行必写）

- 每次运行在 `workspace/four-roles-core/runs/<runId>.json` 落盘**运行日志**，结构见 `workspace/four-roles-core/RUN-LOG-SCHEMA.md`。
- 内容须包含：runId、startedAt、endedAt、instruction、attachmentRefs、各阶段 phases[]（phase、role、startedAt/endedAt、inputSummary、outputSummary、outputFullRef、本阶段 toolCallsInPhase）、toolCalls[]（id、phase、role、at、name、args、resultSummary）。
- 启动时创建该文件并写 instruction 与 phases: []；每完成一个阶段追加一条 phase 并记录本阶段发生的工具调用；结束时写 endedAt、acceptResult、ended。便于后续做测试与回溯。

## 各角色文档与变更记录（有产出必更新）

- **产品经理**：在 demand 或 accept 阶段有产出时，在 `workspace/four-roles-core/artifacts/产品需求变更记录.md` 的变更记录表中追加一行（时间、runId、阶段、变更摘要、关联产出）。
- **技术架构师**：在 design 或 architect_gate 阶段有产出时，在 `workspace/four-roles-core/artifacts/架构变更记录.md` 的变更记录表中追加一行。
- **测试总监**：在 testability 或 test 阶段有产出时，在 `workspace/four-roles-core/artifacts/测试记录.md` 追加一条；若更新了测试策略/用例/报告等文档，在 `workspace/four-roles-core/artifacts/测试文档变更记录.md` 追加一行；在需要汇总当次测试结论时更新 `workspace/four-roles-core/artifacts/测试报告.md`。

## 参考文档

- 流程与角色定义：`workspace/four-roles-core/flow.json`、`context-schema.md`、`roles/*.md`
- 运行日志规范：`workspace/four-roles-core/RUN-LOG-SCHEMA.md`
- 产出文档说明：`workspace/four-roles-core/artifacts/ARTIFACTS-README.md`
- 完整需求与验收标准：`四角色协作-完整需求文档.md`（仓库根或工作区上级）
