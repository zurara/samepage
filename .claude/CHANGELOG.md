---
CLAUDE: ONLY APPEND, LATEST ON TOP
---

## 2026-01-11

### GitHub Sync Improvements (PRD #35-45)
- Replaced single "Sync" button with separate "Pull" and "Push" buttons
- Pull button (blue): fetches remote changes
- Push button (green): commits and pushes local changes
- Added empty repo detection - shows friendly message for empty repos
- Fixed `getDefaultBranch()` to detect remote branches (main/master/other)
- Added `git branch -M main` for initial push to empty repos
- Modal shows connected repo name with "Change Repository" button
- Can switch to different GitHub repo without disconnecting OAuth

### File/Folder Management (PRD #0-14)
- Context menu: right-click files/folders for Rename, Delete, New Folder
- New Folder button in sidebar with auto-naming (Untitled-Folder-N)
- Inline rename via double-click or context menu
- Delete with confirmation dialog (warns about folder contents)
- Drag and drop to move files/folders between directories

### GitHub Integration (PRD #15-34)
- GitHub OAuth flow with real token exchange
- Connect to existing repo or create new repo
- Conflict detection with side-by-side diff view
- "Keep Local" / "Keep Remote" conflict resolution

### All 45 PRD items complete