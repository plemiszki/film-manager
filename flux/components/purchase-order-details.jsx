var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var PurchaseOrdersStore = require('../stores/purchase-orders-store.js');
var PurchaseOrderItemsStore = require('../stores/purchase-order-items-store.js');
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

var qtyModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    width: 300,
    height: 238
  }
};

var PurchaseOrderDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      purchaseOrder: {
        customerId: 0,
        sendInvoice: true
      },
      purchaseOrderSaved: {
        sendInvoice: true
      },
      shippingAddresses: [],
      items: [],
      errors: [],
      sendInvoice: true,
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      addAddressModalOpen: false,
      selectAddressModalOpen: false
    });
  },

  componentDidMount: function() {
    this.purchaseOrderListener = PurchaseOrdersStore.addListener(this.getPurchaseOrders);
    this.purchaseOrderItemsListener = PurchaseOrderItemsStore.addListener(this.getPurchaseOrderItems);
    this.shippingAddressListener = ShippingAddressesStore.addListener(this.getShippingAddresses);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchPurchaseOrder(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.purchaseOrderListener.remove();
    this.purchaseOrderItemsListener.remove();
    this.shippingAddressListener.remove();
    this.errorsListener.remove();
  },

  getPurchaseOrders: function() {
    this.setState({
      purchaseOrder: Tools.deepCopy(PurchaseOrdersStore.find(window.location.pathname.split("/")[2])),
      purchaseOrderSaved: PurchaseOrdersStore.find(window.location.pathname.split("/")[2]),
      shippingAddresses: PurchaseOrdersStore.shippingAddresses(),
      items: PurchaseOrdersStore.items(),
      otherItems: PurchaseOrdersStore.otherItems(),
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

  getPurchaseOrderItems: function() {
    this.setState({
      items: PurchaseOrderItemsStore.items(),
      otherItems: PurchaseOrderItemsStore.otherItems(),
      fetching: false,
      selectedItemId: null,
      selectedItemQty: null
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
        if (purchaseOrder.customerId == 0) {
          purchaseOrder.sendInvoice = false;
        } else {
          purchaseOrder.sendInvoice = !PurchaseOrdersStore.findDvdCustomer(purchaseOrder.customerId).consignment;
        }
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

  clickAddItemButton: function() {
    this.setState({
        selectItemModalOpen: true
    });
  },

  clickSelectItem: function(event) {
    this.setState({
      selectedItemId: event.target.dataset.id,
      selectedItemType: event.target.dataset.type,
      selectItemModalOpen: false,
      qtyModalOpen: true,
      selectedItemQty: 1
    });
  },

  updateQty: function(e) {
    if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
      this.setState({
        selectedItemQty: e.target.value
      });
    }
  },

  clickQtyOk: function() {
    this.setState({
      fetching: true,
      qtyModalOpen: false
    });
    ClientActions.addPurchaseOrderItem(this.state.purchaseOrder.id, this.state.selectedItemId, this.state.selectedItemType, this.state.selectedItemQty);
  },

  clickXButton: function(e) {
    this.setState({
      fetching: true
    });
    ClientActions.deletePurchaseOrderItem(e.target.dataset.id);
  },

  handleModalClose: function() {
    this.setState({
        addAddressModalOpen: false,
        selectAddressModalOpen: false,
        selectItemModalOpen: false,
        qtyModalOpen: false,
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

  beforeSave: function(newThing, key, value) {
    if (key === "customerId") {
      if (value == 0) {
        newThing.sendInvoice = false;
      } else {
        newThing.sendInvoice = !PurchaseOrdersStore.findDvdCustomer(value).consignment;
      }
    }
  },

  findOtherItem: function(type, id) {
    var result;
    this.state.otherItems.forEach(function(otherItem, index) {
      if (otherItem.itemType == type && otherItem.id == id) {
        result = otherItem;
      }
    });
    return result;
  },

  clickShip: function() {
    if (!this.state.purchaseOrder.shipDate && this.state.changesToSave === false) {
      this.setState({
        fetching: true
      }, function() {
        ClientActions.shipPO(this.state.purchaseOrder)
      });
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
                <input className={Common.errorClass(this.state.errors, Common.errors.number)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.purchaseOrder.number || ""} data-field="number" readOnly={this.state.purchaseOrder.shipDate ? "readOnly" : ""} />
                {Common.renderFieldError(this.state.errors, Common.errors.number)}
                <p className={(this.state.purchaseOrder.duplicate && !this.state.purchaseOrder.shipDate) ? "" : "hidden"}>A PO with this number already exists</p>
              </div>
              <div className="col-xs-6">
                <h2>Order Date</h2>
                <input className={Common.errorClass(this.state.errors, Common.errors.orderDate)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.purchaseOrder.orderDate || ""} data-field="orderDate" readOnly={this.state.purchaseOrder.shipDate ? "readOnly" : ""} />
                {Common.renderFieldError(this.state.errors, Common.errors.orderDate)}
              </div>
            </div>
            <hr />
            { this.renderSavedShippingAddressButton() }
            <div className="row">
              <div className="col-xs-4">
                <h2>Name</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.purchaseOrder.name || ""} data-field="name" readOnly={this.state.purchaseOrder.shipDate ? "readOnly" : ""} />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Address 1</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.purchaseOrder.address1 || ""} data-field="address1" readOnly={this.state.purchaseOrder.shipDate ? "readOnly" : ""} />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Address 2</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.purchaseOrder.address2 || ""} data-field="address2" readOnly={this.state.purchaseOrder.shipDate ? "readOnly" : ""} />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3">
                <h2>City</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.purchaseOrder.city || ""} data-field="city" readOnly={this.state.purchaseOrder.shipDate ? "readOnly" : ""} />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-1">
                <h2>State</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.purchaseOrder.state || ""} data-field="state" readOnly={this.state.purchaseOrder.shipDate ? "readOnly" : ""} />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-2">
                <h2>Zip</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.purchaseOrder.zip || ""} data-field="zip" readOnly={this.state.purchaseOrder.shipDate ? "readOnly" : ""} />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-2">
                <h2>Country</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.purchaseOrder.country || ""} data-field="country" readOnly={this.state.purchaseOrder.shipDate ? "readOnly" : ""} />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Customer</h2>
                <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="customerId" value={this.state.purchaseOrder.customerId} disabled={this.state.purchaseOrder.shipDate}>
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
            { this.renderSaveShippingAddressButton() }
            <hr />
            <table className={"admin-table"}>
              <thead>
                <tr>
                  <th>Items</th>
                  <th>Qty</th>
                  <th>Stock</th>
                  <th>{this.state.purchaseOrderSaved.sendInvoice ? 'Unit Price' : ''}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td><td></td><td></td><td></td></tr>
                {this.state.items.map(function(item, index) {
                  return(
                    <tr key={index}>
                      <td className="name-column">
                        <div>
                          { item.label }
                        </div>
                      </td>
                      <td className={ item.qty > item.stock ? "warning" : "" } >
                          { item.qty }
                      </td>
                      <td className={ item.qty > item.stock ? "warning" : "" } >
                          { item.stock }
                      </td>
                      <td>
                          { this.state.purchaseOrderSaved.sendInvoice ? item.price : '' }
                      </td>
                      { this.renderXButton(item) }
                    </tr>
                  );
                }.bind(this))}
              </tbody>
            </table>
            { this.renderAddItemButton() }
            <hr />
            <div className="row">
              <div className="col-xs-12 text-center">
                <input id="send-invoice" className="checkbox" type="checkbox" onChange={Common.changeCheckBox.bind(this, this.changeFieldArgs())} checked={this.state.purchaseOrder.sendInvoice} data-field="sendInvoice" disabled={this.state.purchaseOrder.shipDate || this.state.purchaseOrder.customerId == 0 || PurchaseOrdersStore.findDvdCustomer(this.state.purchaseOrder.customerId).consignment} /><label className="checkbox">Send Invoice</label>
                {this.renderDisabledNotification()}
                <a id="ship" className={"orange-button " + Common.renderDisabledButtonClass(this.state.fetching || this.state.changesToSave) + (this.state.purchaseOrder.shipDate ? " shipped" : "")} onClick={this.clickShip}>
                  {this.state.purchaseOrder.shipDate ? "Shipped " + this.state.purchaseOrder.shipDate : (this.state.changesToSave ? "Save to Ship" : "Ship Now")}
                </a>
              </div>
            </div>
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
        <Modal isOpen={this.state.selectItemModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={Common.selectModalStyles}>
          <ModalSelect options={this.state.otherItems} property={"label"} func={this.clickSelectItem} />
        </Modal>
        <Modal isOpen={this.state.qtyModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={qtyModalStyles}>
          <div className="qty-modal">
            <h1>Enter Quantity:</h1>
            <h2>{ this.state.selectedItemId ? this.findOtherItem(this.state.selectedItemType, this.state.selectedItemId).label : '' }</h2>
            <input onChange={ this.updateQty } value={ this.state.selectedItemQty || "" } /><br />
            <div className="orange-button" onClick={ this.clickQtyOk }>
              OK
            </div>
          </div>
        </Modal>
      </div>
    );
  },

  renderSavedShippingAddressButton: function() {
    if (!this.state.purchaseOrder.shipDate) {
      return(
        <a className={'blue-outline-button small'} onClick={this.clickUseSavedShippingAddressButton}>Use Saved Shipping Address</a>
      )
    }
  },

  renderSaveShippingAddressButton: function() {
    if (!this.state.purchaseOrder.shipDate) {
      return(
        <a id="save-address" className={'blue-outline-button small'} onClick={this.clickSaveShippingAddress}>Save Shipping Address</a>
      )
    }
  },

  renderXButton: function(item) {
    if (!this.state.purchaseOrder.shipDate) {
      return(
        <td>
          <div className="x-button" onClick={this.clickXButton} data-id={item.id}></div>
        </td>
      )
    }
  },

  renderAddItemButton: function() {
    if (!this.state.purchaseOrder.shipDate) {
      return(
        <a className={'blue-outline-button small'} onClick={this.clickAddItemButton}>Add Item</a>
      )
    }
  },

  renderButtons: function() {
    if (!this.state.purchaseOrder.shipDate) {
      if (this.state.changesToSave) {
        var buttonText = "Save";
      } else {
        var buttonText = this.state.justSaved ? "Saved" : "No Changes";
      }
      return(
        <div>
          <hr />
          <a className={"orange-button " + Common.renderDisabledButtonClass(this.state.fetching) + Common.renderInactiveButtonClass(this.state.changesToSave)} onClick={this.clickSave}>
            {buttonText}
          </a>
          <a id="delete" className={"orange-button " + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.clickDelete}>
            Delete Purchase Order
          </a>
        </div>
      )
    }
  },

  renderDisabledNotification: function() {
    var customer = PurchaseOrdersStore.findDvdCustomer(this.state.purchaseOrder.customerId);
    if (this.state.purchaseOrder.customerId == 0) {
      return(
        <div className="notification">Invoice cannot be sent because no customer is selected.</div>
      );
    } else if (customer.consignment) {
      return(
        <div className="notification">Invoice cannot be sent because {customer.name} sells on consignment.</div>
      );
    }
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = PurchaseOrderDetails;
