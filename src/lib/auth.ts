import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// 登录限流存储（生产环境应使用 Redis）
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15分钟

function checkLoginRateLimit(email: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(email);
  if (attempt && attempt.resetAt > now && attempt.count >= MAX_LOGIN_ATTEMPTS) {
    return false; // 被锁
  }
  return true;
}

function recordLoginAttempt(email: string) {
  const now = Date.now();
  const attempt = loginAttempts.get(email);
  if (attempt && attempt.resetAt > now) {
    attempt.count++;
  } else {
    loginAttempts.set(email, { count: 1, resetAt: now + LOCKOUT_DURATION });
  }
}

function resetLoginAttempts(email: string) {
  loginAttempts.delete(email);
}

// 扩展 JWT 和 Session 类型
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "SUPER_ADMIN" | "COUNTY_AGENT" | "STATION_MASTER";
      stationId: string | null;
      agentId: string | null;
      status: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "SUPER_ADMIN" | "COUNTY_AGENT" | "STATION_MASTER";
    stationId: string | null;
    agentId: string | null;
    userId: string;
    status: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // 登录限流检查
        if (!checkLoginRateLimit(credentials.email)) {
          throw new Error("登录尝试过于频繁，请15分钟后再试");
        }

        // 支持邮箱或手机号登录
        const account = credentials.email;
        const isPhone = /^1[3-9]\d{9}$/.test(account);

        const user = await prisma.user.findFirst({
          where: isPhone
            ? { phone: account }
            : { email: account },
          include: {
            station: true,
            agent: true,
          },
        });

        if (!user || user.status === "DISABLED") {
          recordLoginAttempt(credentials.email);
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          recordLoginAttempt(credentials.email);
          return null;
        }

        // 登录成功，清除限流记录
        resetLoginAttempts(credentials.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          stationId: user.station?.id || null,
          agentId: user.agent?.id || null,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as {
          role: "SUPER_ADMIN" | "COUNTY_AGENT" | "STATION_MASTER";
          stationId: string | null;
          agentId: string | null;
          status?: string;
        };
        token.role = u.role;
        token.stationId = u.stationId;
        token.agentId = u.agentId;
        token.userId = user.id as string;
        token.status = u.status || "ACTIVE";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.stationId = token.stationId;
        session.user.agentId = token.agentId;
        session.user.status = token.status;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
