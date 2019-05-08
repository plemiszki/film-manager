import React, { Component } from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import ServerActions from '../actions/server-actions.js'
import BookingsStore from '../stores/bookings-store.js'
import UpcomingBookingsStore from '../stores/upcoming-bookings-store.js'
import NewThing from './new-thing.jsx'
import JobStore from '../stores/job-store.js'
import AdvancedSearch from './advanced-search.jsx'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
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
    height: 500
  }
};

const AdvancedSearchModalStyles = {
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

class BookingsIndex extends React.Component {

  constructor(props) {
    super(props)

    let job = {
      errors_text: ""
    };

    this.state = {
      fetching: true,
      bookings: [],
      modalOpen: false,
      jobModalOpen: !!job.id,
      job: job,
      searchModalOpen: false
    };
  }

  componentDidMount() {
    if (this.props.timeframe == 'upcoming') {
      this.bookingsListener = UpcomingBookingsStore.addListener(this.getBookings.bind(this));
    } else {
      this.bookingsListener = BookingsStore.addListener(this.getBookings.bind(this));
    }
    if (this.props.advanced) {
      ClientActions.fetchBookingsAdvanced();
    } else {
      ClientActions.fetchBookings(this.props.timeframe);
    }
    this.jobListener = JobStore.addListener(this.getJob.bind(this));
  }

  componentWillUnmount() {
    this.bookingsListener.remove();
    this.jobListener.remove();
  }

  getBookings() {
    this.setState({
      fetching: false,
      sortBy: "startDate",
      searchText: "",
      bookings: (this.props.timeframe == 'upcoming' ? UpcomingBookingsStore.all() : BookingsStore.all()),
      modalOpen: false
    });
  }

  getJob() {
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
  }

  redirect(id) {
    window.location.pathname = "bookings/" + id;
  }

  clickNew() {
    this.setState({ modalOpen: true });
  }

  closeModal() {
    this.setState({
      modalOpen: false,
      searchModalOpen: false
    });
  }

  clickAdvanced() {
    this.setState({
      searchModalOpen: true
    });
  }

  clickSeeAll() {
    this.setState({
      fetching: true
    });
    ClientActions.fetchBookings(this.props.timeframe, 'all');
  }

  clickExport() {
    if (!this.state.fetching) {
      this.setState({
        fetching: true
      });
      var bookingIds = this.state.bookings.map(function(booking) {
        return booking.id;
      });
      ClientActions.exportBookings(bookingIds);
    }
  }

  sortByTime(booking) {
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
  }

  render() {
    var filteredBookings = this.state.bookings.filter(this.sortByTime.bind(this)).filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="bookings-index" className="bookings-index component">
        <h1>{ this.renderHeader() }</h1>
        { this.renderAddButton() }
        { this.renderExportButton() }
        { this.renderAdvancedSearchButton() }
        <input className={ "search-box" + ((this.props.advanced || this.props.timeframe == 'upcoming') ? ' margin' : '') } onChange={ FM.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <div className="horizontal-scroll">
            <table className="fm-admin-table">
              <thead>
                <tr>
                  <th className="small-column"><div className={ FM.sortClass.call(this, "startDate") } onClick={ FM.clickHeader.bind(this, "startDate") }>Start Date</div></th>
                  <th className="small-column"><div className={ FM.sortClass.call(this, "endDate") } onClick={ FM.clickHeader.bind(this, "endDate") }>End Date</div></th>
                  <th className="large-column"><div className={ FM.sortClass.call(this, "film") } onClick={ FM.clickHeader.bind(this, "film") }>Film</div></th>
                  <th className="large-column"><div className={ FM.sortClass.call(this, "venue") } onClick={ FM.clickHeader.bind(this, "venue") }>Venue</div></th>
                  <th className="small-column"><div className={ FM.sortClass.call(this, "shippingCity") } onClick={ FM.clickHeader.bind(this, "shippingCity") }>City</div></th>
                  <th className="small-column"><div className={ FM.sortClass.call(this, "shippingState") } onClick={ FM.clickHeader.bind(this, "shippingState") }>State</div></th>
                  <th className="small-column"><div className={ FM.sortClass.call(this, "dateAdded") } onClick={ FM.clickHeader.bind(this, "dateAdded") }>Date Added</div></th>
                  <th className="med-column"><div className={ FM.sortClass.call(this, "terms") } onClick={ FM.clickHeader.bind(this, "terms") }>Terms</div></th>
                  <th className="med-column"><div className={ FM.sortClass.call(this, "bookingType") } onClick={ FM.clickHeader.bind(this, "bookingType") }>Type</div></th>
                  <th className="small-column"><div className={ FM.sortClass.call(this, "format") } onClick={ FM.clickHeader.bind(this, "format") }>Format</div></th>
                  <th className="small-column"><div className={ FM.sortClass.call(this, "materialsSent") } onClick={ FM.clickHeader.bind(this, "materialsSent") }>Materials Sent</div></th>
                  <th className="small-column"><div className={ FM.sortClass.call(this, "boxOfficeReceived") } onClick={ FM.clickHeader.bind(this, "boxOfficeReceived") }>BO Received</div></th>
                  <th className="small-column"><div className={ FM.sortClass.call(this, "totalGross") } onClick={ FM.clickHeader.bind(this, "totalGross") }>Total Gross</div></th>
                  <th className="small-column"><div className={ FM.sortClass.call(this, "ourShare") } onClick={ FM.clickHeader.bind(this, "ourShare") }>Our Share</div></th>
                  <th className="small-column"><div className={ FM.sortClass.call(this, "received") } onClick={ FM.clickHeader.bind(this, "received") }>Received</div></th>
                  <th className="small-column"><div className={ FM.sortClass.call(this, "owed") } onClick={ FM.clickHeader.bind(this, "owed") }>Owed</div></th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                { _.orderBy(filteredBookings, [FM.commonSort.bind(this)], [this.state.sortBy == 'startDate' && this.props.timeframe !== 'upcoming' && !this.props.advanced ? 'desc' : 'asc']).map(function(booking, index) {
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
                      <td>
                        { booking.valid ? booking.totalGross : 'Invalid' }
                      </td>
                      <td>
                        { booking.valid ? booking.ourShare : 'Invalid' }
                      </td>
                      <td>
                        { booking.valid ? booking.received : 'Invalid' }
                      </td>
                      <td>
                        { booking.valid ? booking.owed : 'Invalid' }
                      </td>
                    </tr>
                  );
                }.bind(this)) }
              </tbody>
            </table>
          </div>
        </div>
        { this.renderSeeAllButton() }
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="booking" initialObject={ { bookingType: "Non-Theatrical", status: "Tentative", bookerId: BookingsStore.bookers()[0] && BookingsStore.bookers()[0].id, userId: FM.user.id } } />
        </Modal>
        <Modal isOpen={ this.state.searchModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ AdvancedSearchModalStyles }>
          <AdvancedSearch />
        </Modal>
        { FM.jobModal.call(this, this.state.job) }
      </div>
    );
  }

  renderHeader() {
    if (this.props.timeframe == 'upcoming') {
      return 'Upcoming Bookings';
    } else if (this.props.advanced) {
      return 'Bookings';
    } else {
      return 'Past Bookings';
    }
  }

  renderAddButton() {
    if (this.props.timeframe == 'upcoming') {
      return(
        <a className={ "orange-button float-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew.bind(this) }>Add Booking</a>
      );
    }
  }

  renderAdvancedSearchButton() {
    if (this.props.advanced || this.props.timeframe == 'upcoming') {
      return(
        <a className={ "orange-button float-button advanced-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickAdvanced.bind(this) }>Advanced Search</a>
      );
    }
  }

  renderExportButton() {
    if (this.props.advanced) {
      return(
        <a className={ "orange-button float-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickExport.bind(this) }>Export</a>
      );
    }
  }

  renderSeeAllButton() {
    if (!this.props.advanced && this.state.bookings.length === 25) {
      return(
        <div className="text-center">
          <a className={ "orange-button see-all" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickSeeAll.bind(this) }>See All</a>
        </div>
      )
    }
  }

  componentDidUpdate() {
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
        });
      }.bind(this), 1500)
    }
  }
}

export default BookingsIndex;
