import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "COUNTY_AGENT" | "STATION_MASTER";
  stationId: string | null;
  agentId: string | null;
};

/**
 * 在 API Route Handler 中获取当前认证用户
 * 如果未登录返回 401 NextResponse
 */
export async function getAuthUser(): Promise<{
  user: AuthUser | null;
  error: NextResponse | null;
}> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      user: null,
      error: NextResponse.json({ error: "请先登录" }, { status: 401 }),
    };
  }

  const su = session.user;

  // 验证用户状态
  if (su.status === "DISABLED") {
    return {
      user: null,
      error: NextResponse.json({ error: "账号已被禁用" }, { status: 403 }),
    };
  }

  return {
    user: {
      id: su.id,
      email: su.email,
      name: su.name,
      role: su.role,
      stationId: su.stationId ?? null,
      agentId: su.agentId ?? null,
    },
    error: null,
  };
}

/** 仅允许 SUPER_ADMIN */
export async function requireAdmin() {
  const { user, error } = await getAuthUser();
  if (error) return { user: null, error };
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "未登录" }, { status: 401 }),
    };
  }
  if (user.role !== "SUPER_ADMIN") {
    return {
      user: null,
      error: NextResponse.json({ error: "需要管理员权限" }, { status: 403 }),
    };
  }
  return { user, error: null };
}

/** 允许 SUPER_ADMIN 或 COUNTY_AGENT */
export async function requireAgentOrAdmin() {
  const { user, error } = await getAuthUser();
  if (error) return { user: null, error };
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "未登录" }, { status: 401 }),
    };
  }
  if (user.role !== "COUNTY_AGENT" && user.role !== "SUPER_ADMIN") {
    return {
      user: null,
      error: NextResponse.json({ error: "需要代理权限" }, { status: 403 }),
    };
  }
  return { user, error: null };
}

/** 允许 STATION_MASTER 或 SUPER_ADMIN */
export async function requireStationMaster() {
  const { user, error } = await getAuthUser();
  if (error) return { user: null, error };
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "未登录" }, { status: 401 }),
    };
  }
  if (user.role !== "STATION_MASTER" && user.role !== "SUPER_ADMIN") {
    return {
      user: null,
      error: NextResponse.json({ error: "需要站长权限" }, { status: 403 }),
    };
  }
  return { user, error: null };
}
