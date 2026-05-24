#!/bin/bash
echo "=== Railway 部署诊断脚本 ==="
echo ""

RAILWAY_CLI="/Users/apple/.npm-global/lib/node_modules/@railway/cli/bin/railway"

# 检查本地构建
echo "1. 检查本地构建..."
if npm run build > /dev/null 2>&1; then
  echo "✅ 本地构建成功"
else
  echo "❌ 本地构建失败"
  exit 1
fi
echo ""

# 检查必需的环境变量
echo "2. 检查必需环境变量..."
REQUIRED_VARS=(
  "DATABASE_URL"
  "NEXTAUTH_SECRET"
  "NEXTAUTH_URL"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
    echo "⚠️  缺少: $var"
  else
    echo "✅ 已设置: $var"
  fi
done
echo ""

# 检查数据库连接
echo "3. 检查数据库连接..."
if [ -n "$DATABASE_URL" ]; then
  if npx prisma db pull > /dev/null 2>&1; then
    echo "✅ 数据库连接成功"
  else
    echo "❌ 数据库连接失败"
  fi
else
  echo "⚠️  未设置 DATABASE_URL"
fi
echo ""

# 生成随机 NEXTAUTH_SECRET
echo "4. 生成 NEXTAUTH_SECRET..."
NEW_SECRET=$(openssl rand -base64 32)
echo "生成的密钥: $NEW_SECRET"
echo ""

# 创建 Railway 配置命令
echo "5. Railway 配置命令..."
echo "请运行以下命令:"
echo ""
echo "export RAILWAY_TOKEN=<你的 Railway API Token>"
echo "$RAILWAY_CLI link --project 31731f78-7564-48c5-8e58-58c0f5b328ab --environment ef158f1e-932d-4ef6-987c-cc9842db4793 --service bb1ee29b-6858-4b69-bbcf-cec497ebdd44"
echo "$RAILWAY_CLI variables set NODE_ENV=production"
echo "$RAILWAY_CLI variables set NEXTAUTH_SECRET=\"$NEW_SECRET\""
echo "$RAILWAY_CLI logs --limit 100"
echo ""

# 快速测试
echo "6. 快速部署测试..."
echo "如果 Railway 已配置，可以运行:"
echo "$RAILWAY_CLI up"
echo ""

echo "=== 诊断完成 ==="
