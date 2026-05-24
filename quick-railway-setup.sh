#!/bin/bash
echo "=========================================="
echo "  Railway 快速配置"
echo "=========================================="
echo ""

# 检查是否提供了 Token 作为参数
if [ -n "$1" ]; then
  RAILWAY_TOKEN="$1"
else
  echo "请访问 https://railway.app/account/tokens 获取 Token"
  echo ""
  read -p "请粘贴 Railway API Token: " RAILWAY_TOKEN
fi

if [ -z "$RAILWAY_TOKEN" ]; then
  echo "❌ 错误: 未提供 Token"
  echo ""
  echo "使用方式:"
  echo "  ./quick-railway-setup.sh <你的Token>"
  echo ""
  echo "或者运行脚本后手动输入 Token"
  exit 1
fi

export RAILWAY_TOKEN="$RAILWAY_TOKEN"

RAILWAY_CLI="/Users/apple/.npm-global/lib/node_modules/@railway/cli/bin/railway"

echo ""
echo "🔐 验证 Token..."
if ! $RAILWAY_CLI whoami; then
  echo "❌ Token 无效"
  exit 1
fi

echo ""
echo "🔗 链接项目..."
$RAILWAY_CLI link \
  --project "31731f78-7564-48c5-8e58-58c0f5b328ab" \
  --environment "ef158f1e-932d-4ef6-987c-cc9842db4793" \
  --service "bb1ee29b-6858-4b69-bbcf-cec497ebdd44"

echo ""
echo "🔑 生成 NEXTAUTH_SECRET..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "生成的密钥: $NEXTAUTH_SECRET"

echo ""
echo "⚙️  设置环境变量..."
$RAILWAY_CLI variables set NODE_ENV=production
$RAILWAY_CLI variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
$RAILWAY_CLI variables set NEXTAUTH_URL="https://uczm-production.up.railway.app"
$RAILWAY_CLI variables set NEXT_PUBLIC_APP_URL="https://uczm-production.up.railway.app"

echo ""
echo "📊 当前环境变量:"
$RAILWAY_CLI variables

echo ""
echo "🚀 触发重新部署..."
$RAILWAY_CLI redeploy

echo ""
echo "⏳ 等待部署完成（约 2-5 分钟）..."
sleep 30

# 检查部署状态
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  HTTP_CODE=$(curl -s "https://uczm-production.up.railway.app" -o /dev/null -w "%{http_code}" 2>/dev/null || echo "000")
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo ""
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
    sleep 30
  fi
done

echo ""
echo "⚠️  部署可能仍在进行中"
echo "请访问 Railway 控制台查看状态:"
echo "https://railway.com/project/31731f78-7564-48c5-8e58-58c0f5b328ab"
