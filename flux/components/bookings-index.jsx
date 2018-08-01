var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var ServerActions = require('../actions/server-actions.js');
var BookingsStore = require('../stores/bookings-store.js');
var UpcomingBookingsStore = require('../stores/upcoming-bookings-store.js');
var NewThing = require('./new-thing.jsx');
var JobStore = require('../stores/job-store.js');
var AdvancedSearch = require('./advanced-search.jsx');

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

var AdvancedSearchModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 575
  }
};

var BookingsIndex = React.createClass({

  getInitialState: function() {
    var job = {
      errors_text: ""
    };
    return({
      fetching: true,
      bookings: [],
      modalOpen: false,
      jobModalOpen: !!job.id,
      job: job,
      searchModalOpen: false
    });
  },

  componentDidMount: function() {
    if (this.props.timeframe == 'upcoming') {
      this.bookingsListener = UpcomingBookingsStore.addListener(this.getBookings);
    } else {
      this.bookingsListener = BookingsStore.addListener(this.getBookings);
    }
    if (this.props.advanced) {
      ClientActions.fetchBookingsAdvanced();
    } else {
      ClientActions.fetchBookings(this.props.timeframe);
    }
    this.jobListener = JobStore.addListener(this.getJob);
  },

  componentWillUnmount: function() {
    this.bookingsListener.remove();
    this.jobListener.remove();
  },

  getBookings: function() {
    this.setState({
      fetching: false,
      sortBy: "startDate",
      searchText: "",
      bookings: (this.props.timeframe == 'upcoming' ? UpcomingBookingsStore.all() : BookingsStore.all()),
      modalOpen: false
    });
  },

  getJob: function() {
    var job = JobStore.job();
    if (job.done) {
      this.setState({
        jobModalOpen: false,
        job: job
      }, function() {
        window.location.href = job.first_line;
      });
    } else {
      this.setState({
        jobModalOpen: true,
        job: job,
        fetching: false
      });
    }
  },

  redirect: function(id) {
    window.location.pathname = "bookings/" + id;
  },

  handleAddNewClick: function() {
    this.setState({ modalOpen: true });
  },

  handleModalClose: function() {
    this.setState({
      modalOpen: false,
      searchModalOpen: false
    });
  },

  clickAdvanced: function() {
    this.setState({
      searchModalOpen: true
    });
  },

  clickSeeAll: function() {
    this.setState({
      fetching: true
    });
    ClientActions.fetchBookings(this.props.timeframe, 'all');
  },

  clickExport: function() {
    if (!this.state.fetching) {
      this.setState({
        fetching: true
      });
      var bookingIds = this.state.bookings.map(function(booking) {
        return booking.id;
      });
      ClientActions.exportBookings(bookingIds);
    }
  },

  sortByTime: function(booking) {
    if (this.props.advanced) {
      return true;
    } else {
      var date = new Date(booking.startDate).setHours(0,0,0,0);
      var today = new Date().setHours(0,0,0,0);
      if (this.props.timeframe === 'upcoming') {
        return date >= today;
      } else {
        return date < today;
      }
    }
  },

  render: function() {
    var filteredBookings = this.state.bookings.filter(this.sortByTime).filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="bookings-index" className="bookings-index component">
        <h1>{ this.renderHeader() }</h1>
        { this.renderAddButton() }
        { this.renderExportButton() }
        { this.renderAdvancedSearchButton() }
        <input className={ "search-box" + ((this.props.advanced || this.props.timeframe == 'upcoming') ? '' : ' no-margin') } onChange={ Common.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <div className="horizontal-scroll">
            <table className={"admin-table"}>
              <thead>
                <tr>
                  <th className="small-column"><div className={ Common.sortClass.call(this, "startDate") } onClick={ Common.clickHeader.bind(this, "startDate") }>Start Date</div></th>
                  <th className="small-column"><div className={ Common.sortClass.call(this, "endDate") } onClick={ Common.clickHeader.bind(this, "endDate") }>End Date</div></th>
                  <th className="large-column"><div className={ Common.sortClass.call(this, "film") } onClick={ Common.clickHeader.bind(this, "film") }>Film</div></th>
                  <th className="large-column"><div className={ Common.sortClass.call(this, "venue") } onClick={ Common.clickHeader.bind(this, "venue") }>Venue</div></th>
                  <th className="small-column"><div className={ Common.sortClass.call(this, "shippingCity") } onClick={ Common.clickHeader.bind(this, "shippingCity") }>City</div></th>
                  <th className="small-column"><div className={ Common.sortClass.call(this, "shippingState") } onClick={ Common.clickHeader.bind(this, "shippingState") }>State</div></th>
                  <th className="small-column"><div className={ Common.sortClass.call(this, "dateAdded") } onClick={ Common.clickHeader.bind(this, "dateAdded") }>Date Added</div></th>
                  <th className="med-column"><div className={ Common.sortClass.call(this, "terms") } onClick={ Common.clickHeader.bind(this, "terms") }>Terms</div></th>
                  <th className="med-column"><div className={ Common.sortClass.call(this, "bookingType") } onClick={ Common.clickHeader.bind(this, "bookingType") }>Type</div></th>
                  <th className="small-column"><div className={ Common.sortClass.call(this, "format") } onClick={ Common.clickHeader.bind(this, "format") }>Format</div></th>
                  <th className="small-column"><div className={ Common.sortClass.call(this, "materialsSent") } onClick={ Common.clickHeader.bind(this, "materialsSent") }>Materials Sent</div></th>
                  <th className="small-column"><div className={ Common.sortClass.call(this, "boxOfficeReceived") } onClick={ Common.clickHeader.bind(this, "boxOfficeReceived") }>BO Received</div></th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                { _.orderBy(filteredBookings, [Common.commonSort.bind(this)], [this.state.sortBy == 'startDate' && this.props.timeframe !== 'upcoming' && !this.props.advanced ? 'desc' : 'asc']).map(function(booking, index) {
                  return(
                    <tr key={ index } onClick={ this.redirect.bind(this, booking.id) }>
                      <td className="indent">
                        { booking.startDate }
                      </td>
                      <td>
                        { booking.endDate }
                      </td>
                      <td>
                        { booking.film }
                      </td>
                      <td>
                        { booking.venue }
                      </td>
                      <td>
                        { booking.shippingCity }
                      </td>
                      <td>
                        { booking.shippingState }
                      </td>
                      <td>
                        { booking.dateAdded }
                      </td>
                      <td>
                        { booking.terms }
                      </td>
                      <td>
                        { booking.bookingType }
                      </td>
                      <td>
                        { booking.format }
                      </td>
                      <td>
                        { booking.materialsSent }
                      </td>
                      <td>
                        { booking.boxOfficeReceived }
                      </td>
                    </tr>
                  );
                }.bind(this)) }
              </tbody>
            </table>
          </div>
        </div>
        { this.renderSeeAllButton() }
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="booking" initialObject={ { bookingType: "Non-Theatrical", status: "Tentative", bookerId: BookingsStore.bookers()[0] && BookingsStore.bookers()[0].id, userId: Common.user.id } } />
        </Modal>
        <Modal isOpen={ this.state.searchModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ AdvancedSearchModalStyles }>
          <AdvancedSearch />
        </Modal>
        { Common.jobModal.call(this, this.state.job) }
      </div>
    );
  },

  renderHeader() {
    if (this.props.timeframe == 'upcoming') {
      return 'Upcoming Bookings';
    } else if (this.props.advanced) {
      return 'Bookings';
    } else {
      return 'Past Bookings';
    }
  },

  renderAddButton() {
    if (this.props.timeframe == 'upcoming') {
      return(
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.handleAddNewClick }>Add Booking</a>
      );
    }
  },

  renderAdvancedSearchButton() {
    if (this.props.advanced || this.props.timeframe == 'upcoming') {
      return(
        <a className={ "orange-button float-button advanced-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickAdvanced }>Advanced Search</a>
      );
    }
  },

  renderExportButton() {
    if (this.props.advanced) {
      return(
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickExport }>Export</a>
      );
    }
  },

  renderSeeAllButton: function() {
    if (!this.props.advanced && this.state.bookings.length === 25) {
      return(
        <div className="text-center">
          <a className={ "orange-button see-all" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickSeeAll }>See All</a>
        </div>
      )
    }
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
    if (this.state.jobModalOpen) {
      window.setTimeout(function() {
        $.ajax({
          url: '/api/jobs/status',
          method: 'GET',
          data: {
            id: this.state.job.id,
            time: this.state.job.job_id
          },
          success: function(response) {
            ServerActions.receiveJob(response);
          }.bind(this)
        })
      }.bind(this), 1500)
    }
  }
});

module.exports = BookingsIndex;
