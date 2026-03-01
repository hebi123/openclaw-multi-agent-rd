# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## 推送到 GitHub（通过 OpenClaw / Skills）

要先把**工作区**（或某个子项目）推到 GitHub，可以按下面做。Agent 有 `exec` 和 **GitHub Skill**（`gh` CLI），可以替你执行这些命令。

### 方式一：在飞书 / 对话里让 Agent 帮你推

直接对 Agent 说，例如：

- 「把 workspace 的代码推送到 GitHub，仓库名 xxx」
- 「帮我 git add、commit 并 push 到 GitHub」

Agent 会按当前目录执行 `git add`、`git commit`、`git push`（以及如需 `gh repo create`、`git remote add`）。

### 方式二：自己在本机执行

1. **安装并登录 GitHub CLI（首次）**
   ```bash
   brew install gh
   gh auth login
   ```

2. **进入要推送的目录**（例如工作区根目录）
   ```bash
   cd ~/.openclaw/workspace
   ```

3. **首次提交**
   ```bash
   git add .
   git commit -m "Initial commit: workspace + projects"
   ```

4. **在 GitHub 上建仓库并推送**
   - 用网页在 github.com 新建一个空仓库（不要勾选 README），记下仓库地址；
   - 或使用：`gh repo create 你的仓库名 --private --source=. --remote=origin --push`
   - 若已手动建好仓库：
     ```bash
     git remote add origin https://github.com/你的用户名/你的仓库名.git
     git branch -M main
     git push -u origin main
     ```

### 注意

- 工作区里已有 `.gitignore`（忽略 `node_modules/`、`.DS_Store` 等），避免把无关文件推上去。
- 密钥和敏感信息在 `~/.openclaw` 的 `openclaw.json`、`agents/` 等，不在 workspace 根目录时不会被打包进这次推送；若 workspace 下有敏感文件，请先加入 `.gitignore` 再 push。

---

Add whatever helps you do your job. This is your cheat sheet.
