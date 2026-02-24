#!/usr/bin/env node
/**
 * 诊断：用与网关相同的方式解析 wanjie 模型，并打印即将请求的 URL。
 * 运行：node debug-wanjie-request.mjs
 */
import path from "node:path";
import { readFileSync, existsSync } from "node:fs";

const stateDir = process.env.OPENCLAW_STATE_DIR || path.join(process.env.HOME || "", ".openclaw");
const agentDir = path.join(stateDir, "agents", "main", "agent");
const modelsPath = path.join(agentDir, "models.json");

console.log("Agent dir:", agentDir);
console.log("models.json exists:", existsSync(modelsPath));
if (!existsSync(modelsPath)) {
  console.error("请先启动一次网关生成 models.json，或从 openclaw.json 确认 wanjie 配置。");
  process.exit(1);
}

const config = JSON.parse(readFileSync(modelsPath, "utf-8"));
const wanjie = config?.providers?.wanjie;
if (!wanjie) {
  console.error("models.json 中未找到 providers.wanjie，请确认 openclaw.json 中已添加 wanjie 并重启网关。");
  process.exit(1);
}

const baseUrl = (wanjie.baseUrl || "").replace(/\/+$/, "");
const api = wanjie.api || "";
const modelId = wanjie.models?.[0]?.id || "claude-opus-4-5-20251101";
// OpenAI SDK 会请求 baseURL + "/v1/chat/completions"
const expectedUrl = `${baseUrl}/v1/chat/completions`;

console.log("\nwanjie 解析结果:");
console.log("  baseUrl:", baseUrl || "(未设置)");
console.log("  api:", api || "(未设置)");
console.log("  modelId:", modelId);
console.log("  预期请求 URL:", expectedUrl);

if (!baseUrl || baseUrl.includes("api.anthropic.com")) {
  console.error("\n错误: baseUrl 未设置或仍指向 Anthropic 官方，请求会 404。");
  process.exit(1);
}
if (api !== "openai-completions") {
  console.warn("\n警告: api 不是 openai-completions，当前为", api);
}

console.log("\n若上述 URL 正确仍 404，请在同一终端执行以下命令后重启网关（排除代理）：");
console.log("  export HTTP_PROXY=");
console.log("  export HTTPS_PROXY=");
console.log("  openclaw gateway");
