import React, { PropTypes } from 'react'
import './NomineesGrid.css'

import { Seq } from 'immutable'

import Nominee from './nominee/Nominee'
const NomineesGrid = ({
  nominees,
  selectedNomineeId,
  correctNomineeIds,
  isIncorrect,
  isPeoplesChoice
}) => {
  const nomineeEl = (nominee, i) => (
    <Nominee
      key={nominee.id || i}
      nominee={nominee}
      selectedNomineeId={selectedNomineeId}
      correctIds={correctNomineeIds}
      isPeoplesChoice={isPeoplesChoice}
    />
  )

  const selectableNominees = nominees.map(nomineeEl)

  const selectedNominee = nominees.filter(
    (nominee, i) => nominee.id === selectedNomineeId
  )
  const correctNominees = nominees.filter((nominee, i) =>
    correctNomineeIds.includes(nominee.id)
  )

  const unselectableNominees = correctNomineeIds.includes(selectedNomineeId)
    ? correctNominees.map(nomineeEl)
    : [...selectedNominee, ...correctNominees].map(nomineeEl)

  return (
    <div className='NomineesGrid'>
      <div className='NomineesGrid--list'>
        {correctNomineeIds.size !== 0
          ? unselectableNominees
          : selectableNominees}
      </div>
    </div>
  )
}

NomineesGrid.propTypes = {
  nominees: PropTypes.instanceOf(Seq),
  selectedNomineeId: PropTypes.string,
  correctNomineeIds: PropTypes.object,
  isPeoplesChoice: PropTypes.bool
}

export default NomineesGrid
