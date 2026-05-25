import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "优采智管私域管理系统",
  description: "优采智管私域管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
