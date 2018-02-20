var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var BookingsStore = require('../stores/bookings-store.js');
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
    height: 500
  }
};

var BookingsIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      bookings: [],
      modalOpen: false
    });
  },

  componentDidMount: function() {
    this.bookingsListener = BookingsStore.addListener(this.getBookings);
    ClientActions.fetchBookings();
  },

  componentWillUnmount: function() {
    this.bookingsListener.remove();
  },

  getBookings: function() {
    this.setState({
      fetching: false,
      sortBy: "startDate",
      searchText: "",
      bookings: BookingsStore.all(),
      modalOpen: false
    });
  },

  redirect: function(id) {
    window.location.pathname = "bookings/" + id;
  },

  handleAddNewClick: function() {
    this.setState({ modalOpen: true });
  },

  handleModalClose: function() {
    this.setState({ modalOpen: false });
  },

  render: function() {
    var filteredBookings = this.state.bookings.filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="bookings-index" className="component">
        <h1>Bookings</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.handleAddNewClick }>Add Booking</a>
        <input className="search-box" onChange={ Common.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={"admin-table"}>
            <thead>
              <tr>
                <th><div className={ Common.sortClass.call(this, "startDate") } onClick={ Common.clickHeader.bind(this, "startDate") }>Start Date</div></th>
                <th><div className={ Common.sortClass.call(this, "film") } onClick={ Common.clickHeader.bind(this, "film") }>Film</div></th>
                <th><div className={ Common.sortClass.call(this, "venue") } onClick={ Common.clickHeader.bind(this, "venue") }>Venue</div></th>
                <th><div className={ Common.sortClass.call(this, "dateAdded") } onClick={ Common.clickHeader.bind(this, "dateAdded") }>Date Added</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td><td></td><td></td></tr>
              { _.orderBy(filteredBookings, [Common.commonSort.bind(this)]).map(function(booking, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, booking.id) }>
                    <td className="indent">
                      { booking.startDate }
                    </td>
                    <td>
                      { booking.film }
                    </td>
                    <td>
                      { booking.venue }
                    </td>
                    <td>
                      { booking.dateAdded }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="booking" initialObject={ { bookingType: "Non-Theatrical", status: "Tentative", bookerId: BookingsStore.users()[0] && BookingsStore.users()[0].id, userId: Common.user.id } } />
        </Modal>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = BookingsIndex;
