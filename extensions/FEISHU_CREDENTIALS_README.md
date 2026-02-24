# 飞书凭证说明

若网关日志出现 `failed to obtain token` 或 `GET bot/v3/info 400`，说明飞书应用的 **App Secret** 未正确提供给 OpenClaw。

## 处理步骤（推荐）

在 **openclaw.json** 的 `env` 里已增加 `FEISHU_APP_SECRET`，飞书通道的 `appSecret` 已改为使用 `${FEISHU_APP_SECRET}`。

1. **填写真实 App Secret**  
   打开 `~/.openclaw/openclaw.json`，找到：
   ```json
   "FEISHU_APP_SECRET": "YOUR_FEISHU_APP_SECRET"
   ```
   将 `YOUR_FEISHU_APP_SECRET` 替换为你在 [飞书开放平台](https://open.feishu.cn/app) → 你的应用 → 凭证与基础信息 中复制的 **App Secret**，保存后重启网关。

2. **或通过向导重新配置**  
   ```bash
   openclaw configure
   ```
   在向导里选择配置 Feishu 通道，重新输入 App ID 和 App Secret（若向导写回配置，可能再次出现占位符，届时仍可用上面方式在 env 中填写 FEISHU_APP_SECRET）。

3. **长连接（WebSocket）**  
   若需使用「长连接」接收飞书事件，需在飞书开发者后台：
   - 事件与回调 → 订阅方式 → 选择 **使用长连接接收事件/回调**。

本地重复插件已移出：`extensions/feishu.local.bak` → `backup/feishu.local.bak`，仅使用全局飞书插件。
