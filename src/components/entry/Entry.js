import React, { PropTypes } from 'react'
import { Tab } from 'semantic-ui-react'
import './Entry.css'
import EntryModel from '../../models/Entry'
import Game from '../../models/Game'
import Group from '../../models/Group'
import { connect } from 'react-redux'
import {
  currentEntrySelector,
  entryVisibleSelector,
  entryCompleteSelector,
  isEntryOwnerSelector,
  entryGroupSelector,
  entryPeoplesChoiceScoreSelector
} from '../../selectors/entries-selector'
import {
  entryGameSelector,
  entryGameStartedSelector
} from '../../selectors/games-selector'
import { entryCategoriesSelector } from '../../selectors/categories-selector'
import {
  entryScoreSelector,
  entryPossibleScoreSelector,
  gameTotalPossibleSelector
} from '../../selectors/categories-selector'
import { Seq } from 'immutable'

import PageHeading from '../pageHeading/PageHeading'
import Category from './category/Category'
import { Link } from 'react-router'

const Entry = ({
  entry,
  game,
  group,
  categories,
  score,
  peoplesChoiceScore,
  possible,
  isVisible,
  isComplete,
  hasStarted,
  totalPossible
}) => {
  const panes = [
    {
      menuItem: 'Who you think will win',
      pane: (
        <Tab.Pane key='regular' className='Entry__tab' attached={false}>
          <div className='Entry--score-container'>
            {isComplete || hasStarted
              ? <h3 className='Entry--score'>{`${score}/${possible} points`}</h3>
              : <h3 className='Entry--incomplete'>incomplete</h3>}
          </div>
          {isVisible
            ? categories.map((category, i) => {
              return (
                <Category
                  key={i}
                  category={category}
                  value={group.values.get(category.id)}
                  entry={entry}
                  />
              )
            })
            : <h5>Entry not visible until game starts</h5>}
        </Tab.Pane>
      )
    },
    {
      menuItem: 'Who you want to win',
      pane: (
        <Tab.Pane key='peoplesChoice' className='Entry__tab' attached={false}>
          <div className='Entry--score-container'>
            {isComplete || hasStarted
              ? <h3 className='Entry--score'>{`${peoplesChoiceScore}/${possible} points`}</h3>
              : <h3 className='Entry--incomplete'>incomplete</h3>}
          </div>
          {isVisible
            ? categories.map((category, i) => {
              return (
                <Category
                  key={`peoplesChoice-${i}`}
                  category={category}
                  value={group.values.get(category.id)}
                  entry={entry}
                  isPeoplesChoice
                  />
              )
            })
            : <h5>Entry not visible until game starts</h5>}
        </Tab.Pane>
      )
    }
  ]

  return (
    <div className='Entry'>
      <h5 className='Entry--game-name'>{game.name}</h5>
      <div className='Entry--title-container'>
        <PageHeading text={entry.name}>
          <Link to={`/groups/${entry.group}`} className={'Entry--group-link'}>
            {group.name}
          </Link>
        </PageHeading>
      </div>
      <Tab
        menu={{ secondary: true, pointing: true }}
        panes={panes}
        renderActiveOnly={false}
      />
    </div>
  )
}

Entry.propTypes = {
  entry: PropTypes.instanceOf(EntryModel),
  game: PropTypes.instanceOf(Game),
  group: PropTypes.instanceOf(Group),
  categories: PropTypes.instanceOf(Seq),
  possible: PropTypes.number,
  totalPossible: PropTypes.number,
  score: PropTypes.number,
  isVisible: PropTypes.bool,
  isOwner: PropTypes.bool,
  isComplete: PropTypes.bool,
  hasStarted: PropTypes.bool
}

const mapStateToProps = (state, props) => {
  return {
    entry: currentEntrySelector(state, props),
    game: entryGameSelector(state, props),
    categories: entryCategoriesSelector(state, props),
    score: entryScoreSelector(state, props),
    peoplesChoiceScore: entryPeoplesChoiceScoreSelector(state, props),
    possible: entryPossibleScoreSelector(state, props),
    isVisible: entryVisibleSelector(state, props),
    isComplete: entryCompleteSelector(state, props),
    isOwner: isEntryOwnerSelector(state, props),
    hasStarted: entryGameStartedSelector(state, props),
    group: entryGroupSelector(state, props),
    totalPossible: gameTotalPossibleSelector(state, props)
  }
}

export default connect(mapStateToProps)(Entry)
