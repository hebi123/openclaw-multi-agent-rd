#!/usr/bin/env node
/**
 * 万界方舟接口测试脚本（与接口文档一致）
 * 用法：在终端执行（先设置 API Key）：
 *   WANJIE_API_KEY="你的API_KEY" node test-wanjie.mjs
 * 若 openclaw 已配置过 WANJIE_API_KEY，可先：source 你的环境 或 在 openclaw 同环境下运行。
 */
const API_KEY = (process.env.WANJIE_API_KEY || "").trim();
const MODEL_ID = "claude-opus-4-5-20251101";
const BASE_URL = "https://maas-openapi.wanjiedata.com/api";

if (!API_KEY) {
  console.error("请设置环境变量 WANJIE_API_KEY，例如：");
  console.error('  export WANJIE_API_KEY="从万界后台复制的长串 Key"');
  console.error("  node test-wanjie.mjs");
  process.exit(1);
}
// 万界 Key 应为 ASCII（如 JWT），不能是中文占位符
const isAscii = (s) => /^[\x00-\x7F]*$/.test(s);
if (!isAscii(API_KEY) || /你的|真实|粘贴/.test(API_KEY)) {
  console.error("错误：WANJIE_API_KEY 不能是中文占位符，必须是「从万界后台复制的真实 API Key」（一串英文/数字）。");
  console.error("请打开 https://www.wjark.com/center/api-key 复制 Key 后执行：");
  console.error('  export WANJIE_API_KEY="粘贴复制的整串Key"');
  console.error("  node test-wanjie.mjs");
  process.exit(1);
}

const url = `${BASE_URL}/v1/chat/completions`;
const body = {
  model: MODEL_ID,
  messages: [{ role: "user", content: "你好，请回复「收到」" }],
  stream: false,
};

console.log("请求 URL:", url);
console.log("请求 body:", JSON.stringify(body, null, 2));
console.log("");

const bodyStr = JSON.stringify(body);
const res = await fetch(url, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json; charset=utf-8",
  },
  body: new TextEncoder().encode(bodyStr),
});

const text = await res.text();
console.log("HTTP 状态:", res.status, res.statusText);
console.log("响应 body:", text.slice(0, 500) + (text.length > 500 ? "..." : ""));

if (!res.ok) {
  console.error("\n接口调用失败，请检查 API Key、模型 ID 和网络。");
  process.exit(1);
}

let json;
try {
  json = JSON.parse(text);
} catch {
  console.error("\n响应不是合法 JSON。");
  process.exit(1);
}

const content = json.choices?.[0]?.message?.content;
if (content) {
  console.log("\n模型回复:", content);
  console.log("\n万界接口测试通过。若 OpenClaw 仍 404，请重启网关后再试。");
} else {
  console.log("\n响应中无 content，完整响应:", JSON.stringify(json, null, 2).slice(0, 400));
}
