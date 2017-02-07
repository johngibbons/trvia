import { Record, Map } from 'immutable'

const Category = Record({
  id: undefined,
  name: '',
  game: undefined,
  nominees: new Map(),
  pointValue: 0,
  winner: undefined
});

export default Category;
