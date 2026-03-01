# 将本仓库推送到 GitHub

适用于本仓库（OpenClaw 多 Agent 产研协作）推送到 GitHub 的通用步骤。当前推荐远程名为 `openclaw-multi-agent-rd`，仓库示例：`openclaw-multi-agent-rd`。

## 若 HTTPS 连不上（443 超时）

本机若无法访问 `github.com:443`，可改用 **SSH**（走 22 端口，用你已配置的 GitHub key）：

```bash
cd ~/.openclaw
git remote set-url openclaw-multi-agent-rd git@github.com:你的用户名/仓库名.git
# 示例（仓库名为英文）：
# git remote set-url openclaw-multi-agent-rd git@github.com:hebi123/openclaw-multi-agent-rd.git
git push -u openclaw-multi-agent-rd main
```

## 方式一：网页创建仓库后推送（推荐）

1. **在 GitHub 新建仓库**
   - 打开 https://github.com/new
   - **Repository name** 填英文名（如 `openclaw-multi-agent-rd`），避免中文名在 SSH 下出现「invalid repository name」。
   - 选择 **Public**，**不要**勾选 “Add a README” / “Add .gitignore”
   - 点击 **Create repository**

2. **在本地添加远程并推送**（将 `你的用户名`、`仓库名` 换成实际值）：
   ```bash
   cd ~/.openclaw
   git remote add openclaw-multi-agent-rd https://github.com/你的用户名/仓库名.git
   git push -u openclaw-multi-agent-rd main
   ```
   若用 SSH（推荐）：
   ```bash
   git remote add openclaw-multi-agent-rd git@github.com:你的用户名/仓库名.git
   git push -u openclaw-multi-agent-rd main
   ```

## 方式二：使用 GitHub CLI（需本机可访问 GitHub）

若你本机 `gh auth login` 已登录且无 TLS 问题：

```bash
cd ~/.openclaw
gh repo create 仓库名 --public --source=. --remote=openclaw-multi-agent-rd --description "OpenClaw 多 Agent 产研协作" --push
```

## 若 SSH 报 `Permission denied (publickey)`

说明 GitHub 没有认可当前用的 SSH 公钥。在本机终端依次执行：

**1. 看本机有没有密钥、有没有被 ssh-agent 加载：**
```bash
ls -la ~/.ssh
ssh-add -l
```

**2. 若有 `id_ed25519` 或 `id_rsa` 但 `ssh-add -l` 为空，先加载默认密钥：**
```bash
ssh-add ~/.ssh/id_ed25519
# 没有 id_ed25519 再试：
# ssh-add ~/.ssh/id_rsa
```

**3. 测试能否连上 GitHub：**
```bash
ssh -T git@github.com
```
若成功会提示：`Hi 你的用户名! You've successfully authenticated...`

**4. 再推送：**
```bash
cd ~/.openclaw
git push -u openclaw-multi-agent-rd main
```

若本机还没有 SSH 密钥，或 GitHub 上没有添加公钥，需要：
- 生成密钥：`ssh-keygen -t ed25519 -C "你的邮箱" -f ~/.ssh/id_ed25519 -N ""`
- 把 `~/.ssh/id_ed25519.pub` 的内容复制到 GitHub：Settings → SSH and GPG keys → New SSH key

---

## 说明

- 可将 `openclaw-multi-agent-rd` 换成你习惯的远程名；推送后在该远程对应的 GitHub 仓库查看代码。
- 敏感文件（`openclaw.json`、`logs/`、`identity/` 等）已由 `.gitignore` 排除，不会推送。详见 `PUSH_RULES.md`。
