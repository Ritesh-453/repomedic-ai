const axios = require('axios');

const GITHUB_API = 'https://api.github.com';

// Parse owner and repo from URL
const parseRepoUrl = (repoUrl) => {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error('Invalid GitHub URL');
  return { owner: match[1], repo: match[2].replace('.git', '') };
};

// Fetch repo tree (all files)
const fetchRepoFiles = async (repoUrl) => {
  const { owner, repo } = parseRepoUrl(repoUrl);
  const headers = { Authorization: `token ${process.env.GITHUB_TOKEN}` };

  // Get default branch
  const repoInfo = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}`, { headers });
  const branch = repoInfo.data.default_branch;

  // Get full file tree
  const treeRes = await axios.get(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers }
  );

  const files = treeRes.data.tree.filter(f => f.type === 'blob');

  // Fetch content of important files (limit to avoid rate limits)
  const importantExtensions = ['.js', '.ts', '.py', '.java', '.go', '.json', '.env.example', '.md'];
  const importantFiles = files
    .filter(f => importantExtensions.some(ext => f.path.endsWith(ext)))
    .slice(0, 30); // max 30 files for MVP

  const fileContents = await Promise.all(
    importantFiles.map(async (file) => {
      try {
        const res = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/contents/${file.path}`, { headers });
        const content = Buffer.from(res.data.content, 'base64').toString('utf-8');
        return { path: file.path, content };
      } catch {
        return { path: file.path, content: '' };
      }
    })
  );

  return { owner, repo, branch, files: fileContents };
};

module.exports = { fetchRepoFiles, parseRepoUrl };
