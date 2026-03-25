"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { BlockMath, InlineMath } from "react-katex";
import {
  generateEigenProblem,
  EigenProblem,
} from "@/lib/eigen-generator";

// ------------------------------------------------------------------ types

type Phase = "eigenvalue" | "eigenvector";
type EvalStatus = "idle" | "correct" | "incorrect";

// ------------------------------------------------------------------ component

export default function EigenvaluePracticePage() {
  const [size, setSize] = useState<2 | 3>(2);
  const [problem, setProblem] = useState<EigenProblem | null>(null);

  // Phase 1: eigenvalue inputs
  const [eigenInputs, setEigenInputs] = useState<string[]>([]);
  const [eigenStatus, setEigenStatus] = useState<EvalStatus>("idle");

  // Phase 2: eigenvector choices (index selected per vectorItem)
  const [phase, setPhase] = useState<Phase>("eigenvalue");
  const [vecSelections, setVecSelections] = useState<(number | null)[]>([]);
  const [vecStatus, setVecStatus] = useState<EvalStatus[]>([]);
  const [vecChecked, setVecChecked] = useState(false);

  // Hint / answer
  const [showSteps, setShowSteps] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Stats
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const firstInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------- load

  const loadNew = useCallback((nextSize: 2 | 3) => {
    const p = generateEigenProblem(nextSize);
    setProblem(p);
    setEigenInputs(p.eigenvalues.map(() => ""));
    setEigenStatus("idle");
    setPhase("eigenvalue");
    setVecSelections(p.vectorItems.map(() => null));
    setVecStatus(p.vectorItems.map(() => "idle"));
    setVecChecked(false);
    setShowSteps(false);
    setCurrentStep(0);
    setShowAnswer(false);
    setTimeout(() => firstInputRef.current?.focus(), 50);
  }, []);

  useEffect(() => { loadNew(size); }, [size, loadNew]);

  // ---------------------------------------------------------------- phase 1 handlers

  const handleEigenCheck = useCallback(() => {
    if (!problem) return;
    const parsed = eigenInputs.map((s) => Number(s.trim()));
    if (parsed.some(isNaN)) return;

    const sorted = [...parsed].sort((a, b) => a - b);
    const expected = [...problem.eigenvalues].sort((a, b) => a - b);
    const correct = sorted.length === expected.length && sorted.every((v, i) => v === expected[i]);

    setEigenStatus(correct ? "correct" : "incorrect");
    if (correct) {
      setTotal((t) => t + 1);
      setCorrectCount((c) => c + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  }, [problem, eigenInputs]);

  const handleEigenKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && eigenStatus === "idle") handleEigenCheck();
    },
    [eigenStatus, handleEigenCheck]
  );

  const handleProceedToVectors = useCallback(() => {
    setPhase("eigenvector");
    setShowSteps(false);
    setCurrentStep(0);
  }, []);

  // ---------------------------------------------------------------- phase 2 handlers

  const handleVecSelect = useCallback((itemIdx: number, choiceIdx: number) => {
    if (vecChecked || showAnswer) return;
    setVecSelections((prev) => {
      const next = [...prev];
      next[itemIdx] = choiceIdx;
      return next;
    });
  }, [vecChecked, showAnswer]);

  const handleVecCheck = useCallback(() => {
    if (!problem) return;
    const statuses = problem.vectorItems.map((item, i) => {
      const sel = vecSelections[i];
      if (sel === null) return "idle" as EvalStatus;
      return item.choices[sel].isCorrect ? "correct" : "incorrect";
    });
    setVecStatus(statuses);
    setVecChecked(true);

    const allCorrect = statuses.every((s) => s === "correct");
    if (allCorrect) {
      // eigenvalue phase already counted — only count eigenvector phase separately?
      // We count the full problem as one here; already counted in phase1, so just track streak separately
    }
  }, [problem, vecSelections]);

  const allVecCorrect = vecChecked && vecStatus.every((s) => s === "correct");

  // ---------------------------------------------------------------- render helpers

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
        <Link href="/" className="hover:text-rose-600">ホーム</Link>
        <span>/</span>
        <Link href="/problems" className="hover:text-rose-600">問題一覧</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">固有値・固有ベクトル ランダム練習</span>
      </div>

      {/* Size tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {([2, 3] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSize(s)}
            className={[
              "px-6 py-2 rounded-lg font-semibold text-sm transition-all",
              size === s
                ? "bg-white text-rose-700 shadow-sm"
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
          <div className="text-2xl font-bold text-rose-600">{total}</div>
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
            <span className="inline-block text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              固有値・固有ベクトル / {size}×{size}
            </span>
            <span className="inline-block text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {phase === "eigenvalue" ? "Phase 1: 固有値" : "Phase 2: 固有ベクトル"}
            </span>
          </div>
          <button
            onClick={() => loadNew(size)}
            className="text-sm text-gray-500 hover:text-rose-600 border border-gray-200 hover:border-rose-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            スキップ →
          </button>
        </div>

        {/* Matrix display */}
        <div className="bg-gray-50 rounded-xl p-4 overflow-x-auto">
          <BlockMath math={problem.questionLatex} />
        </div>

        {/* =================== PHASE 1: Eigenvalues =================== */}
        {phase === "eigenvalue" && (
          <>
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600">
                行列 A の固有値をすべて入力してください（順不同）
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {problem.eigenvalues.map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm font-mono">
                      λ<sub>{i + 1}</sub> =
                    </span>
                    <input
                      ref={i === 0 ? firstInputRef : undefined}
                      type="text"
                      inputMode="numeric"
                      value={eigenInputs[i] ?? ""}
                      disabled={eigenStatus === "correct" || showAnswer}
                      onChange={(e) => {
                        const next = [...eigenInputs];
                        next[i] = e.target.value;
                        setEigenInputs(next);
                        setEigenStatus("idle");
                      }}
                      onKeyDown={handleEigenKeyDown}
                      placeholder="?"
                      className={[
                        "w-20 h-12 text-center text-xl font-mono rounded-xl border-2 outline-none",
                        "transition-all duration-150 focus:ring-2 focus:ring-offset-1",
                        "disabled:opacity-60 disabled:cursor-not-allowed",
                        eigenStatus === "correct"
                          ? "border-green-500 bg-green-50 text-green-800 focus:ring-green-400"
                          : eigenStatus === "incorrect"
                          ? "border-red-400 bg-red-50 text-red-700 focus:ring-red-400"
                          : "border-rose-300 bg-white text-gray-800 focus:ring-rose-400",
                      ].join(" ")}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Result */}
            {eigenStatus === "correct" && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">
                <span className="text-2xl">{streak >= 3 ? "🔥" : "🎉"}</span>
                <span className="font-semibold">
                  固有値 正解！{streak >= 3 ? ` ${streak}連続正解！` : ""}
                </span>
              </div>
            )}
            {eigenStatus === "incorrect" && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                <span className="text-xl">❌</span>
                <span className="font-semibold">不正解。もう一度計算してみましょう。</span>
              </div>
            )}

            {/* Show answer box */}
            {showAnswer && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-1">
                <p className="text-sm font-bold text-amber-700">📖 解答（固有値）</p>
                <BlockMath
                  math={problem.eigenvalues
                    .map((v, i) => `\\lambda_{${i + 1}} = ${v}`)
                    .join(", \\quad ")}
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              {eigenStatus === "correct" ? (
                <button
                  onClick={handleProceedToVectors}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  固有ベクトルへ →
                </button>
              ) : showAnswer ? (
                <button
                  onClick={handleProceedToVectors}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  固有ベクトルへ →
                </button>
              ) : (
                <button
                  onClick={handleEigenCheck}
                  disabled={eigenInputs.some((s) => s.trim() === "" || isNaN(Number(s.trim())))}
                  className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  答え合わせ
                </button>
              )}
              <button
                onClick={() => { setShowSteps((v) => !v); setCurrentStep(0); }}
                className="border border-rose-300 text-rose-600 hover:bg-rose-50 font-semibold px-5 py-2 rounded-lg transition-colors"
              >
                {showSteps ? "ヒントを閉じる" : "💡 ヒント"}
              </button>
              {eigenStatus !== "correct" && !showAnswer && (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="border border-amber-300 text-amber-600 hover:bg-amber-50 font-semibold px-5 py-2 rounded-lg transition-colors"
                >
                  📖 解答を表示
                </button>
              )}
            </div>
          </>
        )}

        {/* =================== PHASE 2: Eigenvectors =================== */}
        {phase === "eigenvector" && (
          <>
            <p className="text-sm font-medium text-gray-600">
              各固有値に対応する規格化固有ベクトルを選んでください
            </p>

            <div className="space-y-6">
              {problem.vectorItems.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <p className="text-sm font-bold text-gray-700">
                    <InlineMath math={`\\lambda = ${item.eigenvalue}`} /> の固有ベクトル
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {item.choices.map((choice, ci) => {
                      const selected = vecSelections[idx] === ci;
                      const checked = vecChecked;
                      const status = vecStatus[idx];

                      let borderClass = "border-gray-200 hover:border-rose-300 hover:bg-rose-50";
                      if (selected && !checked) borderClass = "border-rose-400 bg-rose-50 ring-2 ring-rose-300";
                      if (checked && selected && status === "correct") borderClass = "border-green-500 bg-green-50 ring-2 ring-green-300";
                      if (checked && selected && status === "incorrect") borderClass = "border-red-400 bg-red-50 ring-2 ring-red-300";
                      if (checked && !selected && choice.isCorrect) borderClass = "border-green-400 bg-green-50";

                      return (
                        <button
                          key={ci}
                          disabled={vecChecked || showAnswer}
                          onClick={() => handleVecSelect(idx, ci)}
                          className={[
                            "rounded-xl border-2 p-3 text-center transition-all overflow-x-auto",
                            "disabled:cursor-not-allowed",
                            borderClass,
                          ].join(" ")}
                        >
                          <BlockMath math={choice.latex} />
                        </button>
                      );
                    })}
                  </div>
                  {vecChecked && (
                    <p className={`text-sm font-semibold ${vecStatus[idx] === "correct" ? "text-green-600" : "text-red-500"}`}>
                      {vecStatus[idx] === "correct" ? "✓ 正解" : "✗ 不正解"}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Result banner */}
            {allVecCorrect && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">
                <span className="text-2xl">🎉</span>
                <span className="font-semibold">全問正解！素晴らしい！</span>
              </div>
            )}
            {vecChecked && !allVecCorrect && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                <span className="text-xl">❌</span>
                <span className="font-semibold">一部不正解。正しい選択肢が緑色で表示されています。</span>
              </div>
            )}

            {/* Show answer box */}
            {showAnswer && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-2">
                <p className="text-sm font-bold text-amber-700">📖 解答（固有ベクトル）</p>
                {problem.vectorItems.map((item, i) => {
                  const correct = item.choices.find((c) => c.isCorrect)!;
                  return (
                    <div key={i} className="flex items-center gap-3 overflow-x-auto">
                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        <InlineMath math={`\\lambda = ${item.eigenvalue}:`} />
                      </span>
                      <BlockMath math={correct.latex} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              {allVecCorrect || showAnswer ? (
                <button
                  onClick={() => loadNew(size)}
                  className={`${showAnswer ? "bg-amber-500 hover:bg-amber-600" : "bg-green-600 hover:bg-green-700"} text-white font-semibold px-6 py-2 rounded-lg transition-colors`}
                >
                  次の問題 →
                </button>
              ) : (
                <button
                  onClick={handleVecCheck}
                  disabled={vecSelections.some((s) => s === null) || vecChecked}
                  className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  答え合わせ
                </button>
              )}
              {vecChecked && !allVecCorrect && !showAnswer && (
                <button
                  onClick={() => loadNew(size)}
                  className="border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold px-5 py-2 rounded-lg transition-colors"
                >
                  次の問題 →
                </button>
              )}
              <button
                onClick={() => { setShowSteps((v) => !v); setCurrentStep(0); }}
                className="border border-rose-300 text-rose-600 hover:bg-rose-50 font-semibold px-5 py-2 rounded-lg transition-colors"
              >
                {showSteps ? "ヒントを閉じる" : "💡 ヒント"}
              </button>
              {!showAnswer && !allVecCorrect && (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="border border-amber-300 text-amber-600 hover:bg-amber-50 font-semibold px-5 py-2 rounded-lg transition-colors"
                >
                  📖 解答を表示
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Steps panel */}
      {showSteps && (
        <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6 space-y-4">
          <h3 className="font-bold text-gray-700 text-lg">解法ステップ</h3>
          <div className="space-y-3">
            {problem.steps.slice(0, currentStep + 1).map((step, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 transition-all ${
                  i === currentStep
                    ? "bg-rose-50 border border-rose-200"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-bold text-rose-600 mr-1">Step {i + 1}.</span>
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
                className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
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
