import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 密码强度校验规则 */
export const passwordSchema = z
  .string()
  .min(8, "密码至少8位")
  .regex(/[A-Z]/, "密码需包含大写字母")
  .regex(/[a-z]/, "密码需包含小写字母")
  .regex(/[0-9]/, "密码需包含数字");

export function validatePassword(password: string): { valid: boolean; message?: string } {
  const result = passwordSchema.safeParse(password);
  if (!result.success) {
    return { valid: false, message: result.error.issues[0]?.message || "密码不符合要求" };
  }
  return { valid: true };
}
