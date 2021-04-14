import { Record } from "immutable";

const Nominee = Record({
  id: undefined,
  key: undefined,
  text: "",
  secondaryText: "",
  category: undefined,
  game: undefined,
  imageUrl: "",
  movieDBName: "",
});

export default Nominee;
