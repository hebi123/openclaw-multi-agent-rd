#!/usr/bin/env node
/**
 * 诊断：网关用的万界模型解析结果（baseUrl / api 等）
 * 与 test-wanjie.mjs 同目录运行：node check-wanjie-model.mjs
 */
import path from "node:path";
import { readFileSync, existsSync } from "node:fs";

const stateDir = process.env.OPENCLAW_STATE_DIR || path.join(process.env.HOME || "", ".openclaw");
const agentId = "main";
const agentDir = path.join(stateDir, "agents", agentId, "agent");
const modelsPath = path.join(agentDir, "models.json");

console.log("Agent dir:", agentDir);
console.log("models.json exists:", existsSync(modelsPath));
if (!existsSync(modelsPath)) {
  console.error("models.json 不存在，请先启动一次网关以生成。");
  process.exit(1);
}

const raw = readFileSync(modelsPath, "utf-8");
const config = JSON.parse(raw);
const anthropic = config?.providers?.anthropic;
if (!anthropic) {
  console.error("models.json 中未找到 providers.anthropic");
  process.exit(1);
}

console.log("\nproviders.anthropic 内容:");
console.log("  baseUrl:", anthropic.baseUrl ?? "(未设置)");
console.log("  api:", anthropic.api ?? "(未设置)");
console.log("  apiKey 长度:", typeof anthropic.apiKey === "string" ? anthropic.apiKey.length : 0);
const models = anthropic?.models ?? [];
const wanji = models.find((m) => m.id === "claude-opus-4-5-20251101");
if (wanji) {
  console.log("  模型 claude-opus-4-5-20251101: 已配置");
} else {
  console.log("  模型 claude-opus-4-5-20251101: 未在 models 列表中");
}

if (!anthropic.baseUrl || !anthropic.api) {
  console.error("\n结论: baseUrl 或 api 缺失，网关请求会走错地址或格式，导致 404。");
  process.exit(1);
}

const expected = "https://maas-openapi.wanjiedata.com/api";
if (anthropic.baseUrl.replace(/\/+$/, "") !== expected.replace(/\/+$/, "")) {
  console.warn("\n警告: baseUrl 与预期不一致，预期:", expected);
}

console.log("\n结论: models.json 中万界配置正常。若仍 404，可能是网关未用此文件或请求被代理。");
console.log("建议: 先删掉 agents/main/agent/models.json 后重启网关，让网关按 openclaw.json 重新生成。");
