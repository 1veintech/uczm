#!/bin/bash
set -e

echo "=========================================="
echo "  Railway 完整配置和部署脚本"
echo "=========================================="
echo ""

RAILWAY_CLI="/Users/apple/.npm-global/lib/node_modules/@railway/cli/bin/railway"

# 步骤 1: 获取 Railway Token
echo "📋 步骤 1: 获取 Railway API Token"
echo ""
echo "请按以下步骤操作:"
echo "1. 打开浏览器访问: https://railway.app/account/tokens"
echo "2. 点击 'Create Token'"
echo "3. 输入 Token 名称 (例如: deploy-script)"
echo "4. 复制生成的 Token"
echo ""
read -p "请粘贴 Railway API Token: " RAILWAY_TOKEN

if [ -z "$RAILWAY_TOKEN" ]; then
  echo "❌ 错误: 未提供 Token"
  exit 1
fi

export RAILWAY_TOKEN="$RAILWAY_TOKEN"
echo ""

# 步骤 2: 验证 Token
echo "🔐 步骤 2: 验证 Token"
if ! $RAILWAY_CLI whoami; then
  echo "❌ Token 无效，请重新获取"
  exit 1
fi
echo ""

# 步骤 3: 链接项目
echo "🔗 步骤 3: 链接 Railway 项目"
$RAILWAY_CLI link \
  --project "31731f78-7564-48c5-8e58-58c0f5b328ab" \
  --environment "ef158f1e-932d-4ef6-987c-cc9842db4793" \
  --service "bb1ee29b-6858-4b69-bbcf-cec497ebdd44"
echo ""

# 步骤 4: 设置环境变量
echo "⚙️  步骤 4: 设置环境变量"

# 生成 NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "生成 NEXTAUTH_SECRET: $NEXTAUTH_SECRET"

# 设置所有必需的环境变量
$RAILWAY_CLI variables set NODE_ENV=production
$RAILWAY_CLI variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
$RAILWAY_CLI variables set NEXTAUTH_URL="https://uczm-production.up.railway.app"
$RAILWAY_CLI variables set NEXT_PUBLIC_APP_URL="https://uczm-production.up.railway.app"

echo ""
echo "✅ 环境变量已设置"
echo ""

# 步骤 5: 查看当前变量
echo "📊 步骤 5: 当前环境变量"
$RAILWAY_CLI variables
echo ""

# 步骤 6: 触发部署
echo "🚀 步骤 6: 触发部署"
echo "正在重新部署..."
$RAILWAY_CLI up --detach
echo ""

# 步骤 7: 等待部署
echo "⏳ 步骤 7: 等待部署完成"
echo "等待 60 秒..."
sleep 60

# 步骤 8: 验证部署
echo "✅ 步骤 8: 验证部署"
echo ""

MAX_RETRIES=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  HTTP_CODE=$(curl -s "https://uczm-production.up.railway.app" -o /dev/null -w "%{http_code}" 2>/dev/null || echo "000")
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo "🎉 部署成功!"
    echo ""
    echo "=========================================="
    echo "  部署信息"
    echo "=========================================="
    echo "应用地址: https://uczm-production.up.railway.app"
    echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
    echo ""
    echo "请保存以上信息!"
    echo "=========================================="
    exit 0
  fi
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "尝试 $RETRY_COUNT/$MAX_RETRIES: HTTP $HTTP_CODE"
  
  if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
    echo "等待 30 秒后重试..."
    sleep 30
  fi
done

echo ""
echo "⚠️  部署可能仍在进行中"
echo "请运行以下命令查看日志:"
echo "$RAILWAY_CLI logs --limit 100"
echo ""
echo "或访问 Railway 控制台:"
echo "https://railway.app/project/31731f78-7564-48c5-8e58-58c0f5b328ab"
