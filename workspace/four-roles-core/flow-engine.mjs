#!/usr/bin/env node
/**
 * 四角色协作 — 流程引擎（只读流程定义与上下文，推进状态由调用方写 context.json）
 * 不改变 OpenClaw 架构，仅作为共享核心的一部分，供 Agent 或脚本查询/推进。
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname));
const FLOW_PATH = path.join(ROOT, "flow.json");
const DEFAULT_CTX_PATH = path.join(ROOT, "context.json");

function loadFlow() {
  const raw = fs.readFileSync(FLOW_PATH, "utf8");
  return JSON.parse(raw);
}

function loadContext(ctxPath = DEFAULT_CTX_PATH) {
  if (!fs.existsSync(ctxPath)) return null;
  const raw = fs.readFileSync(ctxPath, "utf8");
  return JSON.parse(raw);
}

function getCurrentRole(phase, flow) {
  return flow.roleByPhase[phase] || null;
}

function getNextPhase(phase, ctx, flow) {
  const next = flow.nextPhase[phase];
  if (next === "_end_ok") return "_end_ok";
  if (next === "release_or_rollback") {
    if (ctx.acceptResult == null) return "release_or_rollback";
    return ctx.acceptResult === "pass" ? "release" : "rollback";
  }
  if (next === "rollback") return "rollback";
  if (next === "dev_or_end_fail") {
    const count = (ctx.rollbackCount || 0) + 1;
    if (count <= (flow.maxRollbackCount || 1)) return "dev";
    return "_end_fail";
  }
  return next || null;
}

// CLI: node flow-engine.mjs status [context路径]
//      node flow-engine.mjs next-phase [context路径]
//      node flow-engine.mjs init --instruction="用户指令" [--attachments=a,b]
if (process.argv[2] === "status") {
  const ctxPath = process.argv[3] || DEFAULT_CTX_PATH;
  const ctx = loadContext(ctxPath);
  const flow = loadFlow();
  if (!ctx) {
    console.log(JSON.stringify({ phase: null, role: null, message: "no context" }));
    process.exit(0);
  }
  const role = getCurrentRole(ctx.phase, flow);
  console.log(JSON.stringify({ phase: ctx.phase, role, rollbackCount: ctx.rollbackCount || 0 }));
} else if (process.argv[2] === "next-phase") {
  const ctxPath = process.argv[3] || DEFAULT_CTX_PATH;
  const ctx = loadContext(ctxPath);
  const flow = loadFlow();
  if (!ctx) {
    console.log(JSON.stringify({ nextPhase: null }));
    process.exit(0);
  }
  const next = getNextPhase(ctx.phase, ctx, flow);
  const out = { nextPhase: next };
  if (next === "release_or_rollback") out.hint = "set context.acceptResult (pass|fail) then query next-phase again";
  console.log(JSON.stringify(out));
} else if (process.argv[2] === "init") {
  let instruction = "";
  let attachments = [];
  for (let i = 3; i < process.argv.length; i++) {
    if (process.argv[i].startsWith("--instruction=")) instruction = process.argv[i].slice("--instruction=".length);
    if (process.argv[i].startsWith("--attachments=")) attachments = process.argv[i].slice("--attachments=".length).split(",").filter(Boolean);
  }
  const flow = loadFlow();
  const runId = `run_${Date.now()}`;
  const ctx = {
    runId,
    instruction,
    attachmentRefs: attachments,
    phase: flow.phases[0],
    rollbackCount: 0,
    devTestRound: 1,
    outputs: {},
    architectGates: {},
    acceptResult: null,
    ended: false,
    runLogPath: `runs/${runId}.json`,
  };
  fs.writeFileSync(DEFAULT_CTX_PATH, JSON.stringify(ctx, null, 2), "utf8");
  const role = getCurrentRole(ctx.phase, flow);
  console.log(JSON.stringify({ phase: ctx.phase, role, contextPath: DEFAULT_CTX_PATH, runLogPath: ctx.runLogPath }));
} else {
  console.log("Usage: flow-engine.mjs status [contextPath] | next-phase [contextPath] | init --instruction=\"...\" [--attachments=a,b]");
  process.exit(1);
}
