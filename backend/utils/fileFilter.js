const IMPORTANT_EXTENSIONS = ['.js', '.ts', '.py', '.java', '.go', '.jsx', '.tsx'];
const SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', '__pycache__'];

const isImportantFile = (path) => {
  if (SKIP_DIRS.some(dir => path.includes(dir))) return false;
  return IMPORTANT_EXTENSIONS.some(ext => path.endsWith(ext));
};

module.exports = { isImportantFile };
