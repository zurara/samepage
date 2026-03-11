# Quick Start

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later

## Setup (first time only)

```bash
# Clone the repo
git clone https://github.com/zurara/samepage.git
cd samepage

# Install dependencies
npm install

# Build the frontend
npx vite build
```

## Start the editor

```bash
# Serve your current directory as a workspace
node bin/samepage.js serve

# Or point it at a specific folder
node bin/samepage.js serve ~/my-notes
```

Browser opens automatically at **http://localhost:8000**

> **Note:** Port 8000 is required for GitHub OAuth. Make sure nothing else is running on it.

## Initialize a new workspace

If you're starting fresh in an empty folder:

```bash
mkdir ~/my-workspace
cd ~/my-workspace
node /path/to/samepage/bin/samepage.js init
node /path/to/samepage/bin/samepage.js serve
```

`init` creates the following structure:

```
docs/        general documentation
tasks/       kanban-style task folders (backlog, ready, in-progress, review, done)
specs/       specifications
glossary/    terminology
.samepage/   app config
```

## Using the editor

- **File browser** (left sidebar) — click any `.md` file to open it
- **Editor** (main panel) — rich text editing with markdown under the hood
- **Save** — `Cmd+S` (Mac) / `Ctrl+S` (Windows), or the save button
- **GitHub sync** — connect a repo via the GitHub button to push your docs

## Troubleshooting

**`vite: not found`**
Run `npx vite build` instead of `vite build`, or use `npm run dev` which runs both build and serve together.

**Port 8000 already in use**
Find and stop whatever is using it: `lsof -i :8000` then `kill <PID>`

**Browser doesn't open automatically**
Navigate to `http://localhost:8000` manually.

**Changes not appearing in file browser**
The file tree updates in real time via a watcher — if it seems stuck, refresh the page.
