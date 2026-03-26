"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { BlockMath } from "react-katex";
import { generateDetProblem, DetProblem } from "@/lib/determinant-generator";

type AnswerStatus = "idle" | "correct" | "incorrect";

interface SizeStats { total: number; correct: number; streak: number; }
const initStats = (): SizeStats => ({ total: 0, correct: 0, streak: 0 });

export default function DeterminantPracticePage() {
  const [size, setSize] = useState<2 | 3>(2);
  const [problem, setProblem] = useState<DetProblem | null>(null);
  const [input, setInput] = useState("");
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>("idle");
  const [showAnswer, setShowAnswer] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stats, setStats] = useState<Record<2 | 3, SizeStats>>({ 2: initStats(), 3: initStats() });
  const inputRef = useRef<HTMLInputElement>(null);

  const loadNew = useCallback((nextSize: 2 | 3) => {
    setProblem(generateDetProblem(nextSize));
    setInput("");
    setAnswerStatus("idle");
    setShowSteps(false);
    setCurrentStep(0);
    setShowAnswer(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    loadNew(size);
  }, [size, loadNew]);

  const handleCheck = useCallback(() => {
    if (!problem || input.trim() === "") return;
    const num = Number(input.trim());
    if (isNaN(num)) return;
    const correct = num === problem.answer;
    setAnswerStatus(correct ? "correct" : "incorrect");
    setStats((prev) => {
      const s = prev[size];
      return {
        ...prev,
        [size]: {
          total: s.total + 1,
          correct: correct ? s.correct + 1 : s.correct,
          streak: correct ? s.streak + 1 : 0,
        },
      };
    });
  }, [problem, input, size]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && answerStatus === "idle") handleCheck();
    },
    [answerStatus, handleCheck]
  );

  if (!problem) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <span className="animate-pulse">問題を準備中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-900">ホーム</Link>
        <span>/</span>
        <span className="text-gray-700">行列式</span>
      </div>

      {/* Size selector */}
      <div className="flex gap-0 border-b border-gray-200">
        {([2, 3] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSize(s)}
            className={[
              "px-5 py-2 text-sm font-medium transition-colors",
              size === s
                ? "border-b-2 border-gray-900 text-gray-900 -mb-px"
                : "text-gray-500 hover:text-gray-700",
            ].join(" ")}
          >
            {s}×{s}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 bg-white border border-gray-200 rounded-lg px-5 py-3">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{stats[size].total}</div>
          <div className="text-xs text-gray-400">解いた問題</div>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{stats[size].correct}</div>
          <div className="text-xs text-gray-400">正解</div>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{stats[size].streak}</div>
          <div className="text-xs text-gray-400">連続正解</div>
        </div>
        {stats[size].total > 0 && (
          <>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {Math.round((stats[size].correct / stats[size].total) * 100)}%
              </div>
              <div className="text-xs text-gray-400">正解率</div>
            </div>
          </>
        )}
      </div>

      {/* Problem card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            行列式 / {size}×{size}
          </span>
          <button
            onClick={() => loadNew(size)}
            className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded transition-colors"
          >
            スキップ →
          </button>
        </div>

        {/* Question */}
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 overflow-x-auto">
          <BlockMath math={problem.questionLatex} />
        </div>

        {/* Answer input */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-600">det(A) の値を入力してください</p>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-mono">det(A) =</span>
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
                "w-28 h-12 text-center text-2xl font-mono rounded border-2 outline-none",
                "transition-all duration-150 focus:ring-2 focus:ring-offset-1",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                answerStatus === "correct"
                  ? "border-green-500 bg-green-50 text-green-800 focus:ring-green-400"
                  : answerStatus === "incorrect"
                  ? "border-red-400 bg-red-50 text-red-700 focus:ring-red-400"
                  : "border-gray-300 bg-white text-gray-900 focus:ring-indigo-400",
              ].join(" ")}
            />
          </div>
        </div>

        {answerStatus === "correct" && (
          <div className="border-l-4 border-green-500 bg-green-50 pl-4 py-2 text-sm text-green-800 font-medium">
            正解{stats[size].streak >= 3 ? ` — ${stats[size].streak} 問連続正解` : ""}
          </div>
        )}
        {answerStatus === "incorrect" && (
          <div className="border-l-4 border-red-400 bg-red-50 pl-4 py-2 text-sm text-red-800">
            不正解。もう一度計算してみましょう。
          </div>
        )}

        {showAnswer && (
          <div className="border-l-4 border-gray-400 bg-gray-50 pl-4 py-3 space-y-1">
            <p className="text-sm font-semibold text-gray-700">解答</p>
            <BlockMath math={`\\det(A) = ${problem.answer}`} />
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {answerStatus === "correct" ? (
            <button
              onClick={() => loadNew(size)}
              className="bg-gray-900 hover:bg-gray-700 text-white font-medium px-6 py-2 rounded transition-colors"
            >
              次の問題 →
            </button>
          ) : showAnswer ? (
            <button
              onClick={() => loadNew(size)}
              className="bg-gray-900 hover:bg-gray-700 text-white font-medium px-6 py-2 rounded transition-colors"
            >
              次の問題 →
            </button>
          ) : (
            <button
              onClick={handleCheck}
              disabled={input.trim() === "" || isNaN(Number(input.trim()))}
              className="bg-gray-900 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded transition-colors"
            >
              答え合わせ
            </button>
          )}
          <button
            onClick={() => { setShowSteps((v) => !v); setCurrentStep(0); }}
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium px-5 py-2 rounded transition-colors"
          >
            {showSteps ? "ヒントを閉じる" : "ヒント"}
          </button>
          {answerStatus !== "correct" && !showAnswer && (
            <button
              onClick={() => setShowAnswer(true)}
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium px-5 py-2 rounded transition-colors"
            >
              解答を表示
            </button>
          )}
        </div>
      </div>

      {/* Steps panel */}
      {showSteps && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="font-bold text-gray-900">解法ステップ</h3>
          <div className="space-y-3">
            {problem.steps.slice(0, -1).slice(0, currentStep + 1).map((step, i) => (
              <div
                key={i}
                className={`rounded-lg p-4 transition-all ${
                  i === currentStep
                    ? "bg-indigo-50 border border-indigo-200"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-bold text-gray-900 mr-1">Step {i + 1}.</span>
                  {step.description}
                </p>
                <div className="overflow-x-auto">
                  <BlockMath math={step.formula} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            {currentStep < problem.steps.length - 2 && (
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
              >
                次のステップ →
              </button>
            )}
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium px-4 py-2 rounded transition-colors"
              >
                ← 前のステップ
              </button>
            )}
            {currentStep === problem.steps.length - 2 && (
              <span className="text-sm text-green-700 font-medium self-center ml-2">
                全ステップ完了
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
