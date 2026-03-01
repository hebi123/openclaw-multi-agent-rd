# 四 Agent 协作 — 配置说明

当前已改为 **4 个 Agent 协作**：main（编排者）+ pm、architect、dev、qa（四角色 Agent）。飞书等入口仍由 main 接收，main 通过 **sessions_send** 将各阶段任务发给对应 Agent，收集回复后更新 context 并推进流程。

## 1. 已在本仓库中的修改

- **openclaw.json**（本地，已加以下内容，因 gitignore 未提交）：
  - **agents.list**：main（default）、pm、architect、dev、qa，各 id 对应独立 workspace（main 用 `~/.openclaw/workspace`，其余用 `~/.openclaw/workspace-pm` 等）。
  - **main.subagents.allowAgents**：["pm", "architect", "dev", "qa"]，允许 main 向四角色 Agent 发消息。
  - **bindings**：Feishu → main。
  - **tools.agentToAgent**：enabled true，allow ["main", "pm", "architect", "dev", "qa"]。
- **workspace-pm / workspace-architect / workspace-dev / workspace-qa**：每个目录下 SOUL.md、AGENTS.md 定义该角色身份与「根据 main 消息回复产出」的规则。
- **skill-four-roles**：已更新为「main 使用 sessions_send，sessionKey 为 agent:pm:main / agent:architect:main / agent:dev:main / agent:qa:main」。

## 2. 若你本地 openclaw.json 尚未加入 list/bindings/tools

请手动在 **openclaw.json** 中合并以下内容（保留原有 agents.defaults、channels 等）：

- 在 **agents** 对象中增加 **list** 数组（见上），并给 main 增加 **subagents.allowAgents**。
- 在顶层增加 **bindings** 与 **tools.agentToAgent**。

合并后**重启 OpenClaw Gateway**（如 `openclaw gateway restart`），使多 Agent 与 agentToAgent 生效。

## 3. 验证

- 在飞书问：「你现在是多 Agent 还是单 Agent？」  
  应回答：当前为**多 Agent**，有 main、pm、architect、dev、qa 五个 Agent；四角色协同时由 main 通过 sessions_send 调用 pm/architect/dev/qa。
- 说「按四角色流程做 XXX」：main 应按流程向 agent:pm:main、agent:architect:main 等发消息并收集产出。

## 4. sessionKey 约定

- 各角色 Agent 的 main 会话：**agent:pm:main**、**agent:architect:main**、**agent:dev:main**、**agent:qa:main**。
- main 使用 **sessions_send** 时，sessionKey 填上述之一，message 中带 phase 与 context 摘要。
