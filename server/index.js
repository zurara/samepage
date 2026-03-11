import express from 'express';
import cors from 'cors';
import getPort from 'get-port';
import open from 'open';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import chokidar from 'chokidar';
import dotenv from 'dotenv';
import * as storage from './storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the samepage-mvp project directory (not cwd)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Workspace root: set by CLI via env var, fallback to cwd
const workspaceRoot = process.env.SAMEPAGE_WORKSPACE || process.cwd();

// Documentation git repo — separate from the app's own .git/
// This ensures "app GitHub" and "documentation GitHub" never conflict.
const docsGitDir = path.join(workspaceRoot, '.samepage', 'docs.git');
function docsGitCmd() {
  return `git --git-dir="${docsGitDir}" --work-tree="${workspaceRoot}"`;
}

// Documentation paths to track (only these get synced to the docs GitHub repo)
const DOC_PATHS = ['docs/', 'tasks/', 'specs/', 'glossary/', '.samepage/config.json'];

// Initialize the docs git repo if it doesn't exist
function ensureDocsGitRepo() {
  if (!fs.existsSync(docsGitDir)) {
    fs.mkdirSync(path.dirname(docsGitDir), { recursive: true });
    execSync(`git init --bare "${docsGitDir}"`, { stdio: 'pipe' });
    // Configure the bare repo to allow a work-tree
    execSync(`git --git-dir="${docsGitDir}" config core.bare false`, { stdio: 'pipe' });
    execSync(`git --git-dir="${docsGitDir}" config core.worktree "${workspaceRoot}"`, { stdio: 'pipe' });
  }

  // Ensure git user identity is configured (required for commits)
  const gitCfg = `git --git-dir="${docsGitDir}"`;
  try {
    execSync(`${gitCfg} config user.name`, { stdio: 'pipe' });
  } catch {
    // Pull username from saved config, or use default
    const config = storage.getGitHubConfig();
    const username = config?.user?.login || 'Samepage';
    execSync(`${gitCfg} config user.name "${username}"`, { stdio: 'pipe' });
  }
  try {
    execSync(`${gitCfg} config user.email`, { stdio: 'pipe' });
  } catch {
    const config = storage.getGitHubConfig();
    const email = config?.user?.login ? `${config.user.login}@users.noreply.github.com` : 'samepage@localhost';
    execSync(`${gitCfg} config user.email "${email}"`, { stdio: 'pipe' });
  }
}

// Check if docs git repo exists AND has a remote configured
function docsRepoReady() {
  if (!fs.existsSync(docsGitDir)) return false;
  try {
    const remotes = execSync(`git --git-dir="${docsGitDir}" remote`, { encoding: 'utf8' }).trim();
    return remotes.includes('origin');
  } catch {
    return false;
  }
}

// Auto-migrate: if user has a repo in config but no docs.git, set it up
function ensureDocsRepoFromConfig() {
  const config = storage.getGitHubConfig();
  if (!config?.repo?.url || !config?.accessToken) return false;

  // If docs.git doesn't exist or has no remote, set it up from config
  if (!docsRepoReady()) {
    ensureDocsGitRepo();

    const match = config.repo.url.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
    if (!match) return false;

    const authUrl = `https://${config.accessToken}@github.com/${match[1]}/${match[2]}.git`;

    try {
      execSync(`${docsGitCmd()} remote remove origin`, { cwd: workspaceRoot, stdio: 'pipe' });
    } catch { }
    try {
      execSync(`${docsGitCmd()} remote add origin ${authUrl}`, { cwd: workspaceRoot, stdio: 'pipe' });
    } catch { }

    return docsRepoReady();
  }
  return true;
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist directory (built by Vite)
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));

// API Routes
app.get('/api/files', (req, res) => {
  try {
    const dir = req.query.dir || '';
    const files = storage.listFiles(dir);
    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/tree', (req, res) => {
  try {
    const tree = storage.getFileTree();
    res.json({ success: true, tree });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/file', (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ success: false, error: 'Path required' });
    }
    const content = storage.readFile(filePath);
    res.json({ success: true, content, path: filePath });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/file', (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    if (!filePath) {
      return res.status(400).json({ success: false, error: 'Path required' });
    }
    const result = storage.writeFile(filePath, content);
    res.json({ success: true, path: filePath });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/file/create', (req, res) => {
  try {
    const newPath = storage.createNewFile();
    res.json({ success: true, path: newPath });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/folder/create', (req, res) => {
  try {
    const parentDir = req.body.parentDir || '';
    const newPath = storage.createNewFolder(parentDir);
    res.json({ success: true, path: newPath });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/item', (req, res) => {
  try {
    const itemPath = req.query.path;
    if (!itemPath) {
      return res.status(400).json({ success: false, error: 'Path required' });
    }
    storage.deleteItem(itemPath);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/item/rename', (req, res) => {
  try {
    const { oldPath, newName } = req.body;
    if (!oldPath || !newName) {
      return res.status(400).json({ success: false, error: 'oldPath and newName required' });
    }
    const newPath = storage.renameItem(oldPath, newName);
    res.json({ success: true, newPath });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/item/move', (req, res) => {
  try {
    const { sourcePath, targetDir } = req.body;
    if (!sourcePath || targetDir === undefined) {
      return res.status(400).json({ success: false, error: 'sourcePath and targetDir required' });
    }
    const newPath = storage.moveItem(sourcePath, targetDir);
    res.json({ success: true, newPath });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Terminal — execute commands in workspace
app.post('/api/terminal/exec', (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'No command provided' });
  }

  try {
    const result = execSync(command, {
      cwd: workspaceRoot,
      encoding: 'utf8',
      timeout: 15000,
      maxBuffer: 1024 * 1024,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
    });
    res.json({ stdout: result });
  } catch (error) {
    res.json({
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      error: error.stderr || error.message,
      exitCode: error.status
    });
  }
});

// GitHub OAuth callback
app.get('/api/github/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.redirect('/?github=error&message=no_code');
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    // Get user info
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    const user = await userRes.json();

    // Save config
    storage.saveGitHubConfig({
      connected: true,
      user: { login: user.login, id: user.id },
      accessToken: tokenData.access_token
    });

    res.redirect('/?github=success');
  } catch (error) {
    res.redirect(`/?github=error&message=${encodeURIComponent(error.message)}`);
  }
});

// GitHub config (provides client_id to frontend)
app.get('/api/github/config', (req, res) => {
  res.json({ clientId: process.env.GITHUB_CLIENT_ID });
});

// GitHub status check
app.get('/api/github/status', (req, res) => {
  try {
    const config = storage.getGitHubConfig();
    res.json({ success: true, connected: config?.connected || false, user: config?.user || null, repo: config?.repo || null });
  } catch (error) {
    res.json({ success: true, connected: false, user: null, repo: null });
  }
});

// Connect to GitHub repo (uses separate docs git repo, never touches app's .git)
app.post('/api/github/clone', (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) {
    return res.status(400).json({ success: false, error: 'Repository URL required' });
  }

  try {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
    if (!match) {
      return res.status(400).json({ success: false, error: 'Invalid GitHub URL' });
    }
    const repoName = match[2];

    // Initialize separate docs git repo at .samepage/docs.git
    ensureDocsGitRepo();

    // Build authenticated URL using stored access token
    const config = storage.getGitHubConfig() || {};
    const accessToken = config.accessToken;
    const authUrl = accessToken
      ? `https://${accessToken}@github.com/${match[1]}/${match[2]}.git`
      : repoUrl;

    // Add or update remote origin on the DOCS git repo (not the app repo)
    try {
      execSync(`${docsGitCmd()} remote remove origin`, { cwd: workspaceRoot, stdio: 'pipe' });
    } catch { }
    execSync(`${docsGitCmd()} remote add origin ${authUrl}`, { cwd: workspaceRoot, stdio: 'pipe' });

    // Fetch from remote
    execSync(`${docsGitCmd()} fetch origin`, { cwd: workspaceRoot, stdio: 'pipe' });

    // Save repo config
    config.repo = { url: repoUrl, name: repoName };
    storage.saveGitHubConfig(config);

    res.json({ success: true, repo: repoName });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper: get default branch name (uses docs git repo)
function getDefaultBranch() {
  const cmd = docsGitCmd();

  // Try remote HEAD branch
  try {
    const remoteInfo = execSync(`${cmd} remote show origin`, { cwd: workspaceRoot, encoding: 'utf8' });
    const match = remoteInfo.match(/HEAD branch: (\S+)/);
    if (match && match[1] !== '(unknown)') return match[1];
  } catch { }

  // Try to detect remote branches
  try {
    const remoteBranches = execSync(`${cmd} ls-remote --heads origin`, { cwd: workspaceRoot, encoding: 'utf8' });
    if (remoteBranches.includes('refs/heads/main')) return 'main';
    if (remoteBranches.includes('refs/heads/master')) return 'master';
    const match = remoteBranches.match(/refs\/heads\/(\S+)/);
    if (match) return match[1];
  } catch { }

  // Try local branch
  try {
    const localBranch = execSync(`${cmd} branch --show-current`, { cwd: workspaceRoot, encoding: 'utf8' }).trim();
    if (localBranch) return localBranch;
  } catch { }

  return 'main';
}

// Pull from GitHub (uses docs git repo)
app.post('/api/github/pull', (req, res) => {
  try {
    // Auto-migrate from old config if needed, then check readiness
    if (!ensureDocsRepoFromConfig()) {
      return res.status(400).json({ success: false, error: 'No documentation repository connected. Click the GitHub icon to connect a repo first.' });
    }

    const cmd = docsGitCmd();

    // Check if remote has any branches (empty repo)
    try {
      const remoteBranches = execSync(`${cmd} ls-remote --heads origin`, { cwd: workspaceRoot, encoding: 'utf8' }).trim();
      if (!remoteBranches) {
        return res.json({ success: true, message: 'Remote repository is empty. Use Push to upload your files.' });
      }
    } catch { }

    const branch = getDefaultBranch();

    // Try to pull
    try {
      execSync(`${cmd} pull origin ${branch}`, { cwd: workspaceRoot, stdio: 'pipe' });
      res.json({ success: true, message: 'Pulled successfully' });
    } catch (pullError) {
      // Check for conflicts
      const conflictStatus = execSync(`${cmd} status`, { cwd: workspaceRoot, encoding: 'utf8' });
      if (conflictStatus.includes('both modified') || conflictStatus.includes('Unmerged')) {
        const conflictFiles = execSync(`${cmd} diff --name-only --diff-filter=U`, { cwd: workspaceRoot, encoding: 'utf8' }).trim().split('\n').filter(f => f);
        if (conflictFiles.length > 0) {
          const conflictFile = conflictFiles[0];
          let localContent = '';
          try {
            localContent = execSync(`${cmd} show :2:${conflictFile}`, { cwd: workspaceRoot, encoding: 'utf8' });
          } catch { localContent = ''; }
          let remoteContent = '';
          try {
            remoteContent = execSync(`${cmd} show :3:${conflictFile}`, { cwd: workspaceRoot, encoding: 'utf8' });
          } catch { remoteContent = ''; }

          return res.json({
            success: false,
            conflict: true,
            file: conflictFile,
            local: localContent,
            remote: remoteContent
          });
        }
      }
      throw pullError;
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Push to GitHub (uses docs git repo, only syncs documentation paths)
app.post('/api/github/push', (req, res) => {
  try {
    // Auto-migrate from old config if needed, then check readiness
    if (!ensureDocsRepoFromConfig()) {
      return res.status(400).json({ success: false, error: 'No documentation repository connected. Click the GitHub icon to connect a repo first.' });
    }

    const cmd = docsGitCmd();

    const branch = getDefaultBranch();

    // Add only documentation paths (NOT git add -A which would include app code)
    let addedAny = false;
    for (const docPath of DOC_PATHS) {
      const fullPath = path.join(workspaceRoot, docPath);
      if (fs.existsSync(fullPath)) {
        try {
          execSync(`${cmd} add "${docPath}"`, { cwd: workspaceRoot, stdio: 'pipe' });
          addedAny = true;
        } catch {
          // Skip paths that can't be added (e.g., empty directories)
        }
      }
    }

    // Check if there are staged changes to commit
    let hasChanges = false;
    try {
      const diff = execSync(`${cmd} diff --cached --name-only`, { cwd: workspaceRoot, encoding: 'utf8' }).trim();
      hasChanges = diff.length > 0;
    } catch {
      // If diff fails, check status instead
      const status = execSync(`${cmd} status --porcelain`, { cwd: workspaceRoot, encoding: 'utf8' });
      hasChanges = status.trim().length > 0;
    }

    if (hasChanges) {
      execSync(`${cmd} commit -m "Update from Samepage"`, { cwd: workspaceRoot, stdio: 'pipe' });
    }

    // Check if remote is empty (first push scenario)
    let isEmptyRemote = false;
    try {
      const remoteBranches = execSync(`${cmd} ls-remote --heads origin`, { cwd: workspaceRoot, encoding: 'utf8' }).trim();
      isEmptyRemote = !remoteBranches;
    } catch { }

    // For empty remote, ensure we have a proper branch
    if (isEmptyRemote) {
      try {
        execSync(`${cmd} branch -M ${branch}`, { cwd: workspaceRoot, stdio: 'pipe' });
      } catch { }
    }

    // Push to remote
    try {
      execSync(`${cmd} push -u origin ${branch}`, { cwd: workspaceRoot, stdio: 'pipe' });
      res.json({ success: true, message: 'Pushed successfully' });
    } catch (pushError) {
      res.json({ success: true, message: 'Committed locally (push failed - try pulling first)' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Resolve conflict - keep local (uses docs git repo)
app.post('/api/github/resolve/local', (req, res) => {
  try {
    const cmd = docsGitCmd();
    const branch = getDefaultBranch();
    execSync(`${cmd} checkout --ours .`, { cwd: workspaceRoot, stdio: 'pipe' });
    execSync(`${cmd} add -A`, { cwd: workspaceRoot, stdio: 'pipe' });
    execSync(`${cmd} rebase --continue`, { cwd: workspaceRoot, stdio: 'pipe', env: { ...process.env, GIT_EDITOR: 'true' } });
    execSync(`${cmd} push origin ${branch} --force-with-lease`, { cwd: workspaceRoot, stdio: 'pipe' });
    res.json({ success: true, message: 'Resolved with local version' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Resolve conflict - keep remote (uses docs git repo)
app.post('/api/github/resolve/remote', (req, res) => {
  try {
    const cmd = docsGitCmd();
    execSync(`${cmd} checkout --theirs .`, { cwd: workspaceRoot, stdio: 'pipe' });
    execSync(`${cmd} add -A`, { cwd: workspaceRoot, stdio: 'pipe' });
    execSync(`${cmd} rebase --continue`, { cwd: workspaceRoot, stdio: 'pipe', env: { ...process.env, GIT_EDITOR: 'true' } });
    res.json({ success: true, message: 'Resolved with remote version' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new GitHub repo (uses separate docs git repo)
app.post('/api/github/create', async (req, res) => {
  const { repoName } = req.body;
  if (!repoName) {
    return res.status(400).json({ success: false, error: 'Repository name required' });
  }

  try {
    const cmd = docsGitCmd();
    const config = storage.getGitHubConfig() || {};
    const username = config.user?.login || 'user';
    const accessToken = config.accessToken;

    // Initialize separate docs git repo
    ensureDocsGitRepo();

    // Add only documentation files and make initial commit
    for (const docPath of DOC_PATHS) {
      const fullPath = path.join(workspaceRoot, docPath);
      if (fs.existsSync(fullPath)) {
        try {
          execSync(`${cmd} add "${docPath}"`, { cwd: workspaceRoot, stdio: 'pipe' });
        } catch { }
      }
    }
    try {
      execSync(`${cmd} commit -m "Initial commit from Samepage"`, { cwd: workspaceRoot, stdio: 'pipe' });
    } catch {
      // Commit might fail if nothing to commit, that's ok
    }

    // Create repo via GitHub API if we have a token
    const repoUrl = `https://github.com/${username}/${repoName}`;
    if (accessToken) {
      try {
        const createRes = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: repoName,
            description: 'Documentation synced by Samepage',
            private: true
          })
        });

        if (createRes.ok) {
          // Add the authenticated remote
          const authUrl = `https://${accessToken}@github.com/${username}/${repoName}.git`;
          try {
            execSync(`${cmd} remote remove origin`, { cwd: workspaceRoot, stdio: 'pipe' });
          } catch { }
          execSync(`${cmd} remote add origin ${authUrl}`, { cwd: workspaceRoot, stdio: 'pipe' });

          // Push initial commit
          try {
            execSync(`${cmd} branch -M main`, { cwd: workspaceRoot, stdio: 'pipe' });
            execSync(`${cmd} push -u origin main`, { cwd: workspaceRoot, stdio: 'pipe' });
          } catch { }
        }
      } catch {
        // If API create fails, save config anyway so user can manually set up the repo
      }
    }

    config.repo = { url: repoUrl, name: repoName, created: true };
    storage.saveGitHubConfig(config);

    res.json({ success: true, repo: repoName, url: repoUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// SPA fallback — serve index.html for non-API routes
import fs from 'fs';
app.get('*', (req, res) => {
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('App not built yet. Run: npm run build');
  }
});

// Start server on fixed port (required for GitHub OAuth callback)
const port = 8000;

app.listen(port, 'localhost', () => {
  const url = `http://localhost:${port}`;
  console.log(`\n✨ Samepage running at ${url}\n`);
  console.log('Press Ctrl+C to stop\n');

  // Open browser
  open(url).catch(() => {
    console.log('Could not open browser automatically');
    console.log(`Please open: ${url}`);
  });
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${port} is already in use.`);
    console.error('GitHub OAuth requires a fixed port. Please free up port 8000 and try again.\n');
    process.exit(1);
  }
  throw err;
});

// File watcher for live reload
const watcher = chokidar.watch(workspaceRoot, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true
});

watcher.on('change', (path) => {
  console.log(`File changed: ${path}`);
});
