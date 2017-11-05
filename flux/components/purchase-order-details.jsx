var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var PurchaseOrdersStore = require('../stores/purchase-orders-store.js');
var ShippingAddressesStore = require('../stores/shipping-addresses-store.js');
var ErrorsStore = require('../stores/errors-store.js');
var NewThing = require('./new-thing.jsx');
import ModalSelect from './modal-select.jsx';

var AddAddressModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 415
  }
};

var PurchaseOrderDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      purchaseOrder: {},
      purchaseOrderSaved: {},
      dvds: [],
      shippingAddresses: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      addAddressModalOpen: false,
      selectAddressModalOpen: false
    });
  },

  componentDidMount: function() {
    this.purchaseOrderListener = PurchaseOrdersStore.addListener(this.getPurchaseOrders);
    this.shippingAddressListener = ShippingAddressesStore.addListener(this.getShippingAddresses);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchPurchaseOrder(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.purchaseOrderListener.remove();
    this.shippingAddressListener.remove();
    this.errorsListener.remove();
  },

  getPurchaseOrders: function() {
    this.setState({
      purchaseOrder: Tools.deepCopy(PurchaseOrdersStore.find(window.location.pathname.split("/")[2])),
      purchaseOrderSaved: PurchaseOrdersStore.find(window.location.pathname.split("/")[2]),
      shippingAddresses: PurchaseOrdersStore.shippingAddresses(),
      fetching: false
    }, function() {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  },

  getShippingAddresses: function() {
    this.setState({
      shippingAddresses: ShippingAddressesStore.all(),
      addAddressModalOpen: false
    });
  },

  getErrors: function() {
    this.setState({
      errors: ErrorsStore.all(),
      fetching: false
    });
  },

  clickSave: function() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, function() {
        ClientActions.updatePurchaseOrder(this.state.purchaseOrder);
      });
    }
  },

  clickDelete: function() {
    this.setState({
      deleteModalOpen: true
    });
  },

  confirmDelete: function() {
    this.setState({
      fetching: true,
      deleteModalOpen: false
    }, function() {
      ClientActions.deletePurchaseOrder(this.state.purchaseOrder.id);
    });
  },

  clickSaveShippingAddress: function() {
    this.setState({
      addAddressModalOpen: true
    });
  },

  clickUseSavedShippingAddressButton: function() {
    this.setState({
      selectAddressModalOpen: true
    });
  },

  clickSelectShippingAddress: function(event) {
    for (var i = 0; i < this.state.shippingAddresses.length; i++) {
      if (this.state.shippingAddresses[i].id === +event.target.dataset.id) {
        var address = this.state.shippingAddresses[i];
        var purchaseOrder = this.state.purchaseOrder;
        purchaseOrder.name = address.name;
        purchaseOrder.address1 = address.address1;
        purchaseOrder.address2 = address.address2;
        purchaseOrder.city = address.city;
        purchaseOrder.state = address.state;
        purchaseOrder.zip = address.zip;
        purchaseOrder.country = address.country;
        purchaseOrder.customerId = address.customerId.toString();
        this.setState({
          purchaseOrder: purchaseOrder,
          selectAddressModalOpen: false
        }, function() {
          this.setState({
            changesToSave: this.checkForChanges()
          });
        });
      }
    }
  },

  handleModalClose: function() {
    this.setState({
        addAddressModalOpen: false,
        selectAddressModalOpen: false,
        deleteModalOpen: false
    });
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.purchaseOrder, this.state.purchaseOrderSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "purchaseOrder",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges,
      beforeSave: this.beforeSave
    }
  },

  render: function() {
    return(
      <div id="purchase-order-details">
        <div className="component">
          <h1>Purchase Order Details</h1>
          <div className="white-box">
            {Common.renderSpinner(this.state.fetching)}
            {Common.renderGrayedOut(this.state.fetching)}
            <div className="row">
              <div className="col-xs-6">
                <h2>Number</h2>
                <input className={Common.errorClass(this.state.errors, Common.errors.number)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.purchaseOrder.number || ""} data-field="number" />
                {Common.renderFieldError(this.state.errors, Common.errors.number)}
              </div>
              <div className="col-xs-6">
                <h2>Order Date</h2>
                <input className={Common.errorClass(this.state.errors, Common.errors.orderDate)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.purchaseOrder.orderDate || ""} data-field="orderDate" />
                {Common.renderFieldError(this.state.errors, Common.errors.orderDate)}
              </div>
            </div>
            <hr />
            <a className={'blue-outline-button small'} onClick={this.clickUseSavedShippingAddressButton}>Use Saved Shipping Address</a>
            <div className="row">
              <div className="col-xs-4">
                <h2>Name</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.purchaseOrder.name || ""} data-field="name" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Address 1</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.purchaseOrder.address1 || ""} data-field="address1" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Address 2</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.purchaseOrder.address2 || ""} data-field="address2" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3">
                <h2>City</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.purchaseOrder.city || ""} data-field="city" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-1">
                <h2>State</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.purchaseOrder.state || ""} data-field="state" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-2">
                <h2>Zip</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.purchaseOrder.zip || ""} data-field="zip" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-2">
                <h2>Country</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.purchaseOrder.country || ""} data-field="country" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Customer</h2>
                <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="customerId" value={this.state.purchaseOrder.customerId}>
                  <option key={0} value={'0'}>(None)</option>
                  {PurchaseOrdersStore.dvdCustomers().map(function(dvdCustomer, index) {
                    return(
                      <option key={index + 1} value={dvdCustomer.id}>{dvdCustomer.name}</option>
                    )
                  })}
                </select>
                {Common.renderFieldError(this.state.errors, [])}
              </div>
            </div>
            <a id="save-address" className={'blue-outline-button small'} onClick={this.clickSaveShippingAddress}>Save Shipping Address</a>
            <hr />
            <div className="row">
              <div className="col-xs-12">
                <a id="ship" className={"orange-button " + Common.renderDisabledButtonClass(this.state.fetching) + (this.state.purchaseOrder.shipDate ? " shipped" : "")} onClick={this.clickShip}>
                  {this.state.purchaseOrder.shipDate ? "Shipped " + this.state.purchaseOrder.shipDate : "Ship Now"}
                </a>
              </div>
            </div>
            <hr />
            {this.renderButtons()}
          </div>
        </div>
        <Modal isOpen={this.state.deleteModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={Common.deleteModalStyles}>
          <div className="confirm-delete">
            <h1>Are you sure you want to delete this PO&#63;</h1>
            This action cannot be undone<br />
            <a className={"red-button"} onClick={this.confirmDelete}>
              Yes
            </a>
            <a className={"orange-button"} onClick={this.handleModalClose}>
              No
            </a>
          </div>
        </Modal>
        <Modal isOpen={this.state.addAddressModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={AddAddressModalStyles}>
          <NewThing thing="shippingAddress" initialObject={{
              label: "",
              name: this.state.purchaseOrder.name,
              address1: this.state.purchaseOrder.address1,
              address2: this.state.purchaseOrder.address2,
              city: this.state.purchaseOrder.city,
              state: this.state.purchaseOrder.state,
              zip: this.state.purchaseOrder.zip,
              country: this.state.purchaseOrder.country,
              customerId: this.state.purchaseOrder.customerId
          }} />
        </Modal>
        <Modal isOpen={this.state.selectAddressModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={Common.selectModalStyles}>
          <ModalSelect options={this.state.shippingAddresses} property={"label"} func={this.clickSelectShippingAddress} />
        </Modal>
      </div>
    );
  },

  renderButtons: function() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={"orange-button " + Common.renderDisabledButtonClass(this.state.fetching) + Common.renderInactiveButtonClass(this.state.changesToSave)} onClick={this.clickSave}>
          {buttonText}
        </a>
        <a id="delete" className={"orange-button " + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.clickDelete}>
          Delete Purchase Order
        </a>
      </div>
    )
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = PurchaseOrderDetails;
