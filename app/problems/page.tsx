import Link from "next/link";
import { problems } from "@/lib/problems";

export default function ProblemsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-indigo-600">ホーム</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">問題一覧</span>
      </div>

      <h2 className="text-2xl font-bold text-gray-800">ランダム練習</h2>

      {/* ランダム練習バナー群 */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/practice/matrix-mult"
          className="flex items-center justify-between bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-2xl p-5 text-white shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-indigo-800 transition-all"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🎲</span>
              <span className="font-bold text-lg">行列の積</span>
            </div>
            <p className="text-indigo-100 text-sm">
              2〜3×2〜3 行列の積をランダム出題
            </p>
          </div>
          <span className="text-3xl opacity-70">→</span>
        </Link>

        <Link
          href="/practice/determinant"
          className="flex items-center justify-between bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl p-5 text-white shadow-md hover:shadow-lg hover:from-purple-600 hover:to-purple-800 transition-all"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🔣</span>
              <span className="font-bold text-lg">行列式</span>
            </div>
            <p className="text-purple-100 text-sm">
              2×2 / 3×3 行列式をランダム出題
            </p>
          </div>
          <span className="text-3xl opacity-70">→</span>
        </Link>

        <Link
          href="/practice/inverse"
          className="flex items-center justify-between bg-gradient-to-r from-teal-500 to-teal-700 rounded-2xl p-5 text-white shadow-md hover:shadow-lg hover:from-teal-600 hover:to-teal-800 transition-all"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🔄</span>
              <span className="font-bold text-lg">逆行列</span>
            </div>
            <p className="text-teal-100 text-sm">
              2×2 / 3×3 逆行列をランダム出題
            </p>
          </div>
          <span className="text-3xl opacity-70">→</span>
        </Link>

        <Link
          href="/practice/eigenvalue"
          className="flex items-center justify-between bg-gradient-to-r from-rose-500 to-rose-700 rounded-2xl p-5 text-white shadow-md hover:shadow-lg hover:from-rose-600 hover:to-rose-800 transition-all"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">λ</span>
              <span className="font-bold text-lg">固有値・固有ベクトル</span>
            </div>
            <p className="text-rose-100 text-sm">
              2×2 / 3×3 固有値・固有ベクトルをランダム出題
            </p>
          </div>
          <span className="text-3xl opacity-70">→</span>
        </Link>
      </div>

      {/* 固定問題リスト */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          固定問題
        </h3>
        <div className="grid gap-4">
          {problems.map((problem) => (
            <Link
              key={problem.id}
              href={`/solve/${problem.id}`}
              className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-2">
                    {problem.category}
                  </span>
                  <h3 className="font-semibold text-gray-800">{problem.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{problem.description}</p>
                </div>
                <span className="text-indigo-400 text-xl mt-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
