#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const command = process.argv[2];

if (command === 'init') {
  console.log('🚀 Initializing Samepage workspace...\n');
  
  const folders = [
    'tasks/backlog',
    'tasks/ready',
    'tasks/in-progress',
    'tasks/review',
    'tasks/done',
    'specs',
    'glossary',
    'docs',
    '.samepage'
  ];
  
  folders.forEach(folder => {
    fs.mkdirSync(folder, { recursive: true });
    console.log(`✓ Created ${folder}/`);
  });
  
  // Create initial files
  const welcomeDoc = `# Welcome to Samepage

Your AI-native markdown workspace is ready!

## Quick Start

1. Run \`samepage serve\` to open the editor
2. Create markdown files in any folder
3. Edit with the Tiptap editor
4. All changes save automatically

## Folder Structure

- \`tasks/\` - Organize work as markdown files
- \`specs/\` - OpenSpec specifications
- \`glossary/\` - Code-aware terminology
- \`docs/\` - General documentation

Happy building! 🎉
`;
  
  fs.writeFileSync('docs/welcome.md', welcomeDoc);
  console.log('✓ Created docs/welcome.md\n');
  
  const config = {
    mode: 'solo',
    created: new Date().toISOString()
  };
  
  fs.writeFileSync('.samepage/config.json', JSON.stringify(config, null, 2));
  console.log('✓ Created .samepage/config.json\n');
  
  console.log('✨ Workspace initialized!\n');
  console.log('Run: samepage serve');
  
} else if (command === 'serve') {
  // Accept optional workspace path as argument, default to cwd
  const workspaceArg = process.argv[3] || process.cwd();
  const { resolve } = await import('path');
  const workspace = resolve(process.cwd(), workspaceArg);

  if (!fs.existsSync(workspace)) {
    console.error(`\n❌ Workspace directory not found: ${workspace}`);
    console.error('Please provide a valid directory path.\n');
    process.exit(1);
  }

  // Pass workspace to server via environment variable
  process.env.SAMEPAGE_WORKSPACE = workspace;
  console.log(`📂 Workspace: ${workspace}`);

  const serverPath = join(__dirname, '..', 'server', 'index.js');
  import(serverPath).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
  
} else {
  console.log(`
Samepage - AI-native markdown workspace

Usage:
  samepage init                  Create workspace structure in current dir
  samepage serve [workspace]     Start editor server

  [workspace] defaults to the current directory if not provided.

Examples:
  npx samepage init
  npx samepage serve                    # serve files from current dir
  npx samepage serve ~/my-workspace     # serve files from ~/my-workspace
  `);
}
