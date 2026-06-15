import "./globals.css";
import type { ReactNode } from "react";
import { Noto_Sans_Armenian } from "next/font/google";

const notoSansArmenian = Noto_Sans_Armenian({
  subsets: ["armenian", "latin"],
  display: "swap",
  variable: "--font-noto-sans-armenian"
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={notoSansArmenian.variable}>
      <body className={notoSansArmenian.className}>{children}</body>
    </html>
  );
}
