import React from "react";
import {
  Details,
  deepCopy,
  fetchEntity,
  updateEntity,
  Spinner,
  GrayedOut,
  BottomButtons,
  objectsAreEqual,
  Table,
} from "handy-components";

export default class InstitutionDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spinner: true,
      errors: [],
      institution: {
        label: "",
      },
      orders: [],
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { institution, orders } = response;
      this.setState({
        spinner: false,
        institution,
        institutionSaved: deepCopy(institution),
        orders,
      });
    });
  }

  clickSave() {
    const { institution } = this.state;
    this.setState(
      {
        spinner: true,
        justSaved: true,
      },
      () => {
        updateEntity({
          entityName: "institution",
          entity: institution,
        }).then(
          (response) => {
            const { institution } = response;
            this.setState({
              spinner: false,
              institution,
              institutionSaved: deepCopy(institution),
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

  checkForChanges() {
    const { institution, institutionSaved } = this.state;
    return !objectsAreEqual(institution, institutionSaved);
  }

  changeFieldArgs() {
    return {
      changesFunction: this.checkForChanges.bind(this),
    };
  }

  render() {
    const { spinner, justSaved, changesToSave, orders } = this.state;
    return (
      <>
        <div className="handy-component">
          <h1>Educational Institution Details</h1>
          <div className="white-box">
            <div className="row">
              {Details.renderField.bind(this)({
                columnWidth: 9,
                entity: "institution",
                property: "label",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 3,
                entity: "institution",
                property: "sageId",
                columnHeader: "Sage ID",
              })}
            </div>
            <div className="row">
              {Details.renderField.bind(this)({
                columnWidth: 4,
                entity: "institution",
                property: "contactName",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 4,
                entity: "institution",
                property: "email",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 3,
                entity: "institution",
                property: "phone",
              })}
            </div>
            <hr />
            <div data-test-label="billing-address">
              <p className="section-header">Billing Address</p>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 4,
                  entity: "institution",
                  property: "billingName",
                  columnHeader: "Name",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 4,
                  entity: "institution",
                  property: "billingAddress1",
                  columnHeader: "Address 1",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 4,
                  entity: "institution",
                  property: "billingAddress2",
                  columnHeader: "Address 2",
                })}
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "institution",
                  property: "billingCity",
                  columnHeader: "City",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 1,
                  entity: "institution",
                  property: "billingState",
                  columnHeader: "State",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "institution",
                  property: "billingZip",
                  columnHeader: "Zip",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "institution",
                  property: "billingCountry",
                  columnHeader: "Country",
                })}
              </div>
            </div>
            <hr />
            <div data-test-label="shipping-address">
              <p className="section-header">Shipping Address</p>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 4,
                  entity: "institution",
                  property: "shippingName",
                  columnHeader: "Name",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 4,
                  entity: "institution",
                  property: "shippingAddress1",
                  columnHeader: "Address 1",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 4,
                  entity: "institution",
                  property: "shippingAddress2",
                  columnHeader: "Address 2",
                })}
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "institution",
                  property: "shippingCity",
                  columnHeader: "City",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 1,
                  entity: "institution",
                  property: "shippingState",
                  columnHeader: "State",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "institution",
                  property: "shippingZip",
                  columnHeader: "Zip",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "institution",
                  property: "shippingCountry",
                  columnHeader: "Country",
                })}
              </div>
            </div>
            <hr />
            <div className="row">
              {Details.renderField.bind(this)({
                type: "textbox",
                columnWidth: 12,
                entity: "institution",
                property: "notes",
                rows: 5,
              })}
            </div>
            <BottomButtons
              entityName="institution"
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
        <div className="handy-component">
          <h1>Orders</h1>
          <div className="white-box">
            <GrayedOut visible={spinner} />
            <Spinner visible={spinner} />
            <div className="row">
              <div className="col-xs-12">
                <Table
                  columns={[
                    {
                      name: "orderDate",
                      date: true,
                    },
                    { name: "number" },
                  ]}
                  rows={orders}
                  urlPrefix="institution_orders"
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
