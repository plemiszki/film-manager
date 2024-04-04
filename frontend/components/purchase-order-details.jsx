import React from "react";
import Modal from "react-modal";
import NewEntity from "./new-entity.jsx";
import {
  Common,
  Button,
  Details,
  deepCopy,
  setUpNiceSelect,
  fetchEntity,
  createEntity,
  updateEntity,
  deleteEntity,
  sendRequest,
  GrayedOut,
  Spinner,
  ModalSelect,
  BottomButtons,
  Table,
  OutlineButton,
} from "handy-components";
import QuantityModal from "./quantity-modal.jsx";

const AddAddressModalStyles = {
  overlay: {
    background: "rgba(0, 0, 0, 0.50)",
  },
  content: {
    background: "#F5F6F7",
    padding: 0,
    margin: "auto",
    maxWidth: 500,
    height: 424,
  },
};

export default class PurchaseOrderDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spinner: true,
      purchaseOrder: {
        customerId: "0",
        sendInvoice: true,
      },
      purchaseOrderSaved: {
        sendInvoice: true,
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
      otherItems: [],
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      let {
        shippingAddresses,
        dvdCustomers,
        purchaseOrder,
        items,
        otherItems,
      } = response;
      this.setState(
        {
          spinner: false,
          purchaseOrder,
          purchaseOrderSaved: deepCopy(purchaseOrder),
          dvdCustomers,
          shippingAddresses,
          items,
          otherItems,
        },
        () => {
          setUpNiceSelect({
            selector: "select",
            func: Details.changeDropdownField.bind(this),
          });
        },
      );
    });
  }

  clickSave() {
    this.setState(
      {
        spinner: true,
        justSaved: true,
      },
      () => {
        updateEntity({
          entityName: "purchaseOrder",
          entity: this.state.purchaseOrder,
        }).then(
          (response) => {
            const { purchaseOrder } = response;
            this.setState({
              spinner: false,
              purchaseOrder,
              purchaseOrderSaved: deepCopy(purchaseOrder),
              changesToSave: false,
            });
          },
          (response) => {
            const { errors } = response;
            this.setState({
              spinner: false,
              errors,
            });
          },
        );
      },
    );
  }

  addShippingAddressCallback(shippingAddresses) {
    this.setState({
      shippingAddresses,
      addAddressModalOpen: false,
    });
  }

  clickSelectShippingAddress(option) {
    for (let i = 0; i < this.state.shippingAddresses.length; i++) {
      if (this.state.shippingAddresses[i].id === option.id) {
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
        this.setState(
          {
            purchaseOrder: purchaseOrder,
            selectAddressModalOpen: false,
          },
          () => {
            this.setState({
              changesToSave: this.checkForChanges(),
            });
          },
        );
      }
    }
  }

  clickAddItem() {
    this.setState({
      selectItemModalOpen: true,
    });
  }

  clickSelectItem(option) {
    this.setState({
      selectedItemId: option.id,
      selectedItemType: option.itemType,
      selectItemModalOpen: false,
      qtyModalOpen: true,
    });
  }

  clickQtyOk(qty) {
    const { purchaseOrder, selectedItemId, selectedItemType } = this.state;
    this.setState({
      spinner: true,
      qtyModalOpen: false,
    });
    createEntity({
      directory: "purchase_order_items",
      entityName: "purchaseOrderItem",
      entity: {
        purchaseOrderId: purchaseOrder.id,
        itemId: selectedItemId,
        itemType: selectedItemType,
        qty,
      },
    }).then((response) => {
      const { items, otherItems } = response;
      this.setState({
        spinner: false,
        items,
        otherItems,
        selectedItemId: null,
        selectedItemQty: null,
        selectedItemType: null,
      });
    });
  }

  deleteItem(id) {
    this.setState({
      spinner: true,
    });
    deleteEntity({
      directory: "purchase_order_items",
      id,
    }).then((response) => {
      const { items, otherItems } = response;
      this.setState({
        spinner: false,
        items,
        otherItems,
      });
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(
      this.state.purchaseOrder,
      this.state.purchaseOrderSaved,
    );
  }

  changeFieldArgs() {
    return {
      thing: "purchaseOrder",
      changesFunction: this.checkForChanges.bind(this),
      beforeSave: this.beforeSave,
    };
  }

  beforeSave(newThing, key, value) {
    if (key === "customerId") {
      const customer = this.getCustomerFromId(value);
      const canSendInvoice = this.canSendInvoice(customer);
      newThing.sendInvoice = canSendInvoice;
    }
  }

  clickShip(args) {
    const { reportingOnly } = args;
    const { purchaseOrder, changesToSave } = this.state;
    if (!purchaseOrder.shipDate && changesToSave === false) {
      this.setState(
        {
          spinner: true,
        },
        () => {
          sendRequest("/api/purchase_orders/ship", {
            method: "POST",
            data: {
              purchaseOrder: {
                id: purchaseOrder.id,
              },
              reportingOnly,
            },
          }).then(() => {
            window.location.href = "/purchase_orders";
          });
        },
      );
    }
  }

  render() {
    const {
      purchaseOrder,
      dvdCustomers,
      spinner,
      justSaved,
      changesToSave,
      qtyModalOpen,
      selectedItemId,
      selectedItemType,
      otherItems,
      addAddressModalOpen = [],
      shippingAddresses,
      selectItemModalOpen,
      selectAddressModalOpen,
    } = this.state;
    const {
      invoiceId,
      invoiceNumber,
      shipDate,
      sourceDoc,
      name,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      customerId,
    } = purchaseOrder;
    const customer = this.getCustomerFromId(purchaseOrder.customerId);
    const canSendInvoice = this.canSendInvoice(customer);
    const unshippedPO = !purchaseOrder.shipDate;
    const shippedPO = !unshippedPO;

    const selectedItem = otherItems.find(
      (item) =>
        item.id === selectedItemId && item.itemType === selectedItemType,
    );

    let tableColumns = [
      {
        name: "label",
        header: "Item",
      },
      {
        name: "qty",
        redIf: (item) => unshippedPO && item.qty > item.stock,
      },
    ];

    if (unshippedPO) {
      tableColumns.push({
        name: "stock",
        redIf: (item) => unshippedPO && item.qty > item.stock,
      });
    }

    if (purchaseOrder.sendInvoice) {
      tableColumns.push({
        name: "price",
        header: "Unit Price",
      });
    }

    return (
      <>
        <div>
          <div className="handy-component">
            <h1>Purchase Order Details</h1>
            <div className="white-box">
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: "purchaseOrder",
                  property: "number",
                  warnIf: unshippedPO && purchaseOrder.duplicate,
                  warning: "A PO with this number already exists",
                  readOnly: shippedPO,
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: "purchaseOrder",
                  property: "orderDate",
                  readOnly: !!purchaseOrder.shipDate,
                })}
              </div>
              <hr />
              {unshippedPO && (
                <OutlineButton
                  text="Use Saved Shipping Address"
                  onClick={() =>
                    this.setState({ selectAddressModalOpen: true })
                  }
                  marginBottom
                />
              )}
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 4,
                  entity: "purchaseOrder",
                  property: "name",
                  readOnly: !!purchaseOrder.shipDate,
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 4,
                  entity: "purchaseOrder",
                  property: "address1",
                  columnHeader: "Address 1",
                  readOnly: !!purchaseOrder.shipDate,
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 4,
                  entity: "purchaseOrder",
                  property: "address2",
                  columnHeader: "Address 2",
                  readOnly: !!purchaseOrder.shipDate,
                })}
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "purchaseOrder",
                  property: "city",
                  readOnly: !!purchaseOrder.shipDate,
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 1,
                  entity: "purchaseOrder",
                  property: "state",
                  readOnly: !!purchaseOrder.shipDate,
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "purchaseOrder",
                  property: "zip",
                  readOnly: !!purchaseOrder.shipDate,
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "purchaseOrder",
                  property: "country",
                  readOnly: !!purchaseOrder.shipDate,
                })}
                {Details.renderDropDown.bind(this)({
                  columnWidth: 4,
                  entity: "purchaseOrder",
                  property: "customerId",
                  columnHeader: "Customer",
                  options: dvdCustomers || [],
                  optionDisplayProperty: "name",
                  optional: true,
                  noneValue: "0",
                  readOnly: shippedPO,
                })}
              </div>
              {unshippedPO && (
                <OutlineButton
                  text="Save Shipping Address"
                  onClick={() => this.setState({ addAddressModalOpen: true })}
                  marginBottom
                />
              )}
              <hr />
              <Table
                sortable={false}
                links={false}
                rows={this.state.items}
                columns={tableColumns}
                marginBottom
                clickDelete={
                  unshippedPO ? (item) => this.deleteItem(item.id) : null
                }
              />
              {unshippedPO && (
                <OutlineButton
                  text="Add Item"
                  onClick={() => this.clickAddItem()}
                  marginBottom
                />
              )}
              <hr />
              <div className="row">
                {Details.renderField.bind(this)({
                  type: "textbox",
                  columnWidth: 12,
                  entity: "purchaseOrder",
                  property: "notes",
                  rows: 5,
                  readOnly: !!purchaseOrder.shipDate,
                })}
              </div>
              <hr />
              {unshippedPO ? (
                <>
                  <div className="row">
                    {Details.renderSwitch.bind(this)({
                      columnWidth: 12,
                      entity: "purchaseOrder",
                      property: "sendInvoice",
                      center: true,
                      readOnly: shippedPO || !canSendInvoice,
                      style: { marginBottom: 30 },
                    })}
                  </div>
                  <div className="row">
                    <div className="col-xs-12 text-center">
                      {!customer && (
                        <div className="notification">
                          Invoice cannot be sent because no customer is
                          selected.
                        </div>
                      )}
                      {customer && customer.consignment && (
                        <div className="notification">
                          Invoice cannot be sent because {customer.name} sells
                          on consignment.
                        </div>
                      )}
                      <div>
                        <Button
                          disabled={spinner || changesToSave}
                          text={changesToSave ? "Save to Ship" : "Ship Now"}
                          onClick={() =>
                            this.clickShip({ reportingOnly: false })
                          }
                          marginBottom
                        />
                        {canSendInvoice && purchaseOrder.sendInvoice && (
                          <Button
                            disabled={spinner || changesToSave}
                            text={
                              changesToSave
                                ? "Save to Ship"
                                : "Send Invoice Only"
                            }
                            onClick={() =>
                              this.clickShip({ reportingOnly: true })
                            }
                            style={{ marginLeft: 20 }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <BottomButtons
                    entityName="purchaseOrder"
                    confirmDelete={Details.confirmDelete.bind(this)}
                    justSaved={justSaved}
                    changesToSave={changesToSave}
                    disabled={spinner}
                    clickSave={() => {
                      this.clickSave();
                    }}
                  />
                </>
              ) : (
                <div className="shipped-info-section">
                  <p>This PO was shipped on {shipDate}.</p>
                  {sourceDoc && <p>Sales Order {sourceDoc}</p>}
                  {invoiceNumber && (
                    <a
                      href={`/invoices/${invoiceId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Invoice {invoiceNumber}
                    </a>
                  )}
                </div>
              )}
              <GrayedOut visible={spinner} />
              <Spinner visible={spinner} />
            </div>
          </div>
          <Modal
            isOpen={addAddressModalOpen}
            onRequestClose={Common.closeModals.bind(this)}
            contentLabel="Modal"
            style={AddAddressModalStyles}
          >
            <NewEntity
              context={this.props.context}
              entityName="shippingAddress"
              entityNamePlural="shippingAddresses"
              initialEntity={{
                label: "",
                name,
                address1,
                address2,
                city,
                state,
                zip,
                country,
                customerId,
                customerInfo:
                  customerId !== "0"
                    ? `Customer: ${customer.name}`
                    : "No DVD Customer",
              }}
              callback={this.addShippingAddressCallback.bind(this)}
            />
          </Modal>
          <ModalSelect
            isOpen={selectAddressModalOpen}
            options={shippingAddresses}
            property="label"
            func={this.clickSelectShippingAddress.bind(this)}
            onClose={Common.closeModals.bind(this)}
          />
          <ModalSelect
            isOpen={selectItemModalOpen}
            options={otherItems}
            property="label"
            func={this.clickSelectItem.bind(this)}
            onClose={Common.closeModals.bind(this)}
          />
          <QuantityModal
            isOpen={qtyModalOpen}
            item={selectedItem}
            onClose={() => {
              this.setState({ qtyModalOpen: false });
            }}
            clickOK={(qty) => this.clickQtyOk(qty)}
          />
        </div>
        <style jsx>{`
          .notification {
            margin-bottom: 30px;
          }
          .qty-modal {
            padding: 30px;
            text-align: center;
          }
          .qty-modal h1 {
            font-size: 16px;
            margin-bottom: 14px;
          }
          .qty-modal h2 {
            font-size: 12px;
            margin-bottom: 20px;
          }
          .qty-modal input {
            width: 170px;
            padding: 13px;
            margin-bottom: 20px;
          }
          .shipped-info-section p:not(:first-of-type) {
            margin-top: 10px;
          }
          .shipped-info-section a {
            margin-top: 10px;
            display: block;
            text-decoration: underline;
          }
        `}</style>
      </>
    );
  }

  getCustomerFromId(id) {
    const { dvdCustomers } = this.state;
    return dvdCustomers.find((customer) => customer.id === +id);
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
}
