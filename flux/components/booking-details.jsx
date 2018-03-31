var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var BookingsStore = require('../stores/bookings-store.js');
var WeeklyTermsStore = require('../stores/weekly-terms-store.js');
var WeeklyBoxOfficesStore = require('../stores/weekly-box-offices-store.js');
var PaymentsStore = require('../stores/payments-store.js');
var CalculationsStore = require('../stores/calculations-store.js');
var ErrorsStore = require('../stores/errors-store.js');
import ModalSelect from './modal-select.jsx';
import NewThing from './new-thing.jsx';

var WeeklyTermStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 700,
    height: 240
  }
};

var BookingDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      booking: {},
      bookingSaved: {},
      users: [],
      weeklyTerms: [],
      weeklyBoxOffices: [],
      payments: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      newWeeklyTermsModalOpen: false,
      newWeeklyBoxOfficeModalOpen: false,
      newPaymentModalOpen: false,
      calculations: {
        totalGross: "$0.00",
        ourShare: "$0.00",
        received: "$0.00",
        owed: "$0.00"
      }
    });
  },

  componentDidMount: function() {
    Common.setUpNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    this.bookingListener = BookingsStore.addListener(this.getBooking);
    this.weeklyTermsListener = WeeklyTermsStore.addListener(this.getWeeklyTerms);
    this.weeklyBoxOfficesListener = WeeklyBoxOfficesStore.addListener(this.getWeeklyBoxOffices);
    this.paymentsListener = PaymentsStore.addListener(this.getPayments);
    this.calculationsListener = CalculationsStore.addListener(this.getCalculations);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchBooking(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.bookingListener.remove();
    this.weeklyTermsListener.remove();
    this.weeklyBoxOfficesListener.remove();
    this.paymentsListener.remove();
    this.calculationsListener.remove();
    this.errorsListener.remove();
  },

  getBooking: function() {
    this.setState({
      booking: Tools.deepCopy(BookingsStore.find(window.location.pathname.split("/")[2])),
      bookingSaved: BookingsStore.find(window.location.pathname.split("/")[2]),
      users: BookingsStore.users(),
      weeklyTerms: BookingsStore.weeklyTerms(),
      weeklyBoxOffices: BookingsStore.weeklyBoxOffice(),
      payments: BookingsStore.payments(),
      fetching: false
    }, function() {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  },

  getWeeklyTerms: function() {
    this.setState({
      weeklyTerms: WeeklyTermsStore.all(),
      fetching: false,
      newWeeklyTermsModalOpen: false
    });
  },

  getWeeklyBoxOffices: function() {
    this.setState({
      weeklyBoxOffices: WeeklyBoxOfficesStore.all(),
      fetching: false,
      newWeeklyBoxOfficeModalOpen: false
    });
  },

  getPayments: function() {
    this.setState({
      payments: PaymentsStore.all(),
      fetching: false,
      newPaymentModalOpen: false
    });
  },

  getCalculations: function() {
    this.setState({
      calculations: CalculationsStore.object()
    });
  },

  getErrors: function() {
    this.setState({
      errors: ErrorsStore.all(),
      fetching: false
    });
  },

  clickSave: function() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, function() {
        ClientActions.updateBooking(this.state.booking);
      });
    }
  },

  clickDelete: function(e) {
    this.setState({
      deleteModalOpen: true
    });
  },

  confirmDelete: function() {
    this.setState({
      fetching: true,
      deleteModalOpen: false
    }, function() {
      ClientActions.deleteAndGoToIndex('bookings', this.state.booking.id);
    });
  },

  clickSelectFilmButton: function() {
    this.setState({
      filmsModalOpen: true
    });
  },

  clickSelectFilm: function(event) {
    var booking = this.state.booking;
    booking.filmId = +event.target.dataset.id;
    this.setState({
      booking: booking,
      filmsModalOpen: false,
    }, function() {
      this.setState({
        changesToSave: this.checkForChanges()
      })
    });
  },

  clickSelectVenueButton: function() {
    this.setState({
      venuesModalOpen: true
    });
  },

  clickSelectVenue: function(event) {
    var booking = this.state.booking;
    booking.venueId = +event.target.dataset.id;
    this.setState({
      booking: booking,
      venuesModalOpen: false
    }, function() {
      this.setState({
        changesToSave: this.checkForChanges()
      })
    });
  },

  clickAddWeek: function() {
    this.setState({
      newWeeklyTermsModalOpen: true
    });
  },

  clickDeleteWeek: function(e) {
    this.setState({
      fetching: true
    });
    var id = e.target.dataset.id;
    ClientActions.deleteWeeklyTerm(id);
  },

  clickAddWeeklyBoxOffice: function() {
    this.setState({
      newWeeklyBoxOfficeModalOpen: true
    });
  },

  clickDeleteWeeklyBoxOffice: function(e) {
    this.setState({
      fetching: true
    });
    var id = e.target.dataset.id;
    ClientActions.deleteWeeklyBoxOffice(id);
  },

  clickAddPayment: function() {
    this.setState({
      newPaymentModalOpen: true
    });
  },

  clickDeletePayment: function(e) {
    this.setState({
      fetching: false
    });
    var id = e.target.dataset.id;
    ClientActions.deletePayment(id);
  },

  clickSendConfirmation: function() {
    if (this.state.changesToSave === false) {
      this.setState({
        fetching: true
      });
      ClientActions.sendConfirmation(this.state.booking);
    }
  },

  handleModalClose: function() {
    var errors = this.state.errors;
    HandyTools.removeFromArray(errors, "Terms can't be blank");
    this.setState({
      errors: errors,
      deleteModalOpen: false,
      filmsModalOpen: false,
      venuesModalOpen: false,
      newWeeklyTermsModalOpen: false,
      newWeeklyBoxOfficeModalOpen: false,
      newPaymentModalOpen: false
    });
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.booking, this.state.bookingSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "booking",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges,
      beforeSave: function(newThing, key, value) {
        if (key == "terms") {
          if (value !== "90/10") {
            newThing.houseExpense = "$0.00";
            Common.removeFieldError(this.state.errors, "houseExpense")
          }
        }
      }
    }
  },

  render: function() {
    return(
      <div className="booking-details">
        <div className="component details-component">
          <h1>Booking Details</h1>
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-5">
                <h2>Film</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ BookingsStore.findFilm(this.state.booking.filmId) ? BookingsStore.findFilm(this.state.booking.filmId).title : "" } data-field="filmId" readOnly="true" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-1 select-from-modal">
                <img src={ Images.openModal } onClick={ this.clickSelectFilmButton } />
              </div>
              <div className="col-xs-5">
                <h2>Venue</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ BookingsStore.findVenue(this.state.booking.venueId) ? BookingsStore.findVenue(this.state.booking.venueId).label : "" } data-field="venueId" readOnly="true" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-1 select-from-modal">
                <img src={ Images.openModal } onClick={ this.clickSelectVenueButton } />
              </div>
            </div>
            <div className="row">
              <div className="col-xs-2">
                <h2>Start Date</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.startDate) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.startDate || "" } data-field="startDate" />
                { Common.renderFieldError(this.state.errors, Common.errors.startDate) }
              </div>
              <div className="col-xs-2">
                <h2>End Date</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.endDate) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.endDate || "" } data-field="endDate" />
                { Common.renderFieldError(this.state.errors, Common.errors.endDate) }
              </div>
              <div className="col-xs-3">
                <h2>Type</h2>
                <select onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="bookingType" value={ this.state.booking.bookingType }>
                  <option value={ "Theatrical" }>Theatrical</option>
                  <option value={ "Non-Theatrical" }>Non-Theatrical</option>
                  <option value={ "Festival" }>Festival</option>
                </select>
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-3">
                <h2>Status</h2>
                <select onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="status" value={ this.state.booking.status }>
                  <option value={ "Tentative" }>Tentative</option>
                  <option value={ "Confirmed" }>Confirmed</option>
                </select>
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Screenings</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.screenings || "" } data-field="screenings" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-6">
                <h2>Email</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.email || "" } data-field="email" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              { this.renderBookedByField() }
              <div className="col-xs-3">
                <h2>Format</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.format || "" } data-field="format" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-4">
                <h2>Premiere</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.premiere || "" } data-field="premiere" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Advance</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.advance) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.advance || "" } data-field="advance" />
                { Common.renderFieldError(this.state.errors, Common.errors.advance) }
              </div>
              <div className="col-xs-2">
                <h2>Shipping Fee</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.shippingFee) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.shippingFee || "" } data-field="shippingFee" />
                { Common.renderFieldError(this.state.errors, Common.errors.shippingFee) }
              </div>
              <div className="col-xs-2">
                <h2>Deduction</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.deduction) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.deduction || "" } data-field="deduction" />
                { Common.renderFieldError(this.state.errors, Common.errors.deduction) }
              </div>
              { this.renderHouseExpense() }
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-3">
                <input id="terms-change-weekly" className="checkbox" type="checkbox" onChange={ Common.changeCheckBox.bind(this, this.changeFieldArgs()) } checked={ this.state.booking.termsChange || false } data-field="termsChange" /><label className="checkbox" htmlFor="terms-change-weekly">Terms Change Weekly</label>
              </div>
              { this.renderTermsColumn() }
            </div>
            <hr />
            <h3>Billing Address:</h3>
            <div className="row">
              <div className="col-xs-4">
                <h2>Name</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.billingName || ""} data-field="billingName" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Address 1</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.billingAddress1 || ""} data-field="billingAddress1" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Address 2</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.billingAddress2 || ""} data-field="billingAddress2" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3">
                <h2>City</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.billingCity || ""} data-field="billingCity" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-1">
                <h2>State</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.billingState || ""} data-field="billingState" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-2">
                <h2>Zip</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.billingZip || ""} data-field="billingZip" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Country</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.billingCountry || "" } data-field="billingCountry" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <hr />
            <h3>Shipping Address:</h3>
            <div className="row">
              <div className="col-xs-4">
                <h2>Name</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.shippingName || ""} data-field="shippingName" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Address 1</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.shippingAddress1 || ""} data-field="shippingAddress1" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Address 2</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.shippingAddress2 || ""} data-field="shippingAddress2" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3">
                <h2>City</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.shippingCity || ""} data-field="shippingCity" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-1">
                <h2>State</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.shippingState || ""} data-field="shippingState" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-2">
                <h2>Zip</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.shippingZip || ""} data-field="shippingZip" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Country</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.shippingCountry || "" } data-field="shippingCountry" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <hr />
            { this.renderConfirmationSection() }
            <h3>Screening Materials:</h3>
              <div className="row">
                <div className="col-xs-3">
                  <h2>Materials Sent</h2>
                  <input className={ Common.errorClass(this.state.errors, Common.errors.materialsSent) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.materialsSent || "" } data-field="materialsSent" />
                  { Common.renderFieldError(this.state.errors, Common.errors.materialsSent) }
                </div>
                <div className="col-xs-3">
                  <h2>Tracking Number</h2>
                  <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.trackingNumber || "" } data-field="trackingNumber" />
                  { Common.renderFieldError(this.state.errors, []) }
                </div>
                <div className="col-xs-6">
                  <h2>Shipping Notes</h2>
                  <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.shippingNotes || "" } data-field="shippingNotes" />
                  { Common.renderFieldError(this.state.errors, []) }
                </div>
              </div>
            <hr />
            <h3>Box Office:</h3>
            <div className="row">
              <div className="col-xs-3">
                <input id="box-office-received" className="checkbox" type="checkbox" onChange={ Common.changeCheckBox.bind(this, this.changeFieldArgs()) } checked={ this.state.booking.boxOfficeReceived || false } data-field="boxOfficeReceived" /><label className="checkbox" htmlFor="box-office-received">Box Office Received</label>
              </div>
              { this.renderBoxOfficeSection() }
            </div>
            <hr />
            <h3>Invoices:</h3>
            { this.renderInvoicesSection() }
            <hr />
            <div className="row">
              <div className="col-xs-6">
                <h3>Payments:</h3>
                <ul>
                  { this.state.payments.map(function(payment) {
                    return(
                      <li key={ payment.id }>{ payment.date } - { payment.amount }{ payment.notes && " (" + payment.notes + ")" }<div className="x-button" onClick={ this.clickDeletePayment } data-id={ payment.id }></div></li>
                    );
                  }.bind(this)) }
                </ul>
                <a className={ 'blue-outline-button small' } onClick={ this.clickAddPayment }>Add Payment</a>
              </div>
              <div className="col-xs-6">
                <h3>Calculations:</h3>
                { this.renderCalculations() }
              </div>
            </div>
            <hr />
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this booking&#63;</h1>
            Deleting a booking will erase ALL of its information and data<br />
            <a className={ "red-button" } onClick={ this.confirmDelete }>
              Yes
            </a>
            <a className={ "orange-button" } onClick={ this.handleModalClose }>
              No
            </a>
          </div>
        </Modal>
        <Modal isOpen={ this.state.filmsModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ BookingsStore.films() } property={ "title" } func={ this.clickSelectFilm } />
        </Modal>
        <Modal isOpen={ this.state.venuesModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ BookingsStore.venues() } property={ "label" } func={ this.clickSelectVenue } />
        </Modal>
        <Modal isOpen={ this.state.newWeeklyTermsModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ WeeklyTermStyles }>
          <NewThing thing="weeklyTerm" initialObject={ { bookingId: this.state.booking.id } } />
        </Modal>
        <Modal isOpen={ this.state.newWeeklyBoxOfficeModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ WeeklyTermStyles }>
          <NewThing thing="weeklyBoxOffice" initialObject={ { bookingId: this.state.booking.id } } />
        </Modal>
        <Modal isOpen={ this.state.newPaymentModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ WeeklyTermStyles }>
          <NewThing thing="payment" initialObject={ { bookingId: this.state.booking.id, date: "", amount: "", notes: "" } } />
        </Modal>
      </div>
    );
  },

  renderCalculations: function() {
    if (this.state.bookingSaved.termsValid) {
      return(
        <div>
          <h2>Total Gross</h2>
          <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.calculations.totalGross } readOnly={ true } />
          { Common.renderFieldError(this.state.errors, []) }
          <h2>Our Share</h2>
          <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.calculations.ourShare } readOnly={ true } />
          { Common.renderFieldError(this.state.errors, []) }
          <h2>Received</h2>
          <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.calculations.received } readOnly={ true } />
          { Common.renderFieldError(this.state.errors, []) }
          <h2>Owed</h2>
          <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.calculations.owed } readOnly={ true } />
          { Common.renderFieldError(this.state.errors, []) }
        </div>
      );
    } else {
      return(
        <div style={ { color: 'red' } }>Terms are not valid.</div>
      );
    }
  },

  renderTermsColumn: function() {
    if (this.state.booking.termsChange) {
      return(
        <div className="col-xs-6">
          <h2>Terms by Week</h2>
          <ul>
            { this.state.weeklyTerms.map(function(weeklyTerms) {
              return(
                <li key={ weeklyTerms.id }>Week { +weeklyTerms.order + 1 } - { weeklyTerms.terms }<div className="x-button" onClick={ this.clickDeleteWeek } data-id={ weeklyTerms.id }></div></li>
              );
            }.bind(this)) }
          </ul>
          <a className={ 'blue-outline-button small' } onClick={ this.clickAddWeek }>Add Week</a>
        </div>
      );
    } else {
      return(
        <div className="col-xs-3">
          <h2 style={ this.state.bookingSaved.termsValid ? {} : { color: "red" } }>Terms</h2>
          <input className={ Common.errorClass(this.state.errors, Common.errors.terms) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.terms || "" } data-field="terms" />
          { Common.renderFieldError(this.state.errors, Common.errors.terms) }
        </div>
      );
    }
  },

  renderHouseExpense: function() {
    if (!this.state.booking.termsChange && this.state.booking.terms === "90/10") {
      return(
        <div className="col-xs-2">
          <h2>House Expense</h2>
          <input className={ Common.errorClass(this.state.errors, Common.errors.houseExpense) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.houseExpense || "" } data-field="houseExpense" />
          { Common.renderFieldError(this.state.errors, Common.errors.houseExpense) }
        </div>
      );
    }
  },

  renderConfirmationSection: function() {
    if (this.state.booking.bookingConfirmationSent) {
      return(
        <div>
          <h3>Booking Confirmation:</h3>
          <div className="row">
            <div className="col-xs-3">
              <h2>Booking Confirmation Sent</h2>
              <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.bookingConfirmationSent || "" } data-field="bookingConfirmationSent" readOnly={ true } />
              { Common.renderFieldError(this.state.errors, []) }
            </div>
          </div>
          <hr />
        </div>
      )
    } else {
      if (this.state.bookingSaved.email) {
        return(
          <div>
            <h3>Booking Confirmation:</h3>
            <div className="row">
              <div className="col-xs-12">
                <a className={ "orange-button confirmation-button" + HandyTools.renderInactiveButtonClass(this.state.fetching || this.state.changesToSave) } onClick={ this.clickSendConfirmation }>
                  { this.state.changesToSave ? "Save to Send" : "Send Booking Confirmation" }
                </a>
              </div>
            </div>
            <hr />
          </div>
        );
      }
    }
  },

  renderBookedByField: function() {
    if (JSON.stringify(this.state.booking) == "{}" || this.state.booking.pastBooker) {
      return(
        <div className="col-xs-3">
          <h2>Booked By</h2>
          <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.pastBooker || "" } data-field="pastBooker" readOnly={ true } />
          { Common.renderFieldError(this.state.errors, []) }
        </div>
      );
    } else {
      return(
        <div className="col-xs-3">
          <h2>Booked By</h2>
          <select onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="bookerId" value={ this.state.booking.bookerId }>
            { BookingsStore.bookers().map(function(user) {
              return(
                <option key={ user.id } value={ user.id }>{ user.name }</option>
              );
            }) }
          </select>
          { Common.renderFieldError(this.state.errors, []) }
        </div>
      );
    }
  },

  renderBoxOfficeSection: function() {
    if (this.state.booking.termsChange) {
      return(
        <div className="col-xs-6">
          <h2>Box Office by Week</h2>
          <ul>
            { this.state.weeklyBoxOffices.map(function(weeklyBoxOffice) {
              return(
                <li key={ weeklyBoxOffice.id }>Week { +weeklyBoxOffice.order + 1 } - { weeklyBoxOffice.amount }<div className="x-button" onClick={ this.clickDeleteWeeklyBoxOffice } data-id={ weeklyBoxOffice.id }></div></li>
              );
            }.bind(this)) }
          </ul>
          <a className={ 'blue-outline-button small' } onClick={ this.clickAddWeeklyBoxOffice }>Add Weekly Box Office</a>
        </div>
      );
    } else {
      return(
        <div className="col-xs-3">
          <h2>Box Office</h2>
          <input className={ Common.errorClass(this.state.errors, Common.errors.boxOffice) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.boxOffice || "" } data-field="boxOffice" />
          { Common.renderFieldError(this.state.errors, Common.errors.boxOffice) }
        </div>
      );
    }
  },

  renderInvoicesSection: function() {
    if (this.state.booking.importedAdvanceInvoiceSent || this.state.booking.importedAdvanceInvoiceNumber || this.state.booking.importedOverageInvoiceSent || this.state.booking.importedOverageInvoiceNumber) {
      return(
        <div className="row">
          <div className="col-xs-3">
            <h2>Advance Invoice Sent</h2>
            <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.importedAdvanceInvoiceSent || "" } data-field="importedAdvanceInvoiceSent" readOnly={ true } />
            { Common.renderFieldError(this.state.errors, []) }
          </div>
          <div className="col-xs-3">
            <h2>Advance Invoice Number</h2>
            <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.importedAdvanceInvoiceNumber || "" } data-field="importedAdvanceInvoiceNumber" readOnly={ true } />
            { Common.renderFieldError(this.state.errors, []) }
          </div>
          <div className="col-xs-3">
            <h2>Overage Invoice Sent</h2>
            <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.importedOverageInvoiceSent || "" } data-field="importedOverageInvoiceSent" readOnly={ true } />
            { Common.renderFieldError(this.state.errors, []) }
          </div>
          <div className="col-xs-3">
            <h2>Overage Invoice Number</h2>
            <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.importedOverageInvoiceNumber || "" } data-field="importedOverageInvoiceNumber" readOnly={ true } />
            { Common.renderFieldError(this.state.errors, []) }
          </div>
        </div>
      )
    } else {
      return(
        <div className="row">
        </div>
      )
    }
  },

  renderButtons: function() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave }>
          { buttonText }
        </a>
        <a id="delete" className={ "orange-button " + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete }>
          Delete Booking
        </a>
      </div>
    )
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = BookingDetails;
