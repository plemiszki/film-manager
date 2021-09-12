import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ModalSelect from './modal-select.jsx'
import NewEntity from './new-entity.jsx'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import { fetchEntity, createEntity, updateEntity, deleteEntity, sendRequest } from '../actions/index'
import FM from '../../app/assets/javascripts/me/common.jsx'

class VirtualBookingDetails extends React.Component {

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
    this.props.fetchEntity({
      id: window.location.pathname.split('/')[2],
      directory: window.location.pathname.split('/')[1],
      entityName: this.props.entityName
    }, 'virtualBooking').then(() => {
      this.setState({
        fetching: false,
        virtualBooking: this.props.virtualBooking,
        virtualBookingSaved: HandyTools.deepCopy(this.props.virtualBooking),
        films: this.props.films,
        venues: this.props.venues,
        invoices: this.props.invoices,
        payments: this.props.payments,
        calculations: this.props.calculations,
        changesToSave: false,
        job: this.props.job,
        jobModalOpen: !!this.props.job
      }, () => {
        HandyTools.setUpNiceSelect({ selector: 'select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
      });
    });
  }

  changeFieldArgs() {
    return {
      allErrors: Errors,
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  checkForChanges() {
    return !HandyTools.objectsAreEqual(this.state.virtualBooking, this.state.virtualBookingSaved);
  }

  clickInvoice(id, e) {
    if (e.target.tagName === 'IMG') {
      // var invoice = InvoicesStore.find(id) || BookingsStore.findInvoice(id);
      // var rows = invoice.rows;
      // var oldAdvance;
      // var oldOverage;
      // var oldShipFee;
      // rows.forEach(function(row) {
      //   if (row.label === 'Advance') {
      //     oldAdvance = row.amount;
      //   } else if (row.label.slice(0,7) === 'Overage') {
      //     oldOverage = row.amount;
      //   } else if (row.label === 'Shipping Fee') {
      //     oldShipFee = row.amount;
      //   }
      // });
      // var payments = invoice.payments;
      // var paymentsObj = {};
      // payments.forEach((payment) => {
      //   paymentsObj[payment.id] = true;
      // });
      // this.setState({
      //   newInvoiceModalOpen: true,
      //   oldInvoiceAdvance: oldAdvance,
      //   oldInvoiceOverage: oldOverage,
      //   oldInvoiceShipFee: oldShipFee,
      //   newInvoiceAdvance: !!oldAdvance,
      //   newInvoiceOverage: !!oldOverage,
      //   newInvoiceShipFee: !!oldShipFee,
      //   resendInvoiceId: invoice.number,
      //   invoicePayments: paymentsObj
      // });
    } else if (e.target.tagName === 'DIV' && e.target.classList.contains('delete-invoice')) {
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
    this.props.deleteEntity({
      directory: 'invoices',
      id: this.state.deleteInvoiceId,
      callback: (response) => {
        this.setState({
          fetching: false,
          invoices: response.invoices,
        });
      }
    });
  }

  clickAddInvoice() {

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
    this.props.deleteEntity({
      directory: 'payments',
      id: e.target.dataset.id,
      callback: (response) => {
        this.setState({
          fetching: false,
          payments: response.payments,
          calculations: response.calculations
        });
      }
    })
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, function() {
      this.props.updateEntity({
        id: window.location.pathname.split("/")[2],
        directory: window.location.pathname.split("/")[1],
        entityName: 'virtualBooking',
        entity: Details.removeFinanceSymbolsFromEntity({ entity: this.state.virtualBooking, fields: ['deduction', 'boxOffice'] })
      }).then(() => {
        this.setState({
          fetching: false,
          virtualBooking: this.props.virtualBooking,
          virtualBookingSaved: HandyTools.deepCopy(this.props.virtualBooking),
          calculations: this.props.calculations,
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

  clickSendReport() {
    this.setState({
      fetching: true
    });
    this.props.sendRequest({
      url: `/api/virtual_bookings/${this.state.virtualBooking.id}/send_report`,
      method: 'post'
    }).then(() => {
      this.setState({
        job: this.props.job,
        fetching: false,
        jobModalOpen: true
      });
    });
  }

  render() {
    return (
      <div id="virtual-booking-details" className="component details-component">
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
            <div className="col-xs-3">
              <h2 style={ this.state.virtualBookingSaved.termsValid ? {} : { color: "red" } }>Terms</h2>
              <input className={ Details.errorClass(this.state.errors, FM.errors.terms) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.virtualBooking.terms || "" } data-entity="virtualBooking" data-field="terms" />
              { Details.renderFieldError(this.state.errors, FM.errors.terms) }
            </div>
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'virtualBooking', property: 'deduction' }) }
          </div>
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
            <a className={ "btn blue-button standard-width" + Common.renderDisabledButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
              { Details.saveButtonText.call(this) }
            </a>
            <a className={ "btn delete-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Common.changeState.bind(this, 'deleteModalOpen', true) }>
              Delete
            </a>
          </div>
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
        </div>
        <Modal isOpen={ this.state.newPaymentModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 700 }, 1) }>
          <NewEntity entityName="payment" initialEntity={ { bookingId: this.state.virtualBooking.id, bookingType: "VirtualBooking", date: HandyTools.stringifyDate(new Date), amount: "", notes: "" } } context={ this.props.context } callbackFullProps={ this.updatePayments.bind(this) } />
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

  renderInvoicesSection() {
    if (this.state.virtualBooking.host == 'Venue') {
      return(
        <>
          <hr className="divider" />
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

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntity, createEntity, updateEntity, deleteEntity, sendRequest }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(VirtualBookingDetails);