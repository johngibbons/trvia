import { Record, Map, List } from 'immutable'

const Category = Record({
  id: undefined,
  name: '',
  game: undefined,
  nominees: new Map(),
  correctAnswer: null,
  order: 0,
  peoplesChoiceIds: new List(),
  presentationOrder: 0,
  value: 0
})

export default Category
