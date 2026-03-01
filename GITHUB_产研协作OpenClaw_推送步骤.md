# 将本仓库推送到 GitHub 新项目「产研协作OpenClaw」

本地已提交最新代码。

## 若 HTTPS 连不上（443 超时）

本机若无法访问 `github.com:443`，可改用 **SSH**（走 22 端口，用你已配置的 GitHub key）：

```bash
cd ~/.openclaw
git remote set-url prod-research git@github.com:hebi123/产研协作OpenClaw.git
# 若仓库名是英文：
# git remote set-url prod-research git@github.com:hebi123/openclaw-product-research.git
git push -u prod-research main
```

## 方式一：网页创建仓库后推送（推荐）

1. **在 GitHub 新建仓库**
   - 打开 https://github.com/new
   - **Repository name** 填：`产研协作OpenClaw`（或英文名如 `openclaw-product-research`）
   - 选择 **Public**，**不要**勾选 “Add a README” / “Add .gitignore”
   - 点击 **Create repository**

2. **在本地添加远程并推送**（将 `你的用户名` 换成你的 GitHub 用户名）：
   ```bash
   cd ~/.openclaw
   git remote add prod-research https://github.com/你的用户名/产研协作OpenClaw.git
   git push -u prod-research main
   ```
   若仓库名为英文（如 `openclaw-product-research`）：
   ```bash
   git remote add prod-research https://github.com/你的用户名/openclaw-product-research.git
   git push -u prod-research main
   ```

## 方式二：使用 GitHub CLI（需本机可访问 GitHub）

若你本机 `gh auth login` 已登录且无 TLS 问题：

```bash
cd ~/.openclaw
gh repo create 产研协作OpenClaw --public --source=. --remote=prod-research --description "产研协作多 Agent OpenClaw 配置与四 Agent 流程" --push
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
若成功会提示：`Hi hebi123! You've successfully authenticated...`

**4. 再推送：**
```bash
cd ~/.openclaw
git push -u prod-research main
```

若本机还没有 SSH 密钥，或 GitHub 上没有添加公钥，需要：
- 生成密钥：`ssh-keygen -t ed25519 -C "你的邮箱" -f ~/.ssh/id_ed25519`
- 把 `~/.ssh/id_ed25519.pub` 的内容复制到 GitHub：Settings → SSH and GPG keys → New SSH key

---

## 说明

- 当前 `origin` 仍指向你原来的仓库（如 `hebi123/-openclaw`），未做修改。
- 新仓库只添加为 `prod-research`，推送后可在 GitHub 上看到项目「产研协作OpenClaw」。
- 敏感文件（`openclaw.json`、`logs/`、`identity/` 等）已由 `.gitignore` 排除，不会推送。
