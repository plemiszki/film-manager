var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var InvoicesStore = require('../stores/invoices-store.js');

var filterModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#FFFFFF',
    margin: 'auto',
    maxWidth: 540,
    height: 250,
    border: 'solid 1px black',
    borderRadius: '6px',
    color: '#5F5F5F',
    padding: '30px'
  }
};

var InvoicesIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      searchText: "",
      sortBy: "sentDate",
      invoices: [],
      filterModalOpen: false,
      filterType: "all",
      filterNumber: "0"
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

  openFilterModal: function() {
    this.setState({
      filterModalOpen: true
    }, function() {
      $('.filter-modal select').val(this.state.filterType);
      Common.resetNiceSelect('select');
      $('.filter-modal input').val(this.state.filterNumber);
    });
  },

  updateFilter: function() {
    var type = $('.filter-modal select').val();
    var number = $('.filter-modal input').val();
    this.setState({
      filterType: type,
      filterNumber: number,
      filterModalOpen: false
    });
  },

  handleModalClose: function() {
    this.setState({ filterModalOpen: false });
  },

  filterExists: function() {
    if (this.state.filterType != "all" || this.state.filterNumber != "0") {
      return " green";
    } else {
      return "";
    }
  },

  render: function() {
    var filteredOrders = this.state.invoices.filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="invoices-index" className="component">
        <h1>Invoices</h1>
        <a className={"orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.ClickExport}>Export</a>
        <a className={"orange-button float-button" + this.filterExists() + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.openFilterModal}>Filter</a>
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
        <Modal isOpen={this.state.filterModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={filterModalStyles}>
          <div className="filter-modal">
            <div className="row">
              <div className="col-xs-6">
                <h2>Type</h2>
                <select>
                  <option value="all">All</option>
                  <option value="booking">Booking</option>
                  <option value="dvd">DVD</option>
                </select>
              </div>
              <div className="col-xs-6">
                <h2>Starting Number</h2>
                <input />
              </div>
            </div>
            <div className="row button-row">
              <div className="col-xs-12">
                <a className="orange-button" onClick={this.updateFilter}>Update Filter</a>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = InvoicesIndex;
