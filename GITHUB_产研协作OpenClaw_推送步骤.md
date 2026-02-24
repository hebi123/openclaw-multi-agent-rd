# 将本仓库推送到 GitHub 新项目「产研协作OpenClaw」

本地已提交最新代码。因本机 `gh` 访问 GitHub 时 TLS 校验失败，请在你本机按下面任选一种方式完成建仓与推送。

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
gh repo create 产研协作OpenClaw --public --source=. --remote=prod-research --description "产研协作多角色 OpenClaw 配置与四角色流程" --push
```

## 说明

- 当前 `origin` 仍指向你原来的仓库（如 `hebi123/-openclaw`），未做修改。
- 新仓库只添加为 `prod-research`，推送后可在 GitHub 上看到项目「产研协作OpenClaw」。
- 敏感文件（`openclaw.json`、`logs/`、`identity/` 等）已由 `.gitignore` 排除，不会推送。
