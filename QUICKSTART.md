# 🚀 Quick Start - Test It Now!

Your Samepage MMMMMVP is ready at:
`~/Desktop/claude/samepage-mvp/`

## Run These Commands

Open your terminal and run:

```bash
# 1. Go to project
cd ~/Desktop/claude/samepage-mvp

# 2. Install dependencies (first time only)
npm install

# 3. Make CLI executable (first time only)
chmod +x bin/samepage.js

# 4. Create a test workspace
mkdir ~/test-samepage
cd ~/test-samepage

# 5. Initialize workspace
node ~/Desktop/claude/samepage-mvp/bin/samepage.js init

# 6. Start server (browser opens automatically!)
node ~/Desktop/claude/samepage-mvp/bin/samepage.js serve
```

## What You'll See

Browser opens at `http://127.0.0.1:3000` with:

- **Left Sidebar**: File tree
  - Click folders to expand/collapse
  - Click `.md` files to edit
  
- **Right Panel**: Tiptap editor
  - Edit markdown content
  - Cmd+S (Mac) or Ctrl+S (Windows) to save
  - Save button shows status

## Try This

1. Click `docs/welcome.md` in sidebar
2. Edit the text
3. Press Cmd+S to save
4. See "✓ Saved" status
5. Refresh page - changes persist!

## Create New Files

1. Create file: `echo "# My Note" > docs/my-note.md`
2. Refresh browser
3. Click `docs/my-note.md` to edit

## Next Steps with Claude Code

Once this works, enhance it:

```bash
# In the samepage-mvp directory, ask Claude Code:
cc "Add WikiLink support: [[term]] syntax with autocomplete"
cc "Add inline tag support: #tag syntax"
cc "Add kanban view for tasks/ folders"
```

## Troubleshooting

**Port already in use?**
- Server auto-finds free port (3000, 3001, etc.)

**Browser doesn't open?**
- Manually open: `http://127.0.0.1:3000`

**File changes don't appear?**
- Refresh browser to reload file tree

---

Ready? Run the commands above! 🎉
