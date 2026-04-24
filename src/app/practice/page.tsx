'use client';

import { useMemo, useState } from 'react';

type PracticeResult = {
  answer: string;
  correct: boolean;
};

type GeneratedProblem = {
  prompt: string;
  value: number;
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProblem(): GeneratedProblem {
  const x = randomInt(2, 20);
  const y = randomInt(1, 12);
  const z = randomInt(1, 15);
  const operators = ['+', '-', '*'];
  const operation = operators[randomInt(0, operators.length - 1)];

  if (operation === '+') {
    return { prompt: `Compute ${x} + ${y} + ${z}`, value: x + y + z };
  }
  if (operation === '-') {
    return { prompt: `Compute ${x * 2} - ${y} + ${z}`, value: x * 2 - y + z };
  }
  return { prompt: `Compute ${x} * ${y} - ${z}`, value: x * y - z };
}

export default function PracticePage() {
  const [problem, setProblem] = useState<GeneratedProblem>(() => generateProblem());
  const [answerInput, setAnswerInput] = useState('');
  const [history, setHistory] = useState<PracticeResult[]>([]);

  const score = useMemo(() => history.filter((item) => item.correct).length, [history]);

  const submitAnswer = () => {
    const numeric = Number(answerInput);
    const correct = Number.isFinite(numeric) && Math.abs(numeric - problem.value) < 0.0001;
    setHistory((prev) => [...prev, { answer: answerInput, correct }]);
    setAnswerInput('');
  };

  const nextProblem = () => {
    setProblem(generateProblem());
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Practice Room</h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
        Warm up with quick arithmetic rounds before jumping into live matchmaking.
      </p>

      <div className="mb-4 rounded border p-6 text-3xl dark:bg-slate-800">{problem.prompt}</div>

      <div className="mb-6 flex gap-2">
        <input
          className="flex-1 rounded border p-2 dark:bg-slate-700"
          value={answerInput}
          onChange={(e) => setAnswerInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
          placeholder="Type your answer..."
        />
        <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={submitAnswer}>
          Check
        </button>
        <button className="rounded border px-4 py-2" onClick={nextProblem}>
          Next
        </button>
      </div>

      <div className="rounded border p-4 dark:bg-slate-800">
        <p className="mb-2 font-medium">
          Score: {score}/{history.length}
        </p>
        <div className="max-h-52 space-y-2 overflow-y-auto text-sm">
          {history.length === 0 ? (
            <p className="text-gray-500">No attempts yet.</p>
          ) : (
            history.map((attempt, idx) => (
              <p key={`${attempt.answer}-${idx}`} className={attempt.correct ? 'text-green-600' : 'text-red-600'}>
                Attempt {idx + 1}: {attempt.answer || '(empty)'} - {attempt.correct ? 'correct' : 'incorrect'}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
