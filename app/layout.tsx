import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "線形代数・微積分 練習アプリ",
  description: "大学生向けの線形代数・微積分の計算練習Webアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-indigo-700 text-white shadow-md">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <span className="text-2xl">📐</span>
            <div>
              <h1 className="text-xl font-bold leading-tight">線形代数・微積分 練習帳</h1>
              <p className="text-indigo-200 text-xs">Linear Algebra &amp; Calculus Practice</p>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
