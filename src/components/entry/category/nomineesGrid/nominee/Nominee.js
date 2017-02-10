import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import classNames from 'classnames';
import './Nominee.css';
import { Record } from 'immutable';
import { selectNominee } from '../../../../../actions/entry-actions';
import { selectCorrectNominee } from '../../../../../actions/game-actions';

const Nominee = ({
  router,
  nominee,
  notSelected,
  correctId,
  onClickNominee
}) => {

  const answer = correctId === nominee.id;

  const nomineeClasses = classNames(
    'Nominee',
    { 'Nominee--not-selected': notSelected },
    { 'Nominee--answer': answer },
    { 'Nominee--wrong-selection': !notSelected && !answer }
  );

  const green = 'linear-gradient(rgba(15, 185, 15, 0.5), rgba(15, 185, 15, 0.5)),';
  const red = 'linear-gradient(rgba(255, 0, 0, 0.5), rgba(255, 0, 0, 0.5)),';
  const gold = 'linear-gradient(rgba(183, 162, 97, 0.5), rgba(183, 162, 97, 0.5)),';

  const backgroundImage = classNames(
    {[green]: !notSelected && answer },
    {[red]: correctId && !notSelected && !answer },
    {[gold]: notSelected && answer },
    `url(${nominee.imageUrl})`
  )

  return (
    <div
      className={nomineeClasses}
      style={{
        backgroundImage
      }}
      onClick={() => onClickNominee(router.params.id, nominee)}
    >
      <div className='Nominee--text-container'>
        <div>
          <div className='Nominee--text'>{nominee.text}</div>
          {nominee.secondaryText &&
          <div className='Nominee--secondary-text'>{nominee.secondaryText}</div>}
        </div>
      </div>
    </div>
  )
};

Nominee.propTypes = {
  router: PropTypes.object,
  nominee: PropTypes.instanceOf(Record),
  notSelected: PropTypes.bool.isRequired,
  correctId: PropTypes.bool.isRequired,
  onClickNominee: PropTypes.func.isRequired
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    onClickNominee: props.nominee.game === props.router.params.id ?
    (gameId, nominee) => dispatch(selectCorrectNominee(gameId, nominee)) :
    (entryId, nominee) => dispatch(selectNominee(entryId, nominee))
  }
}

export default withRouter(connect(null, mapDispatchToProps)(Nominee));
