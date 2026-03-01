# 产研协作 OpenClaw

OpenClaw 多角色/多实例配置与产研协作流程（产品、架构、开发、测试四角色）。

## 说明

- 本仓库仅包含可公开的配置示例、脚本与文档，**不包含任何密钥或敏感信息**。
- 实际密钥与本地配置请使用 `openclaw.json`（已通过 `.gitignore` 排除），可参考 `openclaw.json.example` 填写。

## 使用

1. 复制示例配置：`cp openclaw.json.example openclaw.json`
2. 在 `openclaw.json` 的 `env` 中填入你的飞书 App Secret、万界 API Key 等（勿提交）。
3. 运行 `openclaw doctor --fix` 等完成本地配置。

## 仓库内容

- `openclaw.json.example`：配置示例（占位符，无真实密钥）
- `scripts/`：脚本（含 `patch-feishu-timeout.mjs`，用于缓解飞书发消息经常 400）
- `skills/`：技能定义
- `completions/`：Shell 补全
- `extensions/`：扩展说明（飞书凭证与 400 排查见 `extensions/FEISHU_CREDENTIALS_README.md`）
- `万界模型配置说明.md`、`FEISHU_SETUP.md`：文档
