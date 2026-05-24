#!/bin/bash

echo "=========================================="
echo "  Railway 环境变量配置助手"
echo "=========================================="
echo ""

RAILWAY_CLI="/Users/apple/.npm-global/lib/node_modules/@railway/cli/bin/railway"
PROJECT_ID="31731f78-7564-48c5-8e58-58c0f5b328ab"
ENV_ID="ef158f1e-932d-4ef6-987c-cc9842db4793"
SERVICE_ID="bb1ee29b-6858-4b69-bbcf-cec497ebdd44"

# 检查 Railway CLI
if [ ! -f "$RAILWAY_CLI" ]; then
  echo "❌ 错误: Railway CLI 未安装"
  exit 1
fi

# 获取 Railway Token
echo "📋 步骤 1: 获取 Railway API Token"
echo ""
echo "请按以下步骤操作:"
echo "1. 在浏览器中访问: https://railway.app/account/tokens"
echo "2. 点击 'Create Token'"
echo "3. 输入 Token 名称"
echo "4. 复制生成的 Token"
echo ""
read -p "请粘贴 Railway API Token: " RAILWAY_TOKEN

if [ -z "$RAILWAY_TOKEN" ]; then
  echo "❌ 错误: 未提供 Token"
  exit 1
fi

export RAILWAY_TOKEN="$RAILWAY_TOKEN"
echo ""

# 验证 Token
echo "🔐 步骤 2: 验证 Token"
if ! $RAILWAY_CLI whoami; then
  echo "❌ Token 无效"
  exit 1
fi
echo ""

# 链接项目
echo "🔗 步骤 3: 链接项目"
$RAILWAY_CLI link \
  --project "$PROJECT_ID" \
  --environment "$ENV_ID" \
  --service "$SERVICE_ID"
echo ""

# 查看当前变量
echo "📊 步骤 4: 当前环境变量"
$RAILWAY_CLI variables
echo ""

# 生成 NEXTAUTH_SECRET
echo "🔑 步骤 5: 生成 NEXTAUTH_SECRET"
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "生成的密钥: $NEXTAUTH_SECRET"
echo ""

# 设置环境变量
echo "⚙️  步骤 6: 设置环境变量"
$RAILWAY_CLI variables set NODE_ENV=production
$RAILWAY_CLI variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
$RAILWAY_CLI variables set NEXTAUTH_URL="https://uczm-production.up.railway.app"
$RAILWAY_CLI variables set NEXT_PUBLIC_APP_URL="https://uczm-production.up.railway.app"
echo ""

# 确认变量
echo "✅ 步骤 7: 确认环境变量"
$RAILWAY_CLI variables
echo ""

# 触发重新部署
echo "🚀 步骤 8: 触发重新部署"
$RAILWAY_CLI redeploy
echo ""

# 等待部署
echo "⏳ 步骤 9: 等待部署完成"
echo "这可能需要 2-5 分钟..."
echo ""

# 监控部署状态
MAX_WAIT=300
ELAPSED=0
INTERVAL=30

while [ $ELAPSED -lt $MAX_WAIT ]; do
  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))
  
  HTTP_CODE=$(curl -s "https://uczm-production.up.railway.app" -o /dev/null -w "%{http_code}" 2>/dev/null || echo "000")
  
  echo "[$ELAPSED 秒] HTTP 状态码: $HTTP_CODE"
  
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
done

echo ""
echo "⚠️  部署可能仍在进行中"
echo "请运行以下命令查看日志:"
echo "$RAILWAY_CLI logs --limit 100"
echo ""
echo "或访问 Railway 控制台:"
echo "https://railway.com/project/$PROJECT_ID?environmentId=$ENV_ID"
