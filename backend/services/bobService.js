// Repository Context Service
// Local repository analysis used to prepare relevant context for Grok.
// No IBM BOB, Watson, Groq, or external AI dependency.

const generateRepoContext = (parsedRepo, query = '') => {
  const { owner, repo, files, structure, readme } = parsedRepo;

  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3);

  const scoredFiles = files.map(file => {
    let score = 0;

    const pathLower = file.path.toLowerCase();
    const contentLower = file.content.toLowerCase();

    // Path relevance
    queryWords.forEach(word => {
      if (pathLower.includes(word)) {
        score += 10;
      }
    });

    // Content relevance
    queryWords.forEach(word => {
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const occurrences =
        contentLower.match(new RegExp(escapedWord, 'g')) || [];

      score += Math.min(occurrences.length * 2, 20);
    });

    // Important project files
    if (pathLower.includes('route')) score += 8;
    if (pathLower.includes('controller')) score += 8;
    if (pathLower.includes('middleware')) score += 6;
    if (pathLower.includes('auth')) score += 6;
    if (pathLower.includes('index')) score += 3;
    if (
      pathLower.includes('server') ||
      pathLower.includes('app.js')
    ) {
      score += 5;
    }
    if (pathLower.includes('error')) score += 5;
    if (pathLower.includes('model')) score += 4;

    // Reduce noise
    if (pathLower.endsWith('.md')) score -= 5;
    if (pathLower.endsWith('.json')) score -= 3;
    if (
      pathLower.includes('test') ||
      pathLower.includes('spec')
    ) {
      score -= 4;
    }

    if (pathLower.includes('node_modules')) {
      score -= 100;
    }

    return {
      ...file,
      relevanceScore: Math.max(0, score)
    };
  });

  const topFiles = scoredFiles
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 8);

  const highConfidenceFiles = topFiles.filter(
    file => file.relevanceScore >= 10
  );

  const lowConfidenceFiles = topFiles.filter(
    file => file.relevanceScore < 10
  );

  // Technology detection
  const hasPackageJson = files.some(
    file => file.path === 'package.json'
  );

  const hasRequirements = files.some(
    file => file.path === 'requirements.txt'
  );

  const hasPyFiles = files.some(
    file => file.path.endsWith('.py')
  );

  const hasJsFiles = files.some(
    file =>
      file.path.endsWith('.js') ||
      file.path.endsWith('.ts') ||
      file.path.endsWith('.jsx') ||
      file.path.endsWith('.tsx')
  );

  const hasNextJs = files.some(
    file =>
      file.content.includes('next') ||
      file.path.includes('next')
  );

  const hasExpress = files.some(
    file => file.content.includes('express')
  );

  const hasReact = files.some(
    file => file.content.includes('react')
  );

  const hasMongo = files.some(
    file =>
      file.content.toLowerCase().includes('mongoose') ||
      file.content.toLowerCase().includes('mongodb')
  );

  const hasSQL = files.some(
    file =>
      file.content.toLowerCase().includes('sequelize') ||
      file.content.toLowerCase().includes('prisma')
  );

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
  ]
    .filter(Boolean)
    .filter(
      (value, index, array) =>
        array.indexOf(value) === index
    )
    .join(', ');

  // Architecture detection
  const hasMVC = files.some(
    file =>
      file.path.includes('controller') ||
      file.path.includes('model')
  );

  const hasRoutes = files.some(
    file => file.path.includes('route')
  );

  const hasMiddleware = files.some(
    file => file.path.includes('middleware')
  );

  const architecture =
    hasMVC
      ? 'MVC'
      : hasRoutes
        ? 'Router-based'
        : hasMiddleware
          ? 'Middleware-based'
          : 'Standard';

  return `
Repository Context Report for: ${owner}/${repo}

TECH STACK:
${techStack || 'Unknown'}

ARCHITECTURE:
${architecture}

TOTAL FILES SCANNED:
${files.length}

QUERY:
"${query}"

TOP RELEVANT FILES:
${
  topFiles.length
    ? topFiles
        .map(
          file =>
            `- ${file.path} (relevance: ${file.relevanceScore})`
        )
        .join('\n')
    : '- No specific files identified'
}

HIGH CONFIDENCE FILES:
${
  highConfidenceFiles.length
    ? highConfidenceFiles
        .map(
          file =>
            `- ${file.path} (relevance: ${file.relevanceScore})`
        )
        .join('\n')
    : '- None'
}

SUPPORTING FILES:
${
  lowConfidenceFiles.length
    ? lowConfidenceFiles
        .map(file => `- ${file.path}`)
        .join('\n')
    : '- None'
}

REPOSITORY STRUCTURE:
${structure.slice(0, 1200)}

${readme ? `README:\n${readme.slice(0, 600)}` : ''}

This context was generated locally from the repository.
The AI analysis is performed separately by Grok.
`.trim();
};


const generateRepoSummary = parsedRepo => {
  const {
    owner,
    repo,
    files,
    structure,
    readme
  } = parsedRepo;

  const extensions = {};

  files.forEach(file => {
    const parts = file.path.split('.');

    if (parts.length > 1) {
      const extension = parts.pop();

      extensions[extension] =
        (extensions[extension] || 0) + 1;
    }
  });

  const topExtensions = Object.entries(extensions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([extension, count]) => `${extension}(${count})`)
    .join(', ');

  const hasMVC = files.some(
    file =>
      file.path.includes('controller') ||
      file.path.includes('model')
  );

  const hasRoutes = files.some(
    file => file.path.includes('route')
  );

  const architecture =
    hasMVC
      ? 'MVC'
      : hasRoutes
        ? 'Router-based'
        : 'Standard';

  const complexityScore = Math.min(
    100,
    Math.round((files.length / 50) * 100)
  );

  return `
Repository Summary for ${owner}/${repo}:

- Total files scanned: ${files.length}
- File types: ${topExtensions || 'Unknown'}
- Architecture: ${architecture}
- Complexity score: ${complexityScore}/100

Repository structure:
${structure.slice(0, 800)}

${readme ? `README:\n${readme.slice(0, 400)}` : ''}
`.trim();
};


module.exports = {
  generateRepoContext,
  generateRepoSummary
};