# 四 Agent 协作 — 上下文结构

流程引擎与各角色共享的上下文，存于 `context.json`（由 Agent 或 run 脚本读写）。不改变 OpenClaw 整体架构，仅在工作区内维护状态。

## 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| runId | string | 本次运行 ID（如 uuid 或时间戳） |
| instruction | string | 用户指令（文本） |
| attachmentRefs | string[] | 附件引用（路径或链接），可选 |
| phase | string | 当前阶段，取值见 flow.json phases |
| rollbackCount | number | 已发生回流次数，最多 1 |
| devTestRound | number | 当前开发↔测试轮次，从 1 起 |
| outputs | object | 各阶段产出，key 为阶段名或 "phase_role" |
| architectGates | object | 架构关键节点确认记录 |
| acceptResult | "pass" \| "fail" \| null | 产品验收结论，仅 accept 阶段后有效 |
| ended | boolean | 是否已结束（发布或未通过） |
| runLogPath | string | 可选，本次运行的日志文件路径，如 runs/<runId>.json，见 RUN-LOG-SCHEMA.md |

## outputs 结构示例

```json
{
  "demand": { "role": "pm", "text": "..." },
  "design": { "role": "architect", "text": "..." },
  "schedule": { "role": "dev", "text": "..." },
  "testability": { "role": "qa", "text": "..." },
  "align": { "role": "all", "text": "..." },
  "dev_1": { "role": "dev", "text": "..." },
  "test_1": { "role": "qa", "text": "..." },
  "architect_gate_dev_1": { "role": "architect", "text": "..." },
  "architect_gate_test_1": { "role": "architect", "text": "..." },
  "accept": { "role": "pm", "pass": false, "text": "..." },
  "release": { "role": "all", "text": "..." }
}
```

## 约定

- 仅内存或单文件落盘；第一版不支持暂停/续跑，跑完即丢或可选写 workspace 路径。
- 执行层对接由运行侧注入，不在此 schema 中存 CI/仓库信息。
- **每次运行**需在 `workspace/four-roles-core/runs/<runId>.json` 落盘运行日志（输入、各阶段输出、工具调用），见 RUN-LOG-SCHEMA.md。
- 各角色产出需同步写入 **artifacts** 下的对应文档与变更记录，见 ARTIFACTS-README.md。
