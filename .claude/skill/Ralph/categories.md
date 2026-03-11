# Categories Reference

## functional

Core user actions and behaviors. The "what it does" of a feature.

**Good examples:**
- "User can submit the login form"
- "Clicking save persists changes to database"
- "Search returns matching results within 500ms"
- "Beat adds 0.4s to clip duration during playback"

**Steps focus on:** Action → Result verification

```json
{
  "category": "functional",
  "description": "User can create a new workspace",
  "steps": [
    "Navigate to /dashboard",
    "Click 'New Workspace' button",
    "Enter 'Test Workspace' in name field",
    "Click 'Create'",
    "Verify URL changes to /workspace/[id]",
    "Verify workspace name appears in sidebar"
  ],
  "passes": false
}
```

---

## ui

Visual appearance, layout, styling, animations. The "what it looks like" of a feature.

**Good examples:**
- "Login button is blue with white text"
- "Error messages display in red below input"
- "Modal has 8px border radius"
- "Beats display as three orange ellipsis dots below clip"

**Steps focus on:** Visual verification, element presence, styling checks

```json
{
  "category": "ui",
  "description": "Success toast appears after save",
  "steps": [
    "Trigger a successful save action",
    "Verify toast notification appears",
    "Verify toast has green background (bg-green-500)",
    "Verify toast contains checkmark icon",
    "Verify toast auto-dismisses after 3 seconds"
  ],
  "passes": false
}
```

---

## data

Storage, state management, persistence, caching. The "what gets saved" of a feature.

**Good examples:**
- "User preferences persist across sessions"
- "Draft auto-saves every 30 seconds"
- "Deleted items move to trash, not permanently removed"
- "Form state survives page refresh"

**Steps focus on:** State verification, persistence checks, data integrity

```json
{
  "category": "data",
  "description": "Theme preference persists in localStorage",
  "steps": [
    "Set theme to dark mode",
    "Verify localStorage contains theme: 'dark'",
    "Refresh the page",
    "Verify dark mode is still active",
    "Verify no flash of light mode on load"
  ],
  "passes": false
}
```

---

## integration

External APIs, third-party services, webhooks. The "what it connects to" of a feature.

**Good examples:**
- "GitHub OAuth returns user profile"
- "Stripe webhook updates subscription status"
- "S3 upload returns public URL"
- "OpenAI API call includes rate limiting"

**Steps focus on:** API response verification, error handling, data mapping

```json
{
  "category": "integration",
  "description": "GitHub OAuth redirects and creates user",
  "steps": [
    "Click 'Sign in with GitHub' button",
    "Complete GitHub OAuth flow (mock in test)",
    "Verify redirect to /dashboard",
    "Verify user record created in database",
    "Verify GitHub avatar displayed in header"
  ],
  "passes": false
}
```

---

## security

Authentication, authorization, validation, permissions. The "who can do what" of a feature.

**Good examples:**
- "Unauthenticated users redirect to /login"
- "Admin-only routes return 403 for regular users"
- "Password must be at least 8 characters"
- "API endpoints validate JWT token"

**Steps focus on:** Access control verification, validation behavior, error responses

```json
{
  "category": "security",
  "description": "Non-members cannot access private workspace",
  "steps": [
    "Login as user without workspace membership",
    "Navigate directly to /workspace/[private-id]",
    "Verify 403 response or redirect",
    "Verify error message explains access denied",
    "Verify no workspace data leaked in response"
  ],
  "passes": false
}
```

---

## performance

Speed, optimization, caching, lazy loading. The "how fast it is" of a feature.

**Good examples:**
- "Dashboard loads in under 2 seconds"
- "Images lazy load below the fold"
- "Search results cached for 5 minutes"
- "Bundle size under 200KB gzipped"

**Steps focus on:** Timing measurements, resource checks, optimization verification

```json
{
  "category": "performance",
  "description": "Project list paginates to avoid loading all",
  "steps": [
    "Create 100 test projects",
    "Navigate to /projects",
    "Verify only 20 projects rendered initially",
    "Verify 'Load more' button visible",
    "Click 'Load more'",
    "Verify next 20 projects appended"
  ],
  "passes": false
}
```

---

## error-handling

Edge cases, failure states, recovery, error messages. The "what happens when it breaks" of a feature.

**Good examples:**
- "Network error shows retry button"
- "Invalid form shows field-specific errors"
- "API timeout triggers graceful fallback"
- "404 page suggests similar content"

**Steps focus on:** Error triggering, message verification, recovery options

```json
{
  "category": "error-handling",
  "description": "Network error during save shows retry option",
  "steps": [
    "Simulate network offline",
    "Attempt to save document",
    "Verify error toast appears",
    "Verify 'Retry' button in toast",
    "Restore network connection",
    "Click 'Retry'",
    "Verify save completes successfully"
  ],
  "passes": false
}
```

---

## Choosing the Right Category

Ask: **What aspect of the feature is this entry testing?**

| If testing... | Use |
|--------------|-----|
| "Can user do X?" | functional |
| "Does it look like Y?" | ui |
| "Is Z saved/persisted?" | data |
| "Does it talk to service W?" | integration |
| "Is user allowed to do X?" | security |
| "How fast is X?" | performance |
| "What if X fails?" | error-handling |

## Splitting by Category

One feature often becomes multiple entries:

**Feature: "Add to favorites"**

→ `functional`: "Clicking heart icon adds item to favorites"
→ `ui`: "Heart icon fills red when favorited"
→ `data`: "Favorites persist across sessions"
→ `error-handling`: "Favoriting while offline queues for sync"
