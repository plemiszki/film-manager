import React, { Component } from 'react'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

class ModalSelect extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      options: this.props.options,
      searchText: ""
    };
  }

  render() {
    return(
      <div className="modal-select">
        <input className="search-box" onChange={ FM.changeSearchText.bind(this) } value={ this.state.searchText } data-field="searchText" />
        <ul className="licensor-modal-list">
          { this.state.options.filterSearchText(this.state.searchText, this.props.property).map((option, index) => {
            return(
              <li key={ index } onClick={ this.props.func } data-id={ option.id } data-type={ option.itemType }>{ option[this.props.property] }</li>
            );
          }) }
        </ul>
      </div>
    );
  }
}

export default ModalSelect;
