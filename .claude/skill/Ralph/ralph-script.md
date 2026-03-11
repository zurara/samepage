# Ralph Script Reference

Example scripts for running the Ralph loop.

## Basic ralph.sh

```bash
#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

for ((i=1; i<=$1; i++)); do
  echo "Iteration $i"
  echo "--------------------------------"
  result=$(claude --permission-mode acceptEdits -p "@plans/prd.json @progress.txt \
1. Find the highest-priority feature to work on and work ONLY on that feature. \
This should be the one YOU decide has the highest priority - not necessarily the first in the list. \
2. Check that the types check via pnpm typecheck and that the tests pass via pnpm test. \
3. Update the PRD with the work that was done. \
4. Append your progress to the progress.txt file. \
Use this to leave a note for the next person working in the codebase. \
5. Make a git commit of that feature. \
ONLY WORK ON A SINGLE FEATURE. \
If, while implementing the feature, you notice the PRD is complete, output <promise>COMPLETE</promise>. \
")

  echo "$result"

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "PRD complete, exiting."
    # Optional: send notification
    # notify-send "PRD complete after $i iterations"
    exit 0
  fi
done

echo "Reached max iterations ($1)"
exit 1
```

## Single Iteration (human-in-the-loop)

```bash
#!/bin/bash
# ralph-once.sh - Run one iteration, review, repeat manually

claude --permission-mode acceptEdits -p "@plans/prd.json @progress.txt \
1. Find the highest-priority feature to work on and work ONLY on that feature. \
2. Run typecheck and tests to verify. \
3. Update the PRD (mark passes: true if verified). \
4. Append progress to progress.txt. \
5. Make a git commit. \
ONLY WORK ON A SINGLE FEATURE."
```

## Key Points

### File References with @

Files prefixed with `@` are passed as context to Claude:
- `@plans/prd.json` - The feature list
- `@progress.txt` - The progress log

### Permission Mode

`--permission-mode acceptEdits` allows Claude to edit files without prompting.

### Completion Signal

```
<promise>COMPLETE</promise>
```

The script checks for this output to know when all features are done.

### Verification Commands

Customize these for your stack:

| Stack | Typecheck | Test |
|-------|-----------|------|
| TypeScript + Vitest | `pnpm typecheck` | `pnpm test` |
| TypeScript + Jest | `tsc --noEmit` | `npm test` |
| Python + Pytest | `mypy .` | `pytest` |
| Go | `go build ./...` | `go test ./...` |

### Directory Structure

```
project/
├── plans/
│   ├── ralph.sh          # Main loop script
│   ├── ralph-once.sh     # Single iteration
│   ├── prd.json          # Feature list
│   └── progress.txt      # Progress log
├── src/
└── ...
```

## Alternative: Ralph Plugin

If using Claude Code's official plugin:

```bash
# Install
/plugin install ralph-wiggum@claude-plugins-official

# Run
/ralph-loop "Implement all features in plans/prd.json" \
  --max-iterations 50 \
  --completion-promise "COMPLETE"
```

## Tips

1. **Start small** - Run ralph-once.sh manually first to tune your PRD
2. **Watch first iteration** - Make sure Claude understands your codebase
3. **Set reasonable limits** - 20-50 iterations typical for medium features
4. **Check progress.txt** - Claude's notes help debug stuck loops
5. **Git is your friend** - Every feature = one commit = easy rollback
