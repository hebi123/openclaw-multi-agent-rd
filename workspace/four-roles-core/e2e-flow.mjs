#!/usr/bin/env node
/**
 * 四角色协作 — E2E 流程测试（可重复）
 * 固定输入指令 → 初始化 context → 断言阶段与产出结构存在。
 * 不调用真实 LLM，仅验证流程引擎与 context 结构；如需真实多角色跑通，由 Agent 按 skill-four-roles 执行后对本脚本扩展断言。
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname));
const FLOW_PATH = path.join(ROOT, "flow.json");
const CTX_PATH = path.join(ROOT, "context.json");

const flow = JSON.parse(fs.readFileSync(FLOW_PATH, "utf8"));
const requiredPhases = ["demand", "design", "schedule", "testability", "align"];

function run() {
  // 1. 初始化
  const ctx = {
    runId: `e2e_${Date.now()}`,
    instruction: "E2E 固定指令：请按四角色流程完成一次最小演示",
    attachmentRefs: [],
    phase: flow.phases[0],
    rollbackCount: 0,
    devTestRound: 1,
    outputs: {},
    architectGates: {},
    acceptResult: null,
    ended: false,
  };
  fs.writeFileSync(CTX_PATH, JSON.stringify(ctx, null, 2), "utf8");

  // 2. 断言：context 存在且包含必需字段与初始 phase
  const readBack = JSON.parse(fs.readFileSync(CTX_PATH, "utf8"));
  if (readBack.phase !== "demand") throw new Error(`expected phase demand, got ${readBack.phase}`);
  if (!readBack.outputs || typeof readBack.outputs !== "object") throw new Error("missing outputs object");
  if (flow.phases[0] !== "demand") throw new Error("flow first phase should be demand");

  // 3. 模拟推进：为前几阶段写入 mock 产出，便于断言「关键产出存在」
  for (const p of requiredPhases) {
    readBack.outputs[p] = { role: flow.roleByPhase[p] || "all", text: `[E2E mock] ${p}` };
  }
  readBack.phase = "dev";
  readBack.outputs.align = readBack.outputs.align || { role: "all", text: "[E2E mock] align" };
  fs.writeFileSync(CTX_PATH, JSON.stringify(readBack, null, 2), "utf8");

  // 4. 断言：关键阶段产出存在
  const again = JSON.parse(fs.readFileSync(CTX_PATH, "utf8"));
  for (const p of requiredPhases) {
    if (!again.outputs[p] || !again.outputs[p].text) throw new Error(`missing output for phase ${p}`);
  }
  if (again.phase !== "dev") throw new Error(`expected phase dev after mock advance, got ${again.phase}`);

  console.log("e2e-flow: OK — context init, required phases and outputs present, phase advanced to dev");
}

run();
