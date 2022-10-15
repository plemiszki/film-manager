import React from 'react'
import Modal from 'react-modal'
import NewEntity from './new-entity.jsx'
import NewInvoice from './new-invoice.jsx'
import { Common, ConfirmDelete, Details, deepCopy, setUpNiceSelect, pluckFromObjectsArray, stringifyDate, objectsAreEqual, fetchEntity, updateEntity, deleteEntity, sendRequest, DeleteButton, SaveButton } from 'handy-components'

export default class VirtualBookingDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
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
        fetching: false,
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
    }
  }

  checkForChanges() {
    return !objectsAreEqual(this.state.virtualBooking, this.state.virtualBookingSaved);
  }

  clickInvoice(id, index, e) {
    const target = e.target;
    const clickedEdit = (target.tagName === 'IMG');
    const clickedDelete = (target.tagName === 'DIV' && target.classList.contains('delete-invoice'));
    if (clickedEdit) {
      this.setState({
        newInvoiceModalOpen: true,
        editInvoiceMode: true,
        editInvoiceIndex: index
      });
    } else if (clickedDelete) {
      this.setState({
        deleteInvoiceId: id,
        deleteInvoiceModalOpen: true
      });
    } else {
      window.location.pathname = `/invoices/${id}`;
    }
  }

  confirmInvoiceDelete() {
    this.setState({
      fetching: true,
      deleteInvoiceModalOpen: false
    });
    deleteEntity({
      directory: 'invoices',
      id: this.state.deleteInvoiceId,
    }).then((response) => {
      const { invoices } = response;
      this.setState({
        fetching: false,
        invoices,
      });
    });
  }

  clickAddInvoice() {
    this.setState({
      newInvoiceModalOpen: true,
      editInvoiceMode: false,
      editInvoiceIndex: undefined
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

  clickDeletePayment(e) {
    this.setState({
      fetching: true
    });
    deleteEntity({
      directory: 'payments',
      id: e.target.dataset.id,
    }).then((response) => {
      const { payments, calculations } = response;
      this.setState({
        fetching: false,
        payments,
        calculations,
      });
    })
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, () => {
      updateEntity({
        entityName: 'virtualBooking',
        entity: Details.removeFinanceSymbolsFromEntity({ entity: this.state.virtualBooking, fields: ['deduction', 'boxOffice'] })
      }).then((response) => {
        const { virtualBooking, calculations } = response;
        this.setState({
          fetching: false,
          virtualBooking,
          virtualBookingSaved: deepCopy(virtualBooking),
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

  clickSendReport() {
    const { virtualBooking } = this.state;
    this.setState({
      fetching: true
    });
    sendRequest(`/api/virtual_bookings/${virtualBooking.id}/send_report`, {
      method: 'POST',
    }).then((response) => {
      const { job } = response;
      this.setState({
        job,
        fetching: false,
        jobModalOpen: true,
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
    return(
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
          <h3>Box Office</h3>
          <div className="row">
            { Details.renderSwitch.bind(this)({ columnWidth: 2, entity: 'virtualBooking', property: 'boxOfficeReceived' }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'virtualBooking', property: 'boxOffice' }) }
          </div>
          { this.renderPaymentsSection() }
          { this.renderInvoicesSection() }
          { this.renderReportSection() }
          <hr className="divider" style={ { marginTop: 30 } } />
          <div>
            <SaveButton
              justSaved={ this.state.justSaved }
              changesToSave={ this.state.changesToSave }
              disabled={ this.state.fetching }
              onClick={ () => { this.clickSave() } }
            />
            <DeleteButton
              disabled={ this.state.fetching }
              onClick={ Common.changeState.bind(this, 'deleteModalOpen', true) }
            />
          </div>
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
        </div>
        <Modal isOpen={ this.state.newInvoiceModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 700, height: this.calculateNewInvoiceModalHeight() }) }>
          <NewInvoice
            context={ this.props.context }
            bookingId={ this.state.virtualBooking.id }
            rows={ this.generateInvoiceRows() }
            payments={ this.state.payments }
            callback={ this.sendInvoiceCallback.bind(this) }
            editMode={ this.state.editInvoiceMode }
            invoiceToEdit={ (this.state.editInvoiceMode && this.state.invoices[this.state.editInvoiceIndex]) || null }
          />
        </Modal>
        <Modal isOpen={ this.state.newPaymentModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 700 }, 1) }>
          <NewEntity entityName="payment" initialEntity={ { bookingId: this.state.virtualBooking.id, bookingType: "VirtualBooking", date: stringifyDate(new Date), amount: "", notes: "" } } context={ this.props.context } callbackFullProps={ this.updatePayments.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete
            entityName="virtualBooking"
            confirmDelete={ Details.clickDelete.bind(this) }
            closeModal={ Common.closeModals.bind(this) }
          />
        </Modal>
        <Modal isOpen={ this.state.deleteInvoiceModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete
            entityName="invoice"
            confirmDelete={ this.confirmInvoiceDelete.bind(this) }
            closeModal={ Common.closeModals.bind(this) }
          />
        </Modal>
        { Common.renderJobModal.call(this, this.state.job) }
      </div>
    );
  }

  renderBillingAddressSection() {
    if (this.state.virtualBooking.host == 'Venue') {
      return(
        <>
          <hr className="divider" />
          <h3>Billing Address</h3>
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
    if (this.state.virtualBooking.host == 'Venue') {
      return(
        <>
          <hr className="divider" style={ { marginTop: 30 } } />
          <h3>Invoices</h3>
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
                      <tr key={ index } onClick={ this.clickInvoice.bind(this, invoice.id, index) }>
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
        </>
      );
    }
  }

  renderPaymentsSection() {
    if (this.state.virtualBooking.host == 'Venue') {
      return(
        <>
          <hr className="divider" style={ { marginTop: 30 } } />
          <div className="row">
            <div className="col-xs-6">
              <h3>Calculations</h3>
              { this.renderCalculations() }
            </div>
            <div className="col-xs-6">
              <h3>Payments</h3>
              <>
                <ul className="payments-list">
                  { this.state.payments.map((payment) => {
                    return(
                      <li key={ payment.id }>{ payment.date } - { payment.amount }{ payment.notes && " (" + payment.notes + ")" }<div className="circle-x-button" onClick={ this.clickDeletePayment.bind(this) } data-id={ payment.id }></div></li>
                    );
                  }) }
                </ul>
                <style jsx>{`
                  ul {
                    border: 1px solid #E4E9ED;
                    border-radius: 5px;
                    padding: 15px;
                    margin-bottom: 15px;
                  }
                  li {
                    position: relative;
                  }
                  li:not(:last-of-type) {
                    margin-bottom: 15px;
                  }
                  .circle-x-button {
                    display: inline-block;
                    position: absolute;
                    right: 0;
                    background-size: contain;
                    width: 17px;
                    height: 17px;
                    cursor: pointer;
                  }
                `}</style>
              </>
              <a className={ 'blue-outline-button small' } onClick={ this.clickAddPayment.bind(this) }>Add Payment</a>
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
    if (this.state.virtualBooking.host == 'FM') {
      return(
        <>
          <hr className="divider" style={ { marginTop: 30 } } />
          <div className="row">
            <div className="col-xs-6">
              <h3>Calculations</h3>
              { this.renderCalculations() }
            </div>
            <div className="col-xs-6">
              <h3>Report</h3>
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'virtualBooking', property: 'reportSentDate', columnHeader: 'Sent Date', readOnly: true }) }
              <div className="col-xs-6">
                <h2>&nbsp;</h2>
                <a className={ "orange-button" + Common.renderInactiveButtonClass(this.state.fetching || this.state.changesToSave) } style={ { paddingTop: 14, paddingBottom: 14 } } onClick={ this.clickSendReport.bind(this) }>
                  { this.state.changesToSave ? "Save to Send" : (this.state.virtualBooking.reportSentDate == "(Not Sent)" ? "Send Report" : "Send Another Report") }
                </a>
              </div>
            </div>
          </div>
        </>
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
    Common.updateJobModal.call(this);
  }
}
