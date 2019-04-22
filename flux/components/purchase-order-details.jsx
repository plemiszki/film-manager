import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import PurchaseOrdersStore from '../stores/purchase-orders-store.js'
import PurchaseOrderItemsStore from '../stores/purchase-order-items-store.js'
import ShippingAddressesStore from '../stores/shipping-addresses-store.js'
import ErrorsStore from '../stores/errors-store.js'
import NewThing from './new-thing.jsx'
import ModalSelect from './modal-select.jsx'

const AddAddressModalStyles = {
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

const qtyModalStyles = {
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

class PurchaseOrderDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
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
    };
  }

  componentDidMount() {
    this.purchaseOrderListener = PurchaseOrdersStore.addListener(this.getPurchaseOrders.bind(this));
    this.purchaseOrderItemsListener = PurchaseOrderItemsStore.addListener(this.getPurchaseOrderItems.bind(this));
    this.shippingAddressListener = ShippingAddressesStore.addListener(this.getShippingAddresses.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchPurchaseOrder(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.purchaseOrderListener.remove();
    this.purchaseOrderItemsListener.remove();
    this.shippingAddressListener.remove();
    this.errorsListener.remove();
  }

  getPurchaseOrders() {
    this.setState({
      purchaseOrder: Tools.deepCopy(PurchaseOrdersStore.find(window.location.pathname.split("/")[2])),
      purchaseOrderSaved: PurchaseOrdersStore.find(window.location.pathname.split("/")[2]),
      shippingAddresses: PurchaseOrdersStore.shippingAddresses(),
      items: PurchaseOrdersStore.items(),
      otherItems: PurchaseOrdersStore.otherItems(),
      fetching: false
    }, () => {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  }

  getShippingAddresses() {
    this.setState({
      shippingAddresses: ShippingAddressesStore.all(),
      addAddressModalOpen: false
    });
  }

  getErrors() {
    this.setState({
      errors: ErrorsStore.all(),
      fetching: false
    });
  }

  getPurchaseOrderItems() {
    this.setState({
      items: PurchaseOrderItemsStore.items(),
      otherItems: PurchaseOrderItemsStore.otherItems(),
      fetching: false,
      selectedItemId: null,
      selectedItemQty: null
    });
  }

  clickSave() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, () => {
        ClientActions.updatePurchaseOrder(this.state.purchaseOrder);
      });
    }
  }

  clickDelete() {
    this.setState({
      deleteModalOpen: true
    });
  }

  confirmDelete() {
    this.setState({
      fetching: true,
      deleteModalOpen: false
    }, () => {
      ClientActions.deletePurchaseOrder(this.state.purchaseOrder.id);
    });
  }

  clickSaveShippingAddress() {
    this.setState({
      addAddressModalOpen: true
    });
  }

  clickUseSavedShippingAddressButton() {
    this.setState({
      selectAddressModalOpen: true
    });
  }

  clickSelectShippingAddress(event) {
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
        }, () => {
          this.setState({
            changesToSave: this.checkForChanges()
          });
        });
      }
    }
  }

  clickAddItemButton() {
    this.setState({
      selectItemModalOpen: true
    });
  }

  clickSelectItem(event) {
    this.setState({
      selectedItemId: event.target.dataset.id,
      selectedItemType: event.target.dataset.type,
      selectItemModalOpen: false,
      qtyModalOpen: true,
      selectedItemQty: 1
    });
  }

  updateQty(e) {
    if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
      this.setState({
        selectedItemQty: e.target.value
      });
    }
  }

  clickQtyOk() {
    this.setState({
      fetching: true,
      qtyModalOpen: false
    });
    ClientActions.addPurchaseOrderItem(this.state.purchaseOrder.id, this.state.selectedItemId, this.state.selectedItemType, this.state.selectedItemQty);
  }

  clickXButton(e) {
    this.setState({
      fetching: true
    });
    ClientActions.deletePurchaseOrderItem(e.target.dataset.id);
  }

  closeModal() {
    this.setState({
      addAddressModalOpen: false,
      selectAddressModalOpen: false,
      selectItemModalOpen: false,
      qtyModalOpen: false,
      deleteModalOpen: false
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.purchaseOrder, this.state.purchaseOrderSaved);
  }

  changeFieldArgs() {
    return {
      thing: "purchaseOrder",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this),
      beforeSave: this.beforeSave
    }
  }

  beforeSave(newThing, key, value) {
    if (key === "customerId") {
      if (value == 0) {
        newThing.sendInvoice = false;
      } else {
        newThing.sendInvoice = !PurchaseOrdersStore.findDvdCustomer(value).consignment;
      }
    }
  }

  findOtherItem(type, id) {
    var result;
    this.state.otherItems.forEach((otherItem, index) => {
      if (otherItem.itemType == type && otherItem.id == id) {
        result = otherItem;
      }
    });
    return result;
  }

  clickShip() {
    if (!this.state.purchaseOrder.shipDate && this.state.changesToSave === false) {
      this.setState({
        fetching: true
      }, () => {
        ClientActions.shipPO(this.state.purchaseOrder, false)
      });
    }
  }

  clickReportingOnly() {
    if (!this.state.purchaseOrder.shipDate && this.state.changesToSave === false) {
      this.setState({
        fetching: true
      }, () => {
        ClientActions.shipPO(this.state.purchaseOrder, true)
      });
    }
  }

  render() {
    return(
      <div id="purchase-order-details">
        <div className="component">
          <h1>Purchase Order Details</h1>
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-6">
                <h2>Number</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.number) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.purchaseOrder.number || "" } data-field="number" readOnly={ this.state.purchaseOrder.shipDate ? "readOnly" : "" } />
                { Common.renderFieldError(this.state.errors, Common.errors.number) }
                <p className={ (this.state.purchaseOrder.duplicate && !this.state.purchaseOrder.shipDate) ? "" : "hidden"}>A PO with this number already exists</p>
              </div>
              <div className="col-xs-6">
                <h2>Order Date</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.orderDate) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.purchaseOrder.orderDate || "" } data-field="orderDate" readOnly={ this.state.purchaseOrder.shipDate ? "readOnly" : "" } />
                { Common.renderFieldError(this.state.errors, Common.errors.orderDate) }
              </div>
            </div>
            <hr />
            { this.renderSavedShippingAddressButton() }
            <div className="row">
              <div className="col-xs-4">
                <h2>Name</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.purchaseOrder.name || "" } data-field="name" readOnly={ this.state.purchaseOrder.shipDate ? "readOnly" : "" } />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-4">
                <h2>Address 1</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.purchaseOrder.address1 || "" } data-field="address1" readOnly={ this.state.purchaseOrder.shipDate ? "readOnly" : "" } />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-4">
                <h2>Address 2</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.purchaseOrder.address2 || "" } data-field="address2" readOnly={ this.state.purchaseOrder.shipDate ? "readOnly" : "" } />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3">
                <h2>City</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.purchaseOrder.city || "" } data-field="city" readOnly={ this.state.purchaseOrder.shipDate ? "readOnly" : "" } />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-1">
                <h2>State</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.purchaseOrder.state || "" } data-field="state" readOnly={ this.state.purchaseOrder.shipDate ? "readOnly" : "" } />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Zip</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.purchaseOrder.zip || "" } data-field="zip" readOnly={ this.state.purchaseOrder.shipDate ? "readOnly" : "" } />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Country</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.purchaseOrder.country || "" } data-field="country" readOnly={ this.state.purchaseOrder.shipDate ? "readOnly" : "" } />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-4">
                <h2>Customer</h2>
                <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="customerId" value={this.state.purchaseOrder.customerId} disabled={this.state.purchaseOrder.shipDate}>
                  <option key={0} value={'0'}>(None)</option>
                  { PurchaseOrdersStore.dvdCustomers().map((dvdCustomer, index) => {
                    return(
                      <option key={ index + 1 } value={ dvdCustomer.id }>{ dvdCustomer.name }</option>
                    );
                  }) }
                </select>
                { Common.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            { this.renderSaveShippingAddressButton() }
            <hr />
            <table className={"admin-table"}>
              <thead>
                <tr>
                  <th>Items</th>
                  <th>Qty</th>
                  { (() => {
                    if (!this.state.purchaseOrder.shipDate) {
                      return(<th>Stock</th>)
                    }
                  })() }
                  <th>{this.state.purchaseOrderSaved.sendInvoice ? 'Unit Price' : ''}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td></tr>
                {this.state.items.map((item, index) => {
                  return(
                    <tr key={index}>
                      <td className="name-column">
                        <div>
                          { item.label }
                        </div>
                      </td>
                      <td className={ !this.state.purchaseOrder.shipDate && item.qty > item.stock ? "warning" : "" } >
                          { item.qty }
                      </td>
                      { (() => {
                        if (!this.state.purchaseOrder.shipDate) {
                          return(
                            <td className={ item.qty > item.stock ? "warning" : "" } >
                                { item.stock }
                            </td>
                          )
                        }
                      })() }
                      <td>
                          { this.state.purchaseOrderSaved.sendInvoice ? item.price : '' }
                      </td>
                      { this.renderXButton(item) }
                    </tr>
                  );
                })}
              </tbody>
            </table>
            { this.renderAddItemButton() }
            <hr />
            <div className="row">
              <div className="col-xs-12">
                <h2>Notes</h2>
                <textarea rows="5" cols="20" onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.purchaseOrder.notes } data-field="notes" />
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-12 text-center">
                <input id="send-invoice" className="checkbox" type="checkbox" onChange={ Common.changeCheckBox.bind(this, this.changeFieldArgs()) } checked={ this.state.purchaseOrder.sendInvoice } data-field="sendInvoice" disabled={ this.state.purchaseOrder.shipDate || this.state.purchaseOrder.customerId == 0 || PurchaseOrdersStore.findDvdCustomer(this.state.purchaseOrder.customerId).consignment } /><label className="checkbox">Send Invoice</label>
                { this.renderDisabledNotification() }
                <div>
                  <a id="ship" className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching || this.state.changesToSave) + (this.state.purchaseOrder.shipDate ? " shipped" : "") } onClick={ this.clickShip.bind(this) }>
                    { this.state.purchaseOrder.shipDate ? "Shipped " + this.state.purchaseOrder.shipDate : (this.state.changesToSave ? "Save to Ship" : "Ship Now") }
                  </a>
                  { this.renderReportingOnlyButton() }
                </div>
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to delete this PO&#63;</h1>
            This action cannot be undone<br />
            <a className="red-button" onClick={ this.confirmDelete.bind(this) }>
              Yes
            </a>
            <a className="orange-button" onClick={ this.closeModal.bind(this) }>
              No
            </a>
          </div>
        </Modal>
        <Modal isOpen={ this.state.addAddressModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ AddAddressModalStyles }>
          <NewThing thing="shippingAddress" initialObject={ {
              label: "",
              name: this.state.purchaseOrder.name,
              address1: this.state.purchaseOrder.address1,
              address2: this.state.purchaseOrder.address2,
              city: this.state.purchaseOrder.city,
              state: this.state.purchaseOrder.state,
              zip: this.state.purchaseOrder.zip,
              country: this.state.purchaseOrder.country,
              customerId: this.state.purchaseOrder.customerId
          } } />
        </Modal>
        <Modal isOpen={ this.state.selectAddressModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ this.state.shippingAddresses } property="label" func={ this.clickSelectShippingAddress.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.selectItemModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ this.state.otherItems } property="label" func={ this.clickSelectItem.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.qtyModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ qtyModalStyles }>
          <div className="qty-modal">
            <h1>Enter Quantity:</h1>
            <h2>{ this.state.selectedItemId ? this.findOtherItem(this.state.selectedItemType, this.state.selectedItemId).label : '' }</h2>
            <input onChange={ this.updateQty.bind(this) } value={ this.state.selectedItemQty || "" } /><br />
            <div className="orange-button" onClick={ this.clickQtyOk.bind(this) }>
              OK
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  renderSavedShippingAddressButton() {
    if (!this.state.purchaseOrder.shipDate) {
      return(
        <a className="blue-outline-button small" onClick={ this.clickUseSavedShippingAddressButton.bind(this) }>Use Saved Shipping Address</a>
      );
    }
  }

  renderSaveShippingAddressButton() {
    if (!this.state.purchaseOrder.shipDate) {
      return(
        <a id="save-address" className="blue-outline-button small" onClick={ this.clickSaveShippingAddress.bind(this ) }>Save Shipping Address</a>
      );
    }
  }

  renderXButton(item) {
    if (!this.state.purchaseOrder.shipDate) {
      return(
        <td>
          <div className="x-button" onClick={ this.clickXButton.bind(this) } data-id={ item.id }></div>
        </td>
      );
    }
  }

  renderAddItemButton() {
    if (!this.state.purchaseOrder.shipDate) {
      return(
        <a className="blue-outline-button small" onClick={ this.clickAddItemButton.bind(this) }>Add Item</a>
      )
    }
  }

  renderButtons() {
    if (!this.state.purchaseOrder.shipDate) {
      if (this.state.changesToSave) {
        var buttonText = "Save";
      } else {
        var buttonText = this.state.justSaved ? "Saved" : "No Changes";
      }
      return(
        <div>
          <hr />
          <a className={ "orange-button " + HandyTools.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave.bind(this) }>
            { buttonText }
          </a>
          <a id="delete" className={ "orange-button " + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
            Delete Purchase Order
          </a>
        </div>
      );
    }
  }

  renderDisabledNotification() {
    var customer = PurchaseOrdersStore.findDvdCustomer(this.state.purchaseOrder.customerId);
    if (this.state.purchaseOrder.customerId == 0) {
      return(
        <div className="notification">Invoice cannot be sent because no customer is selected.</div>
      );
    } else if (customer.consignment) {
      return(
        <div className="notification">Invoice cannot be sent because { customer.name } sells on consignment.</div>
      );
    }
  }

  renderReportingOnlyButton() {
    if (!this.state.purchaseOrder.shipDate) {
      return(
        <a id="reporting-only" className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching || this.state.changesToSave) } onClick={ this.clickReportingOnly.bind(this) }>
          { this.state.changesToSave ? "Save to Ship" : "Reporting Only" }
        </a>
      );
    }
  }

  componentDidUpdate() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
}

export default PurchaseOrderDetails;
