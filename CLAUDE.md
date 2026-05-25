# Next.js 全栈

## META
- agent: claude-code
- scenario: standard
- tier: standard
- generated: 2026-05-05
- scale_version: 10.0
- doc: CLAUDE.md

## COMMANDS
dev: pnpm dev
build: pnpm build
test: pnpm test
lint: pnpm lint
typecheck: pnpm tsc --noEmit

## TECH_STACK
- Next.js
- React
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL

## CODE_RULES
[ENFORCED] 禁止使用 any 类型
[GUIDE] 优先使用 interface，type 用于联合/交叉类型
[ENFORCED] 组件使用函数式组件 + Hooks
[GUIDE] UI 组件优先使用 shadcn/ui
[ENFORCED] 使用 App Router，禁止 Pages Router
[ENFORCED] 客户端组件标记 use client
[GUIDE] 样式使用 Tailwind 工具类，禁止内联 style
[ENFORCED] 数据库操作使用 Prisma Client，禁止原始 SQL
[ENFORCED] 禁止空 catch 块
[ENFORCED] 禁止硬编码密钥

## ARCH_CONSTRAINTS
[ENFORCED] App Router → src/app/ 目录，路由即文件系统
[ENFORCED] Server Components 默认，客户端组件显式标记 use client
[GUIDE] API 路由放 src/app/api/，使用 Route Handlers
[ENFORCED] Schema 定义在 prisma/schema.prisma，变更必须有 down 方法
[GUIDE] 数据库客户端通过 @/lib/db 统一导出，禁止多处实例化

## WORKFLOW
- tier: standard | mode: standard
- step_1: 探索 → 读本文档 + 扫代码 + 找技能 + 矛盾分析
- step_2: 规划 → 需求精炼 + 影响分析 + 契约定义
- step_3: 执行 → TDD(RED→GREEN→REFACTOR)，禁止同时写代码和测试
- step_4: 验证 → lint全绿 + test全过 + typecheck无错，工具验证不可脑补
- step_5: 沉淀 → 泛化检查 + 经验文档化 + AI Slop自检

## GATES
- G1: 探索完成 → 已读文件数 >= 3
- G2: 规划完成 → 计划文档含功能边界+异常契约+回滚方案
- G3: TDD合规 → 测试文件先于实现文件存在
- G4: Lint通过 → pnpm lint exit code = 0
- G5: 测试通过 → pnpm test exit code = 0
- G6: 类型通过 → pnpm tsc --noEmit exit code = 0

## SKILLS
- graphify: Graphify → 安装: `pip install graphifyy && graphify install`
- systematic-debugging: Systematic Debugging (Superpowers) → 安装: `参照 https://github.com/obra/superpowers 仓库 README 安装`
- deep-interview: Deep Interview (OMC) → 安装: `参照 https://github.com/Yeachan-Heo/oh-my-claudecode 仓库 README 安装`
- brainstorming: Brainstorming (Superpowers) → 安装: `参照 https://github.com/obra/superpowers 仓库 README 安装`
- ralplan: Ralplan (OMC) → 安装: `参照 https://github.com/Yeachan-Heo/oh-my-claudecode 仓库 README 安装`
- autopilot: Autopilot (OMC) → 安装: `参照 https://github.com/Yeachan-Heo/oh-my-claudecode 仓库 README 安装`
- freeze-guard: Freeze Guard (gstack) → 安装: `参照 https://github.com/garrytan/gstack 仓库 README 安装`
- ce-work: CE Work → 安装: `参照 https://github.com/everydotdev/compound-engineering 仓库 README 安装`
- tdd: TDD (Superpowers) → 安装: `参照 https://github.com/obra/superpowers 仓库 README 安装`
- verification: Verification (Superpowers) → 安装: `参照 https://github.com/obra/superpowers 仓库 README 安装`
- ultraqa: UltraQA (OMC) → 安装: `参照 https://github.com/Yeachan-Heo/oh-my-claudecode 仓库 README 安装`
- qa: QA (gstack) → 安装: `参照 https://github.com/garrytan/gstack 仓库 README 安装`
- review: Review (gstack) → 安装: `参照 https://github.com/garrytan/gstack 仓库 README 安装`
- investigate: Investigate (gstack) → 安装: `参照 https://github.com/garrytan/gstack 仓库 README 安装`
- cso: CSO (gstack) → 安装: `参照 https://github.com/garrytan/gstack 仓库 README 安装`
- ce-compound: CE Compound → 安装: `参照 https://github.com/everydotdev/compound-engineering 仓库 README 安装`
- ship: Ship (gstack) → 安装: `参照 https://github.com/garrytan/gstack 仓库 README 安装`
- land-and-deploy: Land and Deploy (gstack) → 安装: `参照 https://github.com/garrytan/gstack 仓库 README 安装`
- canary: Canary (gstack) → 安装: `参照 https://github.com/garrytan/gstack 仓库 README 安装`
- benchmark: Benchmark (gstack) → 安装: `参照 https://github.com/garrytan/gstack 仓库 README 安装`
- mcp-memory: Memory MCP → 安装: `claude mcp add memory -- npx -y @modelcontextprotocol/server-memory`
- mcp-fetch: Fetch MCP → 安装: `claude mcp add fetch -- npx -y @modelcontextprotocol/server-fetch`
- mcp-sequential-thinking: Sequential Thinking MCP → 安装: `claude mcp add sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking`
- mcp-playwright: Playwright MCP → 安装: `claude mcp add playwright -- npx -y @playwright/mcp`
- mcp-context7: Context7 MCP → 安装: `claude mcp add context7 -- npx -y @upstash/context7-mcp`
- mcp-figma: Figma MCP → 安装: `参照 Figma 官方 MCP 集成文档安装`
- mcp-github: GitHub MCP → 安装: `参照 GitHub 官方 MCP 服务器文档安装`
- mcp-supabase: Supabase MCP → 安装: `参照 Supabase 官方 MCP 集成文档安装`
- mcp-sentry: Sentry MCP → 安装: `参照 Sentry 官方 MCP 集成文档安装`
- mcp-slack: Slack MCP → 安装: `参照 Slack 官方 MCP 集成文档安装`
- mcp-postgres: PostgreSQL MCP → 安装: `claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres`
- mcp-docker: Docker MCP → 安装: `参照 Docker MCP 服务器官方文档安装`
- cli-gh: GitHub CLI (gh) → 安装: `brew install gh && gh auth login`
- cli-jq: jq → 安装: `brew install jq`
- cli-ripgrep: ripgrep (rg) → 安装: `brew install ripgrep`
- cli-aws: AWS CLI → 安装: `brew install awscli && aws configure`
- cli-sentry: Sentry CLI → 安装: `brew install sentry-cli && sentry-cli login`
- web-access: web-access → 安装: `git clone --depth 1 https://github.com/eze-is/web-access.git ~/.claude/skills/web-access`
- awesome-design-md: awesome-design-md → 安装: `git clone --depth 1 https://github.com/VoltAgent/awesome-design-md.git ~/.claude/skills/awesome-design-md`
- ui-ux-pro-max-skill: ui-ux-pro-max-skill → 安装: `git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git ~/.claude/skills/ui-ux-pro-max`

## RED_LINES
- R1: 零数据丢失 → migration必须有down方法
- R2: 零静默失败 → 禁止空catch块
- R3: 零硬编码密钥 → 敏感信息走环境变量
- R4: 零幻觉 → 不确定标[UNCERTAIN]
- R5: 零甩锅 → 声称"环境问题"前必须验证