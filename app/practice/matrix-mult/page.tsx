"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { BlockMath, InlineMath } from "react-katex";
import MatrixInput from "@/components/MatrixInput";
import { generateMatrixMultProblem } from "@/lib/generator";
import { Problem } from "@/lib/problems";

// ------------------------------------------------------------------ types

type CellStatus = "correct" | "incorrect" | "neutral";
type Phase = "dimension" | "values";
type DimStatus = "idle" | "correct" | "incorrect";
type ValStatus = "idle" | "correct" | "incorrect";

// ------------------------------------------------------------------ helpers

const makeEmptyValues = (rows: number, cols: number): string[][] =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));

const makeNeutralStatus = (rows: number, cols: number): CellStatus[][] =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, (): CellStatus => "neutral")
  );

/** "2×3 × 3×2 行列の積" から m, k, n を取り出す */
function parseDims(title: string): { m: number; k: number; n: number } {
  const match = title.match(/(\d)×(\d) × \d×(\d)/);
  if (!match) return { m: 2, k: 2, n: 2 };
  return { m: Number(match[1]), k: Number(match[2]), n: Number(match[3]) };
}

// 選択肢: 2×2 / 2×3 / 3×2 / 3×3
const DIM_CHOICES: [number, number][] = [
  [2, 2],
  [2, 3],
  [3, 2],
  [3, 3],
];

// ------------------------------------------------------------------ component

export default function RandomPracticePage() {
  // --- problem state ---
  const [problem, setProblem] = useState<Problem | null>(null);
  const [phase, setPhase] = useState<Phase>("dimension");

  // --- dimension phase ---
  const [dimStatus, setDimStatus] = useState<DimStatus>("idle");
  const [selectedDim, setSelectedDim] = useState<[number, number] | null>(null);

  // --- values phase ---
  const [values, setValues] = useState<string[][]>([]);
  const [cellStatus, setCellStatus] = useState<CellStatus[][]>([]);
  const [valStatus, setValStatus] = useState<ValStatus>("idle");
  const [showSteps, setShowSteps] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // --- 解答表示 ---
  const [showAnswer, setShowAnswer] = useState(false);

  // --- stats (values phase のみカウント) ---
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // ---------------------------------------------------------------- load

  const loadNew = useCallback(() => {
    const p = generateMatrixMultProblem();
    setProblem(p);
    setPhase("dimension");
    setDimStatus("idle");
    setSelectedDim(null);
    setValues(makeEmptyValues(p.answerRows, p.answerCols));
    setCellStatus(makeNeutralStatus(p.answerRows, p.answerCols));
    setValStatus("idle");
    setShowSteps(false);
    setCurrentStep(0);
    setShowAnswer(false);
  }, []);

  useEffect(() => {
    loadNew();
  }, [loadNew]);

  // ---------------------------------------------------------------- dimension phase handlers

  const handleDimSelect = useCallback(
    (rows: number, cols: number) => {
      if (!problem || dimStatus === "correct") return;
      setSelectedDim([rows, cols]);
      const correct =
        rows === problem.answerRows && cols === problem.answerCols;
      setDimStatus(correct ? "correct" : "incorrect");
      if (correct) {
        // 少し待ってからvaluesフェーズへ
        setTimeout(() => setPhase("values"), 700);
      }
    },
    [problem, dimStatus]
  );

  const handleDimRetry = useCallback(() => {
    setDimStatus("idle");
    setSelectedDim(null);
  }, []);

  // ---------------------------------------------------------------- values phase handlers

  const handleChange = useCallback((r: number, c: number, val: string) => {
    setValues((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = val;
      return next;
    });
    setCellStatus((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = "neutral";
      return next;
    });
    setValStatus("idle");
  }, []);

  const handleCheck = useCallback(() => {
    if (!problem) return;
    const newCellStatus: CellStatus[][] = values.map((row, r) =>
      row.map((val, c) => {
        const num = Number(val.trim());
        return isNaN(num) || val.trim() === ""
          ? "incorrect"
          : num === problem.answer[r][c]
          ? "correct"
          : "incorrect";
      })
    );
    setCellStatus(newCellStatus);
    const allCorrect = newCellStatus.every((row) =>
      row.every((s) => s === "correct")
    );
    setValStatus(allCorrect ? "correct" : "incorrect");
    setTotal((t) => t + 1);
    if (allCorrect) {
      setCorrectCount((c) => c + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  }, [problem, values]);

  // ---------------------------------------------------------------- render

  if (!problem) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <span className="animate-pulse text-lg">問題を準備中...</span>
      </div>
    );
  }

  const { m, k, n } = parseDims(problem.title);

  const answerLatex = (() => {
    const inner = problem.answer
      .map((row: number[]) => row.join(" & "))
      .join(" \\\\ ");
    return `AB = \\begin{pmatrix} ${inner} \\end{pmatrix}`;
  })();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-indigo-600">ホーム</Link>
        <span>/</span>
        <Link href="/problems" className="hover:text-indigo-600">問題一覧</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">行列の積 ランダム練習</span>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 px-5 py-3 shadow-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600">{total}</div>
          <div className="text-xs text-gray-500">解いた問題</div>
        </div>
        <div className="w-px h-10 bg-gray-200" />
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{correctCount}</div>
          <div className="text-xs text-gray-500">正解</div>
        </div>
        <div className="w-px h-10 bg-gray-200" />
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-500">{streak}</div>
          <div className="text-xs text-gray-500">🔥 連続正解</div>
        </div>
        {total > 0 && (
          <>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">
                {Math.round((correctCount / total) * 100)}%
              </div>
              <div className="text-xs text-gray-500">正解率</div>
            </div>
          </>
        )}
      </div>

      {/* Problem card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              行列の積
            </span>
            {/* フェーズバッジ */}
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
              phase === "dimension"
                ? "bg-amber-50 text-amber-600"
                : "bg-green-50 text-green-600"
            }`}>
              {phase === "dimension" ? "Step 1: サイズを答えよ" : "Step 2: 成分を入力せよ"}
            </span>
          </div>
          <button
            onClick={loadNew}
            className="text-sm text-gray-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            スキップ →
          </button>
        </div>

        {/* Question */}
        <div className="bg-gray-50 rounded-xl p-4 overflow-x-auto">
          <BlockMath math={problem.questionLatex} />
        </div>

        {/* ============================================================
            Phase: dimension — AB の大きさを選択
        ============================================================ */}
        {phase === "dimension" && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">
              積 <InlineMath math="AB" /> の行列の大きさは？
            </p>

            {/* 4択ボタン */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DIM_CHOICES.map(([r, c]) => {
                const isSelected =
                  selectedDim?.[0] === r && selectedDim?.[1] === c;
                const isCorrect =
                  isSelected && dimStatus === "correct";
                const isWrong =
                  isSelected && dimStatus === "incorrect";
                const isCorrectAnswer =
                  showAnswer && r === problem.answerRows && c === problem.answerCols;
                return (
                  <button
                    key={`${r}x${c}`}
                    onClick={() => handleDimSelect(r, c)}
                    disabled={dimStatus === "correct" || showAnswer}
                    className={[
                      "py-4 rounded-xl border-2 font-bold text-lg transition-all",
                      "disabled:cursor-not-allowed",
                      isCorrect || isCorrectAnswer
                        ? "border-green-400 bg-green-50 text-green-700 scale-105 shadow-md"
                        : isWrong
                        ? "border-red-400 bg-red-50 text-red-600 animate-shake"
                        : showAnswer
                        ? "border-gray-200 bg-gray-50 text-gray-300"
                        : dimStatus === "idle"
                        ? "border-indigo-200 bg-white text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 hover:scale-105 hover:shadow-sm"
                        : "border-gray-200 bg-gray-50 text-gray-400", // 不正解後の他ボタン
                    ].join(" ")}
                  >
                    {r}×{c}
                  </button>
                );
              })}
            </div>

            {/* フィードバック */}
            {dimStatus === "correct" && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-semibold">
                <span>✅</span>
                <span>
                  正解！<InlineMath math={`${m}×${k}`} /> 行列 ×{" "}
                  <InlineMath math={`${k}×${n}`} /> 行列 ={" "}
                  <InlineMath math={`${m}×${n}`} /> 行列。成分を入力してください…
                </span>
              </div>
            )}
            {dimStatus === "incorrect" && !showAnswer && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  <span>❌</span>
                  <span className="font-semibold">不正解。もう一度選んでください。</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                  <span className="font-semibold">💡 ヒント：</span>
                  {" "}m×k 行列と k×n 行列の積は <strong>m×n 行列</strong> になります。
                  <div className="mt-1 overflow-x-auto">
                    <InlineMath math="(m \times k) \cdot (k \times n) \rightarrow (m \times n)" />
                  </div>
                </div>
                <button
                  onClick={handleDimRetry}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold underline"
                >
                  選び直す
                </button>
              </div>
            )}

            {/* dimension フェーズの解答表示ボックス */}
            {showAnswer && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-2">
                <p className="text-sm font-bold text-amber-700">📖 解答</p>
                <p className="text-sm text-amber-800">
                  AB のサイズ：<span className="font-bold">{problem.answerRows}×{problem.answerCols}</span>
                </p>
                <div className="overflow-x-auto">
                  <BlockMath math={answerLatex} />
                </div>
              </div>
            )}

            {/* dimension フェーズの「解答を表示」ボタン */}
            {!showAnswer && (
              <button
                onClick={() => setShowAnswer(true)}
                className="border border-amber-300 text-amber-600 hover:bg-amber-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                📖 解答を表示
              </button>
            )}
            {showAnswer && (
              <button
                onClick={loadNew}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                次の問題 →
              </button>
            )}
          </div>
        )}

        {/* ============================================================
            Phase: values — 成分を入力
        ============================================================ */}
        {phase === "values" && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-600">
              <InlineMath math="AB" /> の成分をすべて入力してください
              <span className="ml-2 text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                {problem.answerRows}×{problem.answerCols} 行列
              </span>
            </p>

            <MatrixInput
              rows={problem.answerRows}
              cols={problem.answerCols}
              values={values}
              onChange={handleChange}
              cellStatus={cellStatus}
              disabled={valStatus === "correct" || showAnswer}
            />

            {/* 正誤メッセージ */}
            {valStatus === "correct" && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">
                <span className="text-2xl">{streak >= 3 ? "🔥" : "🎉"}</span>
                <span className="font-semibold">
                  正解！{streak >= 3 ? ` ${streak}連続正解！` : ""}
                </span>
              </div>
            )}
            {valStatus === "incorrect" && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                <span className="text-xl">❌</span>
                <span className="font-semibold">不正解。赤いセルを確認してください。</span>
              </div>
            )}

            {/* values フェーズの解答表示ボックス */}
            {showAnswer && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-1">
                <p className="text-sm font-bold text-amber-700">📖 解答</p>
                <div className="overflow-x-auto">
                  <BlockMath math={answerLatex} />
                </div>
              </div>
            )}

            {/* ボタン */}
            <div className="flex flex-wrap gap-3">
              {valStatus === "correct" ? (
                <button
                  onClick={loadNew}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  次の問題 →
                </button>
              ) : showAnswer ? (
                <button
                  onClick={loadNew}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  次の問題 →
                </button>
              ) : (
                <button
                  onClick={handleCheck}
                  disabled={values.flat().some((v) => v.trim() === "")}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  答え合わせ
                </button>
              )}
              <button
                onClick={() => { setShowSteps((v) => !v); setCurrentStep(0); }}
                className="border border-indigo-300 text-indigo-600 hover:bg-indigo-50 font-semibold px-5 py-2 rounded-lg transition-colors"
              >
                {showSteps ? "ヒントを閉じる" : "💡 ヒント"}
              </button>
              {valStatus !== "correct" && !showAnswer && (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="border border-amber-300 text-amber-600 hover:bg-amber-50 font-semibold px-5 py-2 rounded-lg transition-colors"
                >
                  📖 解答を表示
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Steps panel（values フェーズのみ表示） */}
      {phase === "values" && showSteps && (
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 space-y-4">
          <h3 className="font-bold text-gray-700 text-lg">解法ステップ</h3>
          <div className="space-y-3">
            {problem.steps.slice(0, currentStep + 1).map((step, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 transition-all ${
                  i === currentStep
                    ? "bg-indigo-50 border border-indigo-200"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-bold text-indigo-600 mr-1">
                    Step {i + 1}.
                  </span>
                  {step.description}
                </p>
                <div className="overflow-x-auto">
                  <BlockMath math={step.formula} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            {currentStep < problem.steps.length - 1 && (
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                次のステップ →
              </button>
            )}
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                ← 前のステップ
              </button>
            )}
            {currentStep === problem.steps.length - 1 && (
              <span className="text-sm text-green-600 font-semibold self-center ml-2">
                ✓ 全ステップ完了
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
