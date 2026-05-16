// IBM BOB Context Service
// IBM BOB acts as the repository intelligence layer:
// - Scores every file for relevance to the query
// - Ranks and filters files before passing to Groq
// - Detects tech stack and architecture patterns
// - Reduces AI noise by only sending high-signal files

const generateRepoContext = (parsedRepo, query) => {
  const { owner, repo, files, structure, readme } = parsedRepo;

  // ─── BOB CORE: Score every file for relevance ───
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  const scoredFiles = files.map(f => {
    let score = 0;
    const pathLower = f.path.toLowerCase();
    const contentLower = f.content.toLowerCase();

    // Path match — high signal
    queryWords.forEach(word => {
      if (pathLower.includes(word)) score += 10;
    });

    // Content match — medium signal
    queryWords.forEach(word => {
      const occurrences = (contentLower.match(new RegExp(word, 'g')) || []).length;
      score += Math.min(occurrences * 2, 20); // cap at 20 per word
    });

    // Boost key files
    if (pathLower.includes('route')) score += 8;
    if (pathLower.includes('controller')) score += 8;
    if (pathLower.includes('middleware')) score += 6;
    if (pathLower.includes('auth')) score += 6;
    if (pathLower.includes('index')) score += 3;
    if (pathLower.includes('server') || pathLower.includes('app.js')) score += 5;
    if (pathLower.includes('error')) score += 5;
    if (pathLower.includes('model')) score += 4;

    // Penalize non-code files
    if (pathLower.endsWith('.md')) score -= 5;
    if (pathLower.endsWith('.json')) score -= 3;
    if (pathLower.includes('test') || pathLower.includes('spec')) score -= 4;
    if (pathLower.includes('node_modules')) score -= 100;

    return { ...f, relevanceScore: Math.max(0, score) };
  });

  // Sort by score, take top 8
  const topFiles = scoredFiles
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 8);

  const highConfidenceFiles = topFiles.filter(f => f.relevanceScore >= 10);
  const lowConfidenceFiles = topFiles.filter(f => f.relevanceScore < 10);

  // ─── Tech Stack Detection ───
  const hasPackageJson = files.some(f => f.path === 'package.json');
  const hasRequirements = files.some(f => f.path === 'requirements.txt');
  const hasPyFiles = files.some(f => f.path.endsWith('.py'));
  const hasJsFiles = files.some(f => f.path.endsWith('.js') || f.path.endsWith('.ts'));
  const hasNextJs = files.some(f => f.content.includes('next') || f.path.includes('next'));
  const hasExpress = files.some(f => f.content.includes('express'));
  const hasReact = files.some(f => f.content.includes('react'));
  const hasMongo = files.some(f => f.content.toLowerCase().includes('mongoose') || f.content.toLowerCase().includes('mongodb'));
  const hasSQL = files.some(f => f.content.toLowerCase().includes('sequelize') || f.content.toLowerCase().includes('prisma'));

  const techStack = [
    hasPackageJson && 'Node.js',
    hasRequirements && 'Python',
    hasPyFiles && 'Python',
    hasJsFiles && 'JavaScript',
    hasNextJs && 'Next.js',
    hasExpress && 'Express.js',
    hasReact && 'React',
    hasMongo && 'MongoDB',
    hasSQL && 'SQL/ORM'
  ].filter(Boolean).join(', ');

  // ─── Architecture Pattern Detection ───
  const hasMVC = files.some(f => f.path.includes('controller') || f.path.includes('model'));
  const hasRoutes = files.some(f => f.path.includes('route'));
  const hasMiddleware = files.some(f => f.path.includes('middleware'));
  const pattern = hasMVC ? 'MVC' : hasRoutes ? 'Router-based' : 'Unknown';

  // ─── Build Context String for Groq ───
  const context = `
IBM BOB Repository Intelligence Report for: ${owner}/${repo}

TECH STACK: ${techStack || 'Unknown'}
ARCHITECTURE PATTERN: ${pattern}
TOTAL FILES SCANNED: ${files.length}
QUERY: "${query}"

BOB FILE RELEVANCE SCORES (top files for this query):
${topFiles.map(f => `  [score:${f.relevanceScore}] ${f.path}`).join('\n')}

HIGH CONFIDENCE FILES (score ≥ 10):
${highConfidenceFiles.length > 0
    ? highConfidenceFiles.map(f => `- ${f.path} (score: ${f.relevanceScore})`).join('\n')
    : '- None found above threshold'}

LOW CONFIDENCE FILES (may be related):
${lowConfidenceFiles.length > 0
    ? lowConfidenceFiles.map(f => `- ${f.path}`).join('\n')
    : '- None'}

REPOSITORY STRUCTURE:
${structure.slice(0, 800)}

${readme ? `README SUMMARY:\n${readme.slice(0, 400)}` : ''}

BOB ANALYSIS: This is a ${techStack} project using ${pattern} architecture.
For the query "${query}", BOB identified ${highConfidenceFiles.length} high-confidence files 
and ${lowConfidenceFiles.length} supporting files out of ${files.length} total files scanned.
`.trim();

  return context;
};

const generateRepoSummary = (parsedRepo) => {
  const { owner, repo, files, structure, readme } = parsedRepo;

  const extensions = {};
  files.forEach(f => {
    const ext = f.path.split('.').pop();
    extensions[ext] = (extensions[ext] || 0) + 1;
  });

  const topExtensions = Object.entries(extensions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([ext, count]) => `${ext}(${count})`)
    .join(', ');

  // Architecture detection
  const hasMVC = files.some(f => f.path.includes('controller') || f.path.includes('model'));
  const hasRoutes = files.some(f => f.path.includes('route'));
  const pattern = hasMVC ? 'MVC' : hasRoutes ? 'Router-based' : 'Standard';

  // Complexity score
  const complexityScore = Math.min(100, Math.round((files.length / 50) * 100));

  return `
IBM BOB Summary for ${owner}/${repo}:
- Total files scanned: ${files.length}
- File types: ${topExtensions}
- Architecture: ${pattern}
- Complexity score: ${complexityScore}/100
`.trim();
};

module.exports = { generateRepoContext, generateRepoSummary };