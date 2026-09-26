const axios = require('axios');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Safe char budget for small free models (~8k context)
const MAX_TOTAL_CHARS = 20000;


// =====================================================
// OPENROUTER
// =====================================================

const callOpenRouter = async (
  messages,
  maxTokens = 3000,
  temperature = 0.2,
  responseFormat = null
) => {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured in .env');
  }

  const body = {
    model: OPENROUTER_MODEL,
    messages,
    max_tokens: maxTokens,
    temperature
  };

  if (responseFormat) {
    body.response_format = responseFormat;
  }

  const response = await axios.post(
    OPENROUTER_API_URL,
    body,
    {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://repomedic.vercel.app',
        'X-Title': 'RepoMedic'
      }
    }
  );

  return response.data?.choices?.[0]?.message?.content || '';
};


// =====================================================
// BUG ANALYSIS
// =====================================================

const analyzeBug = async (
  parsedRepo,
  repoContext,
  bugDescription,
  relevantFiles   // ranked files passed in from analyzeController
) => {

  // Use ranked relevant files; fall back to first 8 if not provided
  const files = (relevantFiles && relevantFiles.length)
    ? relevantFiles
    : parsedRepo.files
        .filter(f =>
          !f.path.toLowerCase().endsWith('.md') &&
          !f.path.toLowerCase().includes('readme')
        )
        .slice(0, 8);

  // Distribute char budget evenly across files
  const perFileBudget = Math.floor(MAX_TOTAL_CHARS / Math.max(files.length, 1));

  const filesSummary = files
    .map(file => `
===== FILE: ${file.path} =====
${file.content.slice(0, perFileBudget)}
===== END FILE =====
`)
    .join('\n');

  const prompt = `
You are RepoMedic, an expert software debugging assistant.

Your job is to analyze the user's reported bug using the ACTUAL repository
source code provided below.

IMPORTANT RULES:

1. Do NOT invent code that is not present in the repository.
2. Do NOT assume that the first few lines of a file are the complete file.
3. Identify the actual file and code responsible for the reported bug.
4. Explain WHY the code is wrong.
5. If the provided code is insufficient to prove the bug, say so clearly.
6. Do NOT rewrite unrelated code.
7. The suggested fix must modify only the relevant part of the code.
8. Preserve the existing programming style and logic whenever possible.
9. Do NOT use README.md as source code.
10. Do not claim a bug exists merely because code looks unusual.

## Repository

${parsedRepo.owner}/${parsedRepo.repo}

## Repository Context

${repoContext}

## Repository Structure

${parsedRepo.structure}

## Source Code

${filesSummary}

## User Reported Bug

${bugDescription}

Analyze the reported bug.

Return:

- summary: short explanation of the actual problem
- rootCause: why the problem happens
- affectedFiles: exact files involved
- reasoning: clear technical reasoning
- fix: what should actually be changed and why
- improvedCode: corrected code for the affected section only
- confidence: confidence from 0 to 100

If you cannot determine the exact cause from the supplied source,
do NOT fabricate an answer. Explain what information is missing.
`;

  const responseFormat = {
    type: 'json_schema',
    json_schema: {
      name: 'bug_analysis',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          rootCause: { type: 'string' },
          affectedFiles: { type: 'array', items: { type: 'string' } },
          reasoning: { type: 'string' },
          fix: { type: 'string' },
          improvedCode: { type: 'string' },
          confidence: { type: 'number' }
        },
        required: ['summary', 'rootCause', 'affectedFiles', 'reasoning', 'fix', 'improvedCode', 'confidence'],
        additionalProperties: false
      }
    }
  };

  const text = await callOpenRouter(
    [
      {
        role: 'system',
        content: 'You are a precise software debugging expert. Never invent repository code. Always respond with valid JSON matching the required schema.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    4000,
    0.2,
    responseFormat  // ← was missing before; this is the primary fix
  );

  try {
    return JSON.parse(text);
  } catch {
    // Fallback: try to extract JSON block from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {}
    }

    // Last resort: regex scrape
    const getSection = (key) => {
      const patterns = [
        new RegExp(`\\*\\*${key}\\*\\*[:\\s]+([^*]+?)(?=\\*\\*|##|$)`, 'is'),
        new RegExp(`##\\s*${key}[:\\s]+([^#]+?)(?=##|$)`, 'is'),
        new RegExp(`${key}[:\\s]+([^\\n]+)`, 'i')
      ];
      for (const p of patterns) {
        const m = text.match(p);
        if (m) return m[1].trim();
      }
      return '';
    };

    const filesRaw = getSection('affectedFiles');
    const affectedFiles = filesRaw
      ? filesRaw.split(/[,\n]/).map(f => f.replace(/[-*`]/g, '').trim()).filter(Boolean)
      : [];

    return {
      summary: text,
      rootCause: getSection('rootCause'),
      affectedFiles,
      reasoning: getSection('reasoning'),
      fix: getSection('fix'),
      improvedCode: getSection('improvedCode'),
      confidence: parseInt(getSection('confidence')) || 0
    };
  }
};


// =====================================================
// CHAT WITH REPOSITORY
// =====================================================

const chatWithRepo = async (
  parsedRepo,
  repoContext,
  question,
  history = []
) => {

  const sourceFiles = parsedRepo.files
    .filter(file =>
      !file.path.toLowerCase().endsWith('.md') &&
      !file.path.toLowerCase().includes('readme')
    )
    .slice(0, 10);

  const perFileBudget = Math.floor(MAX_TOTAL_CHARS / Math.max(sourceFiles.length, 1));

  const filesSummary = sourceFiles
    .map(file => `
===== ${file.path} =====
${file.content.slice(0, perFileBudget)}
===== END =====
`)
    .join('\n');

  const messages = [
    {
      role: 'system',
      content:
        'You are RepoMedic, a helpful software engineer answering questions about the provided GitHub repository. Use only the supplied repository information and source code. Do not invent files or functionality.'
    },
    ...history,
    {
      role: 'user',
      content: `
Repository context:

${repoContext}

Repository files:

${filesSummary}

Question:

${question}
`
    }
  ];

  return await callOpenRouter(messages, 2000, 0.4);
};


// =====================================================
// GENERATE FIX
// =====================================================

const generateFix = async (
  fileContent,
  bugDescription,
  language = 'javascript'
) => {

  // Truncate large files to stay within model context
  const truncatedContent = fileContent.slice(0, 12000);

  const prompt = `
You are RepoMedic's code-fixing engine.

Fix the reported bug in the provided source code.

Programming language:
${language}

Bug:
${bugDescription}

Complete source file:
${truncatedContent}

IMPORTANT RULES:

1. Return a COMPLETE corrected version of the provided file.
2. Do not remove working functionality.
3. Do not rewrite unrelated parts.
4. Preserve the original structure and style.
5. Explain exactly why the change fixes the bug.
6. If the reported bug cannot be confirmed from the code, say so.
7. Never return a partial file as fixedCode.

Return:
- 2 to 4 precise fix steps
- why each change is required
- the complete corrected file
`;

  const responseFormat = {
    type: 'json_schema',
    json_schema: {
      name: 'bug_fix',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          steps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                explanation: { type: 'string' },
                code: { type: 'string' }
              },
              required: ['title', 'explanation', 'code'],
              additionalProperties: false
            }
          },
          fixedCode: { type: 'string' }
        },
        required: ['steps', 'fixedCode'],
        additionalProperties: false
      }
    }
  };

  const text = await callOpenRouter(
    [
      {
        role: 'system',
        content: 'You are an expert software engineer. Return precise, minimal, production-safe fixes. Always respond with valid JSON matching the required schema.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    6000,
    0.2,
    responseFormat
  );

  try {
    return JSON.parse(text);
  } catch {
    // Try to extract JSON block
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {}
    }

    return {
      steps: [
        {
          title: 'Unable to generate structured fix',
          explanation: text,
          code: ''
        }
      ],
      fixedCode: fileContent
    };
  }
};


// =====================================================
// REPOSITORY EXPLANATION
// =====================================================

const explainRepo = async (parsedRepo, repoContext) => {
  const readme = parsedRepo.readme || '';
  const structure = parsedRepo.structure || '';

  const prompt = `
Explain this GitHub repository in simple English.

Repository:

${repoContext}

README:

${readme.slice(0, 1500)}

File structure:

${structure.slice(0, 1000)}

Explain:

1. What the project does
2. Who it is for
3. Main features
4. Technologies used

Keep it concise and easy to understand.
Do not include source code.
`;

  return (
    await callOpenRouter(
      [{ role: 'user', content: prompt }],
      800,
      0.5
    )
  ).trim();
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  analyzeBug,
  chatWithRepo,
  generateFix,
  explainRepo
};