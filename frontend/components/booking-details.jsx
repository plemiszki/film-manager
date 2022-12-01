import React from 'react'
import Modal from 'react-modal'
import NewEntity from './new-entity.jsx'
import CopyEntity from './copy-entity.jsx'
import { Common, ConfirmDelete, Details, stringifyDate, deepCopy, setUpNiceSelect, fetchEntity, updateEntity, deleteEntity, sendRequest, SaveButton, DeleteButton, Button, OutlineButton, Spinner, GrayedOut, ListBox, Table } from 'handy-components'

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

export default class BookingDetails extends React.Component {

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
    fetchEntity().then((response) => {
      const { booking, calculations, users, invoices, formats, weeklyTerms, weeklyBoxOffices, payments, films, venues } = response;
      this.setState({
        fetching: false,
        booking,
        bookingSaved: deepCopy(booking),
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
        setUpNiceSelect({ selector: 'select', func: Details.changeDropdownField.bind(this) });
      });
    });
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, () => {
      updateEntity({
        entityName: 'booking',
        entity: Details.removeFinanceSymbolsFromEntity({ entity: this.state.booking, fields: ['advance', 'shippingFee', 'deduction', 'houseExpense', 'boxOffice'] })
      }).then((response) => {
        const { booking, calculations } = response;
        this.setState({
          fetching: false,
          booking,
          bookingSaved: deepCopy(booking),
          calculations,
          changesToSave: false
        });
      }, (response) => {
        const { errors } = response;
        this.setState({
          fetching: false,
          errors,
        });
      });
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
      deleteEntity({
        directory: 'invoices',
        id: this.state.deleteInvoiceId,
      }).then((response) => {
        const { invoices } = response;
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
    deleteEntity({
      directory: 'weekly_terms',
      id: e.target.dataset.id,
    }).then((response) => {
      const { weeklyTerms } = response;
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
    deleteEntity({
      directory: 'weekly_box_offices',
      id: e.target.dataset.id,
    }).then((response) => {
      const { weeklyBoxOffices, calculations } = response;
      this.setState({
        fetching: false,
        weeklyBoxOffices,
        calculations,
      });
    });
  }

  clickDeletePayment(id) {
    this.setState({
      fetching: true
    });
    deleteEntity({
      directory: 'payments',
      id,
    }).then((response) => {
      const { payments, calculations } = response;
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
    sendRequest(`/api/bookings/${booking.id}/confirm`, {
      method: 'POST',
      data: {
        year: this.state.year,
      }
    }).then((response) => {
      const { booking } = response;
      this.setState({
        fetching: false,
        booking,
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
        sendRequest(`/api/invoices/${this.state.resendInvoiceId}`, {
          method: 'PATCH',
          data: {
            bookingId: booking.id,
            advance: newInvoiceAdvance,
            overage: newInvoiceOverage,
            shipFee: newInvoiceShipFee,
            paymentIds,
          }
        }).then((response) => {
          const { invoices } = response;
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
        sendRequest('/api/invoices', {
          method: 'POST',
          data: {
            bookingId: booking.id,
            advance: newInvoiceAdvance,
            overage: newInvoiceOverage,
            shipFee: newInvoiceShipFee,
          }
        }).then((response) => {
          const { invoices } = response;
          this.setState({
            fetching: false,
            invoices,
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
    const { justSaved, changesToSave, fetching, payments, invoices } = this.state;
    console.log(invoices);
    NewInvoiceStyles.content.height = (238 + (34 * payments.length));
    return (
      <>
        <div className="handy-component">
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
            <p className="section-header">Billing Address</p>
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
            <p className="section-header">Shipping Address</p>
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
            <p className="section-header">Notes</p>
            <div className="row">
              { Details.renderField.bind(this)({ type: 'textbox', columnWidth: 12, entity: 'booking', property: 'notes', rows: 5, hideHeader: true }) }
            </div>
            <hr />
            { this.renderConfirmationSection() }
            <p className="section-header">Screening Materials</p>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'booking', property: 'materialsSent' }) }
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'booking', property: 'trackingNumber' }) }
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'booking', property: 'shippingNotes' }) }
            </div>
            <hr />
            <p className="section-header">Box Office</p>
            <div className="row">
              { Details.renderSwitch.bind(this)({ columnWidth: 2, entity: 'booking', property: 'boxOfficeReceived' }) }
              { this.renderBoxOfficeSection() }
              { Details.renderSwitch.bind(this)({ columnWidth: 4, entity: 'booking', property: 'excludeFromBoRequests', columnHeader: 'Exclude From Automated Box Office Requests' }) }
            </div>
            <hr />
            <p className="section-header">Invoices</p>
            { this.renderImportedInvoicesSection() }
            <div className="row">
              <div className="col-xs-12">
                <Table
                  columns={ [{
                    header: 'Sent',
                    name: 'sentDate',
                  }, {
                    header: 'Number',
                    name: 'number',
                  }, {
                    header: 'Total',
                    name: 'total',
                  }, {
                    header: 'Edit',
                    isEditButton: true,
                    width: 80,
                  }, {
                    header: 'Delete',
                    isDeleteButton: true,
                    width: 80,
                  }] }
                  rows={ invoices }
                  sortable={ false }
                  urlPrefix="invoices"
                  clickDelete={ () => console.log('delete') }
                  clickEdit={ () => console.log('edit') }
                />
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
                <OutlineButton
                  text="Add Invoice"
                  onClick={ () => { this.setState({ newInvoiceModalOpen: true }) } }
                  marginBottom
                />
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-6">
                <p className="section-header">Payments</p>
                <ListBox
                  list={ payments }
                  clickDelete={ payment => this.clickDeletePayment(payment.id) }
                  textFunc={ payment => `${payment.date} - ${payment.amount}${payment.notes && `(${payment.notes})`}` }
                  styles={ { marginBottom: 15 } }
                />
                <OutlineButton
                  text="Add Payment"
                  onClick={ () => { this.setState({ newPaymentModalOpen: true }) } }
                  marginBottom
                />
              </div>
              <div className="col-xs-6">
                <p className="section-header">Calculations</p>
                { this.renderCalculations() }
              </div>
            </div>
            <hr />
            <div>
              <SaveButton
                justSaved={ justSaved }
                changesToSave={ changesToSave }
                disabled={ fetching }
                onClick={ () => { this.clickSave() } }
              />
              <DeleteButton
                entityName="booking"
                confirmDelete={ Details.clickDelete.bind(this) }
              />
              <Button
                marginRight
                float
                disabled={ fetching }
                text="Copy Booking"
                onClick={ () => { this.setState({ copyModalOpen: true }) } }
              />
            </div>
            <GrayedOut visible={ fetching } />
            <Spinner visible={ fetching } />
          </div>
        </div>
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
            initialEntity={ { bookingId: this.state.booking.id, date: stringifyDate(new Date), amount: "", notes: "" } }
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
      </>
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
    const { changesToSave, fetching } = this.state;
    if (this.state.booking.bookingConfirmationSent) {
      return(
        <div>
          <p className="section-header">Booking Confirmation</p>
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
            <p className="section-header">Booking Confirmation</p>
            <div className="row">
              <div className="col-xs-12">
                <Button
                  text={ changesToSave ? "Save to Send" : "Send Booking Confirmation" }
                  disabled={ fetching || changesToSave }
                  onClick={ () => { this.clickSendConfirmation() } }
                  marginBottom
                />
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
}
