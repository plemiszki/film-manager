import React from "react";
import {
  Details,
  deepCopy,
  fetchEntity,
  updateEntity,
  BottomButtons,
  Spinner,
  GrayedOut,
  Button,
} from "handy-components";

export default class DvdCustomerDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spinner: true,
      dvdCustomer: {},
      dvdCustomerSaved: {},
      films: [],
      errors: {},
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { dvdCustomer } = response;
      this.setState({
        spinner: false,
        dvdCustomer,
        dvdCustomerSaved: deepCopy(dvdCustomer),
      });
    });
  }

  clickSave() {
    this.setState(
      {
        spinner: true,
        justSaved: true,
      },
      () => {
        const { dvdCustomer } = this.state;
        updateEntity({
          entityName: "dvdCustomer",
          entity: dvdCustomer,
        }).then(
          (response) => {
            const { dvdCustomer } = response;
            this.setState({
              spinner: false,
              dvdCustomer,
              dvdCustomerSaved: deepCopy(dvdCustomer),
              changesToSave: false,
            });
          },
          (response) => {
            this.setState({
              spinner: false,
              errors: response.errors,
            });
          },
        );
      },
    );
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(
      this.state.dvdCustomer,
      this.state.dvdCustomerSaved,
    );
  }

  changeFieldArgs() {
    return {
      thing: "dvdCustomer",
      changesFunction: this.checkForChanges.bind(this),
      beforeSave: this.beforeSave.bind(this),
    };
  }

  beforeSave(newThing, key, value) {
    const { errors } = this.state;
    if (key === "consignment" && value === false) {
      newThing.invoicesEmail = "";
      newThing.sageId = "";
      newThing.paymentTerms = "";
      Details.removeFieldErrors(errors, [
        "invoicesEmail",
        "sageId",
        "paymentTerms",
      ]);
    }
  }

  render() {
    const { justSaved, changesToSave, spinner, dvdCustomer } = this.state;
    return (
      <>
        <div className="handy-component">
          <h1>DVD Customer Details</h1>
          <div className="white-box">
            <div className="row">
              {Details.renderField.bind(this)({
                columnWidth: 6,
                entity: "dvdCustomer",
                property: "name",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 3,
                entity: "dvdCustomer",
                property: "discount",
                columnHeader: "Discount or Price/Unit",
              })}
              {Details.renderSwitch.bind(this)({
                columnWidth: 2,
                entity: "dvdCustomer",
                property: "consignment",
              })}
            </div>
            <div
              className={
                "row" + (this.state.dvdCustomer.consignment ? " hidden" : "")
              }
            >
              {Details.renderField.bind(this)({
                columnWidth: 6,
                entity: "dvdCustomer",
                property: "invoicesEmail",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 3,
                entity: "dvdCustomer",
                property: "sageId",
                columnHeader: "Sage ID",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 3,
                entity: "dvdCustomer",
                property: "paymentTerms",
                columnHeader: "Payment Terms (in days)",
              })}
            </div>
            <div className={"row" + (dvdCustomer.consignment ? " hidden" : "")}>
              {Details.renderField.bind(this)({
                columnWidth: 6,
                entity: "dvdCustomer",
                property: "creditMemoEmail",
                columnHeader: "Credit Memos Email",
              })}
              {dvdCustomer.stripeId ? (
                <>
                  {Details.renderField.bind(this)({
                    columnWidth: 3,
                    entity: "dvdCustomer",
                    property: "stripeId",
                    columnHeader: "Stripe ID",
                    readOnly: true,
                    linkText: "View in Stripe",
                    linkUrl: `https://dashboard.stripe.com/customers/${dvdCustomer.stripeId}`,
                  })}
                  {Details.renderSwitch.bind(this)({
                    columnWidth: 3,
                    entity: "dvdCustomer",
                    property: "useStripe",
                    columnHeader: "Use Stripe",
                    visible: dvdCustomer.stripeId,
                  })}
                </>
              ) : (
                <div className="col-xs-3">
                  <Button
                    style={{ marginTop: 28, paddingTop: 14, paddingBottom: 14 }}
                    onClick={() => console.log("create stripe customer")}
                    text="Create Stripe Customer"
                  />
                </div>
              )}
            </div>
            <hr />
            <p className="section-header">Billing Address</p>
            <div className="row">
              {Details.renderField.bind(this)({
                columnWidth: 4,
                entity: "dvdCustomer",
                property: "billingName",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 4,
                entity: "dvdCustomer",
                property: "address1",
                columnHeader: "Address 1",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 4,
                entity: "dvdCustomer",
                property: "address2",
                columnHeader: "Address 2",
              })}
            </div>
            <div className="row">
              {Details.renderField.bind(this)({
                columnWidth: 3,
                entity: "dvdCustomer",
                property: "city",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 1,
                entity: "dvdCustomer",
                property: "state",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 2,
                entity: "dvdCustomer",
                property: "zip",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 2,
                entity: "dvdCustomer",
                property: "country",
              })}
            </div>
            <hr />
            <div className="row">
              {Details.renderSwitch.bind(this)({
                columnWidth: 3,
                entity: "dvdCustomer",
                property: "includeInTitleReport",
                columnHeader: "Include in New Titles Report",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 3,
                entity: "dvdCustomer",
                property: "nickname",
              })}
              {Details.renderField.bind(this)({
                type: "textbox",
                columnWidth: 6,
                entity: "dvdCustomer",
                property: "notes",
                rows: 5,
              })}
            </div>
            <BottomButtons
              entityName="dvdCustomer"
              confirmDelete={Details.confirmDelete.bind(this)}
              justSaved={justSaved}
              changesToSave={changesToSave}
              disabled={spinner}
              clickSave={() => {
                this.clickSave();
              }}
            />
            <GrayedOut visible={spinner} />
            <Spinner visible={spinner} />
          </div>
        </div>
      </>
    );
  }
}
