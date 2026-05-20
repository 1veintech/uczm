// 验证码存储（生产环境应使用 Redis）
const codeStore = new Map<string, { code: string; expiresAt: number }>();

// 清理过期验证码
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of codeStore) {
    if (value.expiresAt < now) {
      codeStore.delete(key);
    }
  }
}, 60000);

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function saveCode(phone: string, code: string) {
  codeStore.set(phone, {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5分钟过期
  });
}

export function verifyCode(phone: string, code: string): boolean {
  const stored = codeStore.get(phone);
  if (!stored) return false;
  if (stored.expiresAt < Date.now()) {
    codeStore.delete(phone);
    return false;
  }
  codeStore.delete(phone); // 验证后删除
  return stored.code === code;
}

export async function sendSMS(phone: string, code: string): Promise<boolean> {
  const secretId = process.env.TENCENT_SECRET_ID;
  const secretKey = process.env.TENCENT_SECRET_KEY;
  const smsSdkAppId = process.env.TENCENT_SMS_SDK_APP_ID;
  const templateId = process.env.TENCENT_SMS_TEMPLATE_ID;
  const signName = process.env.TENCENT_SMS_SIGN_NAME || "优采智管";

  // 如果没有配置腾讯云短信，使用模拟模式
  if (!secretId || !secretKey || !smsSdkAppId || !templateId) {
    console.log(`[SMS 模拟模式] 手机号: ${phone}, 验证码: ${code}`);
    return true;
  }

  try {
    const tencentcloud = require("tencentcloud-sdk-nodejs");
    const SmsClient = tencentcloud.sms.v20210111.Client;

    const client = new SmsClient({
      credential: { secretId, secretKey },
      region: "ap-guangzhou",
      profile: { httpProfile: { endpoint: "sms.tencentcloudapi.com" } },
    });

    const params = {
      PhoneNumberSet: [phone.startsWith("86") ? phone : `86${phone}`],
      SmsSdkAppId: smsSdkAppId,
      SignName: signName,
      TemplateId: templateId,
      TemplateParamSet: [code, "5"], // 验证码, 有效期5分钟
    };

    await client.SendSms(params);
    console.log(`[SMS 已发送] 手机号: ${phone}`);
    return true;
  } catch (error) {
    console.error("[SMS 发送失败]", error);
    return false;
  }
}
