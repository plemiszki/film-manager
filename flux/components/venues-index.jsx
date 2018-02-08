var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var VenuesStore = require('../stores/venues-store.js');
var NewThing = require('./new-thing.jsx');

var ModalStyles = {
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

var VenuesIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      searchText: "",
      sortBy: "label",
      venues: [],
      modalOpen: false
    });
  },

  componentDidMount: function() {
    this.venuesListener = VenuesStore.addListener(this.getVenues);
    ClientActions.fetchVenues();
  },

  componentWillUnmount: function() {
    this.venuesListener.remove();
  },

  getVenues: function() {
    this.setState({
      fetching: false,
      venues: VenuesStore.all(),
      modalOpen: false
    });
  },

  redirect: function(id) {
    window.location.pathname = "venues/" + id;
  },

  handleAddNewClick: function() {
    if (!this.state.fetching) {
      this.setState({ modalOpen: true });
    }
  },

  handleModalClose: function() {
    this.setState({ modalOpen: false });
  },

  render: function() {
    var filteredVenues = this.state.venues.filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="venues-index" className="component">
        <div className="clearfix">
          <h1>Venues</h1>
          <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.handleAddNewClick }>Add Venue</a>
          <input className="search-box" onChange={ Common.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        </div>
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={ "admin-table" }>
            <thead>
              <tr>
                <th><div className={ Common.sortClass.call(this, "label") } onClick={ Common.clickHeader.bind(this, "label") }>Label</div></th>
                <th><div className={ Common.sortClass.call(this, "venueType") } onClick={ Common.clickHeader.bind(this, "venueType") }>Type</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td></tr>
              { _.orderBy(filteredVenues, [Common.commonSort.bind(this)]).map(function(venue, index) {
                return(
                  <tr key={index} onClick={this.redirect.bind(this, venue.id)}>
                    <td className="name-column">
                      { venue.label }
                    </td>
                    <td>
                      { venue.venueType }
                    </td>
                  </tr>
                );
              }.bind(this))}
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="venue" initialObject={ { label: "", sageId: "", venueType: "Theater" } } />
        </Modal>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = VenuesIndex;
