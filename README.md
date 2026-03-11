# Samepage

An AI-native markdown workspace. Point it at any folder and get a rich editor, file browser, terminal, and GitHub sync — all in the browser.

## Stack

- **Frontend**: React + Vite + Plate.js editor
- **Backend**: Node.js + Express
- **Storage**: Local filesystem (plain markdown files)
- **GitHub sync**: OAuth app — connects your workspace to a GitHub repo

## Getting Started

```bash
git clone https://github.com/zurara/samepage.git
cd samepage
npm install
npx vite build
```

Then either serve an existing folder:

```bash
node bin/samepage.js serve ~/my-notes
```

Or initialize a fresh workspace first:

```bash
mkdir ~/my-workspace
cd ~/my-workspace
node /path/to/samepage/bin/samepage.js init
node /path/to/samepage/bin/samepage.js serve
```

Browser opens at **http://localhost:8000**.

> Port 8000 is fixed — it's required for GitHub OAuth to work.

## Workspace structure

`init` creates this layout:

```
your-workspace/
├── docs/           general documentation
├── tasks/
│   ├── backlog/
│   ├── ready/
│   ├── in-progress/
│   ├── review/
│   └── done/
├── specs/          specifications
├── glossary/       terminology
└── .samepage/
    └── config.json
```

You don't have to use `init` — Samepage will serve any folder as-is.

## GitHub sync

To sync your workspace to a GitHub repo, you need a GitHub OAuth app:

1. Go to **Settings → Developer settings → OAuth Apps → New OAuth App**
2. Set the callback URL to `http://localhost:8000/api/github/callback`
3. Copy the Client ID and Client Secret into a `.env` file in the project root:

```
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

Then use the GitHub button in the editor to connect a repo and push your docs.

## CLI reference

```
node bin/samepage.js init                  Create workspace folders in current dir
node bin/samepage.js serve                 Serve current directory
node bin/samepage.js serve [path]          Serve a specific directory
```

## License

MIT
