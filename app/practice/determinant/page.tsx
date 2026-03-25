"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { BlockMath } from "react-katex";
import { generateDetProblem, DetProblem } from "@/lib/determinant-generator";

// ------------------------------------------------------------------ types

type AnswerStatus = "idle" | "correct" | "incorrect";

// ------------------------------------------------------------------ component

export default function DeterminantPracticePage() {
  // --- size selector ---
  const [size, setSize] = useState<2 | 3>(2);

  // --- problem state ---
  const [problem, setProblem] = useState<DetProblem | null>(null);
  const [input, setInput] = useState("");
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>("idle");
  const [showAnswer, setShowAnswer] = useState(false);

  // --- hints ---
  const [showSteps, setShowSteps] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // --- stats ---
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // --- focus ref for answer input ---
  const inputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------- load

  const loadNew = useCallback((nextSize: 2 | 3) => {
    setProblem(generateDetProblem(nextSize));
    setInput("");
    setAnswerStatus("idle");
    setShowSteps(false);
    setCurrentStep(0);
    setShowAnswer(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // 初回 & size 変更時に新問題
  useEffect(() => {
    loadNew(size);
  }, [size, loadNew]);

  // ---------------------------------------------------------------- handlers

  const handleSizeChange = useCallback((s: 2 | 3) => {
    setSize(s);
    // loadNew は useEffect で呼ばれる
  }, []);

  const handleCheck = useCallback(() => {
    if (!problem || input.trim() === "") return;
    const num = Number(input.trim());
    if (isNaN(num)) return;

    const correct = num === problem.answer;
    setAnswerStatus(correct ? "correct" : "incorrect");
    setTotal((t) => t + 1);
    if (correct) {
      setCorrectCount((c) => c + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  }, [problem, input]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && answerStatus === "idle") handleCheck();
    },
    [answerStatus, handleCheck]
  );

  // ---------------------------------------------------------------- render

  if (!problem) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <span className="animate-pulse text-lg">問題を準備中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-indigo-600">ホーム</Link>
        <span>/</span>
        <Link href="/problems" className="hover:text-indigo-600">問題一覧</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">行列式 ランダム練習</span>
      </div>

      {/* Size selector tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {([2, 3] as const).map((s) => (
          <button
            key={s}
            onClick={() => handleSizeChange(s)}
            className={[
              "px-6 py-2 rounded-lg font-semibold text-sm transition-all",
              size === s
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            ].join(" ")}
          >
            {s}×{s}
          </button>
        ))}
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
            <span className="inline-block text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              行列式 / {size}×{size}
            </span>
          </div>
          <button
            onClick={() => loadNew(size)}
            className="text-sm text-gray-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            スキップ →
          </button>
        </div>

        {/* Question */}
        <div className="bg-gray-50 rounded-xl p-4 overflow-x-auto">
          <BlockMath math={problem.questionLatex} />
        </div>

        {/* Answer input */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-600">
            det(A) の値を入力してください
          </p>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-mono text-lg">det(A) =</span>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={input}
              disabled={answerStatus === "correct" || showAnswer}
              onChange={(e) => {
                setInput(e.target.value);
                setAnswerStatus("idle");
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="?"
              className={[
                "w-28 h-14 text-center text-2xl font-mono rounded-xl border-2 outline-none",
                "transition-all duration-150 focus:ring-2 focus:ring-offset-1",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                answerStatus === "correct"
                  ? "border-green-500 bg-green-50 text-green-800 focus:ring-green-400"
                  : answerStatus === "incorrect"
                  ? "border-red-400 bg-red-50 text-red-700 focus:ring-red-400"
                  : "border-indigo-300 bg-white text-gray-800 focus:ring-indigo-400",
              ].join(" ")}
            />
          </div>
        </div>

        {/* Result message */}
        {answerStatus === "correct" && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">
            <span className="text-2xl">{streak >= 3 ? "🔥" : "🎉"}</span>
            <span className="font-semibold">
              正解！{streak >= 3 ? ` ${streak}連続正解！` : ""}
            </span>
          </div>
        )}
        {answerStatus === "incorrect" && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
            <span className="text-xl">❌</span>
            <span className="font-semibold">
              不正解。もう一度計算してみましょう。
            </span>
          </div>
        )}

        {/* 解答表示ボックス */}
        {showAnswer && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-1">
            <p className="text-sm font-bold text-amber-700">📖 解答</p>
            <BlockMath math={`\\det(A) = ${problem.answer}`} />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {answerStatus === "correct" ? (
            <button
              onClick={() => loadNew(size)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              次の問題 →
            </button>
          ) : showAnswer ? (
            <button
              onClick={() => loadNew(size)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              次の問題 →
            </button>
          ) : (
            <button
              onClick={handleCheck}
              disabled={input.trim() === "" || isNaN(Number(input.trim()))}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              答え合わせ
            </button>
          )}
          <button
            onClick={() => { setShowSteps((v) => !v); setCurrentStep(0); }}
            className="border border-purple-300 text-purple-600 hover:bg-purple-50 font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            {showSteps ? "ヒントを閉じる" : "💡 ヒント"}
          </button>
          {answerStatus !== "correct" && !showAnswer && (
            <button
              onClick={() => setShowAnswer(true)}
              className="border border-amber-300 text-amber-600 hover:bg-amber-50 font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              📖 解答を表示
            </button>
          )}
        </div>
      </div>

      {/* Steps panel */}
      {showSteps && (
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 space-y-4">
          <h3 className="font-bold text-gray-700 text-lg">解法ステップ</h3>
          <div className="space-y-3">
            {problem.steps.slice(0, currentStep + 1).map((step, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 transition-all ${
                  i === currentStep
                    ? "bg-purple-50 border border-purple-200"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-bold text-purple-600 mr-1">
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
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
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
