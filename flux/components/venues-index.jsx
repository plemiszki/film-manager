import React, { Component } from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import VenuesStore from '../stores/venues-store.js'
import NewThing from './new-thing.jsx'
import { Common, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

const ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 245
  }
};

class VenuesIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      searchText: "",
      sortBy: "label",
      venues: [],
      modalOpen: false
    };
  }

  componentDidMount() {
    this.venuesListener = VenuesStore.addListener(this.getVenues.bind(this));
    ClientActions.fetchVenues();
  }

  componentWillUnmount() {
    this.venuesListener.remove();
  }

  getVenues() {
    this.setState({
      fetching: false,
      venues: VenuesStore.all(),
      modalOpen: false
    });
  }

  redirect(id) {
    window.location.pathname = "venues/" + id;
  }

  clickNew() {
    if (!this.state.fetching) {
      this.setState({ modalOpen: true });
    }
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  render() {
    let filteredVenues = this.state.venues.filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="venues-index" className="component">
        <div className="clearfix">
          <h1>Venues</h1>
          <a className={ "orange-button float-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew.bind(this) }>Add Venue</a>
          <input className="search-box" onChange={ FM.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        </div>
        <div className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={ "admin-table" }>
            <thead>
              <tr>
                <th><div className={ FM.sortClass.call(this, "label") } onClick={ FM.clickHeader.bind(this, "label") }>Label</div></th>
                <th><div className={ FM.sortClass.call(this, "venueType") } onClick={ FM.clickHeader.bind(this, "venueType") }>Type</div></th>
                <th><div className={ FM.sortClass.call(this, "city") } onClick={ FM.clickHeader.bind(this, "city") }>City</div></th>
                <th><div className={ FM.sortClass.call(this, "state") } onClick={ FM.clickHeader.bind(this, "state") }>State</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td></tr>
              { _.orderBy(filteredVenues, [FM.commonSort.bind(this)]).map((venue, index) => {
                return(
                  <tr key={index} onClick={this.redirect.bind(this, venue.id)}>
                    <td className="name-column">
                      { venue.label }
                    </td>
                    <td>
                      { venue.venueType }
                    </td>
                    <td>
                      { venue.city }
                    </td>
                    <td>
                      { venue.state }
                    </td>
                  </tr>
                );
              }) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="venue" initialObject={ { label: "", sageId: "", venueType: "Theater" } } />
        </Modal>
      </div>
    );
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default VenuesIndex;
