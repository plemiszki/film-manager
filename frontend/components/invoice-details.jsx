import React from 'react'
import { Common, fetchEntity, Spinner, GrayedOut } from 'handy-components'

export default class InvoiceDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      invoice: {},
      rows: [],
      payments: []
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { invoice, rows, payments } = response;
      const mappedPayments = payments.map((payment) => {
        return {
          label: 'Payment' + (payment.notes ? (' - ' + payment.notes) : '') + ' (' + payment.date + ')',
          totalPrice: payment.amount
        }
      });
      this.setState({
        fetching: false,
        invoice,
        rows,
        payments: mappedPayments
      });
    });
  }

  clickExport() {
    window.location.pathname = 'api/invoices/' + this.state.invoice.id + '/export';
  }

  render() {
    const { fetching } = this.props;
    return (
      <>
        <div className="handy-component">
          <h1>Invoice Details</h1>
          <div className="white-box">
            <div className="row">
              <div className={ this.state.invoice.invoiceType == "booking" ? "col-xs-2" : "col-xs-4" }>
                <h2>Number</h2>
                { this.state.invoice.number }
              </div>
              <div className={ this.state.invoice.invoiceType == "booking" ? "col-xs-2" : "col-xs-4" }>
                <h2>Sent Date</h2>
                { this.state.invoice.sentDate }
              </div>
              { this.renderPOSection() }
              { this.renderFilmAndVenueSection() }
            </div>
            <div className="row">
              <div className="col-xs-4">
                <h2>Billing Address</h2>
                <p>{ this.state.invoice.billingName }</p>
                <p>{ this.state.invoice.billingAddress1 }</p>
                <p>{ this.state.invoice.billingAddress2 }</p>
                <p>{ this.state.invoice.billingCity }, { this.state.invoice.billingState } { this.state.invoice.billingZip }</p>
                <p>{ this.state.invoice.billingCountry == 'USA' ? '' : this.state.invoice.billingCountry }</p>
              </div>
              { this.renderShippingAddressSection() }
            </div>
            <hr />
            <table className="fm-admin-table">
              <thead>
                { this.renderTableHeaders() }
              </thead>
              <tbody>
                <tr><td></td><td></td><td></td><td></td></tr>
                { (this.state.rows.concat(this.state.payments)).map(this.renderTableColumns.bind(this)) }
              </tbody>
            </table>
            <hr />
            <div className="row">
              <div className="col-xs-12">
                <h2>Total</h2>
                { this.state.invoice.total }
              </div>
            </div>
            { this.renderNotes() }
            <a className={ "standard-button " + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickExport.bind(this) }>
              Export
            </a>
            <Spinner visible={ fetching } />
            <GrayedOut visible={ fetching } />
          </div>
        </div>
        <style jsx>{`
          .row, table {
            margin-bottom: 30px;
          }
        `}</style>
      </>
    );
  }

  renderShippingAddressSection() {
    if (this.state.invoice.shippingAddress1) {
      return(
        <div className="col-xs-4">
          <h2>Shipping Address</h2>
          <p>{ this.state.invoice.shippingName }</p>
          <p>{ this.state.invoice.shippingAddress1 }</p>
          <p>{ this.state.invoice.shippingAddress2 }</p>
          <p>{ this.state.invoice.shippingCity }, { this.state.invoice.shippingState } { this.state.invoice.shippingZip }</p>
          <p>{ this.state.invoice.shippingCountry == 'USA' ? '' : this.state.invoice.shippingCountry }</p>
        </div>
      );
    }
  }

  renderTableHeaders() {
    if (this.state.invoice.invoiceType == "dvd") {
      return(
        <tr>
          <th>Item</th>
          <th>Price</th>
          <th>Qty</th>
          <th>Total Price</th>
        </tr>
      );
    } else {
      return(
        <tr>
          <th>Description</th>
          <th>Amount</th>
        </tr>
      );
    }
  }

  renderTableColumns(row, index) {
    if (this.state.invoice.invoiceType == "dvd") {
      return(
        <tr key={ index }>
          <td>
            <div className="link-padding">
              { row.label }
            </div>
          </td>
          <td>
            <div className="link-padding">
              { row.price }
            </div>
          </td>
          <td>
            <div className="link-padding">
              { row.qty }
            </div>
          </td>
          <td>
            <div className="link-padding">
              { row.totalPrice }
            </div>
          </td>
        </tr>
      );
    } else {
      return(
        <tr key={ index }>
          <td className="indent">
            { row.label }
          </td>
          <td>
            { row.totalPrice }
          </td>
        </tr>
      );
    }
  }

  renderPOSection() {
    if (this.state.invoice.invoiceType == "dvd") {
      return(
        <div className="col-xs-4">
          <h2>PO Number</h2>
          { this.state.invoice.poNumber }
        </div>
      );
    }
  }

  renderFilmAndVenueSection() {
    if (this.state.invoice.invoiceType == "booking") {
      return(
        <div>
          <div className="col-xs-4">
            <h2>Film</h2>
            { this.state.invoice.film }
          </div>
          <div className="col-xs-4">
            <h2>Venue</h2>
            { this.state.invoice.venue }
          </div>
        </div>
      );
    }
  }

  renderNotes() {
    if (this.state.invoice.notes) {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Notes</h2>
            { this.state.invoice.notes.split('\n').map(function(line, key) {
              return(
                <span key={ key }>
                  { line }<br />
                </span>
              )
            }) }
          </div>
        </div>
      )
    }
  }
}
