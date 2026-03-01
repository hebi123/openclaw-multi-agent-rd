# 飞书凭证说明

若网关日志出现 `failed to obtain token` 或 `GET bot/v3/info 400`，说明飞书应用的 **App Secret** 未正确提供给 OpenClaw，或通道配置格式不符合当前插件要求。

**若 gateway.err.log 里仍有 `models.providers.anthropic.api: Invalid input`**：多为旧日志。配置已改为 `anthropic-proxy`，**重启网关**后新日志不再出现该错误。

## 彻底解决：飞书发消息经常 400（ETIMEDOUT）

根因是访问飞书接口（`open.feishu.cn`）时**读超时**（默认 15 秒），网络稍慢就会 ETIMEDOUT，进而被当成错误以 400/Internal server error 形式展示。按下面做可显著减少甚至消除此类 400：

**1. 增大飞书请求超时（推荐，本仓库已提供脚本）**

在项目目录执行（将 15 秒改为 45 秒；若 openclaw 装在系统目录，可能需要 `sudo`）：

```bash
cd ~/.openclaw
node scripts/patch-feishu-timeout.mjs 45000
```

执行成功后**重启 openclaw gateway**。升级 openclaw 后若 400 复现，再执行一次即可。

**2. 网络与环境**

- 使用**稳定网络**（少用易断的 VPN、避免跨地域高延迟）。
- 仍偶发时：在飞书里 `/new` 新开对话重试，或换时间段/网络再试。

**3. 配置自检**

- 确认 `openclaw.json` 里 `models.providers` 只有 `anthropic-proxy`（无 `anthropic`），避免配置校验失败影响网关。
- 确认飞书 `appId` / `appSecret` 正确且已发布应用、权限含 `im:message:send_as_bot`。

按 1 + 重启 + 2、3，一般即可彻底缓解「发消息经常 400」的问题。

---

使用 **accounts** 结构，便于与 bindings 的 accountId 对应：

```json
"channels": {
  "feishu": {
    "enabled": true,
    "domain": "feishu",
    "groupPolicy": "open",
    "connectionMode": "websocket",
    "accounts": {
      "default": {
        "appId": "cli_xxx",
        "appSecret": "${FEISHU_APP_SECRET}"
      }
    }
  }
}
```

bindings 中指定 accountId 以使用该账号凭证：

```json
"bindings": [
  { "agentId": "main", "match": { "channel": "feishu", "accountId": "default" } }
]
```

## 处理步骤（推荐）

1. **填写真实 App Secret**  
   在 **openclaw.json** 的 `env` 中设置 `FEISHU_APP_SECRET`（或直接在 accounts.default.appSecret 中写死，勿提交）。保存后**重启网关**。

2. **或通过向导重新配置**  
   ```bash
   openclaw configure
   ```
   选择配置 Feishu 通道，重新输入 App ID 和 App Secret。

3. **长连接（WebSocket）**  
   若需使用「长连接」接收飞书事件，需在飞书开发者后台：事件与回调 → 订阅方式 → 选择 **使用长连接接收事件/回调**。

4. **仍报 400 时**  
   - 运行 `openclaw doctor --fix` 后重启网关。  
   - 确认飞书应用已开启「机器人」能力、权限含 `im:message:send_as_bot` 等，且应用已发布。  
   - 查看 `~/.openclaw/logs/gateway.log` 中 400 对应的请求 URL（如 `bot/v3/info`）及前后报错，确认是否为 token 未获取或请求未带 Authorization。

## 区分 400 发生时机

- **启动/连接阶段**：若日志里有 `bot open_id resolved`，说明 `bot/v3/info` 已成功，token 正常；若只有 `failed to obtain token` 或请求 `bot/v3/info` 报 400，则是**获取 tenant_access_token 失败**（检查 appId/appSecret 与 env 替换）。
- **回复发送阶段**：若飞书里能收到消息、但某条回复时报 400，则是**发消息到飞书**时失败。请在出现 400 后立刻执行：
  ```bash
  grep -E "feishu.*reply failed|feishu reply API response|status=400" ~/.openclaw/logs/gateway.log | tail -20
  ```
  查看 `feishu reply API response: status=400 body=...` 中的 `body`，即飞书返回的错误码与说明，按飞书文档排查（如权限、receive_id 类型、消息体格式等）。

## 当飞书里「回复内容」就是 400 错误文案时

若飞书聊天里**机器人发出的那条消息**的正文是：  
`error, status code: 400, status: 400 Bad Request, message: Internal server error`，说明：

- **这条内容已经成功发到飞书**（不是飞书发消息接口 400）。
- **400 发生在网关内部**（某次内部 HTTP 请求或工具调用返回了 400），网关把该错误转成文案并作为回复发给了用户。

因此用 `grep "feishu reply failed"` 可能搜不到——需要按**出错时间**在日志里找真实原因。

**建议操作：**

1. 记下飞书里该条消息的**大致时间**（如 21:01:59）。
2. 按时间在日志里搜错误（把 `21:01` 换成你当时的小时:分钟）：
   ```bash
   grep "21:01" ~/.openclaw/logs/gateway.log | tail -50
   grep "21:01" ~/.openclaw/logs/gateway.err.log 2>/dev/null | tail -30
   ```
3. 同时看该时间段前后是否有 `[error]`、`failed`、`ETIMEDOUT`、`tool`、`sessions_send` 等：
   ```bash
   grep -E "\[error\]|failed|ETIMEDOUT|reply failed|tool|sessions_send" ~/.openclaw/logs/gateway.log | tail -40
   ```
4. 若仍无头绪，可开启更详细日志后复现一次（再按时间 grep）：
   ```bash
   OPENCLAW_LOG=verbose openclaw gateway
   ```

常见内部 400 原因：调用网关内部 HTTP 接口（如 browser、hooks）时参数错误或超时、子 Agent 调用失败、某工具返回了 400 等。根据日志里的堆栈或报错行即可进一步排查。

## 400：`tool_result` 与 `tool_use` 不匹配（模型 API，非飞书/非超时）

若飞书里机器人回复的**正文**里出现类似：

`invalid_request_error ... unexpected tool_use_id found in tool_result blocks ... Each tool_result block must have a corresponding tool_use block in the previous message`

这是**模型 API**（万界/OpenAI 兼容）返回的 400，**不是**飞书接口、也不是网络超时。含义是：发给模型的本轮「消息序列」里，有一条 `tool_result` 的 `tool_use_id` 在**上一轮**没有对应的 `tool_use`（常见于上下文压缩时裁掉了某条助手消息，但后面的工具结果还在）。

**立刻可做：**

1. **新开会话**：在飞书里发 **`/new`**（或与机器人新开一个聊天），再重新发起请求。新会话没有这段错乱历史，一般即可恢复。
2. **若频繁出现**：可在 `openclaw.json` 的 `agents.defaults.compaction` 里适当提高保留量，减轻「裁掉助手消息却保留工具结果」的情况，例如：
   ```json
   "compaction": {
     "mode": "safeguard",
     "reserveTokensFloor": 4000
   }
   ```
   保存后**重启网关**。若仍经常出现，可把完整错误信息（含 `request_id`）提供给 OpenClaw 项目，便于在压缩/消息构建逻辑里保证 `tool_use` / `tool_result` 成对保留。

**如何区分 400 来源**：看飞书里那条 400 的 **message** 内容。若含 `tool_use_id` / `tool_result` / `invalid_request_error` → 模型 API；若含 `ETIMEDOUT` 或只有 `Internal server error` → 多为超时或其它内部请求失败。

## read ETIMEDOUT / 400 与 bot/v3/info 超时（常见日志情况）

若 gateway.log 里出现 **`url: 'https://open.feishu.cn/open-apis/bot/v3/info'`** 且 **`AxiosError: read ETIMEDOUT`**，或飞书里看到 **400 / Internal server error**，且 `grep` 结果里**没有** `feishu reply failed`、但有 **`read ETIMEDOUT`** 或 **`failed to remove typing indicator`**，说明：

- 网关访问飞书接口（`open.feishu.cn`）时**读超时**，连接不稳定或延迟高。
- 去掉「正在输入」图标的请求超时后，同一轮里其他请求（例如发消息）也可能超时或失败，最终被转成「400 / Internal server error」作为回复内容发给用户。

**建议处理：**

1. **网络**：尽量用稳定网络访问飞书（避免不稳定 VPN、跨地域或高延迟）。
2. **重试**：多为偶发，可在飞书里 `/new` 新开对话再发一次同一句话。
3. **看时间是否对应**：把你看到 400 的**大致时间**（如 21:01）和日志里的 `ETIMEDOUT`、`failed to remove typing indicator` 时间对比，若在同一两分钟内，可基本确认是本次超时导致。
4. **后续**：若频繁出现，可向 OpenClaw 反馈并附上 `gateway.log` 片段（含 ETIMEDOUT 前后几行），便于增加飞书请求超时时间或重试逻辑。

**快速自检（减少 400/报错）**：确认 `openclaw.json` 里 `models.providers` 只有 `anthropic-proxy`（无 `anthropic`）→ 重启网关 → 飞书/网络不稳时易 ETIMEDOUT，可重试或换稳定网络。

## 排除 env 替换问题（可选）

若怀疑 `${FEISHU_APP_SECRET}` 未被正确替换，可临时在 `channels.feishu.accounts.default` 中把 `appSecret` 写成明文（与 `env.FEISHU_APP_SECRET` 一致），重启网关后复测。确认无误后改回 `"${FEISHU_APP_SECRET}"`，勿提交明文。
