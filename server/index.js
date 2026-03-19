import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSampleQuestions } from './sampleData.js';

loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');
const port = Number(process.env.PORT) || 3001;
const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
      });
      return res.end();
    }

    if (req.method === 'GET' && req.url === '/health') {
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'POST' && req.url === '/generate-questions') {
      const body = await readJson(req);
      const { subject, questionType, numQuestions, difficulty } = body || {};

      if (!subject || !questionType || !difficulty || !Number.isInteger(numQuestions) || numQuestions < 5 || numQuestions > 20) {
        return sendJson(res, 400, {
          error: 'Invalid input. Please provide subject, questionType, difficulty, and numQuestions between 5 and 20.'
        });
      }

      try {
        const useOpenAI = Boolean(process.env.OPENAI_API_KEY);
        const questions = useOpenAI
          ? await generateWithOpenAI({ subject, questionType, numQuestions, difficulty })
          : getSampleQuestions(subject, questionType, numQuestions, difficulty);

        return sendJson(res, 200, {
          questions,
          meta: {
            source: useOpenAI ? `OpenAI (${model})` : 'Local sample bank',
            subject,
            questionType,
            difficulty
          }
        });
      } catch (error) {
        console.error('Question generation failed:', error);
        return sendJson(res, 200, {
          questions: getSampleQuestions(subject, questionType, numQuestions, difficulty),
          meta: {
            source: 'Local sample bank fallback',
            subject,
            questionType,
            difficulty
          },
          warning: 'AI generation failed, so fallback questions were returned.'
        });
      }
    }

    if (req.method === 'GET') {
      return serveStatic(req.url === '/' ? '/index.html' : req.url, res);
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error('Unhandled server error:', error);
    sendJson(res, 500, { error: 'Internal server error' });
  }
});

server.listen(port, () => {
  console.log(`Law Study Helper server listening on http://localhost:${port}`);
});

async function serveStatic(urlPath, res) {
  const safePath = path.normalize(urlPath).replace(/^\.+(\/|\\)/, '');
  const filePath = path.join(publicDir, safePath);
  if (!filePath.startsWith(publicDir)) {
    return sendJson(res, 403, { error: 'Forbidden' });
  }

  try {
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType(filePath) });
    res.end(data);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return sendJson(res, 404, { error: 'Not found' });
    }
    throw error;
  }
}


function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'text/plain; charset=utf-8';
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  });
  res.end(JSON.stringify(payload, null, 2));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function generateWithOpenAI({ subject, questionType, numQuestions, difficulty }) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      input: `Generate ${numQuestions} ${difficulty} ${questionType} study questions for ${subject}. Return JSON only using the schema fields prompt, options (for multiple choice only), correctAnswer, and explanation. Each explanation should help a law student revise doctrinal concepts clearly.`,
      text: {
        format: {
          type: 'json_schema',
          name: 'law_questions',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              questions: {
                type: 'array',
                minItems: numQuestions,
                maxItems: numQuestions,
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    prompt: { type: 'string' },
                    options: { type: 'array', items: { type: 'string' } },
                    correctAnswer: { type: 'string' },
                    explanation: { type: 'string' }
                  },
                  required: ['prompt', 'correctAnswer', 'explanation']
                }
              }
            },
            required: ['questions']
          }
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const parsed = JSON.parse(payload.output?.[0]?.content?.[0]?.text || payload.output_text || '{}');
  if (!Array.isArray(parsed.questions) || parsed.questions.length !== numQuestions) {
    throw new Error('Model returned an unexpected payload.');
  }

  return parsed.questions.map((question) => {
    if (questionType !== 'multiple choice') {
      return {
        prompt: question.prompt,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      };
    }

    return {
      prompt: question.prompt,
      options: Array.isArray(question.options) && question.options.length === 4 ? question.options : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    };
  });
}

function loadEnv() {
  const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env');
  if (!fs.existsSync(envPath)) return;

  const contents = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
