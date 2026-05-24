#!/bin/bash
echo "=== Railway 部署和配置脚本 ==="
echo ""
echo "请访问 https://railway.app/account/tokens 获取 API Token"
echo ""
read -p "请输入 Railway API Token: " RAILWAY_TOKEN

if [ -z "$RAILWAY_TOKEN" ]; then
  echo "错误: 未提供 Token"
  exit 1
fi

# 设置环境变量
export RAILWAY_TOKEN="$RAILWAY_TOKEN"

RAILWAY_CLI="/Users/apple/.npm-global/lib/node_modules/@railway/cli/bin/railway"

echo ""
echo "步骤 1: 验证 Token"
$RAILWAY_CLI whoami
if [ $? -ne 0 ]; then
  echo "错误: Token 无效"
  exit 1
fi
echo ""

echo "步骤 2: 链接项目"
$RAILWAY_CLI link \
  --project "31731f78-7564-48c5-8e58-58c0f5b328ab" \
  --environment "ef158f1e-932d-4ef6-987c-cc9842db4793" \
  --service "bb1ee29b-6858-4b69-bbcf-cec497ebdd44"
echo ""

echo "步骤 3: 查看当前变量"
$RAILWAY_CLI variables
echo ""

echo "步骤 4: 设置环境变量"
$RAILWAY_CLI variables set NODE_ENV=production
read -p "请输入 NEXTAUTH_SECRET (留空跳过): " NEXTAUTH_SECRET
if [ -n "$NEXTAUTH_SECRET" ]; then
  $RAILWAY_CLI variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
fi
echo ""

echo "步骤 5: 查看部署日志"
$RAILWAY_CLI logs --limit 100
echo ""

echo "步骤 6: 检查部署状态"
echo "等待 30 秒..."
sleep 30
HTTP_CODE=$(curl -s "https://uczm-production.up.railway.app" -o /dev/null -w "%{http_code}")
echo "HTTP 状态码: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ 部署成功!"
  echo "访问地址: https://uczm-production.up.railway.app"
else
  echo "❌ 部署可能失败，请查看日志"
fi

echo ""
echo "=== 完成 ==="
