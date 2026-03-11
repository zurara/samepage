# Samepage MMMMMVP

The minimal markdown workspace with Tiptap editor.

## Quick Start

```bash
# 1. Install dependencies
cd ~/Desktop/claude/samepage-mvp
npm install

# 2. Make CLI executable
chmod +x bin/samepage.js

# 3. Create a test project
mkdir ~/test-samepage
cd ~/test-samepage

# 4. Initialize workspace
node ~/Desktop/claude/samepage-mvp/bin/samepage.js init

# 5. Start server (browser opens automatically!)
node ~/Desktop/claude/samepage-mvp/bin/samepage.js serve
```

## What Works

✅ File browser with tree view  
✅ Tiptap markdown editor  
✅ Save files (Cmd+S or button)  
✅ Auto-open browser  
✅ Live file watching  

## What's Not Implemented Yet

- WikiLinks `[[term]]`
- Inline tags `#tag`
- Kanban view
- Git integration
- Worktrees
- MCP server
- OpenSpec
- Glossary

## Folder Structure Created by `init`

```
your-project/
├── tasks/
│   ├── backlog/
│   ├── ready/
│   ├── in-progress/
│   ├── review/
│   └── done/
├── specs/
├── glossary/
├── docs/
│   └── welcome.md
└── .samepage/
    └── config.json
```

## Development with Claude Code

Once this works, enhance it with:

```bash
# Add WikiLinks
cc "Add WikiLink support: [[term]] syntax with autocomplete and backlinks"

# Add inline tags
cc "Add inline tag support: #tag syntax with filtering"

# Add kanban view
cc "Add kanban view that treats tasks/ folders as columns"

# Add git integration
cc "Add git auto-commit on save"
```

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React (via CDN) + Tiptap
- **Storage**: Local filesystem + markdown files
- **No build step**: Works immediately

## License

MIT
