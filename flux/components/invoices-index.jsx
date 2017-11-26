var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var InvoicesStore = require('../stores/invoices-store.js');

var InvoicesIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      invoices: []
    });
  },

  componentDidMount: function() {
    this.invoicesListener = InvoicesStore.addListener(this.getInvoices);
    ClientActions.fetchInvoices();
  },

  componentWillUnmount: function() {
    this.invoicesListener.remove();
  },

  getInvoices: function() {
    this.setState({
      fetching: false,
      invoices: InvoicesStore.all()
    });
  },

  redirect: function(id) {
    window.location.pathname = "invoices/" + id;
  },

  render: function() {
    var filteredOrders = this.state.invoices.filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="invoices-index" className="component">
        <h1>Invoices</h1>
        <a className={"orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.ClickExport}>Export</a>
        <input className="search-box" onChange={Common.changeSearchText.bind(this)} value={this.state.searchText || ""} data-field="searchText" />
        <div className="white-box">
          {Common.renderSpinner(this.state.fetching)}
          {Common.renderGrayedOut(this.state.fetching)}
          <table className={"admin-table"}>
            <thead>
              <tr>
                <th><div className={Common.sortClass.call(this, "sentDate")} onClick={Common.clickHeader.bind(this, "sentDate")}>Sent Date</div></th>
                <th><div className={Common.sortClass.call(this, "number")} onClick={Common.clickHeader.bind(this, "number")}>Invoice Number</div></th>
                <th><div className={Common.sortClass.call(this, "type")} onClick={Common.clickHeader.bind(this, "type")}>Type</div></th>
                <th><div className={Common.sortClass.call(this, "poNumber")} onClick={Common.clickHeader.bind(this, "poNumber")}>PO Number</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              {_.orderBy(filteredOrders, [Common.commonSort.bind(this)], [this.state.sortBy === 'sentDate' ? 'desc' : 'asc']).map(function(invoice, index) {
                return(
                  <tr key={index} onClick={this.redirect.bind(this, invoice.id)}>
                    <td className="indent">
                      {invoice.sentDate}
                    </td>
                    <td>
                      {invoice.number}
                    </td>
                    <td>
                      {invoice.type}
                    </td>
                    <td>
                      {invoice.poNumber}
                    </td>
                  </tr>
                );
              }.bind(this))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = InvoicesIndex;
