#!/usr/bin/env node
/**
 * 增大飞书 Lark SDK 的请求超时，缓解 ETIMEDOUT 导致的 400 错误。
 * 将默认 15 秒改为 45 秒（可配置）。
 *
 * 使用：node scripts/patch-feishu-timeout.mjs [超时毫秒]
 * 示例：node scripts/patch-feishu-timeout.mjs 45000
 *
 * 需在 openclaw 全局安装目录有写权限；升级 openclaw 后需重新执行。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_TIMEOUT_MS = 45000;
const TARGET_TIMEOUT = parseInt(process.argv[2] || String(DEFAULT_TIMEOUT_MS), 10) || DEFAULT_TIMEOUT_MS;

// 常见 OpenClaw 全局安装路径（按优先级）
function findSdkRoot() {
  const tryPath = (p) => {
    if (!p) return null;
    const sdk = path.join(p, 'node_modules/@larksuiteoapi/node-sdk');
    return fs.existsSync(sdk) ? sdk : null;
  };
  const candidates = [
    process.env.OPENCLAW_HOME,
    path.join(process.env.HOME || '', '.openclaw'),
    '/usr/local/lib/node_modules/openclaw',
  ].filter(Boolean);
  for (const p of candidates) {
    const sdk = tryPath(p);
    if (sdk) return sdk;
  }
  return null;
}

let sdkRoot = findSdkRoot();

if (!sdkRoot) {
  console.error('未找到 @larksuiteoapi/node-sdk（请确认已全局安装 openclaw）');
  process.exit(1);
}

const files = [
  path.join(sdkRoot, 'lib/index.js'),
  path.join(sdkRoot, 'es/index.js'),
];

let patched = 0;
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // 1) WebSocket pullConnectConfig 的 timeout（原 15000，或之前已改为 45000 等）
  const timeoutRe = /\btimeout:\s*(?:15000|45000|60000)\b/g;
  if (timeoutRe.test(content)) {
    content = content.replace(/\btimeout:\s*(?:15000|45000|60000)\b/g, `timeout: ${TARGET_TIMEOUT}`);
    changed = true;
  }

  // 2) 默认 axios 实例加上超时（解决 bot/v3/info 等请求 timeout: 0 导致 ETIMEDOUT）
  const isLib = file.endsWith('lib/index.js');
  const createNoTimeout = isLib
    ? 'axios__default["default"].create()'
    : 'axios.create()';
  const createWithTimeout = isLib
    ? `axios__default["default"].create({ timeout: ${TARGET_TIMEOUT} })`
    : `axios.create({ timeout: ${TARGET_TIMEOUT} })`;
  if (content.includes(createNoTimeout) && !content.includes(createWithTimeout)) {
    content = content.replace(createNoTimeout, createWithTimeout);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('已修改:', file, '-> 默认超时', TARGET_TIMEOUT, 'ms');
    patched++;
  } else {
    console.log('跳过（已打过补丁或无需修改）:', file);
  }
}

if (patched === 0) {
  console.log('未修改任何文件（可能已打过补丁或路径不对）');
  process.exit(0);
}

console.log('\n完成。请重启 openclaw gateway 使飞书请求使用新超时。');
