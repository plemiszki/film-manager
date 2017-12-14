var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var InvoicesStore = require('../stores/invoices-store.js');

var InvoiceDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      invoice: {},
      rows: []
    });
  },

  componentDidMount: function() {
    this.invoiceListener = InvoicesStore.addListener(this.getInvoice);
    ClientActions.fetchInvoice(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.invoiceListener.remove();
  },

  getInvoice: function() {
    this.setState({
      invoice: InvoicesStore.find(window.location.pathname.split("/")[2]),
      rows: InvoicesStore.rows(),
      fetching: false
    });
  },

  clickExport: function() {
    window.location.pathname = 'api/invoices/' + this.state.invoice.id + '/export';
  },

  render: function() {
    return(
      <div id="invoice-details">
        <div className="component">
          <h1>Invoice Details</h1>
          <div className="white-box">
            {Common.renderSpinner(this.state.fetching)}
            {Common.renderGrayedOut(this.state.fetching)}
            <div className="row">
              <div className="col-xs-4">
                <h2>Number</h2>
                { this.state.invoice.number }
              </div>
              <div className="col-xs-4">
                <h2>Sent Date</h2>
                { this.state.invoice.sentDate }
              </div>
              <div className="col-xs-4">
                <h2>PO Number</h2>
                { this.state.invoice.poNumber }
              </div>
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
              <div className="col-xs-4">
                <h2>Shipping Address</h2>
                <p>{ this.state.invoice.shippingName }</p>
                <p>{ this.state.invoice.shippingAddress1 }</p>
                <p>{ this.state.invoice.shippingAddress2 }</p>
                <p>{ this.state.invoice.shippingCity }, { this.state.invoice.shippingState } { this.state.invoice.shippingZip }</p>
                <p>{ this.state.invoice.shippingCountry == 'USA' ? '' : this.state.invoice.shippingCountry }</p>
              </div>
            </div>
            <hr />
            <table className={"admin-table"}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total Price</th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td><td></td><td></td><td></td></tr>
                {this.state.rows.map(function(row, index) {
                  return(
                    <tr key={index}>
                      <td className="indent">
                        { row.label }
                      </td>
                      <td>
                        { row.price }
                      </td>
                      <td>
                        { row.qty }
                      </td>
                      <td>
                        { row.totalPrice }
                      </td>
                    </tr>
                  );
                }.bind(this))}
              </tbody>
            </table>
            <hr />
            { this.renderShippingFee() }
            <div className="row">
              <div className="col-xs-12">
                <h2>Total</h2>
                { this.state.invoice.total }
              </div>
            </div>
            <a id="export" className={"orange-button " + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.clickExport}>
              Export
            </a>
          </div>
        </div>
      </div>
    );
  },

  renderShippingFee: function() {
    if (this.state.invoice.invoiceType == "Booking") {
      <div className="row">
        <div className="col-xs-12">
          <h2>Shipping Fee</h2>
          { this.state.invoice.shipFee }
        </div>
      </div>
    }
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = InvoiceDetails;
