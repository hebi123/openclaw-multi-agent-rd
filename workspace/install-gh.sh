#!/bin/bash
# 方式二：安装 GitHub CLI (gh) 到 ~/bin，不依赖 Homebrew
set -e
GH_VERSION="2.87.2"
GH_URL="https://github.com/cli/cli/releases/download/v${GH_VERSION}/gh_${GH_VERSION}_macOS_amd64.zip"
mkdir -p "$HOME/bin"
echo "Downloading gh ${GH_VERSION} (macOS Intel)..."
curl -sSL -o /tmp/gh.zip "$GH_URL"
echo "Extracting..."
unzip -o /tmp/gh.zip -d /tmp/gh_extract
cp "/tmp/gh_extract/gh_${GH_VERSION}_macOS_amd64/bin/gh" "$HOME/bin/gh"
chmod +x "$HOME/bin/gh"
rm -rf /tmp/gh.zip /tmp/gh_extract
echo "Installed: $HOME/bin/gh"
"$HOME/bin/gh" --version

# 把 ~/bin 加入 PATH（若尚未加入）
if ! grep -q 'export PATH="$HOME/bin:$PATH"' "$HOME/.zshrc" 2>/dev/null; then
  echo '' >> "$HOME/.zshrc"
  echo '# GitHub CLI (gh)' >> "$HOME/.zshrc"
  echo 'export PATH="$HOME/bin:$PATH"' >> "$HOME/.zshrc"
  echo "Added \$HOME/bin to PATH in ~/.zshrc"
fi
echo ''
echo "下一步：执行下面命令使 PATH 生效，然后登录 GitHub："
echo "  source ~/.zshrc"
echo "  gh auth login"
