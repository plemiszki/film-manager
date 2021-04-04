import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import HandyTools from 'handy-tools'
import { Common, Details, Index } from 'handy-components'
import { fetchEntity, updateEntity } from '../actions/index'
import FM from '../../app/assets/javascripts/me/common.jsx'

class SettingsDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      settings: {},
      settingsSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false
    };
  }

  componentDidMount() {
    this.props.fetchEntity({
      url: '/api/settings'
    }).then(() => {
      this.setState({
        settings: this.props.settings,
        settingsSaved: Tools.deepCopy(this.props.settings),
        fetching: false
      }, () => {
        this.setState({
          changesToSave: this.checkForChanges()
        });
      });
    });
  }

  getErrors() {
    this.setState({
      errors: ErrorsStore.all(),
      fetching: false
    });
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, () => {
      this.props.updateEntity({
        url: '/api/settings',
        entityName: 'settings',
        entity: {
          booking_confirmation_text: this.state.settings.bookingConfirmationText,
          dvd_invoice_email_text: this.state.settings.dvdInvoiceEmailText,
          credit_memo_email_text: this.state.settings.creditMemoEmailText,
          paid_booking_invoice_email_text: this.state.settings.paidBookingInvoiceEmailText,
          partially_paid_booking_invoice_email_text: this.state.settings.partiallyPaidBookingInvoiceEmailText,
          unpaid_overage_booking_invoice_email_text: this.state.settings.unpaidOverageBookingInvoiceEmailText,
          unpaid_non_overage_booking_invoice_email_text: this.state.settings.unpaidNonOverageBookingInvoiceEmailText,
          booking_invoice_payment_info_email_text: this.state.settings.bookingInvoicePaymentInfoEmailText,
          shipping_terms_email_text: this.state.settings.shippingTermsEmailText,
          all_booking_invoices_email_text: this.state.settings.allBookingInvoicesEmailText
        }
      }).then(() => {
        this.setState({
          fetching: false,
          changesToSave: false,
          settings: this.props.settings,
          settingsSaved: Tools.deepCopy(this.props.settings)
        });
      });
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.settings, this.state.settingsSaved);
  }

  changeFieldArgs() {
    return {
      allErrors: FM.errors,
      entity: 'settings',
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    return(
      <div className="settings-details">
        <div className="component">
          <h1>Settings</h1>
          <div className="white-box">
            <div className="row">
              { Details.renderTextBox.bind(this)({ columnHeader: 'Booking Confirmation Email Copy', rows: 15, columnWidth: 12, entity: 'settings', property: 'bookingConfirmationText' }) }
              { Details.renderTextBox.bind(this)({ columnHeader: 'Unpaid Non-Overage Booking Invoice Email Copy', rows: 6, columnWidth: 12, entity: 'settings', property: 'unpaidNonOverageBookingInvoiceEmailText' }) }
              { Details.renderTextBox.bind(this)({ columnHeader: 'Unpaid Overage Booking Invoice Email Copy', rows: 6, columnWidth: 12, entity: 'settings', property: 'unpaidOverageBookingInvoiceEmailText' }) }
              { Details.renderTextBox.bind(this)({ columnHeader: 'Partially Paid Booking Invoice Email Copy', rows: 6, columnWidth: 12, entity: 'settings', property: 'partiallyPaidBookingInvoiceEmailText' }) }
              { Details.renderTextBox.bind(this)({ columnHeader: 'Paid Booking Invoice Email Copy', rows: 6, columnWidth: 12, entity: 'settings', property: 'paidBookingInvoiceEmailText' }) }
              { Details.renderTextBox.bind(this)({ columnHeader: 'Booking Invoice Payment Info Email Copy', subheader: 'Included in all booking invoice emails with a balance due.', rows: 15, columnWidth: 12, entity: 'settings', property: 'bookingInvoicePaymentInfoEmailText' }) }
              { Details.renderTextBox.bind(this)({ columnHeader: 'Booking Invoice Shipping Terms Email Copy', subheader: 'Included in invoice emails for non-theatrical or festival bookings with an advance.', rows: 4, columnWidth: 12, entity: 'settings', property: 'shippingTermsEmailText' }) }
              { Details.renderTextBox.bind(this)({ columnHeader: 'Booking Invoices Additional Email Copy', subheader: 'Included at the end of all booking invoice emails.', rows: 4, columnWidth: 12, entity: 'settings', property: 'allBookingInvoicesEmailText' }) }
              { Details.renderTextBox.bind(this)({ columnHeader: 'DVD Invoice Email Copy', rows: 10, columnWidth: 12, entity: 'settings', property: 'dvdInvoiceEmailText' }) }
              { Details.renderTextBox.bind(this)({ columnHeader: 'Credit Memo Email Copy', rows: 8, columnWidth: 12, entity: 'settings', property: 'creditMemoEmailText' }) }
            </div>
            { this.renderButtons() }
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          </div>
        </div>
      </div>
    );
  }

  renderButtons() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={ "btn orange-button " + Common.renderDisabledButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
      </div>
    );
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntity, updateEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsDetails);
