#!/bin/bash
echo "=========================================="
echo "  Git 历史凭据清理"
echo "=========================================="
echo ""

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ 错误: 有未提交的更改，请先提交或暂存"
  exit 1
fi

echo "⚠️  警告: 此操作将重写 Git 历史"
echo "这会改变所有提交的 SHA"
echo ""
read -p "是否继续? (y/N): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "已取消"
  exit 0
fi

echo ""
echo "🔍 步骤 1: 识别敏感信息..."

# 数据库密码
DB_PASSWORD="QjkfMTJyulyYqZFqYJaBhyFVnFEEyrIX"

echo "发现的敏感信息:"
echo "- 数据库密码: $DB_PASSWORD"
echo ""

echo "🧹 步骤 2: 清理 Git 历史..."

# 使用 git filter-branch 清理
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.production .env.local 2>/dev/null || true" \
  --prune-empty --tag-name-filter cat -- --all

# 替换敏感信息
git filter-branch --force --tree-filter "
  find . -type f -name '*.md' -o -name '*.txt' -o -name '*.json' -o -name '*.ts' -o -name '*.tsx' | \
  xargs sed -i '' 's/$DB_PASSWORD/[REDACTED]/g' 2>/dev/null || true
" --prune-empty --tag-name-filter cat -- --all

echo ""
echo "📦 步骤 3: 清理引用..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "✅ 步骤 4: 验证清理结果..."
echo "检查是否还有敏感信息..."
git log --all -p | grep -i "QjkfMTJyulyYqZFqYJaBhyFVnFEEyrIX" | wc -l

echo ""
echo "=========================================="
echo "  清理完成"
echo "=========================================="
echo ""
echo "⚠️  重要提示:"
echo "1. 数据库密码已从历史中移除"
echo "2. 所有提交 SHA 已改变"
echo "3. 需要强制推送到远程仓库"
echo ""
echo "运行以下命令推送更改:"
echo "  git push origin main --force"
echo ""
echo "⚠️  警告: 强制推送会覆盖远程历史"
echo "确保所有协作者已知晓"
