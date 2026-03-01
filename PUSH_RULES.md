# 仓库推送规则（重新盘点）

克隆到别机后要能「配好即用」，需要推送代码与文档，但**绝不推送**密钥、运行时和敏感数据。

---

## 一、绝不推送（敏感 / 运行时 / 无关）

| 路径或规则 | 原因 |
|------------|------|
| `openclaw.json` | 含 API Key、飞书 Secret、万界 Key、网关 token 等 |
| `openclaw.json.bak`、`openclaw.json.bak.*` | 配置备份，可能含密钥 |
| `*.local.json` | 本地覆盖配置，可能含密钥 |
| `.env`、`.env.*` | 环境变量里的密钥 |
| `identity/` | 设备身份、私钥等 |
| `devices/` | 配对信息等 |
| `credentials/` | 飞书等凭证、配对结果 |
| `agents/` | 会话、会话内 token、对话内容 |
| `logs/` | 运行日志，可能含请求/响应 |
| `delivery-queue/` | 投递队列，运行时数据 |
| `media/` | 上传/下载的媒体文件 |
| `cron/` | 定时任务状态 |
| `update-check.json` | 更新检查状态 |
| `backup/`、`*.bak`、`.cache/` | 备份与缓存 |
| `browser/openclaw/` | 浏览器用户数据 |
| `node_modules/`、`.DS_Store`、`*.log`、`Thumbs.db` | 依赖与系统/日志文件 |
| `workspace/four-roles-core/context.json` | 四 Agent 运行时上下文（会话状态） |
| `workspace/four-roles-core/runs/` | 每次运行的日志（可能含会话摘要） |
| `workspace/2026-02-19-tankbattle/` | 具体项目目录，已决定不推送 |
| `workspace/.openclaw/` | 工作区内部状态 |
| `workspace/.git/` | 嵌套仓库，不纳入主仓库 |

---

## 二、应推送（别机克隆后配好即用）

| 路径 | 说明 |
|------|------|
| `.gitignore` | 保持上述规则生效 |
| `README.md` | 仓库说明与使用步骤 |
| `openclaw.json.example` | 配置示例（仅占位符，无真实密钥） |
| `FEISHU_SETUP.md` | 飞书配置说明 |
| `GITHUB_推送步骤.md` | 推送到 GitHub 的通用步骤 |
| `万界模型配置说明.md` | 万界配置与排查（仅说明与占位符） |
| `extensions/FEISHU_CREDENTIALS_README.md` | 飞书凭证与 400 排查 |
| `completions/` | Shell 补全脚本 |
| `canvas/index.html` | 前端页面 |
| `scripts/` | 脚本（如 `patch-feishu-timeout.mjs`、`feishu-check-token.sh`） |
| `skills/skill-four-roles/`、`skills/skill-vetting/` | 技能定义 |
| `workspace-pm/`、`workspace-architect/`、`workspace-dev/`、`workspace-qa/` | 各 Agent 的 AGENTS.md、SOUL.md |
| `check-wanjie-model.mjs`、`debug-wanjie-request.mjs`、`test-wanjie.mjs`、`test-wanjie-stream.sh` | 万界测试脚本（用环境变量，无硬编码 Key） |
| **`workspace/` 根下** | 全局说明 8 个：ROLES.md、AGENTS.md、TOOLS.md、BOOTSTRAP.md、USER.md、IDENTITY.md、SOUL.md、HEARTBEAT.md；以及 install-gh.sh、package.json、.gitignore |
| **`workspace/four-roles-core/`**（见下） | 四 Agent 流程共享核心（除 context.json、runs/ 外） |
| `四Agent协作-完整需求文档.md`、`四Agent协作-需求摘要.md` | 需求文档 |

**workspace/four-roles-core/ 中应推送的文件：**

- `flow.json`、`flow-engine.mjs`、`context-schema.md`、`RUN-LOG-SCHEMA.md`、`README.md`
- `roles/pm.md`、`roles/architect.md`、`roles/dev.md`、`roles/qa.md`
- `artifacts/ARTIFACTS-README.md` 及各 artifacts 下的模板/说明（如 `产品需求变更记录.md` 等)
- `e2e-flow.mjs`、`e2e-full-flow.mjs`、`四Agent配置说明.md`、`产品经理最终验收清单.md`
- **不推送**：`context.json`、`runs/` 下内容

---

## 三、可选（按需决定是否推送）

| 路径 | 说明 |
|------|------|
| `workspace/2026-02-19-tankbattle/` | 具体项目（如 E2E 测试说明）；**已决定不推送**，已写入 .gitignore |

当前：workspace 根下 8 个文档与 install-gh.sh、package.json、.gitignore 已纳入应推送；仅 `workspace/2026-02-19-tankbattle/` 不推送。

**说明**：`workspace/` 目录内若有独立 `.git`（自成仓库），主仓库无法直接跟踪其下单个文件。若克隆后要在别机使用这 8 个文档，可二选一：**(A)** 删掉 `workspace/.git`，让 workspace 完全由主仓库管理后再 `git add workspace/…`；**(B)** 在主仓库新建目录（如 `workspace-defaults/`），把这 8 个文档和 install-gh.sh、package.json、.gitignore 复制一份放入并推送，别机克隆后复制到 workspace 使用。

---

## 四、当前 .gitignore 与执行顺序

- 上述「绝不推送」已全部写在 `.gitignore` 中。
- 推送前执行：  
  `git add .` 然后检查 `git status`，确认没有 `openclaw.json`、`agents/`、`logs/`、`identity/`、`credentials/` 等再 `git commit` 与 `git push`。
