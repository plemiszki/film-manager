import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import NewEntity from './new-entity.jsx'
import ModalSelect from './modal-select.jsx'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import { fetchEntity, createEntity, updateEntity, deleteEntity, sendRequest } from '../actions/index'
import FM from '../../app/assets/javascripts/me/common.jsx'

const AddAddressModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 500,
    height: 424
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
      dvdCustomers: [],
      shippingAddresses: [],
      items: [],
      errors: [],
      sendInvoice: true,
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      addAddressModalOpen: false,
      selectAddressModalOpen: false,
      selectedItemId: null,
      selectedItemQty: null
    };
  }

  componentDidMount() {
    this.props.fetchEntity({
      id: window.location.pathname.split('/')[2],
      directory: window.location.pathname.split('/')[1],
      entityName: this.props.entityName
    }, 'purchaseOrder').then(() => {
      let { shippingAddresses, dvdCustomers, purchaseOrder, items, otherItems } = this.props;
      this.setState({
        fetching: false,
        purchaseOrder,
        purchaseOrderSaved: HandyTools.deepCopy(purchaseOrder),
        dvdCustomers,
        shippingAddresses,
        items,
        otherItems
      }, () => {
        HandyTools.setUpNiceSelect({ selector: 'select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
      });
    });
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

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, () => {
      this.props.updateEntity({
        id: window.location.pathname.split("/")[2],
        directory: window.location.pathname.split("/")[1],
        entityName: 'purchaseOrder',
        entity: this.state.purchaseOrder
      }).then(() => {
        this.setState({
          fetching: false,
          purchaseOrder: this.props.purchaseOrder,
          purchaseOrderSaved: HandyTools.deepCopy(this.props.purchaseOrder),
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

  clickDelete() {
    this.setState({
      deleteModalOpen: true
    });
  }

  clickSaveShippingAddress() {
    this.setState({
      addAddressModalOpen: true
    });
  }

  addShippingAddressCallback(shippingAddresses) {
    this.setState({
      shippingAddresses,
      addAddressModalOpen: false
    });
  }

  clickUseSavedShippingAddress() {
    this.setState({
      selectAddressModalOpen: true
    });
  }

  clickSelectShippingAddress(option, event) {
    for (let i = 0; i < this.state.shippingAddresses.length; i++) {
      if (this.state.shippingAddresses[i].id === +event.target.dataset.id) {
        let address = this.state.shippingAddresses[i];
        let purchaseOrder = this.state.purchaseOrder;
        purchaseOrder.name = address.name;
        purchaseOrder.address1 = address.address1;
        purchaseOrder.address2 = address.address2;
        purchaseOrder.city = address.city;
        purchaseOrder.state = address.state;
        purchaseOrder.zip = address.zip;
        purchaseOrder.country = address.country;
        purchaseOrder.customerId = address.customerId.toString();
        purchaseOrder.sendInvoice = address.sendInvoice;
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

  clickAddItem() {
    this.setState({
      selectItemModalOpen: true
    });
  }

  clickSelectItem(option, event) {
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
    const { purchaseOrder, selectedItemId, selectedItemType, selectedItemQty } = this.state;
    this.setState({
      fetching: true,
      qtyModalOpen: false
    });
    this.props.createEntity({
      directory: 'purchase_order_items',
      entityName: 'purchaseOrderItem',
      entity: {
        purchaseOrderId: purchaseOrder.id,
        itemId: selectedItemId,
        itemType: selectedItemType,
        qty: selectedItemQty
      }
    }).then(() => {
      const { items, otherItems } = this.props;
      this.setState({
        fetching: false,
        items,
        otherItems,
        selectedItemId: null,
        selectedItemQty: null,
        selectedItemType: null
      });
    });
  }

  clickX(e) {
    this.setState({
      fetching: true
    });
    this.props.deleteEntity({
      directory: 'purchase_order_items',
      id: e.target.dataset.id,
      callback: (response) => {
        this.setState({
          fetching: false,
          items: response.items,
          otherItems: response.otherItems
        });
      }
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.purchaseOrder, this.state.purchaseOrderSaved);
  }

  changeFieldArgs() {
    return {
      thing: "purchaseOrder",
      allErrors: Errors,
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this),
      beforeSave: this.beforeSave
    }
  }

  beforeSave(newThing, key, value) {
    if (key === "customerId") {
      const customer = this.getCustomerFromId(value);
      const canSendInvoice = this.canSendInvoice(customer);
      newThing.sendInvoice = canSendInvoice;
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

  clickShip(args) {
    if (!this.state.purchaseOrder.shipDate && this.state.changesToSave === false) {
      this.setState({
        fetching: true
      }, () => {
        this.props.sendRequest({
          url: '/api/purchase_orders/ship',
          method: 'post',
          data: {
            purchaseOrder: {
              id: this.state.purchaseOrder.id
            },
            reportingOnly: args.reportingOnly
          },
        }).then(() => {
          window.location.href = '/purchase_orders';
        });
      });
    }
  }

  render() {
    const { purchaseOrder, purchaseOrderSaved, errors } = this.state;
    const customer = this.getCustomerFromId(purchaseOrder.customerId);
    return(
      <div id="purchase-order-details">
        <div className="component">
          <h1>Purchase Order Details</h1>
          <div className="white-box">
            <div className="row">
              <div className="col-xs-6">
                <h2>Number</h2>
                <input className={ Details.errorClass(errors, FM.errors.number) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.purchaseOrder.number || "" } data-field="number" readOnly={ this.state.purchaseOrder.shipDate ? "readOnly" : "" } />
                { Details.renderFieldError(errors, FM.errors.number) }
                <p className={ (purchaseOrder.duplicate && !purchaseOrder.shipDate) ? "" : "hidden"}>A PO with this number already exists</p>
              </div>
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'purchaseOrder', property: 'orderDate', readOnly: !!purchaseOrder.shipDate }) }
            </div>
            <hr />
            { this.renderSavedShippingAddressButton() }
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'purchaseOrder', property: 'name', readOnly: !!purchaseOrder.shipDate }) }
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'purchaseOrder', property: 'address1', columnHeader: 'Address 1', readOnly: !!purchaseOrder.shipDate }) }
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'purchaseOrder', property: 'address2', columnHeader: 'Address 2', readOnly: !!purchaseOrder.shipDate }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'purchaseOrder', property: 'city', readOnly: !!purchaseOrder.shipDate }) }
              { Details.renderField.bind(this)({ columnWidth: 1, entity: 'purchaseOrder', property: 'state', readOnly: !!purchaseOrder.shipDate }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'purchaseOrder', property: 'zip', readOnly: !!purchaseOrder.shipDate }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'purchaseOrder', property: 'country', readOnly: !!purchaseOrder.shipDate }) }
              <div className="col-xs-4">
                <h2>Customer</h2>
                <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="customerId" value={ purchaseOrder.customerId } disabled={ purchaseOrder.shipDate }>
                  <option key={ 0 } value={ '0' }>(None)</option>
                  { this.state.dvdCustomers.map((dvdCustomer, index) => {
                    return(
                      <option key={ index + 1 } value={ dvdCustomer.id }>{ dvdCustomer.name }</option>
                    );
                  }) }
                </select>
                { Details.renderFieldError(errors, []) }
              </div>
            </div>
            { this.renderSaveShippingAddressButton() }
            <hr />
            <table className="fm-admin-table">
              <thead>
                <tr>
                  <th>Items</th>
                  <th>Qty</th>
                  { (() => {
                    if (!purchaseOrder.shipDate) {
                      return(<th>Stock</th>)
                    }
                  })() }
                  <th>{ purchaseOrderSaved.sendInvoice ? 'Unit Price' : '' }</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td></tr>
                { this.state.items.map((item, index) => {
                  return(
                    <tr key={ index }>
                      <td className="name-column">
                        <div>
                          { item.label }
                        </div>
                      </td>
                      <td className={ !purchaseOrder.shipDate && item.qty > item.stock ? "warning" : "" } >
                          { item.qty }
                      </td>
                      { (() => {
                        if (!purchaseOrder.shipDate) {
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
                }) }
              </tbody>
            </table>
            { this.renderAddItemButton() }
            <hr />
            <div className="row">
              <div className="col-xs-12">
                <h2>Notes</h2>
                <textarea rows="5" cols="20" onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.purchaseOrder.notes } data-field="notes" />
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-12 text-center">
                <input
                  id="send-invoice"
                  className="checkbox"
                  type="checkbox"
                  onChange={ FM.changeCheckBox.bind(this, this.changeFieldArgs()) }
                  checked={ this.state.purchaseOrder.sendInvoice }
                  data-field="sendInvoice"
                  disabled={
                    this.state.purchaseOrder.shipDate ||
                    this.canSendInvoice(this.getCustomerFromId(this.state.purchaseOrder.customerId)) === false
                  }
                />
                <label className="checkbox">Send Invoice</label>
                { this.renderDisabledNotification() }
                <div>
                  <a
                    id="ship"
                    className={ "orange-button" + Common.renderInactiveButtonClass(this.state.fetching || this.state.changesToSave) + (this.state.purchaseOrder.shipDate ? " shipped" : "") }
                    onClick={ this.clickShip.bind(this, { reportingOnly: false }) }
                  >
                    { this.state.purchaseOrder.shipDate ? "Shipped " + this.state.purchaseOrder.shipDate : (this.state.changesToSave ? "Save to Ship" : "Ship Now") }
                  </a>
                  { this.renderReportingOnlyButton() }
                </div>
              </div>
            </div>
            { this.renderButtons() }
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete
            entityName="purchaseOrder"
            confirmDelete={ Details.clickDelete.bind(this) }
            closeModal={ Common.closeModals.bind(this) }
          />
        </Modal>
        <Modal isOpen={ this.state.addAddressModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ AddAddressModalStyles }>
          <NewEntity
            context={ this.props.context }
            entityName="shippingAddress"
            entityNamePlural="shippingAddresses"
            initialEntity={ {
              label: "",
              name: purchaseOrder.name,
              address1: purchaseOrder.address1,
              address2: purchaseOrder.address2,
              city: purchaseOrder.city,
              state: purchaseOrder.state,
              zip: purchaseOrder.zip,
              country: purchaseOrder.country,
              customerId: purchaseOrder.customerId,
              customerInfo: purchaseOrder.customerId ? `Customer: ${customer.name}` : "No DVD Customer"
            } }
            callback={ this.addShippingAddressCallback.bind(this) }
          />
        </Modal>
        <Modal isOpen={ this.state.selectAddressModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.shippingAddresses } property="label" func={ this.clickSelectShippingAddress.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.selectItemModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.otherItems } property="label" func={ this.clickSelectItem.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.qtyModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ qtyModalStyles }>
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
        <a className="blue-outline-button small" onClick={ this.clickUseSavedShippingAddress.bind(this) }>Use Saved Shipping Address</a>
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
          <div className="x-button" onClick={ this.clickX.bind(this) } data-id={ item.id }></div>
        </td>
      );
    }
  }

  renderAddItemButton() {
    if (!this.state.purchaseOrder.shipDate) {
      return(
        <a className="blue-outline-button small" onClick={ this.clickAddItem.bind(this) }>Add Item</a>
      )
    }
  }

  renderButtons() {
    if (!this.state.purchaseOrder.shipDate) {
      return(
        <div>
          <a className={ "btn blue-button standard-width" + Common.renderDisabledButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
            { Details.saveButtonText.call(this) }
          </a>
          <a className={ "btn delete-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Common.changeState.bind(this, 'deleteModalOpen', true) }>
            Delete
          </a>
        </div>
      );
    }
  }

  renderDisabledNotification() {
    const customer = this.getCustomerFromId(this.state.purchaseOrder.customerId);
    if (customer === undefined) {
      return(
        <div className="notification">Invoice cannot be sent because no customer is selected.</div>
      );
    } else if (customer.consignment) {
      return(
        <div className="notification">Invoice cannot be sent because { customer.name } sells on consignment.</div>
      );
    }
  }

  getCustomerFromId(id) {
    return this.state.dvdCustomers.find(customer => customer.id === +id);
  }

  canSendInvoice(customer) {
    if (customer === undefined) {
      return false;
    } else if (customer.consignment) {
      return false;
    } else {
      return true;
    }
  }

  renderReportingOnlyButton() {
    if (!this.state.purchaseOrder.shipDate) {
      return(
        <a
          id="reporting-only"
          className={ "orange-button" + Common.renderInactiveButtonClass(this.state.fetching || this.state.changesToSave) }
          onClick={ this.clickShip.bind(this, { reportingOnly: true }) }
        >
          { this.state.changesToSave ? "Save to Ship" : "Invoice Only" }
        </a>
      );
    }
  }

  componentDidUpdate() {
    FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntity, createEntity, updateEntity, deleteEntity, sendRequest }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseOrderDetails);
