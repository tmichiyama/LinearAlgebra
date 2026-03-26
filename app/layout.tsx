import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "線形代数 練習帳",
  description: "大学生向けの線形代数の計算練習Webアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-zinc-100">
        <header className="bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-lg font-bold tracking-tight">線形代数 練習帳</h1>
            <p className="text-gray-400 text-xs tracking-widest mt-0.5">LINEAR ALGEBRA PRACTICE</p>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
