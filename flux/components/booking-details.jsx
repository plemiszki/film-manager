import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { deleteEntity } from '../actions/index.js'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import BookingsStore from '../stores/bookings-store.js'
import WeeklyTermsStore from '../stores/weekly-terms-store.js'
import WeeklyBoxOfficesStore from '../stores/weekly-box-offices-store.js'
import PaymentsStore from '../stores/payments-store.js'
import CalculationsStore from '../stores/calculations-store.js'
import InvoicesStore from '../stores/invoices-store.js'
import ErrorsStore from '../stores/errors-store.js'
import ModalSelect from './modal-select.jsx'
import NewThing from './new-thing.jsx'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

const WeeklyTermStyles = {
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

const NewInvoiceStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 700
  }
};

const copyModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 700
  }
};

class BookingDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      booking: {},
      bookingSaved: {},
      users: [],
      weeklyTerms: [],
      weeklyBoxOffices: [],
      payments: [],
      errors: [],
      formats: [],
      invoices: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      deleteInvoiceModalOpen: false,
      copyModalOpen: false,
      newWeeklyTermsModalOpen: false,
      newWeeklyBoxOfficeModalOpen: false,
      newPaymentModalOpen: false,
      newInvoiceModalOpen: false,
      calculations: {
        totalGross: "$0.00",
        ourShare: "$0.00",
        received: "$0.00",
        owed: "$0.00",
        overage: "$0.00"
      },
      newInvoiceAdvance: false,
      newInvoiceOverage: false,
      newInvoiceShipFee: false,
      resendInvoiceId: null,
      oldInvoiceAdvance: null,
      oldInvoiceOverage: null,
      oldInvoiceShipFee: null,
      invoicePayments: {}
    };
  }

  componentDidMount() {
    FM.setUpNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
    this.bookingListener = BookingsStore.addListener(this.getBooking.bind(this));
    this.weeklyTermsListener = WeeklyTermsStore.addListener(this.getWeeklyTerms.bind(this));
    this.weeklyBoxOfficesListener = WeeklyBoxOfficesStore.addListener(this.getWeeklyBoxOffices.bind(this));
    this.paymentsListener = PaymentsStore.addListener(this.getPayments.bind(this));
    this.calculationsListener = CalculationsStore.addListener(this.getCalculations.bind(this));
    this.invoicesListener = InvoicesStore.addListener(this.getInvoices.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchBooking(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.bookingListener.remove();
    this.weeklyTermsListener.remove();
    this.weeklyBoxOfficesListener.remove();
    this.paymentsListener.remove();
    this.calculationsListener.remove();
    this.invoicesListener.remove();
    this.errorsListener.remove();
  }

  getBooking() {
    this.setState({
      booking: Tools.deepCopy(BookingsStore.find(window.location.pathname.split("/")[2])),
      bookingSaved: BookingsStore.find(window.location.pathname.split("/")[2]),
      users: BookingsStore.users(),
      invoices: BookingsStore.invoices(),
      formats: BookingsStore.formats(),
      weeklyTerms: BookingsStore.weeklyTerms(),
      weeklyBoxOffices: BookingsStore.weeklyBoxOffice(),
      payments: BookingsStore.payments(),
      fetching: false
    }, () => {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  }

  getWeeklyTerms() {
    this.setState({
      weeklyTerms: WeeklyTermsStore.all(),
      fetching: false,
      newWeeklyTermsModalOpen: false
    });
  }

  getWeeklyBoxOffices() {
    this.setState({
      weeklyBoxOffices: WeeklyBoxOfficesStore.all(),
      fetching: false,
      newWeeklyBoxOfficeModalOpen: false
    });
  }

  getPayments() {
    this.setState({
      payments: PaymentsStore.all(),
      fetching: false,
      newPaymentModalOpen: false
    });
  }

  getCalculations() {
    this.setState({
      calculations: CalculationsStore.object()
    });
  }

  getInvoices() {
    this.setState({
      fetching: false,
      invoices: InvoicesStore.all(),
      newInvoiceAdvance: false,
      newInvoiceOverage: false,
      newInvoiceShipFee: false
    });
  }

  getErrors() {
    this.setState({
      errors: ErrorsStore.all(),
      fetching: false
    });
  }

  clickSave() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, () => {
        ClientActions.updateBooking(this.state.booking);
      });
    }
  }

  clickDelete() {
    this.setState({
      deleteModalOpen: true
    });
  }

  clickCopy() {
    this.setState({
      copyModalOpen: true
    });
  }

  confirmDelete() {
    this.setState({
      fetching: true,
      deleteModalOpen: false
    }, () => {
      ClientActions.deleteAndGoToIndex('bookings', this.state.booking.id);
    });
  }

  confirmDeleteInvoice() {
    this.setState({
      fetching: true,
      deleteInvoiceModalOpen: false
    }, () => {
      this.setState({
        fetching: false
      });
      this.props.deleteEntity({
        directory: 'invoices',
        id: this.state.deleteInvoiceId,
        callback: (response) => {
          this.setState({
            invoices: response.invoices
          });
        }
      });
    });
  }

  clickSelectFilmButton() {
    this.setState({
      filmsModalOpen: true
    });
  }

  clickSelectFilm(option, event) {
    var booking = this.state.booking;
    booking.filmId = +event.target.dataset.id;
    this.setState({
      booking: booking,
      filmsModalOpen: false,
    }, () => {
      this.setState({
        changesToSave: this.checkForChanges()
      })
    });
  }

  clickSelectVenueButton() {
    this.setState({
      venuesModalOpen: true
    });
  }

  clickSelectVenue(option, event) {
    var booking = this.state.booking;
    booking.venueId = +event.target.dataset.id;
    this.setState({
      booking: booking,
      venuesModalOpen: false
    }, () => {
      this.setState({
        changesToSave: this.checkForChanges()
      })
    });
  }

  clickAddWeek() {
    this.setState({
      newWeeklyTermsModalOpen: true
    });
  }

  clickDeleteWeek(e) {
    this.setState({
      fetching: true
    });
    var id = e.target.dataset.id;
    ClientActions.deleteWeeklyTerm(id);
  }

  clickAddWeeklyBoxOffice() {
    this.setState({
      newWeeklyBoxOfficeModalOpen: true
    });
  }

  clickDeleteWeeklyBoxOffice(e) {
    this.setState({
      fetching: true
    });
    var id = e.target.dataset.id;
    ClientActions.deleteWeeklyBoxOffice(id);
  }

  clickAddPayment() {
    this.setState({
      newPaymentModalOpen: true
    });
  }

  clickDeletePayment(e) {
    this.setState({
      fetching: false
    });
    var id = e.target.dataset.id;
    ClientActions.deletePayment(id);
  }

  clickAddInvoice() {
    this.setState({
      newInvoiceModalOpen: true
    });
  }

  clickSendConfirmation() {
    if (this.state.changesToSave === false) {
      this.setState({
        fetching: true
      });
      ClientActions.sendConfirmation(this.state.booking);
    }
  }

  clickSendInvoice() {
    if (this.state.newInvoiceAdvance || this.state.newInvoiceOverage || this.state.newInvoiceShipFee) {
      if (this.state.resendInvoiceId) {
        ClientActions.resendInvoice(this.state.resendInvoiceId, this.state.booking.id, this.state.newInvoiceAdvance, this.state.newInvoiceOverage, this.state.newInvoiceShipFee, this.state.invoicePayments);
        this.setState({
          newInvoiceModalOpen: false,
          fetching: true,
          resendInvoiceId: null,
          oldInvoiceAdvance: null,
          oldInvoiceOverage: null,
          oldInvoiceShipFee: null
        });
      } else {
        this.setState({
          newInvoiceModalOpen: false,
          fetching: true
        });
        ClientActions.sendInvoice(this.state.booking.id, this.state.newInvoiceAdvance, this.state.newInvoiceOverage, this.state.newInvoiceShipFee, this.state.invoicePayments);
      }
    }
  }

  newInvoiceAdvanceEnabled() {
    if (this.state.booking.advance === "$0.00") {
      return false;
    } else {
      return true;
    }
  }

  newInvoiceOverageEnabled() {
    if (this.state.calculations.overage === "$0.00") {
      return false;
    } else {
      return true;
    }
  }

  newInvoiceShipFeeEnabled() {
    if (this.state.booking.shippingFee === "$0.00") {
      return false;
    } else {
      return true;
    }
  }

  closeModal() {
    var errors = this.state.errors;
    HandyTools.removeFromArray(errors, "Terms can't be blank");
    this.setState({
      errors: errors,
      deleteModalOpen: false,
      copyModalOpen: false,
      filmsModalOpen: false,
      venuesModalOpen: false,
      newWeeklyTermsModalOpen: false,
      newWeeklyBoxOfficeModalOpen: false,
      newPaymentModalOpen: false,
      newInvoiceModalOpen: false,
      newInvoiceAdvance: false,
      newInvoiceOverage: false,
      newInvoiceShipFee: false,
      resendInvoiceId: null,
      oldInvoiceAdvance: null,
      oldInvoiceOverage: null,
      oldInvoiceShipFee: null
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.booking, this.state.bookingSaved);
  }

  changeFieldArgs() {
    return {
      thing: "booking",
      errorsArray: this.state.errors,
      allErrors: FM.errors,
      changesFunction: this.checkForChanges.bind(this),
      beforeSave: function(newThing, key, value) {
        if (key == "terms") {
          if (value !== "90/10") {
            newThing.houseExpense = "$0.00";
            FM.removeFieldError(this.state.errors, "houseExpense")
          }
        }
      }
    }
  }

  changeAdvanceCheckbox() {
    this.setState({
      newInvoiceAdvance: !this.state.newInvoiceAdvance
    });
  }

  changeOverageCheckbox() {
    this.setState({
      newInvoiceOverage: !this.state.newInvoiceOverage
    });
  }

  changeShipFeeCheckbox() {
    this.setState({
      newInvoiceShipFee: !this.state.newInvoiceShipFee
    });
  }

  changePaymentCheckbox(e) {
    var id = e.target.dataset.id;
    var obj = this.state.invoicePayments;
    if (obj[id]) {
      obj[id] = false;
    } else {
      obj[id] = true;
    }
    this.setState({
      invoicePayments: obj
    });
  }

  clickInvoice(id, e) {
    if (e.target.tagName === 'IMG') {
      var invoice = InvoicesStore.find(id) || BookingsStore.findInvoice(id);
      var rows = invoice.rows;
      var oldAdvance;
      var oldOverage;
      var oldShipFee;
      rows.forEach(function(row) {
        if (row.label === 'Advance') {
          oldAdvance = row.amount;
        } else if (row.label.slice(0,7) === 'Overage') {
          oldOverage = row.amount;
        } else if (row.label === 'Shipping Fee') {
          oldShipFee = row.amount;
        }
      });
      var payments = invoice.payments;
      var paymentsObj = {};
      payments.forEach((payment) => {
        paymentsObj[payment.id] = true;
      });
      this.setState({
        newInvoiceModalOpen: true,
        oldInvoiceAdvance: oldAdvance,
        oldInvoiceOverage: oldOverage,
        oldInvoiceShipFee: oldShipFee,
        newInvoiceAdvance: !!oldAdvance,
        newInvoiceOverage: !!oldOverage,
        newInvoiceShipFee: !!oldShipFee,
        resendInvoiceId: invoice.number,
        invoicePayments: paymentsObj
      });
    } else if (e.target.tagName === 'DIV' && e.target.classList.contains('delete-invoice')) {
      this.setState({
        deleteInvoiceId: id,
        deleteInvoiceModalOpen: true
      });
    } else {
      this.redirect("invoices", id);
    }
  }

  redirect(directory, id) {
    window.location.pathname = directory + "/" + id;
  }

  render() {
    NewInvoiceStyles.content.height = (238 + (34 * this.state.payments.length));
    return(
      <div className="booking-details">
        <div className="component details-component">
          <h1>Booking Details</h1>
          <div className="white-box">
            <div className="row">
              <div>
                <div className="col-xs-5">
                  <h2>Film</h2>
                  <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ BookingsStore.findFilm(this.state.booking.filmId) ? BookingsStore.findFilm(this.state.booking.filmId).title : "" } data-field="filmId" readOnly={ true } />
                  <a className="jump-link" href={ `/films/${this.state.booking.filmId}` }>Jump to Film Details</a>
                  { Details.renderFieldError(this.state.errors, []) }
                </div>
                <div className="col-xs-1 select-from-modal" onClick={ this.clickSelectFilmButton.bind(this) }></div>
              </div>
              <div>
                <div className="col-xs-5">
                  <h2>Venue</h2>
                  <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ BookingsStore.findVenue(this.state.booking.venueId) ? BookingsStore.findVenue(this.state.booking.venueId).label : "" } data-field="venueId" readOnly={ true } />
                  <a className="jump-link" href={ `/venues/${this.state.booking.venueId}` }>Jump to Venue Details</a>
                  { Details.renderFieldError(this.state.errors, []) }
                </div>
                <div className="col-xs-1 select-from-modal" onClick={ this.clickSelectVenueButton.bind(this) }></div>
              </div>
            </div>
            <div className="row">
              <div className="col-xs-2">
                <h2>Start Date</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.startDate) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.startDate || "" } data-field="startDate" />
                { Details.renderFieldError(this.state.errors, FM.errors.startDate) }
              </div>
              <div className="col-xs-2">
                <h2>End Date</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.endDate) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.endDate || "" } data-field="endDate" />
                { Details.renderFieldError(this.state.errors, FM.errors.endDate) }
              </div>
              <div className="col-xs-3">
                <h2>Type</h2>
                <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="bookingType" value={ this.state.booking.bookingType }>
                  <option value={ "Theatrical" }>Theatrical</option>
                  <option value={ "Non-Theatrical" }>Non-Theatrical</option>
                  <option value={ "Festival" }>Festival</option>
                  <option value={ "Press/WOM" }>Press/WOM</option>
                </select>
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-3">
                <h2>Status</h2>
                <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="status" value={ this.state.booking.status }>
                  <option value={ "Tentative" }>Tentative</option>
                  <option value={ "Confirmed" }>Confirmed</option>
                  <option value={ "Cancelled" }>Cancelled</option>
                </select>
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Screenings</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.screenings || "" } data-field="screenings" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-6">
                <h2>Email</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.email || "" } data-field="email" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              { this.renderBookedByField() }
              <div className="col-xs-2">
                <h2>Format</h2>
                <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="formatId" value={ this.state.booking.formatId }>
                  { this.state.formats.map((format) => {
                    return(
                      <option key={ format.id } value={ format.id }>{ format.name }</option>
                    );
                  }) }
                </select>
                { Details.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-4">
                <h2>Premiere</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.premiere || "" } data-field="premiere" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Advance</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.advance) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.advance || "" } data-field="advance" />
                { Details.renderFieldError(this.state.errors, FM.errors.advance) }
              </div>
              <div className="col-xs-2">
                <h2>Shipping Fee</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.shippingFee) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.shippingFee || "" } data-field="shippingFee" />
                { Details.renderFieldError(this.state.errors, FM.errors.shippingFee) }
              </div>
              <div className="col-xs-2">
                <h2>Deduction</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.deduction) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.deduction || "" } data-field="deduction" />
                { Details.renderFieldError(this.state.errors, FM.errors.deduction) }
              </div>
              { this.renderHouseExpense() }
            </div>
            <hr />
            <div className="row">
              { Details.renderSwitch.bind(this)({ columnWidth: 3, entity: 'booking', property: 'termsChange', columnHeader: 'Terms Change Weekly' }) }
              { this.renderTermsColumn() }
            </div>
            <hr />
            <h3>Billing Address</h3>
            <div className="row">
              <div className="col-xs-4">
                <h2>Name</h2>
                <input className={Details.errorClass(this.state.errors, [])} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.billingName || ""} data-field="billingName" />
                {Details.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Address 1</h2>
                <input className={Details.errorClass(this.state.errors, [])} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.billingAddress1 || ""} data-field="billingAddress1" />
                {Details.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Address 2</h2>
                <input className={Details.errorClass(this.state.errors, [])} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.billingAddress2 || ""} data-field="billingAddress2" />
                {Details.renderFieldError(this.state.errors, [])}
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3">
                <h2>City</h2>
                <input className={Details.errorClass(this.state.errors, [])} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.billingCity || ""} data-field="billingCity" />
                {Details.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-1">
                <h2>State</h2>
                <input className={Details.errorClass(this.state.errors, [])} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.billingState || ""} data-field="billingState" />
                {Details.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-2">
                <h2>Zip</h2>
                <input className={Details.errorClass(this.state.errors, [])} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.billingZip || ""} data-field="billingZip" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Country</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.billingCountry || "" } data-field="billingCountry" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <hr />
            <h3>Shipping Address</h3>
            <div className="row">
              <div className="col-xs-4">
                <h2>Name</h2>
                <input className={Details.errorClass(this.state.errors, [])} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.shippingName || ""} data-field="shippingName" />
                {Details.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Address 1</h2>
                <input className={Details.errorClass(this.state.errors, [])} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.shippingAddress1 || ""} data-field="shippingAddress1" />
                {Details.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Address 2</h2>
                <input className={Details.errorClass(this.state.errors, [])} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.shippingAddress2 || ""} data-field="shippingAddress2" />
                {Details.renderFieldError(this.state.errors, [])}
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3">
                <h2>City</h2>
                <input className={Details.errorClass(this.state.errors, [])} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.shippingCity || ""} data-field="shippingCity" />
                {Details.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-1">
                <h2>State</h2>
                <input className={Details.errorClass(this.state.errors, [])} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.shippingState || ""} data-field="shippingState" />
                {Details.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-2">
                <h2>Zip</h2>
                <input className={Details.errorClass(this.state.errors, [])} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.booking.shippingZip || ""} data-field="shippingZip" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Country</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.shippingCountry || "" } data-field="shippingCountry" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <hr />
            <h3>Notes</h3>
            <div className="row">
              <div className="col-xs-12">
                <textarea rows="5" cols="20" onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.notes || "" } data-field="notes" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <hr />
            { this.renderConfirmationSection() }
            <h3>Screening Materials</h3>
              <div className="row">
                <div className="col-xs-3">
                  <h2>Materials Sent</h2>
                  <input className={ Details.errorClass(this.state.errors, FM.errors.materialsSent) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.materialsSent || "" } data-field="materialsSent" />
                  { Details.renderFieldError(this.state.errors, FM.errors.materialsSent) }
                </div>
                <div className="col-xs-3">
                  <h2>Tracking Number</h2>
                  <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.trackingNumber || "" } data-field="trackingNumber" />
                  { Details.renderFieldError(this.state.errors, []) }
                </div>
                <div className="col-xs-6">
                  <h2>Shipping Notes</h2>
                  <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.shippingNotes || "" } data-field="shippingNotes" />
                  { Details.renderFieldError(this.state.errors, []) }
                </div>
              </div>
            <hr />
            <h3>Box Office</h3>
            <div className="row">
              { Details.renderSwitch.bind(this)({ columnWidth: 2, entity: 'booking', property: 'boxOfficeReceived' }) }
              { this.renderBoxOfficeSection() }
              { Details.renderSwitch.bind(this)({ columnWidth: 4, entity: 'booking', property: 'excludeFromBoRequests', columnHeader: 'Exclude From Automated Box Office Requests' }) }
            </div>
            <hr />
            <h3>Invoices</h3>
            { this.renderImportedInvoicesSection() }
            <div className="row">
              <div className="col-xs-12">
                <table className="fm-admin-table invoices-table">
                  <thead>
                    <tr>
                      <th>Sent</th>
                      <th>Number</th>
                      <th>Total</th>
                      <th className="button">Edit</th>
                      <th className="button">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td></td><td></td><td></td><td></td><td></td></tr>
                    { this.state.invoices.map((invoice, index) => {
                      return(
                        <tr key={ index } onClick={ this.clickInvoice.bind(this, invoice.id) }>
                          <td className="indent">
                            { invoice.sentDate }
                          </td>
                          <td>
                            { invoice.number }
                          </td>
                          <td>
                            { invoice.total }
                          </td>
                          <td className="button">
                            <img src={ Images.edit } />
                          </td>
                          <td className="button">
                            <div className="delete-invoice"></div>
                          </td>
                        </tr>
                      );
                    }) }
                  </tbody>
                </table>
                <a className='blue-outline-button small' onClick={ this.clickAddInvoice.bind(this) }>Add Invoice</a>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-6">
                <h3>Payments</h3>
                <ul className="payments-list">
                  { this.state.payments.map((payment) => {
                    return(
                      <li key={ payment.id }>{ payment.date } - { payment.amount }{ payment.notes && " (" + payment.notes + ")" }<div className="x-button" onClick={ this.clickDeletePayment.bind(this) } data-id={ payment.id }></div></li>
                    );
                  }) }
                </ul>
                <a className={ 'blue-outline-button small' } onClick={ this.clickAddPayment.bind(this) }>Add Payment</a>
              </div>
              <div className="col-xs-6">
                <h3>Calculations</h3>
                { this.renderCalculations() }
              </div>
            </div>
            <hr />
            { this.renderButtons() }
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete entityName="booking" confirmDelete={ this.confirmDelete.bind(this) } closeModal={ Common.closeModals.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.deleteInvoiceModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete entityName="invoice" confirmDelete={ this.confirmDeleteInvoice.bind(this) } closeModal={ Common.closeModals.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.copyModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ WeeklyTermStyles }>
          <NewThing thing="booking" copyFrom={ this.state.booking.id } initialObject={ { copyFrom: this.state.booking.id } } />
        </Modal>
        <Modal isOpen={ this.state.filmsModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ BookingsStore.films() } property={ "title" } func={ this.clickSelectFilm.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.venuesModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ BookingsStore.venues() } property={ "label" } func={ this.clickSelectVenue.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.newWeeklyTermsModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ WeeklyTermStyles }>
          <NewThing thing="weeklyTerm" initialObject={ { bookingId: this.state.booking.id } } />
        </Modal>
        <Modal isOpen={ this.state.newWeeklyBoxOfficeModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ WeeklyTermStyles }>
          <NewThing thing="weeklyBoxOffice" initialObject={ { bookingId: this.state.booking.id } } />
        </Modal>
        <Modal isOpen={ this.state.newPaymentModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ WeeklyTermStyles }>
          <NewThing thing="payment" initialObject={ { bookingId: this.state.booking.id, date: HandyTools.stringifyDate(new Date), amount: "", notes: "" } } />
        </Modal>
        <Modal isOpen={ this.state.newInvoiceModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ NewInvoiceStyles }>
          <div className="new-invoice-modal">
            <div><input id="advance-checkbox" className="checkbox" type="checkbox" onChange={ this.changeAdvanceCheckbox.bind(this) } checked={ this.state.newInvoiceAdvance } disabled={ !this.newInvoiceAdvanceEnabled() } /><label className={ "checkbox" + (this.newInvoiceAdvanceEnabled() ? "" : " disabled") } htmlFor="advance-checkbox">Advance - { (this.state.resendInvoiceId && this.state.oldInvoiceAdvance) ? (this.state.oldInvoiceAdvance + ' →') : '' } { this.state.bookingSaved.advance }</label></div>
            <div><input id="overage-checkbox" className="checkbox" type="checkbox" onChange={ this.changeOverageCheckbox.bind(this) } checked={ this.state.newInvoiceOverage } disabled={ !this.newInvoiceOverageEnabled() } /><label className={ "checkbox" + (this.newInvoiceOverageEnabled() ? "" : " disabled") } htmlFor="overage-checkbox">Overage - { (this.state.resendInvoiceId && this.state.oldInvoiceOverage) ? (this.state.oldInvoiceOverage + ' →') : '' } { this.state.calculations.overage }</label></div>
            <div><input id="shipfee-checkbox" className="checkbox" type="checkbox" onChange={ this.changeShipFeeCheckbox.bind(this) } checked={ this.state.newInvoiceShipFee } disabled={ !this.newInvoiceShipFeeEnabled() } /><label className={ "checkbox" + (this.newInvoiceShipFeeEnabled() ? "" : " disabled") } htmlFor="shipfee-checkbox">Shipping Fee - { (this.state.resendInvoiceId && this.state.oldInvoiceShipFee) ? (this.state.oldInvoiceShipFee + ' →') : '' } { this.state.bookingSaved.shippingFee }</label></div>
            { this.state.payments.map((payment, index) => {
              return(
                <div key={ index }><input id={ `payment-${payment.id}` } className="checkbox" type="checkbox" onChange={ this.changePaymentCheckbox.bind(this) } checked={ this.state.invoicePayments[payment.id] || false } data-id={ payment.id } /><label className="checkbox" htmlFor={ `payment-${payment.id}` }>Payment ({ payment.date }) - ({ payment.amount })</label></div>
              );
            }) }
            <div className="text-center">
              <a className={ "orange-button" + Common.renderInactiveButtonClass(!this.state.newInvoiceAdvance && !this.state.newInvoiceOverage && !this.state.newInvoiceShipFee) } onClick={ this.clickSendInvoice.bind(this) }>
                { this.state.resendInvoiceId ? ('Resend Invoice ' + this.state.resendInvoiceId) : 'Send Invoice' }
              </a>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  renderCalculations() {
    if (this.state.bookingSaved.termsValid) {
      return(
        <div>
          <h2>Total Gross</h2>
          <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.calculations.totalGross } readOnly={ true } data-field="totalGross" />
          { Details.renderFieldError(this.state.errors, []) }
          <h2>Our Share</h2>
          <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.calculations.ourShare } readOnly={ true } data-field="ourShare" />
          { Details.renderFieldError(this.state.errors, []) }
          <h2>Received</h2>
          <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.calculations.received } readOnly={ true } data-field="received" />
          { Details.renderFieldError(this.state.errors, []) }
          <h2>Owed</h2>
          <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.calculations.owed } readOnly={ true } data-field="owed" />
          { Details.renderFieldError(this.state.errors, []) }
        </div>
      );
    } else {
      return(
        <div style={ { color: 'red' } }>Terms are not valid.</div>
      );
    }
  }

  renderTermsColumn() {
    if (this.state.booking.termsChange) {
      return(
        <div className="col-xs-6">
          <h2>Terms by Week</h2>
          <ul className="weekly-terms">
            { this.state.weeklyTerms.map((weeklyTerms) => {
              return(
                <li key={ weeklyTerms.id }>Week { +weeklyTerms.order + 1 } - { weeklyTerms.terms }<div className="x-button" onClick={ this.clickDeleteWeek.bind(this) } data-id={ weeklyTerms.id }></div></li>
              );
            }) }
          </ul>
          <a className="blue-outline-button small" onClick={ this.clickAddWeek.bind(this) }>Add Week</a>
        </div>
      );
    } else {
      return(
        <div className="col-xs-3">
          <h2 style={ this.state.bookingSaved.termsValid ? {} : { color: "red" } }>Terms</h2>
          <input className={ Details.errorClass(this.state.errors, FM.errors.terms) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.terms || "" } data-field="terms" />
          { Details.renderFieldError(this.state.errors, FM.errors.terms) }
        </div>
      );
    }
  }

  renderHouseExpense() {
    if (!this.state.booking.termsChange && this.state.booking.terms === "90/10") {
      return(
        <div className="col-xs-2">
          <h2>House Expense</h2>
          <input className={ Details.errorClass(this.state.errors, FM.errors.houseExpense) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.houseExpense || "" } data-field="houseExpense" />
          { Details.renderFieldError(this.state.errors, FM.errors.houseExpense) }
        </div>
      );
    }
  }

  renderConfirmationSection() {
    if (this.state.booking.bookingConfirmationSent) {
      return(
        <div>
          <h3>Booking Confirmation</h3>
          <div className="row">
            <div className="col-xs-3">
              <h2>Booking Confirmation Sent</h2>
              <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.bookingConfirmationSent || "" } data-field="bookingConfirmationSent" readOnly={ true } />
              { Details.renderFieldError(this.state.errors, []) }
            </div>
          </div>
          <hr />
        </div>
      );
    } else {
      if (this.state.bookingSaved.email) {
        return(
          <div>
            <h3>Booking Confirmation</h3>
            <div className="row">
              <div className="col-xs-12">
                <a className={ "orange-button confirmation-button" + Common.renderInactiveButtonClass(this.state.fetching || this.state.changesToSave) } onClick={ this.clickSendConfirmation.bind(this) }>
                  { this.state.changesToSave ? "Save to Send" : "Send Booking Confirmation" }
                </a>
              </div>
            </div>
            <hr />
          </div>
        );
      }
    }
  }

  renderBookedByField() {
    if (JSON.stringify(this.state.booking) == "{}" || this.state.booking.pastBooker) {
      return(
        <div className="col-xs-3">
          <h2>Booked By</h2>
          <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.pastBooker || "" } data-field="pastBooker" readOnly={ true } />
          { Details.renderFieldError(this.state.errors, []) }
        </div>
      );
    } else {
      return(
        <div className="col-xs-3">
          <h2>Booked By</h2>
          <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="bookerId" value={ this.state.booking.bookerId }>
            { BookingsStore.bookers().map(function(user) {
              return(
                <option key={ user.id } value={ user.id }>{ user.name }</option>
              );
            }) }
          </select>
          { Details.renderFieldError(this.state.errors, []) }
        </div>
      );
    }
  }

  renderBoxOfficeSection() {
    if (this.state.booking.termsChange) {
      return(
        <div className="col-xs-6">
          <h2>Box Office by Week</h2>
          <ul className="weekly-box-offices">
            { this.state.weeklyBoxOffices.map((weeklyBoxOffice) => {
              return(
                <li key={ weeklyBoxOffice.id }>Week { +weeklyBoxOffice.order + 1 } - { weeklyBoxOffice.amount }<div className="x-button" onClick={ this.clickDeleteWeeklyBoxOffice.bind(this) } data-id={ weeklyBoxOffice.id }></div></li>
              );
            }) }
          </ul>
          <a className="blue-outline-button small" onClick={ this.clickAddWeeklyBoxOffice.bind(this) }>Add Weekly Box Office</a>
        </div>
      );
    } else {
      return(
        <div className="col-xs-3">
          <h2>Box Office</h2>
          <input className={ Details.errorClass(this.state.errors, FM.errors.boxOffice) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.boxOffice || "" } data-field="boxOffice" />
          { Details.renderFieldError(this.state.errors, FM.errors.boxOffice) }
        </div>
      );
    }
  }

  renderImportedInvoicesSection() {
    if (this.state.booking.importedAdvanceInvoiceSent || this.state.booking.importedAdvanceInvoiceNumber || this.state.booking.importedOverageInvoiceSent || this.state.booking.importedOverageInvoiceNumber) {
      return(
        <div className="row">
          <div className="col-xs-3">
            <h2>Advance Invoice Sent</h2>
            <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.importedAdvanceInvoiceSent || "" } data-field="importedAdvanceInvoiceSent" readOnly={ true } />
            { Details.renderFieldError(this.state.errors, []) }
          </div>
          <div className="col-xs-3">
            <h2>Advance Invoice Number</h2>
            <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.importedAdvanceInvoiceNumber || "" } data-field="importedAdvanceInvoiceNumber" readOnly={ true } />
            { Details.renderFieldError(this.state.errors, []) }
          </div>
          <div className="col-xs-3">
            <h2>Overage Invoice Sent</h2>
            <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.importedOverageInvoiceSent || "" } data-field="importedOverageInvoiceSent" readOnly={ true } />
            { Details.renderFieldError(this.state.errors, []) }
          </div>
          <div className="col-xs-3">
            <h2>Overage Invoice Number</h2>
            <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.importedOverageInvoiceNumber || "" } data-field="importedOverageInvoiceNumber" readOnly={ true } />
            { Details.renderFieldError(this.state.errors, []) }
          </div>
        </div>
      );
    }
  }

  renderButtons() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={ "orange-button" + Common.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        <a id="delete" className={ "orange-button " + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
          Delete Booking
        </a>
        <a className={ "float-button orange-button copy-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickCopy.bind(this) }>
          Copy Booking
        </a>
      </div>
    );
  }

  componentDidUpdate() {
    FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(BookingDetails);
