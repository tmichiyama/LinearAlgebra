import Link from "next/link";

const CATEGORIES = [
  {
    href: "/practice/matrix-mult",
    title: "行列の積",
    subtitle: "Matrix Multiplication",
    description: "2×2 〜 3×3 行列の積をランダム出題",
  },
  {
    href: "/practice/determinant",
    title: "行列式",
    subtitle: "Determinant",
    description: "2×2 / 3×3 行列式をランダム出題",
  },
  {
    href: "/practice/inverse",
    title: "逆行列",
    subtitle: "Inverse Matrix",
    description: "2×2 / 3×3 逆行列をランダム出題",
  },
  {
    href: "/practice/eigenvalue",
    title: "固有値・固有ベクトル",
    subtitle: "Eigenvalues & Eigenvectors",
    description: "2×2 / 3×3 固有値・固有ベクトルをランダム出題",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="py-2">
        <h2 className="text-2xl font-bold text-gray-900">練習メニュー</h2>
        <p className="text-gray-500 text-sm mt-1">カテゴリを選んでランダム出題を始めましょう</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="group block bg-white border border-gray-200 hover:border-gray-400 rounded-lg p-5 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900 text-base">{cat.title}</p>
                <p className="text-xs text-gray-400 tracking-wide mt-0.5">{cat.subtitle}</p>
                <p className="text-sm text-gray-500 mt-2">{cat.description}</p>
              </div>
              <span className="text-gray-300 group-hover:text-gray-600 transition-colors text-xl shrink-0 mt-0.5">→</span>
            </div>
          </Link>
        ))}
      </div>
      <div className="border-t border-gray-200 pt-6 text-sm text-gray-400 space-y-1">
        <p>Developed by <span className="text-gray-600 font-medium">Tomonari Michiyama</span> (Shunan University)</p>
        <p>Built with <a href="https://claude.ai/code" className="underline underline-offset-2 hover:text-gray-600 transition-colors">Claude Code</a> — most of this app was written through AI-assisted development.</p>
      </div>
    </div>
  );
}
