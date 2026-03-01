#!/usr/bin/env node
/**
 * 四 Agent 协作 — 完整流程 E2E（可重复）
 * 固定输入指令 → 从 demand 模拟推进到 release（验收通过）或 rollback→dev→…→未通过（验收再次不通过）。
 * 不调用真实 LLM，仅验证流程与 context 的完整推进；用于验收标准 A3「流程可完整走通」。
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname));
const FLOW_PATH = path.join(ROOT, "flow.json");
const CTX_PATH = path.join(ROOT, "context.e2e-full.json");

const flow = JSON.parse(fs.readFileSync(FLOW_PATH, "utf8"));

function getNextPhase(phase, ctx, flow) {
  const next = flow.nextPhase[phase];
  if (next === "_end_ok") return "_end_ok";
  if (next === "release_or_rollback") {
    if (ctx.acceptResult == null) return "release_or_rollback";
    return ctx.acceptResult === "pass" ? "release" : "rollback";
  }
  if (next === "dev_or_end_fail") {
    const count = (ctx.rollbackCount || 0) + 1;
    if (count <= (flow.maxRollbackCount || 1)) return "dev";
    return "_end_fail";
  }
  return next || null;
}

function runScenario(name, acceptFirstResult, expectEndPhase) {
  const runId = `e2e_full_${Date.now()}_${name}`;
  const ctx = {
    runId,
    instruction: "E2E 完整流程：固定指令",
    attachmentRefs: [],
    phase: "demand",
    rollbackCount: 0,
    devTestRound: 1,
    outputs: {},
    architectGates: {},
    acceptResult: null,
    ended: false,
    runLogPath: `runs/${runId}.json`,
  };

  const phasesInOrder = ["demand", "design", "schedule", "testability", "align", "dev", "test", "accept"];
  for (const p of phasesInOrder) {
    const key = p === "dev" || p === "test" ? `${p}_${ctx.devTestRound}` : p;
    ctx.outputs[key] = { role: flow.roleByPhase[p] || "all", text: `[E2E] ${key}` };
    if (p === "dev" || p === "test") {
      ctx.architectGates[`${p}_${ctx.devTestRound}`] = { role: "architect", text: "[E2E] gate OK" };
    }
    if (p === "accept") {
      ctx.acceptResult = acceptFirstResult;
      ctx.outputs.accept = { role: "pm", pass: acceptFirstResult === "pass", text: `[E2E] accept ${acceptFirstResult}` };
    }
    ctx.phase = getNextPhase(p, ctx, flow);
    if (ctx.phase === "release" || ctx.phase === "rollback") break;
  }

  if (ctx.phase === "rollback") {
    ctx.rollbackCount = 1;
    ctx.phase = getNextPhase("rollback", ctx, flow);
    if (ctx.phase === "dev") {
      ctx.devTestRound = 2;
      ctx.outputs.dev_2 = { role: "dev", text: "[E2E] dev_2" };
      ctx.outputs.test_2 = { role: "qa", text: "[E2E] test_2" };
      ctx.architectGates.dev_2 = { role: "architect", text: "[E2E] gate OK" };
      ctx.architectGates.test_2 = { role: "architect", text: "[E2E] gate OK" };
      ctx.outputs.accept = { role: "pm", pass: false, text: "[E2E] accept fail again" };
      ctx.acceptResult = "fail";
      ctx.phase = getNextPhase("accept", ctx, flow);
      if (ctx.phase === "rollback") ctx.phase = getNextPhase("rollback", { ...ctx, rollbackCount: 2 }, flow);
    }
  }

  if (ctx.phase === "release") {
    ctx.outputs.release = { role: "all", text: "[E2E] release" };
    ctx.phase = "_end_ok";
    ctx.ended = true;
  }

  if (ctx.phase === "_end_fail") ctx.ended = true;

  if (ctx.phase !== expectEndPhase) {
    throw new Error(`${name}: expected final phase ${expectEndPhase}, got ${ctx.phase}`);
  }
  return ctx;
}

function run() {
  runScenario("pass", "pass", "_end_ok");
  console.log("e2e-full-flow: scenario pass — demand→…→accept(通过)→release→_end_ok");

  runScenario("rollback_then_fail", "fail", "_end_fail");
  console.log("e2e-full-flow: scenario rollback_then_fail — accept(不通过)→rollback→dev→test→accept(不通过)→_end_fail");

  console.log("e2e-full-flow: OK — full flow and rollback path verified");
}

run();
