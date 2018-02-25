import { createSelector } from 'reselect'
import Group from '../models/Group'
import { Seq } from 'immutable'

const groupsSelector = state => state.groups
const userSelector = (state, props) => state.users.get(props.routeParams.id)
const entryFromPropsSelector = (state, props) =>
  state.entries.get(props.entry.id)

export const currentGroupSelector = (state, props) => {
  return props.entry
    ? state.groups.get(props.entry.group)
    : state.groups.get(props.routeParams.id) ||
        state.groups.get(state.entries.get(props.routeParams.id).group) ||
        new Group()
}

export const userGroupsSelector = createSelector(
  groupsSelector,
  userSelector,
  (groups, currentUser) => {
    return currentUser
      ? currentUser.groups.keySeq().map(key => groups.get(key))
      : new Seq()
  }
)

export const entryGroupSelector = createSelector(
  entryFromPropsSelector,
  groupsSelector,
  (entry, groups) => groups.get(entry.group)
)

export const groupFromPropsSelector = (state, props) => {
  if (!state.groups.size) return new Group()
  return state.groups.get(props.group.first().group) || new Group()
}
