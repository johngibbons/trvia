import {
  CREATE_ENTRY,
  UPDATE_ENTRY,
  FETCH_ENTRY,
  SET_ENTRY,
  SET_ENTRIES,
  SELECT_NOMINEE,
  SELECT_NOMINEE_SUCCESS,
  FETCH_USER_ENTRIES
} from './action-types'

export function createEntry (name, group, game, user) {
  return {
    type: CREATE_ENTRY,
    payload: {
      name,
      group,
      game,
      user
    }
  }
}

export function fetchEntry (id, next) {
  return {
    type: FETCH_ENTRY,
    payload: {
      id,
      next
    }
  }
}

export function setEntry (entry) {
  return {
    type: SET_ENTRY,
    payload: {
      entry
    }
  }
}

export function syncEntry ({ value }) {
  return {
    type: SET_ENTRY,
    payload: {
      entry: value
    }
  }
}

export function setEntries (entries) {
  return {
    type: SET_ENTRIES,
    payload: {
      entries
    }
  }
}

export function updateEntry (entry) {
  return {
    type: UPDATE_ENTRY,
    payload: {
      entry
    }
  }
}

export function selectNominee (entryId, nominee, isPeoplesChoice) {
  return {
    type: SELECT_NOMINEE,
    payload: {
      entryId,
      nominee,
      isPeoplesChoice
    }
  }
}

export function selectNomineeSuccess (entryId, nominee) {
  return {
    type: SELECT_NOMINEE_SUCCESS,
    payload: {
      entryId,
      nominee
    }
  }
}

export function fetchUserEntries (userId, next) {
  return {
    type: FETCH_USER_ENTRIES,
    payload: {
      userId,
      next
    }
  }
}
