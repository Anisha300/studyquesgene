import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

const SUBJECTS = [
  'Contract Law',
  'Criminal Law',
  'Constitutional Law',
  'Hindu Law',
  'Muslim Law',
  'Jurisprudence'
];

const QUESTION_TYPES = [
  { value: 'multiple choice', label: 'Multiple Choice' },
  { value: 'short answer', label: 'Short Answer' },
  { value: 'essay/open response', label: 'Essay / Open Response' }
];

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const SAMPLE_REQUEST = {
  subject: 'Contract Law',
  questionType: 'multiple choice',
  numQuestions: 5,
  difficulty: 'medium'
};

function App() {
  const [form, setForm] = useState(SAMPLE_REQUEST);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState(null);

  const canSubmit = useMemo(() => form.numQuestions >= 5 && form.numQuestions <= 20, [form]);

  async function generateQuestions(request = form) {
    setLoading(true);
    setError('');
    setRevealed(false);
    try {
      const response = await fetch('/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate questions.');
      setQuestions(data.questions || []);
      setAnswers({});
      setMeta(data.meta || null);
    } catch (err) {
      setQuestions([]);
      setMeta(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const score = questions.reduce((total, question, index) => {
    if (!revealed) return total;
    return normalize(answers[index]) === normalize(question.correctAnswer) ? total + 1 : total;
  }, 0);

  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-8' },
    React.createElement('div', { className: 'mx-auto flex max-w-7xl flex-col gap-8' }, [
      React.createElement('header', { key: 'header', className: 'rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur' },
        React.createElement('div', { className: 'flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between' }, [
          React.createElement('div', { key: 'copy', className: 'max-w-3xl space-y-3' }, [
            React.createElement('p', { key: 'eyebrow', className: 'text-sm font-semibold uppercase tracking-[0.35em] text-blue-300' }, 'Law Study Helper'),
            React.createElement('h1', { key: 'title', className: 'text-4xl font-bold tracking-tight text-white sm:text-5xl' }, 'Generate smarter practice questions for your law exams.'),
            React.createElement('p', { key: 'subtitle', className: 'text-lg text-slate-300' }, 'Choose a subject, format, difficulty, and question count to create instant practice sets with answers and explanations.')
          ]),
          React.createElement('button', {
            key: 'sample',
            type: 'button',
            onClick: () => generateQuestions(SAMPLE_REQUEST),
            className: 'rounded-2xl border border-blue-400/50 bg-blue-500/20 px-5 py-3 font-medium text-blue-100 transition hover:bg-blue-500/30'
          }, 'Load 5 sample questions')
        ])
      ),
      React.createElement('main', { key: 'main', className: 'grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]' }, [
        React.createElement('section', { key: 'controls', className: 'rounded-3xl border border-white/10 bg-slate-900/75 p-6 shadow-2xl backdrop-blur' }, [
          React.createElement('div', { key: 'intro', className: 'mb-6 space-y-2' }, [
            React.createElement('h2', { key: 'heading', className: 'text-2xl font-semibold text-white' }, 'Create a study set'),
            React.createElement('p', { key: 'desc', className: 'text-sm leading-6 text-slate-300' }, 'The backend supports dynamic generation through OpenAI. If no API key is configured, the app falls back to curated local sample questions so you can still test the experience.')
          ]),
          React.createElement('form', {
            key: 'form',
            className: 'space-y-5',
            onSubmit: async (event) => {
              event.preventDefault();
              await generateQuestions();
            }
          }, [
            field('Law subject', React.createElement('select', {
              value: form.subject,
              onChange: (e) => setForm({ ...form, subject: e.target.value }),
              className: inputClasses
            }, SUBJECTS.map((subject) => React.createElement('option', { key: subject, value: subject }, subject)))),
            field('Question type', React.createElement('select', {
              value: form.questionType,
              onChange: (e) => setForm({ ...form, questionType: e.target.value }),
              className: inputClasses
            }, QUESTION_TYPES.map((type) => React.createElement('option', { key: type.value, value: type.value }, type.label)))),
            field('Number of questions', React.createElement('input', {
              type: 'number',
              min: 5,
              max: 20,
              value: form.numQuestions,
              onChange: (e) => setForm({ ...form, numQuestions: Number(e.target.value) }),
              className: inputClasses
            })),
            field('Difficulty', React.createElement('div', { className: 'grid grid-cols-3 gap-2' }, DIFFICULTIES.map((difficulty) => {
              const active = form.difficulty === difficulty;
              return React.createElement('button', {
                key: difficulty,
                type: 'button',
                onClick: () => setForm({ ...form, difficulty }),
                className: `rounded-2xl border px-3 py-2 text-sm font-semibold capitalize transition ${active ? 'border-blue-400 bg-blue-500/20 text-blue-100' : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'}`
              }, difficulty);
            }))),
            React.createElement('button', {
              key: 'submit',
              type: 'submit',
              disabled: !canSubmit || loading,
              className: 'w-full rounded-2xl bg-blue-500 px-4 py-3 font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-slate-700'
            }, loading ? 'Generating…' : 'Generate Questions')
          ]),
          React.createElement('div', { key: 'request', className: 'mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100' }, [
            React.createElement('p', { key: 'label', className: 'font-semibold' }, 'Sample API request'),
            React.createElement('pre', { key: 'json', className: 'mt-3 overflow-x-auto whitespace-pre-wrap text-xs text-emerald-50/90' }, JSON.stringify(SAMPLE_REQUEST, null, 2))
          ])
        ]),
        React.createElement('section', { key: 'questions', className: 'rounded-3xl border border-white/10 bg-slate-900/75 p-6 shadow-2xl backdrop-blur' }, [
          React.createElement('div', { key: 'head', className: 'mb-6 flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between' }, [
            React.createElement('div', { key: 'copy' }, [
              React.createElement('h2', { key: 'title', className: 'text-2xl font-semibold text-white' }, 'Generated questions'),
              React.createElement('p', { key: 'sub', className: 'text-sm text-slate-300' }, 'Submit your answers to reveal the correct response and explanation for each question.')
            ]),
            meta && React.createElement('div', { key: 'meta', className: 'rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200' }, [
              React.createElement('div', { key: 'source' }, [React.createElement('span', { className: 'font-semibold' }, 'Source: '), meta.source]),
              React.createElement('div', { key: 'set' }, [React.createElement('span', { className: 'font-semibold' }, 'Set: '), `${meta.subject} · ${meta.questionType}`])
            ])
          ]),
          error && React.createElement('div', { key: 'error', className: 'mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200' }, error),
          !questions.length && !loading && React.createElement('div', { key: 'empty', className: 'flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-950/40 p-10 text-center text-slate-400' }, 'Generate a question set or load the built-in 5-question example to start studying.'),
          React.createElement('div', { key: 'list', className: 'space-y-5' }, questions.map((question, index) => {
            const answer = answers[index] || '';
            const isCorrect = normalize(answer) === normalize(question.correctAnswer);
            return React.createElement('article', { key: `${index}-${question.prompt}`, className: 'rounded-3xl border border-white/10 bg-slate-950/50 p-5' }, [
              React.createElement('div', { key: 'top', className: 'mb-4 flex items-start justify-between gap-4' }, [
                React.createElement('div', { key: 'question' }, [
                  React.createElement('p', { key: 'num', className: 'text-sm font-semibold uppercase tracking-[0.3em] text-blue-300' }, `Question ${index + 1}`),
                  React.createElement('h3', { key: 'prompt', className: 'mt-2 text-lg font-semibold text-white' }, question.prompt)
                ]),
                revealed && React.createElement('span', { key: 'status', className: `rounded-full px-3 py-1 text-xs font-semibold ${isCorrect ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-200'}` }, isCorrect ? 'Correct' : 'Review')
              ]),
              Array.isArray(question.options) && question.options.length
                ? React.createElement('div', { key: 'options', className: 'grid gap-3 sm:grid-cols-2' }, question.options.map((option) => React.createElement('label', {
                    key: option,
                    className: `rounded-2xl border p-4 transition ${revealed && option === question.correctAnswer ? 'border-emerald-400/50 bg-emerald-500/10' : answer === option ? 'border-blue-400 bg-blue-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`
                  }, [
                    React.createElement('input', {
                      key: 'input',
                      type: 'radio',
                      name: `question-${index}`,
                      value: option,
                      checked: answer === option,
                      onChange: (e) => setAnswers({ ...answers, [index]: e.target.value }),
                      className: 'mr-3'
                    }),
                    option
                  ])))
                : React.createElement('textarea', {
                    key: 'textarea',
                    rows: 4,
                    value: answer,
                    onChange: (e) => setAnswers({ ...answers, [index]: e.target.value }),
                    placeholder: 'Type your answer here',
                    className: `${inputClasses} min-h-32 w-full resize-y`
                  }),
              revealed && React.createElement('div', { key: 'answer-box', className: 'mt-5 rounded-2xl border border-white/10 bg-white/5 p-4' }, [
                React.createElement('p', { key: 'answer-label', className: 'text-sm font-semibold text-blue-200' }, 'Correct answer'),
                React.createElement('p', { key: 'answer-value', className: 'mt-1 text-slate-100' }, question.correctAnswer),
                React.createElement('p', { key: 'explanation-label', className: 'mt-4 text-sm font-semibold text-blue-200' }, 'Explanation'),
                React.createElement('p', { key: 'explanation', className: 'mt-1 leading-7 text-slate-300' }, question.explanation)
              ])
            ]);
          })),
          questions.length > 0 && React.createElement('div', { key: 'footer', className: 'mt-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between' }, [
            React.createElement('div', { key: 'text' }, [
              React.createElement('p', { key: 'title', className: 'text-lg font-semibold text-white' }, 'Ready to self-check?'),
              React.createElement('p', { key: 'summary', className: 'text-sm text-slate-300' }, revealed ? `You answered ${score} out of ${questions.length} exactly as expected.` : 'When you submit, the app reveals model answers and explanations.')
            ]),
            React.createElement('button', {
              key: 'toggle',
              type: 'button',
              onClick: () => setRevealed(!revealed),
              className: 'rounded-2xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-200'
            }, revealed ? 'Hide Answers' : 'Submit & View Answers')
          ])
        ])
      ])
    ])
  );
}

const inputClasses = 'w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-400';
const field = (label, control) => React.createElement('label', { className: 'block space-y-2' }, [
  React.createElement('span', { key: 'label', className: 'text-sm font-medium text-slate-200' }, label),
  React.cloneElement(control, { key: 'control' })
]);
const normalize = (value) => String(value || '').trim().toLowerCase();

createRoot(document.getElementById('root')).render(React.createElement(App));
