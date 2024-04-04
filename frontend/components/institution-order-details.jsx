import React from "react";
import Modal from "react-modal";
import NewEntity from "./new-entity.jsx";
import {
  objectsAreEqual,
  sendRequest,
  deepCopy,
  Details,
  setUpNiceSelect,
  fetchEntity,
  updateEntity,
  GrayedOut,
  Spinner,
  BottomButtons,
  Table,
  OutlineButton,
  ModalSelect,
  Common,
  createEntity,
  deleteEntity,
  Button,
} from "handy-components";

export default class InstitutionOrderDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spinner: true,
      institutionOrder: {},
      institutionOrderSaved: {},
      institutions: [],
      orderFilms: [],
      films: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const {
        institutionOrder,
        institutions,
        institutionOrderFilms,
        films,
        invoice,
      } = response;
      this.setState(
        {
          institutionOrder,
          institutionOrderSaved: deepCopy(institutionOrder),
          institutions,
          orderFilms: institutionOrderFilms,
          films,
          invoice,
          spinner: false,
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
        const { institutionOrder } = this.state;
        updateEntity({
          entityName: "institutionOrder",
          entity: Details.removeFinanceSymbolsFromEntity({
            entity: institutionOrder,
            fields: ["price", "shippingFee"],
          }),
        }).then(
          (response) => {
            const { institutionOrder } = response;
            this.setState({
              spinner: false,
              changesToSave: false,
              institutionOrder,
              institutionOrderSaved: deepCopy(institutionOrder),
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

  checkForChanges() {
    const { institutionOrder, institutionOrderSaved } = this.state;
    return !objectsAreEqual(institutionOrder, institutionOrderSaved);
  }

  changeFieldArgs() {
    const { errors } = this.state;
    return {
      thing: "institutionOrder",
      errorsArray: errors,
      changesFunction: this.checkForChanges.bind(this),
    };
  }

  deleteFilm(id) {
    this.setState({
      spinner: true,
    });
    deleteEntity({
      directory: "institution_order_films",
      id,
    }).then((response) => {
      const { institutionOrderFilms, films } = response;
      const institutionOrder = {
        ...this.state.institutionOrder,
        ...response.institutionOrder,
      };
      this.setState({
        spinner: false,
        orderFilms: institutionOrderFilms,
        films,
        institutionOrder,
        institutionOrderSaved: deepCopy(institutionOrder),
      });
    });
  }

  sendInvoice() {
    const { institutionOrder } = this.state;
    this.setState({
      jobModalOpen: true,
      job: {
        firstLine: "Sending Invoice",
      },
    });
    sendRequest(`/api/institution_orders/${institutionOrder.id}/send_invoice`, {
      method: "POST",
    }).then((response) => {
      const { job } = response;
      this.setState({
        job,
      });
    });
  }

  render() {
    const {
      invoice,
      institutionOrder,
      job,
      spinner,
      justSaved,
      changesToSave,
      institutions,
      orderFilms,
      films,
      addFilmModalOpen,
    } = this.state;
    const unsavedChanges = this.checkForChanges();
    return (
      <>
        <div>
          <div className="handy-component details-component">
            <h1>Educational Order Details</h1>
            <div className="white-box">
              <div className="row">
                {Details.renderField.bind(this)({
                  columnHeader: "Customer",
                  columnWidth: 6,
                  type: "modal",
                  entity: "institutionOrder",
                  property: "institutionId",
                  options: institutions,
                  optionDisplayProperty: "label",
                  readOnly: invoice,
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "institutionOrder",
                  property: "number",
                  columnHeader: "Order Number",
                  readOnly: invoice,
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "institutionOrder",
                  property: "orderDate",
                  readOnly: invoice,
                })}
              </div>
              <hr />
              <div className="address-block">
                <p className="section-header">Billing Address</p>
                <div className="row">
                  {Details.renderField.bind(this)({
                    columnWidth: 4,
                    entity: "institutionOrder",
                    property: "billingName",
                    columnHeader: "Name",
                    readOnly: invoice,
                  })}
                  {Details.renderField.bind(this)({
                    columnWidth: 4,
                    entity: "institutionOrder",
                    property: "billingAddress1",
                    columnHeader: "Address 1",
                    readOnly: invoice,
                  })}
                  {Details.renderField.bind(this)({
                    columnWidth: 4,
                    entity: "institutionOrder",
                    property: "billingAddress2",
                    columnHeader: "Address 2",
                    readOnly: invoice,
                  })}
                </div>
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "institutionOrder",
                  property: "billingCity",
                  columnHeader: "City",
                  readOnly: invoice,
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 1,
                  entity: "institutionOrder",
                  property: "billingState",
                  columnHeader: "State",
                  readOnly: invoice,
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "institutionOrder",
                  property: "billingZip",
                  columnHeader: "Zip",
                  readOnly: invoice,
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "institutionOrder",
                  property: "billingCountry",
                  columnHeader: "Country",
                  readOnly: invoice,
                })}
              </div>
              <hr />
              <div className="address-block">
                <p className="section-header">Shipping Address</p>
                <div className="row">
                  {Details.renderField.bind(this)({
                    columnWidth: 4,
                    entity: "institutionOrder",
                    property: "shippingName",
                    columnHeader: "Name",
                    readOnly: invoice,
                  })}
                  {Details.renderField.bind(this)({
                    columnWidth: 4,
                    entity: "institutionOrder",
                    property: "shippingAddress1",
                    columnHeader: "Address 1",
                    readOnly: invoice,
                  })}
                  {Details.renderField.bind(this)({
                    columnWidth: 4,
                    entity: "institutionOrder",
                    property: "shippingAddress2",
                    columnHeader: "Address 2",
                    readOnly: invoice,
                  })}
                </div>
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "institutionOrder",
                  property: "shippingCity",
                  columnHeader: "City",
                  readOnly: invoice,
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 1,
                  entity: "institutionOrder",
                  property: "shippingState",
                  columnHeader: "State",
                  readOnly: invoice,
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "institutionOrder",
                  property: "shippingZip",
                  columnHeader: "Zip",
                  readOnly: invoice,
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "institutionOrder",
                  property: "shippingCountry",
                  columnHeader: "Country",
                  readOnly: invoice,
                })}
              </div>
              <hr />
              <Table
                rows={orderFilms}
                links={false}
                alphabetize
                columns={[
                  { name: "filmTitle", header: "Film" },
                  { name: "licensedRights" },
                  { name: "price" },
                  { name: "formats", header: "Format(s)" },
                ]}
                clickDelete={
                  invoice ? null : (film) => this.deleteFilm(film.id)
                }
                sortable={false}
                style={{ marginBottom: 15 }}
                test="films"
              />
              {invoice ? null : (
                <OutlineButton
                  text="Add Film"
                  onClick={() => this.setState({ addFilmModalOpen: true })}
                  marginBottom
                />
              )}
              <hr />
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "institutionOrder",
                  property: "subtotal",
                  readOnly: true,
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "institutionOrder",
                  property: "shippingFee",
                  readOnly: invoice,
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "institutionOrder",
                  property: "total",
                  readOnly: true,
                })}
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  type: "textbox",
                  columnWidth: 12,
                  entity: "institutionOrder",
                  property: "invoiceNotes",
                  rows: 5,
                  readOnly: invoice,
                })}
              </div>
              <hr />
              {invoice ? (
                <>
                  <div className="row">
                    <div className="col-xs-12">
                      <p style={{ marginBottom: 30 }}>
                        <a
                          href={`/invoices/${invoice.id}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ textDecoration: "underline" }}
                        >
                          Invoice {invoice.number}
                        </a>{" "}
                        was sent on {invoice.sentDate}.
                      </p>
                    </div>
                  </div>
                  <hr />
                </>
              ) : null}
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "institutionOrder",
                  property: "materialsSent",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 4,
                  entity: "institutionOrder",
                  property: "trackingNumber",
                })}
              </div>
              <hr />
              <div className="row">
                {Details.renderField.bind(this)({
                  type: "textbox",
                  columnWidth: 12,
                  entity: "institutionOrder",
                  property: "internalNotes",
                  rows: 5,
                })}
              </div>
              <BottomButtons
                entityName="educationalOrder"
                confirmDelete={Details.confirmDelete.bind(this)}
                justSaved={justSaved}
                changesToSave={changesToSave}
                disabled={spinner}
                clickSave={() => this.clickSave()}
              >
                {invoice ? null : (
                  <Button
                    text="Send Invoice"
                    onClick={() => this.sendInvoice()}
                    marginLeft
                    disabled={
                      spinner ||
                      unsavedChanges ||
                      !institutionOrder.customerEmail
                    }
                    disabledTooltip={
                      institutionOrder.customerEmail
                        ? null
                        : "Invoices cannot be sent without an email address for the customer."
                    }
                  />
                )}
              </BottomButtons>
              <GrayedOut visible={spinner} />
              <Spinner visible={spinner} />
            </div>
          </div>
        </div>
        <Modal
          isOpen={addFilmModalOpen}
          onRequestClose={Common.closeModals.bind(this)}
          contentLabel="Modal"
          style={Common.newEntityModalStyles({ width: 800 }, 2)}
        >
          <NewEntity
            context={this.props.context}
            entityName="institutionOrderFilm"
            initialEntity={{
              institutionOrderId: institutionOrder.id,
              price: "",
              licensedRights: 0,
              formats: "",
            }}
            passData={{ films }}
            callbackFullProps={(response) => {
              const { institutionOrderFilms, films } = response;
              const institutionOrder = {
                ...this.state.institutionOrder,
                ...response.institutionOrder,
              };
              this.setState({
                orderFilms: institutionOrderFilms,
                films,
                addFilmModalOpen: false,
                institutionOrder,
                institutionOrderSaved: deepCopy(institutionOrder),
              });
            }}
          />
        </Modal>
        {Common.renderJobModal.call(this, job)}
      </>
    );
  }

  componentDidUpdate() {
    Common.updateJobModal.call(this, {
      successCallback: () => {
        this.setState({
          spinner: true,
        });
        fetchEntity().then((response) => {
          const { institutionOrder, invoice } = response;
          this.setState({
            institutionOrder,
            institutionOrderSaved: deepCopy(institutionOrder),
            invoice,
            spinner: false,
          });
        });
      },
    });
  }
}
