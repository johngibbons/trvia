import React, { PropTypes } from 'react'
import './EntriesTable.css'
import { List, Seq } from 'immutable'

import EntryRow from './entryRow/EntryRow'

const EntriesTable = ({
  entries,
  categories,
  gameStarted,
  isPeoplesChoice
}) => {
  return (
    <div className='EntriesTable'>
      {!gameStarted &&
        <div className='EntriesTable--legend'>
          <span className='EntriesTable--legend-icon EntriesTable--legend-icon-complete'>
            Complete
          </span>
          <span className='EntriesTable--legend-icon EntriesTable--legend-icon-incomplete'>
            Incomplete
          </span>
        </div>}
      <table className='EntriesTable--table'>
        <thead className='EntriesTable--table-header'>
          <tr className='EntriesTable--table-header-row'>
            <th className='EntriesTable--headerCol EntriesTable--headerCol-rank' />
            <th className='EntriesTable--headerCol EntriesTable--headerCol-avatar' />
            <th className='EntriesTable--headerCol EntriesTable--headerCol-entry-name'>
              <span className='EntriesTable--entry-name-container'>
                Entry Name
              </span>
            </th>
            <th className='EntriesTable--headerCol EntriesTable--headerCol-score'>
              Score
            </th>
            {gameStarted &&
              categories.map(category => {
                return (
                  <th className='EntriesTable--headerCol EntriesTable--headerCol-diagonal'>
                    {category.name}
                  </th>
                )
              })}
          </tr>
        </thead>
        <tbody className='EntriesTable--table-body'>
          {entries.map((entry, i) => {
            return (
              <EntryRow
                key={entry.id || i}
                entry={entry}
                categories={categories}
                isPeoplesChoice={isPeoplesChoice}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

EntriesTable.propTypes = {
  entries: PropTypes.instanceOf(List),
  categories: PropTypes.instanceOf(Seq),
  gameStarted: PropTypes.bool,
  isPeoplesChoice: PropTypes.bool
}

export default EntriesTable
