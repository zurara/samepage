# PRD Examples

Real-world examples of well-structured prd.json entries.

## Example 1: Video Editor (from Matt Pocock)

Beat/pause feature broken into atomic pieces:

```json
[
  {
    "category": "functional",
    "description": "Beat adds 0.4s to clip duration during playback",
    "steps": [
      "Navigate to video editor with clips containing beats",
      "Play back the clips",
      "Verify clips with beats pause for 0.4s (BEAT_DURATION from constants.ts)",
      "Verify beat duration is added to total clip playback time"
    ],
    "passes": false
  },
  {
    "category": "ui",
    "description": "Beats display as three orange ellipsis dots below clip",
    "steps": [
      "Add a beat to a clip",
      "Verify three orange dots appear below the clip",
      "Verify dots are orange colored",
      "Verify dots form an ellipsis pattern"
    ],
    "passes": false
  },
  {
    "category": "ui",
    "description": "Beat dots create visual gap between clips",
    "steps": [
      "Add a beat to a clip that has a following clip",
      "Verify dots create slight visual gap between clip and next clip",
      "Verify gap indicates the pause duration"
    ],
    "passes": false
  }
]
```

---

## Example 2: Chat Application

New conversation feature:

```json
[
  {
    "category": "functional",
    "description": "New chat button creates a fresh conversation",
    "steps": [
      "Navigate to main interface",
      "Click the 'New Chat' button",
      "Verify a new conversation is created",
      "Verify chat area shows welcome state",
      "Verify conversation appears in sidebar"
    ],
    "passes": false
  },
  {
    "category": "functional",
    "description": "User can send a message in conversation",
    "steps": [
      "Open an existing conversation",
      "Type 'Hello world' in message input",
      "Press Enter or click Send",
      "Verify message appears in chat area",
      "Verify message shows current timestamp"
    ],
    "passes": false
  },
  {
    "category": "ui",
    "description": "Message input auto-expands for long messages",
    "steps": [
      "Focus on message input",
      "Type a message longer than one line",
      "Verify input height increases",
      "Verify max height is 200px",
      "Verify scrollbar appears at max height"
    ],
    "passes": false
  },
  {
    "category": "data",
    "description": "Conversations persist on page reload",
    "steps": [
      "Create a new conversation",
      "Send a message",
      "Refresh the page",
      "Verify conversation still exists in sidebar",
      "Verify message content preserved"
    ],
    "passes": false
  },
  {
    "category": "error-handling",
    "description": "Failed message send shows retry option",
    "steps": [
      "Simulate network offline",
      "Attempt to send message",
      "Verify message shows 'failed' indicator",
      "Verify 'Retry' button appears",
      "Restore network",
      "Click retry",
      "Verify message sends successfully"
    ],
    "passes": false
  }
]
```

---

## Example 3: Dark Mode Toggle

Complete feature breakdown:

```json
[
  {
    "category": "functional",
    "description": "Theme toggle switches between light and dark mode",
    "steps": [
      "Navigate to settings or header",
      "Locate theme toggle",
      "Click toggle (starting from light)",
      "Verify page switches to dark mode",
      "Click toggle again",
      "Verify page switches to light mode"
    ],
    "passes": false
  },
  {
    "category": "ui",
    "description": "Dark mode uses correct color palette",
    "steps": [
      "Enable dark mode",
      "Verify background is slate-900",
      "Verify text is slate-100",
      "Verify borders are slate-700",
      "Verify no white flashes during transitions"
    ],
    "passes": false
  },
  {
    "category": "ui",
    "description": "Toggle shows sun/moon icons",
    "steps": [
      "In light mode, verify moon icon displayed",
      "Click toggle to dark mode",
      "Verify sun icon displayed",
      "Verify smooth icon transition"
    ],
    "passes": false
  },
  {
    "category": "data",
    "description": "Theme preference persists in localStorage",
    "steps": [
      "Set theme to dark mode",
      "Verify localStorage key 'theme' equals 'dark'",
      "Refresh page",
      "Verify dark mode still active",
      "Verify no flash of light mode on load"
    ],
    "passes": false
  },
  {
    "category": "functional",
    "description": "System preference used when no saved preference",
    "steps": [
      "Clear localStorage",
      "Set system preference to dark (prefers-color-scheme)",
      "Load page fresh",
      "Verify dark mode applied",
      "Verify no theme key in localStorage until user toggles"
    ],
    "passes": false
  }
]
```

---

## Example 4: Authentication Flow

Login feature:

```json
[
  {
    "category": "functional",
    "description": "User can log in with email and password",
    "steps": [
      "Navigate to /login",
      "Enter valid email in email field",
      "Enter valid password in password field",
      "Click 'Sign In' button",
      "Verify redirect to /dashboard",
      "Verify user session created"
    ],
    "passes": false
  },
  {
    "category": "ui",
    "description": "Login button disabled when form invalid",
    "steps": [
      "Navigate to /login with empty form",
      "Verify 'Sign In' button is disabled",
      "Enter only email",
      "Verify button still disabled",
      "Enter password",
      "Verify button becomes enabled"
    ],
    "passes": false
  },
  {
    "category": "security",
    "description": "Invalid credentials show error without leaking info",
    "steps": [
      "Navigate to /login",
      "Enter non-existent email",
      "Enter any password",
      "Click 'Sign In'",
      "Verify generic error 'Invalid email or password'",
      "Verify error does not reveal if email exists"
    ],
    "passes": false
  },
  {
    "category": "security",
    "description": "Password field masks input",
    "steps": [
      "Navigate to /login",
      "Focus password field",
      "Type 'secretpassword'",
      "Verify input type is 'password'",
      "Verify text is masked (dots or asterisks)"
    ],
    "passes": false
  },
  {
    "category": "error-handling",
    "description": "Rate limiting after failed attempts",
    "steps": [
      "Attempt login with wrong password 5 times",
      "Verify rate limit message appears",
      "Verify login button disabled",
      "Verify countdown timer shown",
      "Wait for cooldown",
      "Verify login enabled again"
    ],
    "passes": false
  }
]
```

---

## Example 5: File Upload

```json
[
  {
    "category": "functional",
    "description": "User can upload a file via drag and drop",
    "steps": [
      "Navigate to upload area",
      "Drag a valid file over drop zone",
      "Verify drop zone highlights",
      "Drop the file",
      "Verify upload starts",
      "Verify file appears in file list after upload"
    ],
    "passes": false
  },
  {
    "category": "functional",
    "description": "User can upload via file picker",
    "steps": [
      "Click 'Choose File' button",
      "Select a file from picker",
      "Verify upload starts automatically",
      "Verify progress indicator shown",
      "Verify file in list when complete"
    ],
    "passes": false
  },
  {
    "category": "ui",
    "description": "Upload progress shows percentage",
    "steps": [
      "Start uploading a large file (>1MB)",
      "Verify progress bar appears",
      "Verify percentage text updates",
      "Verify progress bar fills left to right",
      "Verify 100% shown when complete"
    ],
    "passes": false
  },
  {
    "category": "error-handling",
    "description": "Invalid file type shows error",
    "steps": [
      "Attempt to upload .exe file",
      "Verify upload rejected immediately",
      "Verify error message lists allowed types",
      "Verify no partial upload occurred"
    ],
    "passes": false
  },
  {
    "category": "error-handling",
    "description": "Upload failure allows retry",
    "steps": [
      "Start upload",
      "Simulate network failure mid-upload",
      "Verify error state shown",
      "Verify 'Retry' button available",
      "Restore network",
      "Click retry",
      "Verify upload resumes or restarts"
    ],
    "passes": false
  }
]
```

---

## Anti-Patterns

### ❌ Too Big

```json
{
  "description": "Complete user authentication system",
  "steps": ["Implement login, signup, forgot password, OAuth"]
}
```

### ❌ Too Vague

```json
{
  "description": "App works correctly",
  "steps": ["Test the app", "Make sure it works"]
}
```

### ❌ Implementation Steps (not verification)

```json
{
  "description": "Create login form",
  "steps": [
    "Create LoginForm.tsx component",
    "Add email and password inputs",
    "Add submit handler"
  ]
}
```

### ❌ Multiple Behaviors

```json
{
  "description": "User can login and see their profile and edit settings",
  "steps": ["..."]
}
```

---

## Quick Reference

Good PRD entries are:

1. **Atomic** - One behavior per entry
2. **Testable** - Clear pass/fail via steps
3. **Specific** - References actual values, code locations
4. **Categorized** - Correct category for the aspect being tested
5. **Independent** - Can be verified in isolation (mostly)
