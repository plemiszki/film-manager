import React, { Component } from 'react'

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
        <input className="search-box" onChange={ Common.changeSearchText.bind(this) } value={ this.state.searchText } data-field="searchText" />
        <ul className="licensor-modal-list">
          { this.state.options.filterSearchText(this.state.searchText, this.props.property).map(function(option, index) {
            return(
              <li key={ index } onClick={ this.props.func } data-id={ option.id } data-type={ option.itemType }>{ option[this.props.property] }</li>
            );
          }.bind(this)) }
        </ul>
      </div>
    );
  }
}

export default ModalSelect;
