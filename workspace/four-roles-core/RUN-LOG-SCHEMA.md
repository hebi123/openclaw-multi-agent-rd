# 四角色协作 — 运行日志规范

每次四角色协作运行均需落盘一份**运行日志**，便于测试、回溯与审计。日志路径：`workspace/four-roles-core/runs/<runId>.json`。

## 日志结构（runId.json）

| 字段 | 类型 | 说明 |
|------|------|------|
| runId | string | 与 context.runId 一致 |
| startedAt | string | ISO 8601 开始时间 |
| endedAt | string \| null | ISO 8601 结束时间，未结束为 null |
| instruction | string | 用户输入指令（原文） |
| attachmentRefs | string[] | 附件路径或链接 |
| acceptResult | "pass" \| "fail" \| null | 产品验收结论 |
| ended | boolean | 是否已结束 |
| phases | array | 见下表「阶段条目」 |
| toolCalls | array | 本次运行中所有工具调用（按时间序），见下表「工具调用条目」 |

### 阶段条目（phases[] 元素）

| 字段 | 类型 | 说明 |
|------|------|------|
| phase | string | 阶段名（demand / design / schedule / testability / align / dev_N / test_N / accept / release / rollback 等） |
| role | string | 本阶段执行角色（pm / architect / dev / qa / all） |
| startedAt | string | ISO 8601 |
| endedAt | string | ISO 8601 |
| inputSummary | string | 本阶段输入摘要（上游产出或指令引用） |
| outputSummary | string | 本阶段输出摘要（一两句话） |
| outputFullRef | string | 可选，完整产出所在文件路径（如 artifacts/xxx.md 或 context.outputs 的引用） |
| toolCallsInPhase | string[] | 本阶段内的 toolCallId 引用，对应 toolCalls 中的 id |

### 工具调用条目（toolCalls[] 元素）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一 id，如 runId + "_" + phase + "_" + 序号 |
| phase | string | 所属阶段 |
| role | string | 发起调用的角色 |
| at | string | ISO 8601 |
| name | string | 工具/命令名称 |
| args | object \| array | 参数（可脱敏） |
| resultSummary | string | 结果摘要（成功/失败/关键输出一行） |

## 写入时机

- **启动运行**：创建 `runs/<runId>.json`，写入 runId、startedAt、instruction、attachmentRefs、phases: []、toolCalls: []。
- **每完成一个阶段**：追加一条 phases 条目，并更新本阶段内发生的 toolCalls 与 toolCallsInPhase。
- **运行结束**：写入 endedAt、acceptResult、ended。

## 示例（片段）

```json
{
  "runId": "run_1730123456789",
  "startedAt": "2026-02-24T10:00:00.000Z",
  "endedAt": null,
  "instruction": "按四角色流程完成 XXX 功能",
  "attachmentRefs": ["docs/prd-draft.md"],
  "acceptResult": null,
  "ended": false,
  "phases": [
    {
      "phase": "demand",
      "role": "pm",
      "startedAt": "2026-02-24T10:00:01.000Z",
      "endedAt": "2026-02-24T10:02:00.000Z",
      "inputSummary": "用户指令 + 附件 prd-draft.md",
      "outputSummary": "需求摘要与 5 条验收标准",
      "outputFullRef": "artifacts/产品需求变更记录.md#run_1730123456789",
      "toolCallsInPhase": ["run_1730123456789_demand_1"]
    }
  ],
  "toolCalls": [
    {
      "id": "run_1730123456789_demand_1",
      "phase": "demand",
      "role": "pm",
      "at": "2026-02-24T10:01:00.000Z",
      "name": "read_file",
      "args": { "path": "docs/prd-draft.md" },
      "resultSummary": "成功，约 2000 字"
    }
  ]
}
```

## 与 flow-engine 的对应

- 当 `next-phase` 返回 `release_or_rollback` 时，表示当前处于 accept 阶段之后、尚未写入 `context.acceptResult`；调用方须先由产品经理写入 `acceptResult: "pass"` 或 `"fail"` 后再查询 next-phase，将得到 `release` 或 `rollback`。

## 测试用途

- E2E/回归：固定 instruction → 断言对应 run 的 phases 覆盖 demand 至 release/rollback，且关键 phase 的 outputSummary 或 outputFullRef 存在。
- 问题排查：根据 runId 查看当次输入、各阶段输出与工具调用顺序。
