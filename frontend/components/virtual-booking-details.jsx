import React from 'react';
import Modal from 'react-modal';
import NewEntity from './new-entity.jsx';
import NewInvoice from './new-invoice.jsx';
import { Common, Details, deepCopy, setUpNiceSelect, pluckFromObjectsArray, stringifyDate, objectsAreEqual, fetchEntity, updateEntity, deleteEntity, sendRequest, BottomButtons, Button, Spinner, GrayedOut, OutlineButton, ListBox, Table, ConfirmDelete } from 'handy-components';

export default class VirtualBookingDetails extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      spinner: true,
      virtualBooking: {},
      virtualBookingSaved: {},
      calculations: {
        totalGross: "$0.00",
        ourShare: "$0.00",
        received: "$0.00",
        owed: "$0.00",
        overage: "$0.00"
      },
      films: [],
      venues: [],
      errors: [],
      payments: [],
      invoices: [],
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { virtualBooking, films, venues, invoices, payments, calculations, job } = response;
      this.setState({
        spinner: false,
        virtualBooking,
        virtualBookingSaved: deepCopy(virtualBooking),
        films,
        venues,
        invoices,
        payments,
        calculations,
        changesToSave: false,
        job,
        jobModalOpen: !!job
      }, () => {
        setUpNiceSelect({ selector: 'select', func: Details.changeDropdownField.bind(this) });
      });
    });
  }

  changeFieldArgs() {
    return {
      changesFunction: this.checkForChanges.bind(this)
    };
  }

  checkForChanges() {
    return !objectsAreEqual(this.state.virtualBooking, this.state.virtualBookingSaved);
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

  confirmDeleteInvoice() {
    this.setState({
      spinner: true,
      deleteInvoiceModalOpen: false
    });
    deleteEntity({
      directory: 'invoices',
      id: this.state.deleteInvoiceId,
    }).then((response) => {
      const { invoices } = response;
      this.setState({
        spinner: false,
        invoices,
      });
    });
  }

  clickAddInvoice() {
    this.setState({
      newInvoiceModalOpen: true,
      editInvoiceMode: false,
      editInvoiceId: undefined
    });
  }

  clickAddPayment() {
    this.setState({
      newPaymentModalOpen: true
    });
  }

  updatePayments(props) {
    this.setState({
      newPaymentModalOpen: false,
      payments: props.payments,
      calculations: props.calculations
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

  clickSave() {
    this.setState({
      spinner: true,
      justSaved: true
    }, () => {
      updateEntity({
        entityName: 'virtualBooking',
        entity: Details.removeFinanceSymbolsFromEntity({ entity: this.state.virtualBooking, fields: ['deduction', 'boxOffice'] })
      }).then((response) => {
        const { virtualBooking, calculations } = response;
        this.setState({
          spinner: false,
          virtualBooking,
          virtualBookingSaved: deepCopy(virtualBooking),
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

  clickSendReport() {
    const { virtualBooking } = this.state;
    this.setState({
      spinner: true
    });
    sendRequest(`/api/virtual_bookings/${virtualBooking.id}/send_report`, {
      method: 'POST',
    }).then((response) => {
      const { job } = response;
      this.setState({
        job,
        spinner: false,
        jobModalOpen: true,
      });
    });
  }

  sendInvoice({ editMode, rows, invoiceToEdit, bookingId, bookingType }) {
    this.setState({
      jobModalOpen: true,
      newInvoiceModalOpen: false,
      job: {
        firstLine: 'Sending Invoice',
      },
    });
    sendRequest(`/api/invoices/${editMode ? invoiceToEdit.number : ''}`, {
      method: (editMode ? 'PATCH' : 'POST'),
      data: {
        bookingId,
        bookingType,
        rows,
      }
    }).then((response) => {
      const { job } = response;
      this.setState({
        job,
      });
    });
  }

  generateInvoiceRows() {
    const { virtualBookingSaved } = this.state;
    const film = pluckFromObjectsArray({
      array: this.state.films,
      property: 'id',
      value: virtualBookingSaved.filmId
    });
    const filmTitle = film && film.title;
    return [{
      label: 'Amount Due',
      labelExport: `${filmTitle}\n${virtualBookingSaved.startDate} - ${virtualBookingSaved.endDate}\n${virtualBookingSaved.terms} (Total Gross: ${this.state.calculations.totalGross})\nVirtual Screening`,
      amount: this.state.calculations.ourShare,
      active: true,
      sufficient: true
    }];
  }

  calculateNewInvoiceModalHeight() {
    const rows = 1 + this.state.payments.length;
    const padding = 36;
    const border = 1;
    const buttonHeight = 47;
    const rowHeight = 54;
    return (rowHeight * rows) + (padding * 2) + (border * 2) + buttonHeight;
  }

  render() {
    const { justSaved, changesToSave, spinner, deleteInvoiceModalOpen } = this.state;
    return (
      <div className="handy-component">
        <h1>Virtual Booking Details</h1>
        <div className="white-box">
          <div className="row">
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'virtualBooking', property: 'filmId', columnHeader: 'Film', errorsProperty: 'film', type: 'modal', optionDisplayProperty: 'title' }) }
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'virtualBooking', property: 'venueId', columnHeader: 'Venue', errorsProperty: 'venue', type: 'modal', optionDisplayProperty: 'label' }) }
          </div>
          <div className="row">
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'virtualBooking', property: 'startDate' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'virtualBooking', property: 'endDate' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'virtualBooking', property: 'shippingCity', columnHeader: 'City' }) }
            { Details.renderField.bind(this)({ columnWidth: 1, entity: 'virtualBooking', property: 'shippingState', columnHeader: 'State' }) }
          </div>
          <hr className="divider" />
          <div className="row">
            { Details.renderField.bind(this)({ columnWidth: 8, entity: 'virtualBooking', property: 'url', columnHeader: 'URL' }) }
            { Details.renderDropDown.bind(this)({ columnWidth: 2, entity: 'virtualBooking', property: 'host', columnHeader: 'Hosted By', options: [{ id: 'FM', text: 'FM' }, { id: 'Venue', text: 'Venue' }], optionDisplayProperty: 'text' }) }
          </div>
          <div className="row">
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'virtualBooking', property: 'email' }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'virtualBooking', property: 'terms', redHeader: !this.state.virtualBookingSaved.termsValid }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'virtualBooking', property: 'deduction' }) }
          </div>
          { this.renderBillingAddressSection() }
          <hr className="divider" />
          <p className="section-header">Box Office</p>
          <div className="row">
            { Details.renderSwitch.bind(this)({ columnWidth: 2, entity: 'virtualBooking', property: 'boxOfficeReceived' }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'virtualBooking', property: 'boxOffice' }) }
          </div>
          { this.renderPaymentsSection() }
          { this.renderInvoicesSection() }
          { this.renderReportSection() }
          <hr className="divider" style={ { marginTop: 30 } } />
          <BottomButtons
            entityName="virtualBooking"
            confirmDelete={ Details.confirmDelete.bind(this) }
            justSaved={ justSaved }
            changesToSave={ changesToSave }
            disabled={ spinner }
            clickSave={ () => { this.clickSave(); } }
          />
          <GrayedOut visible={ spinner } />
          <Spinner visible={ spinner } />
        </div>
        <Modal isOpen={ this.state.newInvoiceModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 700, height: this.calculateNewInvoiceModalHeight() }) }>
          <NewInvoice
            context={ this.props.context }
            bookingId={ this.state.virtualBooking.id }
            bookingType="virtualBooking"
            bookingEmail={ this.state.virtualBooking.email }
            rows={ this.generateInvoiceRows() }
            payments={ this.state.payments }
            callback={ this.sendInvoice.bind(this) }
            editMode={ this.state.editInvoiceMode }
            invoiceToEdit={ (this.state.editInvoiceMode && this.state.invoices.find(invoice => invoice.id === this.state.editInvoiceId)) || null }
          />
        </Modal>
        <Modal isOpen={ this.state.newPaymentModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 700 }, 1) }>
          <NewEntity entityName="payment" initialEntity={ { bookingId: this.state.virtualBooking.id, bookingType: "VirtualBooking", date: stringifyDate(new Date), amount: "", notes: "" } } context={ this.props.context } callbackFullProps={ this.updatePayments.bind(this) } />
        </Modal>
        <ConfirmDelete
          isOpen={ deleteInvoiceModalOpen }
          entityName="invoice"
          confirmDelete={ this.confirmDeleteInvoice.bind(this) }
          closeModal={ Common.closeModals.bind(this) }
        />
        { Common.renderJobModal.call(this, this.state.job) }
      </div>
    );
  }

  renderBillingAddressSection() {
    if (this.state.virtualBooking.host == 'Venue') {
      return(
        <>
          <hr className="divider" />
          <p className="section-header">Billing Address</p>
          <div className="row">
            { Details.renderField.call(this, { columnWidth: 4, entity: 'virtualBooking', property: 'billingName', columnHeader: 'Name' }) }
            { Details.renderField.call(this, { columnWidth: 4, entity: 'virtualBooking', property: 'billingAddress1', columnHeader: 'Address 1' }) }
            { Details.renderField.call(this, { columnWidth: 4, entity: 'virtualBooking', property: 'billingAddress2', columnHeader: 'Address 2' }) }
          </div>
          <div className="row">
            { Details.renderField.call(this, { columnWidth: 3, entity: 'virtualBooking', property: 'billingCity', columnHeader: 'City' }) }
            { Details.renderField.call(this, { columnWidth: 1, entity: 'virtualBooking', property: 'billingState', columnHeader: 'State' }) }
            { Details.renderField.call(this, { columnWidth: 2, entity: 'virtualBooking', property: 'billingZip', columnHeader: 'Zip' }) }
            { Details.renderField.call(this, { columnWidth: 2, entity: 'virtualBooking', property: 'billingCountry', columnHeader: 'Country' }) }
          </div>
        </>
      );
    }
  }

  renderInvoicesSection() {
    const { invoices, virtualBooking } = this.state;
    if (virtualBooking.host == 'Venue') {
      return (
        <>
          <hr className="divider" style={ { marginTop: 30 } } />
          <p className="section-header">Invoices</p>
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
                clickDelete={ (invoice) => this.clickDelete(invoice) }
                clickEdit={ (invoice) => this.clickEdit(invoice) }
                style={ {  marginBottom: 15 } }
              />
              <OutlineButton
                text="Add Invoice"
                onClick={ () => { this.clickAddInvoice(); } }
                marginBottom
              />
            </div>
          </div>
        </>
      );
    }
  }

  renderPaymentsSection() {
    const { payments } = this.state;
    if (this.state.virtualBooking.host == 'Venue') {
      return (
        <>
          <hr className="divider" style={ { marginTop: 30 } } />
          <div className="row">
            <div className="col-xs-6">
              <p className="section-header">Calculations</p>
              { this.renderCalculations() }
            </div>
            <div className="col-xs-6">
              <p className="section-header">Payments</p>
              <ListBox
                entityName="payment"
                entities={ payments }
                clickDelete={ (payment) => { this.clickDeletePayment(payment.id); } }
                displayFunction={ payment => `${payment.date} - ${payment.amount}${payment.notes && ` (${payment.notes})`}` }
                style={ { marginBottom: 15 } }
              />
              <OutlineButton
                text="Add Payment"
                onClick={ () => { this.clickAddPayment(); } }
                marginBottom
              />
            </div>
          </div>
        </>
      );
    } else {
      return(
        <div className="col-xs-6"></div>
      );
    }
  }

  renderReportSection() {
    const { spinner, changesToSave, virtualBooking } = this.state;
    if (this.state.virtualBooking.host == 'FM') {
      return (
        <div>
          <hr className="divider" style={ { marginTop: 30 } } />
          <div className="row">
            <div className="col-xs-6">
              <p className="section-header">Calculations</p>
              { this.renderCalculations() }
            </div>
            <div className="col-xs-6 no-column-padding">
              <p className="section-header">Report</p>
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'virtualBooking', property: 'reportSentDate', columnHeader: 'Sent Date', readOnly: true }) }
              <div className="col-xs-6">
                <h2>&nbsp;</h2>
                <Button
                  marginLeft
                  disabled={ spinner || changesToSave }
                  text={ changesToSave ? "Save to Send" : (virtualBooking.reportSentDate == "(Not Sent)" ? "Send Report" : "Send Another Report") }
                  onClick={ () => { this.clickSendReport(); } }
                  style={ {
                    paddingTop: 14,
                    paddingBottom: 14,
                  } }
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  renderCalculations() {
    let { virtualBooking, virtualBookingSaved } = this.state;
    if (virtualBookingSaved.termsValid) {
      return(
        <div className="no-column-padding">
          { Details.renderField.bind(this)({ columnWidth: 12, entity: 'calculations', property: 'totalGross', readOnly: true }) }
          { virtualBooking.host == 'FM' ? Details.renderField.bind(this)({ columnWidth: 12, entity: 'calculations', property: 'venueShare', readOnly: true }) : null }
          { this.renderVenueHostCalculations() }
        </div>
      );
    } else {
      return(
        <div style={ { color: 'red' } }>Terms are not valid.</div>
      );
    }
  }

  renderVenueHostCalculations() {
    if (this.state.virtualBooking.host == 'Venue') {
      return(
        <>
          { Details.renderField.bind(this)({ columnWidth: 12, entity: 'calculations', property: 'ourShare', readOnly: true }) }
          { Details.renderField.bind(this)({ columnWidth: 12, entity: 'calculations', property: 'received', readOnly: true }) }
          { Details.renderField.bind(this)({ columnWidth: 12, entity: 'calculations', property: 'owed', readOnly: true }) }
        </>
      );
    }
  }

  componentDidUpdate() {
    const { virtualBooking } = this.state;
    Common.updateJobModal.call(this, { successCallback: () => {
      this.setState({
        spinner: true,
      });
      sendRequest(`/api/virtual_bookings/${virtualBooking.id}/invoices`).then((response) => {
        const { invoices } = response;
        this.setState({
          spinner: false,
          invoices,
        });
      });
    }});
  }
}
