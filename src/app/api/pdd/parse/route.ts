import { NextResponse } from "next/server";

// 允许的拼多多域名白名单
const ALLOWED_HOSTS = [
  "pinduoduo.com",
  "www.pinduoduo.com",
  "yangkeduo.com",
  "www.yangkeduo.com",
  "mobile.yangkeduo.com",
  "m.pinduoduo.com",
  "pdd.com",
];

function isValidPddHost(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return ALLOWED_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "请提供链接" }, { status: 400 });
    }

    // 从文本中提取 URL
    const urlInText = extractUrl(url);
    if (urlInText && isValidPddHost(urlInText)) {
      const goodsId = extractGoodsId(urlInText);
      const priceFromText = extractPrice(url);
      const titleFromText = extractTitle(url);

      return NextResponse.json({
        success: true,
        data: {
          title: titleFromText || "",
          image: "",
          price: priceFromText || "",
          goodsId,
          sourceUrl: urlInText,
        },
      });
    }

    // 纯链接模式 - 严格域名校验
    if (!isValidPddHost(url)) {
      return NextResponse.json({ error: "请输入拼多多商品链接或分享文本" }, { status: 400 });
    }

    const goodsId = extractGoodsId(url);
    let title = "";
    let image = "";
    let price = "";

    // 方法1: 尝试拼多多商品详情 API
    if (goodsId) {
      try {
        const apiResult = await fetchPddApi(goodsId);
        if (apiResult) {
          title = apiResult.title || "";
          image = apiResult.image || "";
          price = apiResult.price || "";
        }
      } catch { /* fall through to next method */ }
    }

    // 方法2: 回退到页面抓取（仅允许白名单域名）
    if (!title && isValidPddHost(url)) {
      try {
        const pageResult = await fetchPddPage(url);
        if (pageResult) {
          title = pageResult.title || "";
          image = pageResult.image || "";
          price = pageResult.price || "";
        }
      } catch { /* ignore */ }
    }

    return NextResponse.json({
      success: true,
      data: {
        title: title || "",
        image: image || "",
        price: price || "",
        goodsId,
        sourceUrl: url,
      },
    });
  } catch (error) {
    console.error("PDD parse error:", error);
    return NextResponse.json({ error: "解析失败" }, { status: 500 });
  }
}

function extractUrl(text: string): string {
  const urlMatch = text.match(/https?:\/\/[^\s<>]+/);
  return urlMatch ? urlMatch[0] : "";
}

function extractGoodsId(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const gid =
      parsedUrl.searchParams.get("goods_id") ||
      parsedUrl.searchParams.get("goodsid") ||
      "";
    if (gid) return gid;
    const match = url.match(/goods[_-]?[iI]d[=\/](\d+)/);
    if (match) return match[1];
    const shortMatch = url.match(/\/(\d{8,})/);
    if (shortMatch) return shortMatch[1];
  } catch { /* ignore */ }
  return "";
}

function extractPrice(text: string): string {
  const priceMatch = text.match(/[¥￥]\s*(\d+\.?\d*)/);
  if (priceMatch) {
    const p = parseFloat(priceMatch[1]);
    if (p > 0 && p < 100000) return p.toFixed(2);
  }
  return "";
}

function extractTitle(text: string): string {
  const cleanText = text.replace(/https?:\/\/[^\s<>]+/, "").trim();
  const titleMatch = cleanText.match(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]*([^\n¥￥]+)/u);
  if (titleMatch) {
    return titleMatch[1].replace(/\s+/g, " ").trim().slice(0, 80);
  }
  const idx = cleanText.search(/[¥￥]/);
  if (idx > 0) return cleanText.slice(0, idx).replace(/\s+/g, " ").trim().slice(0, 80);
  return cleanText.slice(0, 80);
}

async function fetchPddApi(goodsId: string): Promise<{ title: string; image: string; price: string } | null> {
  const apiUrl = `https://mobile.yangkeduo.com/proxy/api/api/aristotle/goods_detail?goods_id=${goodsId}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
        Accept: "application/json",
        "Accept-Language": "zh-CN,zh;q=0.9",
        Referer: `https://mobile.yangkeduo.com/goods.html?goods_id=${goodsId}`,
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    const goods = data?.goods_detail || data?.result?.goods_detail || data;

    if (!goods) return null;

    const title = goods.goods_name || goods.goodsDesc || "";
    const image = goods.goods_image || goods.hdThumbUrl || goods.thumbUrl || "";
    let price = "";

    const minPrice = goods.min_normal_price || goods.minPrice || goods.normalPrice;
    if (minPrice) {
      const p = typeof minPrice === "string" ? parseFloat(minPrice) : minPrice;
      price = (p > 10000 ? p / 100 : p).toFixed(2);
    }

    if (title) return { title, image, price };
    return null;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

async function fetchPddPage(url: string): Promise<{ title: string; image: string; price: string } | null> {
  // 二次确认：只允许白名单域名
  if (!isValidPddHost(url)) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "zh-CN,zh;q=0.9",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const html = await res.text();

    // 尝试从 SEO JSON-LD 提取
    const ldMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
    if (ldMatch) {
      try {
        const ld = JSON.parse(ldMatch[1]);
        return {
          title: ld.name || "",
          image: ld.image || "",
          price: ld.offers?.price || "",
        };
      } catch { /* ignore */ }
    }

    // 回退到 meta 标签解析
    const titleMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/);
    const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/);
    const priceMatch = html.match(/¥(\d+\.?\d*)/);

    return {
      title: titleMatch?.[1]?.slice(0, 80) || "",
      image: imageMatch?.[1] || "",
      price: priceMatch?.[1] || "",
    };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}
