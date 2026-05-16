const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Main bug analysis
const analyzeBug = async (parsedRepo, repoContext, bugDescription) => {
  const filesSummary = parsedRepo.files
    .slice(0, 15)
    .map(f => `### ${f.path}\n${f.content.slice(0, 500)}`)
    .join('\n\n');

  const prompt = `You are a senior software engineer and debugging expert.

## Repository: ${parsedRepo.owner}/${parsedRepo.repo}
## Repository Structure:
${parsedRepo.structure}

## Repository Context:
${repoContext}

## Relevant File Contents:
${filesSummary}

## Bug Description:
${bugDescription}

Analyze this bug and respond ONLY in this exact JSON format with no extra text:
{
  "summary": "One line summary of the issue",
  "rootCause": "Detailed root cause explanation",
  "affectedFiles": ["file1.js", "file2.js"],
  "reasoning": "Step by step reasoning",
  "fix": "How to fix the bug in plain english",
  "improvedCode": "The corrected code snippet",
  "confidence": 85
}`;

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2000,
    temperature: 0.3
  });

  const text = response.choices[0].message.content;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: text, rootCause: text, affectedFiles: [], fix: '', improvedCode: '', confidence: 0 };
  } catch {
    return { summary: text, rootCause: text, affectedFiles: [], fix: '', improvedCode: '', confidence: 0 };
  }
};

// Chat with repo
const chatWithRepo = async (parsedRepo, repoContext, question, history) => {
  const filesSummary = parsedRepo.files
    .slice(0, 10)
    .map(f => `### ${f.path}\n${f.content.slice(0, 300)}`)
    .join('\n\n');

  const messages = [
    {
      role: 'system',
      content: 'You are a helpful code assistant. Answer questions about the repository clearly and concisely.'
    },
    ...history,
    {
      role: 'user',
      content: `Repository context:\n${repoContext}\n\nFiles:\n${filesSummary}\n\nQuestion: ${question}`
    }
  ];

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    max_tokens: 1000,
    temperature: 0.5
  });

  return response.choices[0].message.content;
};

// Generate step-by-step fix for a specific bug
const generateFix = async (fileContent, bugDescription, language = 'javascript') => {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{
      role: 'user',
      content: `You are an expert software engineer. Fix the following bug step by step.

Bug Description: ${bugDescription}

Relevant Code:
${fileContent}

Respond ONLY in this exact JSON format with no extra text, no markdown, no backticks:
{
  "steps": [
    {
      "title": "Short title of this step",
      "explanation": "Why this is the problem and what needs to change here",
      "code": "// code snippet for this step if needed, else empty string"
    }
  ],
  "fixedCode": "// Complete corrected code here"
}

Rules:
- Give 2 to 4 steps maximum
- Each explanation must say WHY, not just what
- fixedCode must be the full corrected version
- Return ONLY the JSON, nothing else`
    }],
    max_tokens: 2000,
    temperature: 0.3
  });

  const text = response.choices[0].message.content.trim();
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {
      steps: [{ title: 'Fix Applied', explanation: text, code: '' }],
      fixedCode: fileContent
    };
  } catch {
    return {
      steps: [{ title: 'Fix Applied', explanation: text, code: '' }],
      fixedCode: fileContent
    };
  }
};

// ADD THIS FUNCTION to groqService.js before module.exports

const explainRepo = async (parsedRepo, bobSummary) => {
  const readme = parsedRepo.readme || '';
  const structure = parsedRepo.structure || '';

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{
      role: 'user',
      content: `You are a helpful assistant that explains GitHub repositories in simple plain English.

Here is the repository information:

BOB Analysis:
${bobSummary}

README content:
${readme.slice(0, 1000)}

File structure:
${structure.slice(0, 500)}

Write a clear, simple explanation of:
1. What this project does (1-2 sentences, no jargon)
2. Who it is for
3. Main features (3-4 bullet points max)
4. Tech stack used

Keep it friendly and simple. No code, no markdown symbols, no HTML tags. Plain English only.`
    }],
    max_tokens: 500,
    temperature: 0.5
  });

  return response.choices[0].message.content.trim();
};

// UPDATE module.exports to include explainRepo:
// module.exports = { analyzeBug, chatWithRepo, generateFix, explainRepo };

module.exports = { analyzeBug, chatWithRepo, generateFix, explainRepo };