var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var PurchaseOrdersStore = require('../stores/purchase-orders-store.js');
var NewThing = require('./new-thing.jsx');

var ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 351
  }
};

var PurchaseOrdersIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      searchText: "",
      sortBy: "shipDate",
      purchaseOrders: [],
      modalOpen: false
    });
  },

  componentDidMount: function() {
    this.purchaseOrdersListener = PurchaseOrdersStore.addListener(this.getPurchaseOrders);
    ClientActions.fetchPurchaseOrders();
  },

  componentWillUnmount: function() {
    this.purchaseOrdersListener.remove();
  },

  getPurchaseOrders: function() {
    this.setState({
      fetching: false,
      purchaseOrders: PurchaseOrdersStore.all(),
      modalOpen: false
    });
  },

  redirect: function(id) {
    window.location.pathname = "purchase_orders/" + id;
  },

  handleAddNewClick: function() {
    this.setState({modalOpen: true});
  },

  handleModalClose: function() {
    this.setState({modalOpen: false});
  },

  render: function() {
    var filteredOrders = this.state.purchaseOrders.filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="purchase-orders-index" className="component">
        <h1>DVD Purchase Orders</h1>
        <a className={"orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.handleAddNewClick}>Add New</a>
        <a className={"orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.clickUpdateStock}>Update Stock</a>
        <input className="search-box" onChange={Common.changeSearchText.bind(this)} value={this.state.searchText || ""} data-field="searchText" />
        <div className="white-box">
          {Common.renderSpinner(this.state.fetching)}
          {Common.renderGrayedOut(this.state.fetching)}
          <table className={"admin-table"}>
            <thead>
              <tr>
                <th><div className={Common.sortClass.call(this, "shipDate")} onClick={Common.clickHeader.bind(this, "shipDate")}>Ship Date</div></th>
                <th><div className={Common.sortClass.call(this, "number")} onClick={Common.clickHeader.bind(this, "number")}>PO Number</div></th>
                <th><div className={Common.sortClass.call(this, "customer")} onClick={Common.clickHeader.bind(this, "customer")}>Customer</div></th>
                <th><div className={Common.sortClass.call(this, "units")} onClick={Common.clickHeader.bind(this, "units")}>Units</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              {_.orderBy(filteredOrders, [Common.commonSort.bind(this)], [this.state.sortBy === 'shipDate' ? 'desc' : 'asc']).map(function(purchaseOrder, index) {
                return(
                  <tr key={index} onClick={this.redirect.bind(this, purchaseOrder.id)}>
                    <td className="indent">
                      {purchaseOrder.shipDate}
                    </td>
                    <td>
                      {purchaseOrder.number}
                    </td>
                    <td>
                      {purchaseOrder.customer}
                    </td>
                    <td>
                      {purchaseOrder.units}
                    </td>
                  </tr>
                );
              }.bind(this))}
            </tbody>
          </table>
        </div>
        <Modal isOpen={this.state.modalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={ModalStyles}>
          <NewThing thing="purchaseOrder" initialObject={{number: "", orderDate: ""}} />
        </Modal>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = PurchaseOrdersIndex;
