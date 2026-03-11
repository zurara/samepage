---
CLAUDE: UPDATE CURRENT ARCHITECTURE
---

# Samepage - Markdown Workspace Editor

## Overview
A local-first markdown editor with GitHub sync. Users manage files in a sidebar and edit them with a rich text editor.

## Architecture

### Frontend (`public/`)
- **app.js** - React app (no JSX, uses React.createElement)
  - `App` - Main component with file browser, editor, GitHub modal
  - `FileBrowser` - Sidebar with file tree, drag-drop, context menu
  - `Editor` - TipTap rich text editor for markdown
  - `GitHubModal` - OAuth flow, repo connection, change repo
  - `ContextMenu` - Right-click actions (Rename, Delete, New Folder)
  - `ConfirmDialog` - Delete confirmation
  - `ConflictDialog` - Git conflict resolution (side-by-side diff)

- **style.css** - All styles (no CSS framework)

### Backend (`server/`)
- **index.js** - Express server
  - File API: `/api/files`, `/api/file`, `/api/tree`
  - CRUD: `/api/file/create`, `/api/folder/create`, `/api/item/rename`, `/api/item/move`, `/api/item`
  - GitHub: `/api/github/callback`, `/api/github/status`, `/api/github/config`
  - Git ops: `/api/github/clone`, `/api/github/pull`, `/api/github/push`
  - Conflict: `/api/github/resolve/local`, `/api/github/resolve/remote`

- **storage.js** - File system operations
  - `workspaceRoot` = `process.cwd()`
  - File CRUD, folder CRUD, rename, move, delete
  - GitHub config stored in `.samepage/config.json`

### Key Functions
- `getDefaultBranch()` - Detects remote branch (main/master/other)
- `saveGitHubConfig()` / `getGitHubConfig()` - Persist OAuth token and repo info

## GitHub Flow
1. User clicks "Connect GitHub" → OAuth redirect
2. Callback exchanges code for access_token
3. User enters repo URL or creates new repo
4. Pull/Push buttons sync with remote
5. Conflicts show side-by-side diff with resolution options

## Tech Stack
- React 18 (CDN, no build)
- TipTap editor
- Express.js
- Node.js child_process for git commands
- dotenv for secrets