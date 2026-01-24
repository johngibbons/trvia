# Production Debugging Guide - Rank Changes & Category Reordering

## Changes Made

I've fixed three critical issues and added extensive logging to help debug in production:

### Issue 1: Category Not Moving to Leftmost Position
**Problem**: The `answered_order` was only being updated in Redux state, not in Firebase.

**Fix**: Added Firebase update in `src/sagas/gameSaga.js` (line ~208):
```javascript
yield call(API.updateGame, nominee.game, { answered_order: newOrder.toJS() });
```

### Issue 2: Rank Change Indicators Not Showing
**Problem**: Production saga was capturing ranks at the wrong time - capturing current ranks instead of ranks before the scoring change.

**Fix**: Updated production logic in `src/sagas/gameSaga.js` to match the mock mode logic:
- Capture ranks BEFORE scoring when adding a correct answer
- Capture ranks AFTER unscoring when removing a correct answer

### Issue 3: Saga Crashing - API Method Missing
**Problem**: `API.updateGame` didn't exist, causing error: "call: argument fn is undefined"

**Fix**:
- Added `API.updateGame` method in `src/api.js` to update game fields in Firebase
- Added migration logic in `src/reducers/games-reducer.js` to handle old `answeredOrder` structure
- Added defensive check to skip Firebase update if answered_order hasn't changed

**Note**: Existing games with scored categories may have empty `answered_order` initially. The array will populate as new categories are scored going forward.

## How to Debug in Production

### 1. Open Browser Console
Open your browser's developer tools (F12 or Cmd+Option+I) and go to the Console tab.

### 2. Watch for These Log Messages

When you select a nominee as the correct answer, you should see:

```
🔥 Production mode: Toggling nominee [nomineeId] for category [categoryId]
🔥 currentId: null isScoring: true
🔥 Game object: {id: "...", name: "...", answered_order: []}
🔥 Calculated answered_order from [] to ["cat-id"]
🔥 Capturing ranks BEFORE scoring: {entryId1: 1, entryId2: 2, ...}
💾 UI Reducer: CAPTURE_RANKINGS {entryId1: 1, entryId2: 2, ...}
🎭 Reducer: UPDATE_ANSWERED_ORDER for game ... category ... isScoring: true
🎭 Current answered_order: []
🎭 New answered_order: ["cat-id"]
🔥 Updating Firebase answered_order to ["cat-id"]
🔥 Firebase update complete
🔥 Redux state answered_order after update: ["cat-id"]
```

Then when you navigate to the group page, you should see:

```
📋 reorderedGroupCategoriesSelector:
  answered_order: ["cat-id"]
  mostRecentId: cat-id
  Reordered categories (mostRecent moved to front): ["cat-id", "other-cat-1", "other-cat-2", ...]
🏆 rankedGroupEntriesSelector called
  Group: [groupId]
  Categories with correctAnswer: [{id: "cat-id", correctAnswer: "nom-id"}, ...]
  previousRanks: {entryId1: 1, entryId2: 2, ...}
  Ranked entries: [{id: "entryId1", name: "User 1", score: 5, rank: 1}, ...]
📊 entryRankChangeSelector(entryId1): previousRank=2, currentRank=1
```

**Key things to verify:**
- ✅ `answered_order` should contain the category ID you just scored
- ✅ `mostRecentId` should match that category ID
- ✅ `Reordered categories` should show that category first in the array
- ✅ The table should visually show that category column on the left

### 3. Common Issues & Solutions

#### Categories Not Reordering
**Symptom**: You see `answered_order: null or empty` in the console when viewing the group page

**Step 1: Check if Redux was updated**
Look for these logs after selecting a nominee:
```
🎭 New answered_order: ["cat-id"]
🔥 Redux state answered_order after update: ["cat-id"]
```

If you see empty arrays `[]` instead, the Redux update failed.

**Step 2: Check if the group page sees the updated state**
When you navigate to the group page, look for:
```
📋 reorderedGroupCategoriesSelector:
  answered_order: ["cat-id"]
```

If you see `answered_order: null or empty`, the state isn't being passed to the selector.

**Possible causes**:
1. **Different game ID**: Master entry and group page are for different games
   - Check the game ID in both URLs
2. **Page cached**: Browser cached the old state
   - Try hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
3. **Firebase update failed**: Check for errors in console
4. **Firebase rules**: Rules might be blocking the update
   - Check Firebase Database: `games/[gameId]/answered_order`
   - Should be an array like `["cat1", "cat2", "cat3"]`

**Step 3: Check if the category is in the list**
If answered_order has a value but categories don't reorder, look for:
```
mostRecent category not found in list
```
This means the category ID in answered_order doesn't match any category in the group.

#### Rank Indicators Not Showing
**Symptom**: You see `No previousRanks` or `Entry not in previousRanks`

**Possible causes**:
1. previousRanks not being captured - check for "💾 UI Reducer: CAPTURE_RANKINGS" log
2. UI state not persisting
3. Ranks captured at wrong time (should be BEFORE scoring)

**How to check**:
- Look for the "🔥 Capturing ranks BEFORE scoring" message
- Verify the previousRanks values match the ranks before you made the selection
- Check Redux state in browser: `state.ui.previousRanks`

#### Indicators Show But Wrong Direction
**Symptom**: All indicators show "–" (same) or wrong direction

**Possible causes**:
1. previousRanks captured after scoring instead of before
2. Calculation error in selector

**How to check**:
- Compare the previousRanks logged values with current ranks
- Look at the `📊 entryRankChangeSelector` logs showing previousRank vs currentRank

### 4. Manual Testing Steps

1. **Test Category Reordering**:
   - Navigate to group page
   - Note the order of category columns
   - Go to master entry (/admin/games/[gameId]/master)
   - Select a correct nominee
   - Navigate back to group page
   - The category you just scored should now be leftmost

2. **Test Rank Indicators**:
   - Navigate to group page and note current ranks
   - Go to master entry
   - Select a correct nominee that will change rankings
   - Navigate back to group page
   - Should see ↑ for entries that moved up, ↓ for entries that moved down, – for entries that stayed same

### 5. If Things Aren't Working

**Check 1: Firebase Permissions**
Make sure your Firebase rules allow updating `games/[gameId]/answered_order`

**Check 2: API Method Exists**
Verify `API.updateGame` is implemented in `src/api.js`

**Check 3: State Sync**
If using real-time Firebase sync, the local update might be overwritten by Firebase. Check if there's a sync conflict.

**Check 4: Browser Console Logs**
Share the complete console output (all the 🔥, 💾, 🏆, 📋, 📊 messages) to help diagnose the issue.

### 6. Removing Debug Logs

Once everything works, you can remove the production logging by changing:
```javascript
const shouldLog = isMockMode || isProduction;
```
to:
```javascript
const shouldLog = isMockMode;
```

in these files:
- `src/selectors/entries-selector.js` (2 places)
- `src/selectors/categories-selector.js`
- `src/reducers/ui-reducer.js`
- And remove the `console.log` statements from `src/sagas/gameSaga.js`

## Next Steps

1. Deploy these changes to production
2. Test by selecting a nominee and watching the console logs
3. Share the console output if you see any issues
4. Once verified working, optionally remove debug logs
