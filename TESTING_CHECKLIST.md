# React Upgrade Testing Checklist

## Phase 3: Firebase Migration Testing

### Critical Functions to Test:

- [ ] **Authentication**
  - [ ] Log in with Google
  - [ ] Log in with Facebook
  - [ ] Log in with Email
  - [ ] Log out
  - [ ] Auth state persists on page refresh

- [ ] **Data Reading**
  - [ ] Homepage loads and displays games
  - [ ] View a game
  - [ ] View a group
  - [ ] View an entry
  - [ ] View user entries
  - [ ] View master entry

- [ ] **Data Writing**
  - [ ] Create a new group
  - [ ] Create a new entry
  - [ ] Select a nominee in an entry
  - [ ] Save group values
  - [ ] Admin: Create/edit game

- [ ] **Real-time Sync**
  - [ ] Open entry in two browser windows
  - [ ] Make selection in one window
  - [ ] Verify it updates in the other window
  - [ ] Test with categories sync
  - [ ] Test with nominees sync

- [ ] **Edge Cases**
  - [ ] Navigate with browser back/forward buttons
  - [ ] Refresh page while logged in
  - [ ] Check Redux DevTools (state should persist)
  - [ ] Check browser console for errors
  - [ ] Check Network tab for Firebase calls

## Environment Switching

**Test with Staging:**
```bash
# .env.local should have:
REACT_APP_ENVIRONMENT=staging
```

**Deploy to Production:**
```bash
# Change .env.local to:
REACT_APP_ENVIRONMENT=production
```

## Known Issues to Watch For:

1. **Firebase Queries**: orderByChild/equalTo patterns were heavily refactored
2. **Real-time Listeners**: onChildAdded, onChildChanged, onChildRemoved changed
3. **Auth State**: onAuthStateChanged pattern changed
4. **Push Keys**: Key generation pattern changed

## If Something Breaks:

1. Check browser console for errors
2. Check Network tab for failed Firebase calls
3. Verify Firebase rules haven't changed
4. Compare working production vs new staging behavior
5. Git checkout previous commit if needed: `git checkout fee7177` (Phase 2)
