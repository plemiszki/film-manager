import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { sendRequest, fetchEntity, updateEntity, deleteEntity } from '../actions/index.js'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import NewEntity from './new-entity.jsx'
import CopyEntity from './copy-entity.jsx'
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
      films: [],
      venues: [],
      users: [],
      weeklyTerms: [],
      weeklyBoxOffices: [],
      payments: [],
      errors: {},
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
    this.props.fetchEntity({
      directory: 'bookings',
      id: window.location.pathname.split('/')[2]
    }).then(() => {
      const { booking, calculations, users, invoices, formats, weeklyTerms, weeklyBoxOffices, payments, films, venues } = this.props;
      this.setState({
        fetching: false,
        booking,
        bookingSaved: HandyTools.deepCopy(booking),
        calculations,
        users,
        invoices,
        formats,
        weeklyTerms,
        weeklyBoxOffices,
        payments,
        films,
        venues
      }, () => {
        HandyTools.setUpNiceSelect({ selector: 'select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
      });
    });
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, function() {
      this.props.updateEntity({
        id: window.location.pathname.split("/")[2],
        directory: window.location.pathname.split("/")[1],
        entityName: 'booking',
        entity: Details.removeFinanceSymbolsFromEntity({ entity: this.state.booking, fields: ['advance', 'shippingFee', 'deduction', 'houseExpense', 'boxOffice'] })
      }).then(() => {
        const { booking } = this.props;
        this.setState({
          fetching: false,
          booking,
          bookingSaved: HandyTools.deepCopy(booking),
          changesToSave: false
        });
      }, () => {
        this.setState({
          fetching: false,
          errors: this.props.errors
        });
      });
    });
  }

  confirmDelete() {
    this.setState({
      fetching: true,
      deleteModalOpen: false
    });
    this.props.deleteEntity({
      directory: 'bookings',
      id: this.state.booking.id,
      redirectToIndex: true,
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
      }).then(() => {
        const { invoices } = this.props;
        this.setState({
          invoices,
        });
      });
    });
  }

  clickDeleteWeek(e) {
    this.setState({
      fetching: true
    });
    this.props.deleteEntity({
      directory: 'weekly_terms',
      id: e.target.dataset.id,
    }).then(() => {
      const { weeklyTerms } = this.props;
      this.setState({
        fetching: false,
        weeklyTerms,
      });
    });
  }

  clickDeleteWeeklyBoxOffice(e) {
    this.setState({
      fetching: true
    });
    this.props.deleteEntity({
      directory: 'weekly_box_offices',
      id: e.target.dataset.id,
    }).then(() => {
      const { weeklyBoxOffices, calculations } = this.props;
      this.setState({
        fetching: false,
        weeklyBoxOffices,
        calculations,
      });
    });
  }

  clickDeletePayment(e) {
    this.setState({
      fetching: false
    });
    this.props.deleteEntity({
      directory: 'payments',
      id: e.target.dataset.id,
    }).then(() => {
      const { payments, calculations } = this.props;
      this.setState({
        fetching: false,
        payments,
        calculations,
      });
    });
  }

  clickSendConfirmation() {
    const { booking } = this.state;
    this.setState({
      fetching: true
    });
    this.props.sendRequest({
      url: `/api/bookings/${booking.id}/confirm`,
      method: 'post'
    }).then(() => {
      const { booking } = this.props;
      this.setState({
        fetching: false,
        booking
      });
    });
  }

  clickSendInvoice() {
    const { booking, newInvoiceAdvance, newInvoiceOverage, newInvoiceShipFee } = this.state;
    const paymentIds = this.getInvoicePaymentIds();
    if (this.state.newInvoiceAdvance || this.state.newInvoiceOverage || this.state.newInvoiceShipFee) {
      if (this.state.resendInvoiceId) {
        this.setState({
          newInvoiceModalOpen: false,
          fetching: true,
          resendInvoiceId: null,
          oldInvoiceAdvance: null,
          oldInvoiceOverage: null,
          oldInvoiceShipFee: null
        });
        this.props.sendRequest({
          url: `/api/invoices/${this.state.resendInvoiceId}`,
          method: 'patch',
          data: {
            bookingId: booking.id,
            advance: newInvoiceAdvance,
            overage: newInvoiceOverage,
            shipFee: newInvoiceShipFee,
            paymentIds
          }
        }).then(() => {
          const { invoices } = this.props;
          this.setState({
            fetching: false,
            invoices
          });
        });
      } else {
        this.setState({
          newInvoiceModalOpen: false,
          fetching: true
        });
        this.props.sendRequest({
          url: '/api/invoices',
          method: 'post',
          data: {
            bookingId: booking.id,
            advance: newInvoiceAdvance,
            overage: newInvoiceOverage,
            shipFee: newInvoiceShipFee
          }
        }).then(() => {
          const { invoices } = this.props;
          this.setState({
            fetching: false,
            invoices
          });
        });
      }
    }
  }

  getInvoicePaymentIds() {
    const { invoicePayments } = this.state;
    const paymentIds = Object.keys(invoicePayments);
    let result = [];
    for (let i = 0; i < paymentIds.length; i++) {
      if (invoicePayments[paymentIds[i]]) {
        result.push(paymentIds[i]);
      }
    }
    return result;
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
    const { errors } = this.state;
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
            Details.removeFieldError(this.state.errors, "houseExpense");
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
    const { invoices } = this.state;
    if (e.target.tagName === 'IMG') {
      const invoice = invoices.find(invoice => invoice.id === id);
      const rows = invoice.rows;
      let oldAdvance;
      let oldOverage;
      let oldShipFee;
      rows.forEach(function(row) {
        if (row.label === 'Advance') {
          oldAdvance = row.amount;
        } else if (row.label.slice(0,7) === 'Overage') {
          oldOverage = row.amount;
        } else if (row.label === 'Shipping Fee') {
          oldShipFee = row.amount;
        }
      });
      const payments = invoice.payments;
      let paymentsObj = {};
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
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'booking', property: 'filmId', columnHeader: 'Film', type: 'modal', optionDisplayProperty: 'title', linkText: 'Jump to Film', linkUrl: `/films/${this.state.booking.filmId}` }) }
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'booking', property: 'venueId', columnHeader: 'Venue', type: 'modal', optionDisplayProperty: 'label', linkText: 'Jump to Venue', linkUrl: `/venues/${this.state.booking.venueId}` }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'booking', property: 'startDate' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'booking', property: 'endDate' }) }
              { Details.renderDropDown.bind(this)({
                columnWidth: 3,
                entity: 'booking',
                property: 'bookingType',
                columnHeader: 'Type',
                options: [
                  { name: 'Theatrical', value: 'Theatrical' },
                  { name: 'Non-Theatrical', value: 'Non-Theatrical' },
                  { name: 'Festival', value: 'Festival' },
                  { name: 'Press/WOM', value: 'Press/WOM' }
                ],
                optionDisplayProperty: 'name'
              }) }
              { Details.renderDropDown.bind(this)({
                columnWidth: 3,
                entity: 'booking',
                property: 'status',
                options: [
                  { name: 'Tentative', value: 'Tentative' },
                  { name: 'Confirmed', value: 'Confirmed' },
                  { name: 'Cancelled', value: 'Cancelled' }
                ],
                optionDisplayProperty: 'name'
              }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'booking', property: 'screenings' }) }
            </div>
            <hr />
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'booking', property: 'email' }) }
              { this.renderBookedByField() }
              { Details.renderDropDown.bind(this)({
                columnWidth: 2,
                entity: 'booking',
                property: 'formatId',
                columnHeader: 'Format',
                options: this.state.formats,
                optionDisplayProperty: 'name'
              }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booking', property: 'premiere' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'booking', property: 'advance' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'booking', property: 'shippingFee' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'booking', property: 'deduction' }) }
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
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booking', property: 'billingName', columnHeader: 'Name' }) }
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booking', property: 'billingAddress1', columnHeader: 'Address 1' }) }
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booking', property: 'billingAddress2', columnHeader: 'Address 2' }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'booking', property: 'billingCity', columnHeader: 'City' }) }
              { Details.renderField.bind(this)({ columnWidth: 1, entity: 'booking', property: 'billingState', columnHeader: 'State' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'booking', property: 'billingZip', columnHeader: 'Zip' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'booking', property: 'billingCountry', columnHeader: 'Country' }) }
            </div>
            <hr />
            <h3>Shipping Address</h3>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booking', property: 'shippingName', columnHeader: 'Name' }) }
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booking', property: 'shippingAddress1', columnHeader: 'Address 1' }) }
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booking', property: 'shippingAddress2', columnHeader: 'Address 2' }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'booking', property: 'shippingCity', columnHeader: 'City' }) }
              { Details.renderField.bind(this)({ columnWidth: 1, entity: 'booking', property: 'shippingState', columnHeader: 'State' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'booking', property: 'shippingZip', columnHeader: 'Zip' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'booking', property: 'shippingCountry', columnHeader: 'Country' }) }
            </div>
            <hr />
            <h3>Notes</h3>
            <div className="row">
              { Details.renderTextBox.bind(this)({ columnWidth: 12, entity: 'booking', property: 'notes', rows: 5 }) }
            </div>
            <hr />
            { this.renderConfirmationSection() }
            <h3>Screening Materials</h3>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'booking', property: 'materialsSent' }) }
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'booking', property: 'trackingNumber' }) }
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'booking', property: 'shippingNotes' }) }
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
                <a className='blue-outline-button small' onClick={ Common.changeState.bind(this, 'newInvoiceModalOpen', true) }>Add Invoice</a>
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
                <a className={ 'blue-outline-button small' } onClick={ Common.changeState.bind(this, 'newPaymentModalOpen', true) }>Add Payment</a>
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
        <Modal isOpen={ this.state.copyModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 750 }, 1) }>
          <CopyEntity
            context={ this.props.context }
            entityName="booking"
            initialEntity={ { copyFrom: this.state.booking.id, filmId: this.state.booking.filmId } }
            films={ this.state.films }
          />
        </Modal>
        <Modal isOpen={ this.state.newWeeklyTermsModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 500 }, 1) }>
          <NewEntity
            context={ this.props.context }
            entityName="weeklyTerm"
            initialEntity={ { bookingId: this.state.booking.id } }
            callback={ response => this.setState({ weeklyTerms: response, newWeeklyTermsModalOpen: false }) }
          />
        </Modal>
        <Modal isOpen={ this.state.newWeeklyBoxOfficeModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 500 }, 1) }>
          <NewEntity
            context={ this.props.context }
            entityName="weeklyBoxOffice"
            initialEntity={ { bookingId: this.state.booking.id } }
            callbackFullProps={ response => this.setState({ weeklyBoxOffices: response.weeklyBoxOffices, calculations: response.calculations, newWeeklyBoxOfficeModalOpen: false }) }
          />
        </Modal>
        <Modal isOpen={ this.state.newPaymentModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 750 }, 1) }>
          <NewEntity
            context={ this.props.context }
            entityName="payment"
            initialEntity={ { bookingId: this.state.booking.id, date: HandyTools.stringifyDate(new Date), amount: "", notes: "" } }
            callbackFullProps={ response => this.setState({ payments: response.payments, calculations: response.calculations, newPaymentModalOpen: false }) }
          />
        </Modal>
        <Modal isOpen={ this.state.newInvoiceModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ NewInvoiceStyles }>
          <div className="new-invoice-modal">
            <div>
              <input
                id="advance-checkbox"
                className="checkbox"
                type="checkbox"
                onChange={ this.changeAdvanceCheckbox.bind(this) }
                checked={ this.state.newInvoiceAdvance }
                disabled={ !this.newInvoiceAdvanceEnabled() }
              />
              <label
                className={ "checkbox" + (this.newInvoiceAdvanceEnabled() ? "" : " disabled") }
                htmlFor="advance-checkbox"
              >
                Advance - { (this.state.resendInvoiceId && this.state.oldInvoiceAdvance) ? (this.state.oldInvoiceAdvance + ' →') : '' } { this.state.bookingSaved.advance }
              </label>
            </div>
            <div>
              <input
                id="overage-checkbox"
                className="checkbox"
                type="checkbox"
                onChange={ this.changeOverageCheckbox.bind(this) }
                checked={ this.state.newInvoiceOverage }
                disabled={ !this.newInvoiceOverageEnabled() }
              />
              <label
                className={ "checkbox" + (this.newInvoiceOverageEnabled() ? "" : " disabled") }
                htmlFor="overage-checkbox"
              >
                Overage - { (this.state.resendInvoiceId && this.state.oldInvoiceOverage) ? (this.state.oldInvoiceOverage + ' →') : '' } { this.state.calculations.overage }
              </label>
            </div>
            <div>
              <input
                id="shipfee-checkbox"
                className="checkbox"
                type="checkbox"
                onChange={ this.changeShipFeeCheckbox.bind(this) }
                checked={ this.state.newInvoiceShipFee }
                disabled={ !this.newInvoiceShipFeeEnabled() }
              />
              <label
                className={ "checkbox" + (this.newInvoiceShipFeeEnabled() ? "" : " disabled") }
                htmlFor="shipfee-checkbox"
              >
                Shipping Fee - { (this.state.resendInvoiceId && this.state.oldInvoiceShipFee) ? (this.state.oldInvoiceShipFee + ' →') : '' } { this.state.bookingSaved.shippingFee }
              </label>
            </div>
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
          { Details.renderField.bind(this)({ entity: 'calculations', property: 'totalGross', readOnly: true }) }
          { Details.renderField.bind(this)({ entity: 'calculations', property: 'ourShare', readOnly: true }) }
          { Details.renderField.bind(this)({ entity: 'calculations', property: 'received', readOnly: true }) }
          { Details.renderField.bind(this)({ entity: 'calculations', property: 'owed', readOnly: true }) }
        </div>
      );
    } else {
      return(
        <div style={ { color: 'red' } }>Terms are not valid.</div>
      );
    }
  }

  renderTermsColumn() {
    const { termsValid } = this.state.bookingSaved;
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
          <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'newWeeklyTermsModalOpen', true) }>Add Week</a>
        </div>
      );
    } else {
      return(
        <>
          { Details.renderField.bind(this)({ columnWidth: 3, entity: 'booking', property: 'terms', redHeader: !termsValid, warnIf: !termsValid, warning: 'Terms are not valid' }) }
        </>
      );
    }
  }

  renderHouseExpense() {
    if (!this.state.booking.termsChange && this.state.booking.terms === "90/10") {
      return(
        <>
          { Details.renderField.bind(this)({ columnWidth: 2, entity: 'booking', property: 'houseExpense' }) }
        </>
      );
    }
  }

  renderConfirmationSection() {
    if (this.state.booking.bookingConfirmationSent) {
      return(
        <div>
          <h3>Booking Confirmation</h3>
          <div className="row">
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'booking', property: 'bookingConfirmationSent', readOnly: true }) }
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
                <a className={ "btn orange-button confirmation-button" + Common.renderDisabledButtonClass(this.state.fetching || this.state.changesToSave) } onClick={ this.clickSendConfirmation.bind(this) }>
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
        <>
          { Details.renderField.bind(this)({ columnWidth: 3, entity: 'booking', property: 'pastBooker', columnHeader: 'Booked By', readOnly: true }) }
        </>
      );
    } else {
      return(
        <>
          { Details.renderDropDown.bind(this)({
            columnWidth: 3,
            entity: 'booking',
            property: 'bookerId',
            columnHeader: 'Booked By',
            options: this.state.users,
            optionDisplayProperty: 'name'
          }) }
        </>
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
          <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'newWeeklyBoxOfficeModalOpen', true) }>Add Weekly Box Office</a>
        </div>
      );
    } else {
      return(
        <>
          { Details.renderField.bind(this)({ columnWidth: 3, entity: 'booking', property: 'boxOffice' }) }
        </>
      );
    }
  }

  renderImportedInvoicesSection() {
    if (this.state.booking.importedAdvanceInvoiceSent || this.state.booking.importedAdvanceInvoiceNumber || this.state.booking.importedOverageInvoiceSent || this.state.booking.importedOverageInvoiceNumber) {
      return(
        <div className="row">
          { Details.renderField.bind(this)({ columnWidth: 3, entity: 'booking', property: 'importedAdvanceInvoiceSent', readOnly: true }) }
          { Details.renderField.bind(this)({ columnWidth: 3, entity: 'booking', property: 'importedAdvanceInvoiceNumber', readOnly: true }) }
          { Details.renderField.bind(this)({ columnWidth: 3, entity: 'booking', property: 'importedOverageInvoiceSent', readOnly: true }) }
          { Details.renderField.bind(this)({ columnWidth: 3, entity: 'booking', property: 'importedOverageInvoiceNumber', readOnly: true }) }
        </div>
      );
    }
  }

  renderButtons() {
    return(
      <div>
        <a className={ "btn blue-button standard-width" + Common.renderDisabledButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
          { Details.saveButtonText.call(this) }
        </a>
        <a className={ "btn delete-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Common.changeState.bind(this, 'deleteModalOpen', true) }>
          Delete
        </a>
        <a className={ "btn float-button orange-button copy-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Common.changeState.bind(this, 'copyModalOpen', true) }>
          Copy Booking
        </a>
      </div>
    );
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ sendRequest, fetchEntity, updateEntity, deleteEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(BookingDetails);
