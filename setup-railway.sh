#!/bin/bash
echo "=== Railway 配置脚本 ==="
echo ""

# 1. 登录 Railway
echo "步骤 1: 登录 Railway"
/Users/apple/.npm-global/lib/node_modules/@railway/cli/bin/railway login --browserless
echo ""

# 2. 检查登录状态
echo "步骤 2: 检查登录状态"
/Users/apple/.npm-global/lib/node_modules/@railway/cli/bin/railway whoami
echo ""

# 3. 链接项目
echo "步骤 3: 链接项目"
/Users/apple/.npm-global/lib/node_modules/@railway/cli/bin/railway link
echo ""

# 4. 查看当前变量
echo "步骤 4: 查看当前环境变量"
/Users/apple/.npm-global/lib/node_modules/@railway/cli/bin/railway variables
echo ""

# 5. 设置必需的环境变量
echo "步骤 5: 设置环境变量"
read -p "请输入 NEXTAUTH_SECRET (留空跳过): " NEXTAUTH_SECRET
if [ -n "$NEXTAUTH_SECRET" ]; then
  /Users/apple/.npm-global/lib/node_modules/@railway/cli/bin/railway variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
fi

/Users/apple/.npm-global/lib/node_modules/@railway/cli/bin/railway variables set NODE_ENV=production
echo ""

# 6. 查看部署日志
echo "步骤 6: 查看最新部署日志"
/Users/apple/.npm-global/lib/node_modules/@railway/cli/bin/railway logs --limit 50
echo ""

# 7. 检查部署状态
echo "步骤 7: 检查部署状态"
curl -s "https://uczm-production.up.railway.app" -o /dev/null -w "HTTP状态码: %{http_code}\n"
echo ""

echo "=== 配置完成 ==="
