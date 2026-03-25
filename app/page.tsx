import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          計算力を鍛えよう
        </h2>
        <p className="text-gray-500">
          問題を解いてステップごとに理解を深めましょう
        </p>
      </div>

      {/* Quick start: ランダム練習 */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/practice/matrix-mult"
          className="flex items-center justify-between bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-indigo-800 transition-all"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">🎲</span>
              <span className="font-bold text-xl">行列の積</span>
            </div>
            <p className="text-indigo-100 text-sm pl-1">
              2〜3×2〜3 行列の積をランダム出題
            </p>
          </div>
          <span className="text-4xl opacity-60 pr-2">→</span>
        </Link>

        <Link
          href="/practice/determinant"
          className="flex items-center justify-between bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-purple-800 transition-all"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">🔣</span>
              <span className="font-bold text-xl">行列式</span>
            </div>
            <p className="text-purple-100 text-sm pl-1">
              2×2 / 3×3 行列式をランダム出題
            </p>
          </div>
          <span className="text-4xl opacity-60 pr-2">→</span>
        </Link>

        <Link
          href="/practice/inverse"
          className="flex items-center justify-between bg-gradient-to-r from-teal-500 to-teal-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:from-teal-600 hover:to-teal-800 transition-all"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">🔄</span>
              <span className="font-bold text-xl">逆行列</span>
            </div>
            <p className="text-teal-100 text-sm pl-1">
              2×2 / 3×3 逆行列をランダム出題
            </p>
          </div>
          <span className="text-4xl opacity-60 pr-2">→</span>
        </Link>

        <Link
          href="/practice/eigenvalue"
          className="flex items-center justify-between bg-gradient-to-r from-rose-500 to-rose-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:from-rose-600 hover:to-rose-800 transition-all"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">λ</span>
              <span className="font-bold text-xl">固有値・固有ベクトル</span>
            </div>
            <p className="text-rose-100 text-sm pl-1">
              2×2 / 3×3 固有値・固有ベクトルをランダム出題
            </p>
          </div>
          <span className="text-4xl opacity-60 pr-2">→</span>
        </Link>
      </div>

    </div>
  );
}
