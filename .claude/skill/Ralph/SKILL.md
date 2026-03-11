---
name: ralph-prd-writer
description: Generate prd.json files for Ralph Wiggum autonomous coding loops. Guides users through breaking down features into small, atomic, testable pieces. Use when the user says "ralph prd", "create prd.json", "write features for ralph", or wants to set up autonomous agent development. Supports solo (1 person) and team (2-15 people) modes.
---

# Ralph PRD Writer

Generate `prd.json` files for the Ralph Wiggum autonomous coding pattern. The skill guides users to break down feature ideas into small, atomic, testable entries that Claude Code can implement one at a time in a loop.

## Core Principle

**Small and nice.** Each PRD entry should be:

- **Single behavior** - one thing to verify
- **Clear pass/fail** - either it works or it doesn't  
- **Fits in one iteration** - Claude can complete and commit in one loop

❌ Bad: "Implement user authentication"  
✅ Good: "User can enter email in login form"  
✅ Good: "Login button is disabled when email is empty"  
✅ Good: "Invalid email shows error message below input"

## Workflow

### Step 1: Gather Context

Ask these questions **one at a time**:

1. **Mode**
   - "Is this solo (1 person) or team (2-15 people)?"
   - Solo: Quicker flow, fewer questions
   - Team: More detailed verification steps

2. **Tech Stack** (brief)
   - "What's your tech stack? (e.g., React + Node, Next.js, Vue + Django)"
   - "What test framework? (e.g., Playwright, Vitest, Jest)"
   - Used to make verification steps specific

3. **Feature Scope**
   - "What feature are you building? Give me a one-sentence summary."
   - This is the big idea we'll break down

### Step 2: Break It Down

Guide the user to decompose their feature. Ask:

- "What's the **core user action**?" → functional entry
- "What should it **look like**?" → ui entry  
- "What **data** needs to persist?" → data entry
- "What happens on **error**?" → error-handling entry
- "Any **external services** involved?" → integration entry

For each piece, ask:
- "How would you **verify** this works? What would you check in a test?"

Keep pushing for smaller pieces until each is atomic.

### Step 3: Write Verification Steps

For each entry, write steps that are **test-oriented**, not implementation-oriented.

❌ Implementation steps (wrong):
```json
"steps": [
  "Create Button component",
  "Add onClick handler",
  "Style with Tailwind"
]
```

✅ Verification steps (correct):
```json
"steps": [
  "Navigate to /dashboard",
  "Click 'New Project' button",
  "Verify modal appears with title 'Create Project'",
  "Verify input field is focused"
]
```

When relevant, reference actual code locations:
```json
"steps": [
  "Verify button uses PRIMARY_COLOR from constants.ts",
  "Verify modal uses Dialog component from @/components/ui"
]
```

### Step 4: Generate Files

Create two files:

**1. prd.json** - Array of feature entries (no wrapper object)

```json
[
  {
    "category": "functional",
    "description": "User can create a new project",
    "steps": [
      "Navigate to /dashboard",
      "Click 'New Project' button",
      "Enter project name 'Test Project'",
      "Click 'Create'",
      "Verify redirect to /project/[id]",
      "Verify project name in header"
    ],
    "passes": false
  }
]
```

**2. progress.txt** - Log file for Claude to append progress

```
# Progress Log

## [YYYY-MM-DD]

(Claude appends entries here)

---
```

### Step 5: Save and Present

1. Save files to `/mnt/user-data/outputs/plans/`
   - `prd.json`
   - `progress.txt`

2. Present both files to the user

3. Remind user about the ralph.sh script pattern (see references/ralph-script.md)

## Categories

Use these standard categories:

| Category | Use For |
|----------|---------|
| `functional` | Core user actions, behaviors |
| `ui` | Visual appearance, layout, styling |
| `data` | Storage, state, persistence |
| `integration` | APIs, external services, third-party |
| `security` | Auth, permissions, validation |
| `performance` | Speed, optimization, caching |
| `error-handling` | Edge cases, failures, recovery |

## PRD Entry Format

```json
{
  "category": "functional|ui|data|integration|security|performance|error-handling",
  "description": "Short, specific description of ONE behavior",
  "steps": [
    "Step 1: Setup/navigation",
    "Step 2: Action to take",
    "Step 3: Verify expected result",
    "Step 4: Verify additional details (optional)"
  ],
  "passes": false
}
```

Rules:
- **No ID field** - array position is the reference (PRD item #0, #1, etc.)
- **No priority field** - Claude decides priority based on dependencies
- **All `passes: false`** - Claude marks true after verification
- **3-6 steps typical** - enough to verify, not overwhelming

## Solo vs Team Mode

| Aspect | Solo | Team |
|--------|------|------|
| Questions | Faster, fewer prompts | More thorough |
| Steps | 3-4 essential | 5-6 comprehensive |
| Code refs | Optional | Encouraged |
| Error cases | Basic | Detailed |

## Example Interaction

**User:** "ralph prd"

**Claude:** "Got it! Let's create a prd.json for Ralph. First - is this solo (just you) or team (2-15 people)?"

**User:** "solo"

**Claude:** "What's your tech stack? (framework + test runner)"

**User:** "Next.js, Playwright"

**Claude:** "What feature are you building? One sentence."

**User:** "Dark mode toggle"

**Claude:** "Let's break this down into small, testable pieces:

1. **Functional**: What's the core action?
2. **UI**: What should it look like?
3. **Data**: Does the preference persist?

Starting with functional - when user clicks the toggle, what should happen?"

*...continues breaking down until atomic...*

## References

See `references/` folder for:
- `categories.md` - Detailed category guidance
- `examples.md` - Real-world prd.json examples
- `ralph-script.md` - Example ralph.sh script

## Trigger Phrases

- "ralph prd"
- "create prd.json"
- "prd for ralph"
- "set up ralph loop"
- "write features for autonomous coding"
- "break down this feature for ralph"
