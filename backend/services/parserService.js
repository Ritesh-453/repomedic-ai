// Parses and filters repo files to extract meaningful structure

const parseRepo = (repoData) => {
  const { owner, repo, branch, files } = repoData;

  // Separate by type
  const jsFiles = files.filter(f => f.path.endsWith('.js') || f.path.endsWith('.ts'));
  const pyFiles = files.filter(f => f.path.endsWith('.py'));
  const configFiles = files.filter(f => f.path.includes('package.json') || f.path.includes('requirements.txt'));
  const readmeFile = files.find(f => f.path.toLowerCase() === 'readme.md');

  // Build structure summary
  const structure = files.map(f => f.path).join('\n');

  return {
    owner,
    repo,
    branch,
    structure,
    files,
    jsFiles,
    pyFiles,
    configFiles,
    readme: readmeFile?.content || '',
    totalFiles: files.length
  };
};

module.exports = { parseRepo };
