import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import './Group.css';
import { Seq } from 'immutable';
import GroupModel from '../../models/Group';
import { groupEntriesSelector } from '../../selectors/entries-selector';
import { currentGroupSelector } from '../../selectors/group-selector';
import { openModal } from '../../actions/ui-actions';

import RaisedButton from 'material-ui/RaisedButton';
import NewEntryModal from '../../components/entry/newEntryModal/NewEntryModal';

const Group = ({
  group,
  entries,
  params,
  onClickNewEntry
}) => {
  return (
    <div className='Group'>
      <h1>{group.name}</h1>
        <RaisedButton
          primary
          label='Create your entry'
          labelStyle={{
            color: '#212121'
          }}
          onClick={() => onClickNewEntry('NEW_ENTRY')}
        />
      {entries.map((entry, i) =>
        <div key={entry.get('id') || i}>{entry.name}</div>)}
      <NewEntryModal groupId={params.id} />
    </div>
  )
}

Group.propTypes = {
  group: PropTypes.instanceOf(GroupModel),
  entries: PropTypes.instanceOf(Seq),
  params: PropTypes.object,
  onClickNewEntry: PropTypes.func.isRequired
}

const mapStateToProps = (state, props) => {
  return {
    entries: groupEntriesSelector(state, props),
    group: currentGroupSelector(state, props)
  }
}

export default connect(mapStateToProps, {
  onClickNewEntry: openModal
})(Group)
