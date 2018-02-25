import React, { PropTypes } from 'react'
import './Category.css'
import { Record, Seq, List } from 'immutable'
import { connect } from 'react-redux'
import classNames from 'classnames'
import {
  currentNomineesSelector,
  selectedNomineeIdSelector
} from '../../../selectors/nominees-selector'
import {
  mostPopularNomineeIdsSelector
} from '../../../selectors/entries-selector'

import { Header } from 'semantic-ui-react'
import NomineesGrid from './nomineesGrid/NomineesGrid'
import IncorrectIcon from 'material-ui/svg-icons/navigation/cancel'
import CorrectIcon from 'material-ui/svg-icons/action/check-circle'

const Category = ({
  category,
  value,
  nominees,
  selectedNomineeId,
  mostPopularNomineeIds,
  isPeoplesChoice
}) => {
  const incorrect = category.correctAnswer && isPeoplesChoice
    ? !selectedNomineeId || !mostPopularNomineeIds.includes(selectedNomineeId)
    : category.correctAnswer !== selectedNomineeId
  const correct = category.correctAnswer && !incorrect
  const categoryClasses = classNames('Category', {
    'Category--selected': !!selectedNomineeId,
    'Category--correct': correct,
    'Category--incorrect': category.correctAnswer && incorrect
  })

  return (
    <div className={categoryClasses}>
      <Header className='Category__header'>
        {category.correctAnswer &&
          (incorrect
            ? <IncorrectIcon
              className='Category__status-icon Category__status-icon--incorrect'
              color='rgb(255, 0, 0)'
              />
            : <CorrectIcon
              className='Category__status-icon Category__status-icon--correct'
              color='#b7a261'
              />)}
        <Header.Content className='Category__header-content'>
          {category.name}
          <Header.Subheader className='Category__subheader'>{`${value} points`}</Header.Subheader>
        </Header.Content>
      </Header>
      <NomineesGrid
        categoryId={category.id}
        nominees={nominees}
        selectedNomineeId={selectedNomineeId}
        correctNomineeIds={
          isPeoplesChoice && category.correctAnswer
            ? mostPopularNomineeIds
            : category.correctAnswer
                ? new List().push(category.correctAnswer)
                : new List()
        }
        isIncorrect={incorrect}
        isPeoplesChoice={isPeoplesChoice}
      />
    </div>
  )
}

Category.propTypes = {
  entry: PropTypes.instanceOf(Record),
  category: PropTypes.instanceOf(Record).isRequired,
  value: PropTypes.number,
  nominees: PropTypes.instanceOf(Seq).isRequired,
  selectedNomineeId: PropTypes.string,
  mostPopularNomineeIds: PropTypes.object
}

const mapStateToProps = (state, props) => {
  return {
    nominees: currentNomineesSelector(state, props),
    selectedNomineeId: selectedNomineeIdSelector(state, props),
    mostPopularNomineeIds: props.entry &&
      (mostPopularNomineeIdsSelector(state, props) || new List())
  }
}
export default connect(mapStateToProps)(Category)
