# Law Study Helper

A full-stack web application that helps law students generate practice questions with answers and explanations.

## Features

- Select a law subject, question type, number of questions, and difficulty.
- Generate multiple choice, short answer, or essay-style questions.
- Reveal model answers and explanations after submission.
- Supports OpenAI-backed generation when `OPENAI_API_KEY` is configured.
- Includes a built-in 5-question sample flow for instant testing.

## Tech Stack

- **Frontend:** React (loaded in-browser with ES modules) + Tailwind CDN
- **Backend:** Node.js HTTP server
- **API:** `POST /generate-questions`

## Run locally

```bash
cp .env.example .env
npm run dev
```

Open `http://localhost:3001`.

## Environment variables

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-mini
PORT=3001
```

## API request example

```json
{
  "subject": "Contract Law",
  "questionType": "multiple choice",
  "numQuestions": 5,
  "difficulty": "medium"
}
```

## API response example

```json
{
  "questions": [
    {
      "prompt": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "B",
      "explanation": "Detailed explanation here"
    }
  ]
}
```

## Test the 5-sample-question flow

```bash
curl -X POST http://localhost:3001/generate-questions \
  -H 'Content-Type: application/json' \
  -d '{"subject":"Contract Law","questionType":"multiple choice","numQuestions":5,"difficulty":"medium"}'
```
