import React, { PropTypes } from 'react'
import { connect } from 'react-redux';
import './EntryRow.css'
import Entry from '../../../../models/Entry';
import User from '../../../../models/User';
import { push } from 'react-router-redux';
import {
  entryPossibleScoreSelector
} from '../../../../selectors/categories-selector';
import {
  entryUserSelector,
  entryCompleteSelector
} from '../../../../selectors/entries-selector';
import {
  entryGameStartedSelector
} from '../../../../selectors/games-selector';
import classNames from 'classnames';
import { Seq } from 'immutable';

import UserAvatar from '../../../users/userAvatar/UserAvatar';


const EntryRow = ({
  entry,
  possibleScore,
  categories,
  nominees,
  entryComplete,
  gameStarted,
  onClickEntry,
  user
}) => {
  const entryCompleteClasses = classNames(
    'EntriesTable--entry-complete-indicator',
    { 'EntriesTable--entry-complete-indicator-complete': entryComplete }
  )

  return (
    <tr
      key={entry.id}
      className={'EntriesTable--row'}
      onClick={() => onClickEntry(`/entries/${entry.id}`)}
    >
      <td
        className={'EntriesTable--col EntriesTable--col-rank'}
      >{gameStarted ? entry.rank :
          <div className={entryCompleteClasses} />
      }</td>
      <td
        className={'EntriesTable--col EntriesTable--col-avatar'}
      >
        <UserAvatar user={user} />
      </td>
      <td
        className={'EntriesTable--col EntriesTable--col-entry-name'}
      >
        <div className='EntriesTable--entry-name-container'>
          <div className='EntriesTable--entry-name'>{entry.name}</div>
          <div className='EntriesTable--user-name'>{user.name}</div>
        </div>
      </td>
      <td
        className={'EntriesTable--col EntriesTable--col-score'}
      >{entry.score} / {possibleScore}</td>
      {gameStarted && categories.map(category => {
        const categoryClasses = classNames(
          'EntriesTable--col',
          'EntriesTable--col-category',
          { 'EntriesTable--col-correct': category.correctAnswer &&
            category.correctAnswer === entry.selections.get(category.id) },
          { 'EntriesTable--col-incorrect': category.correctAnswer &&
            category.correctAnswer !== entry.selections.get(category.id) }
        )
        const selectedNomineeId = entry.selections.get(category.id);
        const nominee = nominees.get(selectedNomineeId);
        return (
          <td className={categoryClasses}>
            <div className='EntriesTable--col-category-content'>{nominee.text}</div>
          </td>
        );
      })}
    </tr>
  )
}

EntryRow.propTypes = {
  user: PropTypes.instanceOf(User),
  entry: PropTypes.instanceOf(Entry),
  categories: PropTypes.instanceOf(Seq),
  possibleScore: PropTypes.number,
  entryComplete: PropTypes.bool,
  gameStarted: PropTypes.bool,
  onClickEntry: PropTypes.func.isRequired
}

const mapStateToProps = (state, props) => {
  return {
    possibleScore: entryPossibleScoreSelector(state, props),
    user: entryUserSelector(state, props),
    entryComplete: entryCompleteSelector(state, props),
    gameStarted: entryGameStartedSelector(state, props),
    nominees: state.nominees
  }
}

export default connect(mapStateToProps, {
  onClickEntry: push
})(EntryRow)
