import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get workspace root from environment variable (set by CLI), fallback to cwd
const workspaceRoot = process.env.SAMEPAGE_WORKSPACE || process.cwd();

export function listFiles(dir = '') {
  const targetPath = path.join(workspaceRoot, dir);
  
  if (!fs.existsSync(targetPath)) {
    return [];
  }
  
  const items = fs.readdirSync(targetPath, { withFileTypes: true });
  
  return items
    .filter(item => !item.name.startsWith('.'))
    .map(item => ({
      name: item.name,
      path: path.join(dir, item.name),
      type: item.isDirectory() ? 'directory' : 'file',
      isMarkdown: item.isFile() && item.name.endsWith('.md')
    }));
}

export function readFile(filePath) {
  const fullPath = path.join(workspaceRoot, filePath);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error('File not found');
  }
  
  return fs.readFileSync(fullPath, 'utf-8');
}

export function writeFile(filePath, content) {
  const fullPath = path.join(workspaceRoot, filePath);
  const dir = path.dirname(fullPath);
  
  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, content, 'utf-8');
  return { success: true };
}

export function createNewFile() {
  // Find the next available Untitled-N.md filename
  let counter = 1;
  let filename;

  do {
    filename = `Untitled-${counter}.md`;
    counter++;
  } while (fs.existsSync(path.join(workspaceRoot, filename)));

  // Create the file with empty content
  const fullPath = path.join(workspaceRoot, filename);
  fs.writeFileSync(fullPath, '', 'utf-8');

  return filename;
}

export function createNewFolder(parentDir = '') {
  // Find the next available Untitled-Folder-N name
  let counter = 1;
  let folderName;
  const basePath = path.join(workspaceRoot, parentDir);

  do {
    folderName = `Untitled-Folder-${counter}`;
    counter++;
  } while (fs.existsSync(path.join(basePath, folderName)));

  // Create the folder
  const fullPath = path.join(basePath, folderName);
  fs.mkdirSync(fullPath, { recursive: true });

  return parentDir ? path.join(parentDir, folderName) : folderName;
}

export function deleteItem(itemPath) {
  const fullPath = path.join(workspaceRoot, itemPath);

  if (!fs.existsSync(fullPath)) {
    throw new Error('Item not found');
  }

  const stats = fs.statSync(fullPath);
  if (stats.isDirectory()) {
    fs.rmSync(fullPath, { recursive: true });
  } else {
    fs.unlinkSync(fullPath);
  }

  return { success: true };
}

export function renameItem(oldPath, newName) {
  const fullOldPath = path.join(workspaceRoot, oldPath);

  if (!fs.existsSync(fullOldPath)) {
    throw new Error('Item not found');
  }

  const parentDir = path.dirname(fullOldPath);
  const fullNewPath = path.join(parentDir, newName);

  if (fs.existsSync(fullNewPath)) {
    throw new Error('An item with that name already exists');
  }

  fs.renameSync(fullOldPath, fullNewPath);

  // Return the new relative path
  const relativeParent = path.dirname(oldPath);
  return relativeParent === '.' ? newName : path.join(relativeParent, newName);
}

export function moveItem(sourcePath, targetDir) {
  const fullSourcePath = path.join(workspaceRoot, sourcePath);
  const itemName = path.basename(sourcePath);
  const fullTargetPath = path.join(workspaceRoot, targetDir, itemName);

  if (!fs.existsSync(fullSourcePath)) {
    throw new Error('Source item not found');
  }

  if (fs.existsSync(fullTargetPath)) {
    throw new Error('An item with that name already exists in the target folder');
  }

  // Prevent moving a folder into itself
  if (fullTargetPath.startsWith(fullSourcePath + path.sep)) {
    throw new Error('Cannot move a folder into itself');
  }

  fs.renameSync(fullSourcePath, fullTargetPath);

  return path.join(targetDir, itemName);
}

export function getFileTree(dir = '', depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return null;

  const targetPath = path.join(workspaceRoot, dir);

  if (!fs.existsSync(targetPath)) {
    return null;
  }

  const items = fs.readdirSync(targetPath, { withFileTypes: true });

  return items
    .filter(item => !item.name.startsWith('.'))
    .map(item => {
      const itemPath = path.join(dir, item.name);
      const result = {
        name: item.name,
        path: itemPath,
        type: item.isDirectory() ? 'directory' : 'file'
      };

      if (item.isDirectory()) {
        result.children = getFileTree(itemPath, depth + 1, maxDepth);
      }

      return result;
    });
}

// GitHub config management
const configPath = path.join(workspaceRoot, '.samepage', 'config.json');

export function getGitHubConfig() {
  try {
    if (!fs.existsSync(configPath)) {
      return null;
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return config.github || null;
  } catch {
    return null;
  }
}

export function saveGitHubConfig(githubConfig) {
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  let config = {};
  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch {
    config = {};
  }

  config.github = githubConfig;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  return config;
}
