import React from 'react'
import Modal from 'react-modal'
import NewEntity from './new-entity.jsx'
import CopyEntity from './copy-entity.jsx'
import NewInvoice from './new-invoice.jsx'
import { Common, ConfirmDelete, Details, stringifyDate, deepCopy, setUpNiceSelect, fetchEntity, updateEntity, deleteEntity, sendRequest, SaveButton, DeleteButton, Button, OutlineButton, Spinner, GrayedOut, ListBox, Table, removeFinanceSymbols } from 'handy-components'

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
      spinner: true,
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
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { booking, calculations, users, invoices, formats, weeklyTerms, weeklyBoxOffices, payments, films, venues } = response;
      this.setState({
        spinner: false,
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

  sendInvoiceCallback(invoices) {
    this.setState({
      newInvoiceModalOpen: false,
      invoices
    });
  }

  generateInvoiceRows() {
    const { bookingSaved, calculations, films } = this.state;
    const film = films.find(film => film.id === bookingSaved.filmId)
    const filmTitle = film && film.title;
    const { overage, totalGross } = calculations;
    return [
      {
        label: 'Advance',
        labelExport: 'Advance',
        amount: bookingSaved.advance,
        active: false,
        sufficient: true,
        disabled: !+removeFinanceSymbols(bookingSaved.advance || "0.00"),
      },
      {
        label: 'Shipping Fee',
        labelExport: 'Shipping Fee',
        amount: bookingSaved.shippingFee,
        active: false,
        sufficient: true,
        disabled: !+removeFinanceSymbols(bookingSaved.shippingFee || "0.00"),
      },
      {
        label: 'Overage',
        labelExport: `Overage (Total Gross: ${totalGross})`,
        amount: overage,
        active: false,
        sufficient: true,
        disabled: !+removeFinanceSymbols(overage || "0.00"),
      },
    ];
  }

  clickSave() {
    this.setState({
      spinner: true,
      justSaved: true
    }, () => {
      updateEntity({
        entityName: 'booking',
        entity: Details.removeFinanceSymbolsFromEntity({ entity: this.state.booking, fields: ['advance', 'shippingFee', 'deduction', 'houseExpense', 'boxOffice'] })
      }).then((response) => {
        const { booking, calculations } = response;
        this.setState({
          spinner: false,
          booking,
          bookingSaved: deepCopy(booking),
          calculations,
          changesToSave: false
        });
      }, (response) => {
        const { errors } = response;
        this.setState({
          spinner: false,
          errors,
        });
      });
    });
  }

  confirmDeleteInvoice() {
    this.setState({
      spinner: true,
      deleteInvoiceModalOpen: false
    }, () => {
      this.setState({
        spinner: false
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

  clickDeleteWeek(weeklyTerms) {
    this.setState({
      spinner: true
    });
    deleteEntity({
      directory: 'weekly_terms',
      id: weeklyTerms.id,
    }).then((response) => {
      const { weeklyTerms } = response;
      this.setState({
        spinner: false,
        weeklyTerms,
      });
    });
  }

  clickDeleteWeeklyBoxOffice(weeklyBoxOffice) {
    this.setState({
      spinner: true
    });
    deleteEntity({
      directory: 'weekly_box_offices',
      id: weeklyBoxOffice.id,
    }).then((response) => {
      const { weeklyBoxOffices, calculations } = response;
      this.setState({
        spinner: false,
        weeklyBoxOffices,
        calculations,
      });
    });
  }

  clickDeletePayment(id) {
    this.setState({
      spinner: true
    });
    deleteEntity({
      directory: 'payments',
      id,
    }).then((response) => {
      const { payments, calculations } = response;
      this.setState({
        spinner: false,
        payments,
        calculations,
      });
    });
  }

  clickSendConfirmation() {
    const { booking } = this.state;
    this.setState({
      spinner: true
    });
    sendRequest(`/api/bookings/${booking.id}/confirm`, {
      method: 'POST',
      data: {
        year: this.state.year,
      }
    }).then((response) => {
      const { booking } = response;
      this.setState({
        spinner: false,
        booking,
      });
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

  clickEdit(invoice) {
    this.setState({
      newInvoiceModalOpen: true,
      editInvoiceMode: true,
      editInvoiceId: invoice.id,
    });
  }

  clickDelete(invoice) {
    this.setState({
      deleteInvoiceId: invoice.id,
      deleteInvoiceModalOpen: true,
    });
  }

  redirect(directory, id) {
    window.location.pathname = directory + "/" + id;
  }

  calculateNewInvoiceModalHeight() {
    const { payments } = this.state;
    const rows = 3 + payments.length;
    const padding = 36;
    const border = 1;
    const buttonHeight = 47;
    const rowHeight = 54;
    return (rowHeight * rows) + (padding * 2) + (border * 2) + buttonHeight;
  }

  render() {
    const { justSaved, changesToSave, spinner, payments, invoices, deleteInvoiceModalOpen } = this.state;
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
                  clickDelete={ invoice => this.clickDelete(invoice) }
                  clickEdit={ invoice => this.clickEdit(invoice) }
                  style={ { marginBottom: 15 } }
                />
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
                  entityName="payment"
                  entities={ payments }
                  clickDelete={ payment => this.clickDeletePayment(payment.id) }
                  displayFunction={ payment => `${payment.date} - ${payment.amount}${payment.notes && `(${payment.notes})`}` }
                  style={ { marginBottom: 15 } }
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
                disabled={ spinner }
                onClick={ () => { this.clickSave() } }
              />
              <DeleteButton
                entityName="booking"
                confirmDelete={ Details.confirmDelete.bind(this) }
              />
              <Button
                marginRight
                float
                disabled={ spinner }
                text="Copy Booking"
                onClick={ () => { this.setState({ copyModalOpen: true }) } }
              />
            </div>
            <GrayedOut visible={ spinner } />
            <Spinner visible={ spinner } />
          </div>
        </div>
        <ConfirmDelete
          isOpen={ deleteInvoiceModalOpen }
          entityName="invoice"
          confirmDelete={ this.confirmDeleteInvoice.bind(this) }
          closeModal={ Common.closeModals.bind(this) }
        />
        <Modal isOpen={ this.state.copyModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 750 }, 1) }>
          <CopyEntity
            context={ this.props.context }
            entityName="booking"
            initialEntity={ { copyFrom: this.state.booking.id, filmId: this.state.booking.filmId } }
            films={ this.state.films }
          />
        </Modal>
        <Modal isOpen={ this.state.newWeeklyTermsModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 500 }, 1) }>
          <NewEntity
            context={ this.props.context }
            entityName="weeklyTerm"
            initialEntity={ { bookingId: this.state.booking.id } }
            callback={ response => this.setState({ weeklyTerms: response, newWeeklyTermsModalOpen: false }) }
          />
        </Modal>
        <Modal isOpen={ this.state.newWeeklyBoxOfficeModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 500 }, 1) }>
          <NewEntity
            context={ this.props.context }
            entityName="weeklyBoxOffice"
            initialEntity={ { bookingId: this.state.booking.id } }
            callbackFullProps={ response => this.setState({ weeklyBoxOffices: response.weeklyBoxOffices, calculations: response.calculations, newWeeklyBoxOfficeModalOpen: false }) }
          />
        </Modal>
        <Modal isOpen={ this.state.newPaymentModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 750 }, 1) }>
          <NewEntity
            context={ this.props.context }
            entityName="payment"
            initialEntity={ { bookingId: this.state.booking.id, date: stringifyDate(new Date), amount: "", notes: "" } }
            callbackFullProps={ response => this.setState({ payments: response.payments, calculations: response.calculations, newPaymentModalOpen: false }) }
          />
        </Modal>
        <Modal isOpen={ this.state.newInvoiceModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 700, height: this.calculateNewInvoiceModalHeight() }) }>
          <NewInvoice
            context={ this.props.context }
            bookingId={ this.state.booking.id }
            bookingType="booking"
            rows={ this.generateInvoiceRows() }
            payments={ this.state.payments }
            callback={ this.sendInvoiceCallback.bind(this) }
            editMode={ this.state.editInvoiceMode }
            invoiceToEdit={ (this.state.editInvoiceMode && this.state.invoices.find(invoice => invoice.id === this.state.editInvoiceId)) || null }
          />
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
    const { weeklyTerms } = this.state;
    if (this.state.booking.termsChange) {
      return (
        <div className="col-xs-6">
          <h2>Terms by Week</h2>
          <ListBox
            entityName="weeklyTerm"
            entities={ weeklyTerms }
            clickDelete={ weeklyTerms => this.clickDeleteWeek(weeklyTerms) }
            displayFunction={ weeklyTerms => `Week ${ +weeklyTerms.order + 1 } - ${ weeklyTerms.terms }` }
            style={ { marginBottom: 15 } }
          />
          <OutlineButton
            text="Add Week"
            onClick={ () => { this.setState({ newWeeklyTermsModalOpen: true }) } }
            marginBottom
          />
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
    const { changesToSave, spinner } = this.state;
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
                  disabled={ spinner || changesToSave }
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
      const { weeklyBoxOffices } = this.state;
      return (
        <div className="col-xs-6">
          <h2>Box Office by Week</h2>
          <ListBox
            entityName="weeklyBoxOffice"
            entities={ weeklyBoxOffices }
            clickDelete={ weeklyBoxOffice => this.clickDeleteWeeklyBoxOffice(weeklyBoxOffice) }
            displayFunction={ weeklyBoxOffice => `Week ${ +weeklyBoxOffice.order + 1 } - ${ weeklyBoxOffice.amount }` }
            style={ { marginBottom: 15 } }
          />
          <OutlineButton
            text="Add Weekly Box Office"
            onClick={ () => { this.setState({ newWeeklyBoxOfficeModalOpen: true }) } }
            marginBottom
          />
        </div>
      );
    } else {
      return (
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
