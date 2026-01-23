import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import GameModel from "../../models/Game";

const Game = ({ game }) => {
  if (!game) {
    return <div>Loading...</div>;
  }

  return <h1>{game.name}</h1>;
};

Game.propTypes = {
  game: PropTypes.instanceOf(GameModel),
};

const mapStateToProps = ({ games }, ownProps) => ({
  game: games.get(ownProps.routeParams.id),
});

export default connect(mapStateToProps)(Game);
