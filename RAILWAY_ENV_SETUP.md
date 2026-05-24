# Railway 环境变量配置指南

## 问题诊断

部署失败原因：缺少必需的环境变量

## 快速配置步骤

### 步骤 1：打开 Railway 控制台

访问以下链接：
https://railway.com/project/31731f78-7564-48c5-8e58-58c0f5b328ab?environmentId=ef158f1e-932d-4ef6-987c-cc9842db4793

### 步骤 2：设置环境变量

在 Railway 控制台中，点击 "Variables" 标签，添加以下环境变量：

```
NODE_ENV=production
NEXTAUTH_SECRET=<运行命令生成>
NEXTAUTH_URL=https://uczm-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://uczm-production.up.railway.app
DATABASE_URL=<Railway PostgreSQL 自动提供>
```

### 步骤 3：生成 NEXTAUTH_SECRET

在终端运行：
```bash
openssl rand -base64 32
```

### 步骤 4：重新部署

设置完环境变量后，在 Railway 控制台点击 "Redeploy" 按钮

## 自动化配置（推荐）

运行以下脚本自动完成配置：

```bash
./railway-setup-complete.sh
```

## 验证部署

配置完成后，访问：
https://uczm-production.up.railway.app

## 常见问题

### 1. 仍然返回 502 错误

检查 Railway 日志：
- 在控制台点击 "Logs" 标签
- 查看错误信息

### 2. 数据库连接失败

确保 DATABASE_URL 已正确设置：
- Railway PostgreSQL 服务会自动注入此变量
- 如果手动设置，格式为：`postgresql://user:password@host:port/database`

### 3. NextAuth 错误

确保以下变量已设置：
- NEXTAUTH_SECRET（随机生成的密钥）
- NEXTAUTH_URL（应用的完整 URL）

## 联系支持

如果问题仍然存在：
1. 检查 Railway 状态页面：https://status.railway.app
2. 查看 Railway 文档：https://docs.railway.app
3. 联系 Railway 支持
