import React from "react";
import Modal from "react-modal";
import {
  BottomButtons,
  Button,
  Common,
  deepCopy,
  deleteEntity,
  Details,
  fetchEntity,
  GrayedOut,
  ModalMessage,
  objectsAreEqual,
  sendRequest,
  setUpNiceSelect,
  Spinner,
  Table,
  titleCase,
  updateEntity,
} from "handy-components";

const ShredderModalStyles = {
  overlay: {
    background: "rgba(0, 0, 0, 0.50)",
  },
  content: {
    background: "#FFFFFF",
    margin: "auto",
    maxWidth: 570,
    height: "273px",
    border: "solid 1px #5F5F5F",
    borderRadius: "6px",
    textAlign: "center",
    color: "#5F5F5F",
  },
};

const STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "PR",
];
const PROVINCES = [
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NS",
  "NT",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
];

const splitCityStateZipLine = (line) => {
  const commaSplit = line.split(",");
  const stateZipSplit = commaSplit[1].split(" ");
  return {
    city: titleCase(commaSplit[0]),
    state: stateZipSplit[1].toUpperCase(),
    zip: stateZipSplit[2],
  };
};

const splitAddress = (input) => {
  const result = {};
  let splitObj;
  const lines = input.split("\n");
  if (lines.length < 3 || lines.length > 4) {
    throw "Address must be 3 or 4 lines";
  } else {
    result.name = lines[0];
    result.address1 = lines[1];
    const cityStateRegEx = /^[\w\s]+, \w{2} [\w\d]+$/;
    if (lines[2].match(cityStateRegEx)) {
      splitObj = splitCityStateZipLine(lines[2]);
    } else if (lines[3] && lines[3].match(cityStateRegEx)) {
      result.address2 = lines[2];
      splitObj = splitCityStateZipLine(lines[3]);
    } else {
      throw 'Did not find "CITY, STATE/PROVINCE ZIP" on line 3 or 4';
    }
  }
  result.city = splitObj.city;
  result.state = splitObj.state;
  result.zip = splitObj.zip;
  if (STATES.indexOf(splitObj.state) > -1) {
    result.country = "USA";
  } else if (PROVINCES.indexOf(splitObj.state) > -1) {
    result.country = "Canada";
  } else {
    throw "State not recognized";
  }
  return result;
};

export default class VenueDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spinner: true,
      venue: {
        email: "",
      },
      venueSaved: {},
      bookings: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteError: {},
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { venue, bookings } = response;
      this.setState(
        {
          venue,
          venueSaved: deepCopy(venue),
          bookings,
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

  clickCopyAddress() {
    var venue = this.state.venue;
    venue["shippingName"] = this.state.venue.billingName;
    venue["shippingAddress1"] = this.state.venue.billingAddress1;
    venue["shippingAddress2"] = this.state.venue.billingAddress2;
    venue["shippingCity"] = this.state.venue.billingCity;
    venue["shippingState"] = this.state.venue.billingState;
    venue["shippingZip"] = this.state.venue.billingZip;
    venue["shippingCountry"] = this.state.venue.billingCountry;
    this.setState(
      {
        venue: venue,
      },
      () => {
        this.setState({
          changesToSave: this.checkForChanges(),
        });
      },
    );
  }

  clickSave() {
    this.setState(
      {
        spinner: true,
        justSaved: true,
      },
      () => {
        updateEntity({
          entityName: "venue",
          entity: this.state.venue,
        }).then(
          (response) => {
            const { venue } = response;
            this.setState({
              spinner: false,
              changesToSave: false,
              venue,
              venueSaved: deepCopy(venue),
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

  clickDelete() {
    this.setState({
      deleteModalOpen: true,
    });
  }

  confirmDelete() {
    this.setState(
      {
        spinner: true,
        deleteModalOpen: false,
      },
      () => {
        deleteEntity().then(
          () => {
            window.location.pathname = "/venues";
          },
          (response) => {
            this.setState({
              messageModalOpen: true,
              deleteError: response,
              spinner: false,
            });
          },
        );
      },
    );
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false,
      dvdsModalOpen: false,
      shredderModalOpen: false,
      messageModalOpen: false,
    });
  }

  checkForChanges() {
    return !objectsAreEqual(this.state.venue, this.state.venueSaved);
  }

  changeFieldArgs() {
    return {
      thing: "venue",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this),
    };
  }

  clickSplitAddress() {
    try {
      var result = splitAddress($(".shredder-modal textarea")[0].value);
      var venue = this.state.venue;
      venue[this.state.shredderModalAddress + "Name"] = result.name;
      venue[this.state.shredderModalAddress + "Address1"] = result.address1;
      venue[this.state.shredderModalAddress + "Address2"] =
        result.address2 || "";
      venue[this.state.shredderModalAddress + "City"] = result.city;
      venue[this.state.shredderModalAddress + "State"] = result.state;
      venue[this.state.shredderModalAddress + "Zip"] = result.zip;
      venue[this.state.shredderModalAddress + "Country"] = result.country;
      this.setState(
        {
          shredderModalOpen: false,
          venue: venue,
        },
        () => {
          this.setState({
            changesToSave: this.checkForChanges(),
          });
        },
      );
    } catch (e) {
      $(".shredder-modal textarea").addClass("error");
      $(".shredder-modal .error-message").text(e);
    }
  }

  clearShredderError() {
    $(".shredder-modal textarea").removeClass("error");
    $(".shredder-modal .error-message").text("");
  }

  redirect(directory, id) {
    window.location.pathname = directory + "/" + id;
  }

  createStripeCustomer() {
    const { venue } = this.state;
    this.setState({ spinner: true });
    sendRequest(`/api/venues/${venue.id}/create_in_stripe`, {
      method: "post",
    }).then((response) => {
      const { job } = response;
      this.setState({
        spinner: false,
        job,
        jobModalOpen: true,
      });
    });
  }

  render() {
    const { spinner, justSaved, changesToSave, venue, job } = this.state;
    return (
      <>
        <div>
          <div className="handy-component details-component">
            <h1>Venue Details</h1>
            <div className="white-box">
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: "venue",
                  property: "label",
                })}
                {Details.renderDropDown.bind(this)({
                  columnWidth: 3,
                  entity: "venue",
                  property: "venueType",
                  options: [
                    { value: "Theater", text: "Theater" },
                    { value: "Non-Theatrical", text: "Non-Theatrical" },
                    { value: "Festival", text: "Festival" },
                  ],
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "venue",
                  property: "sageId",
                  columnHeader: "Sage ID",
                })}
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 4,
                  entity: "venue",
                  property: "contactName",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 4,
                  entity: "venue",
                  property: "email",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "venue",
                  property: "phone",
                })}
              </div>
              <div className="row">
                {spinner ? null : venue.stripeId ? (
                  <>
                    {Details.renderField.bind(this)({
                      columnWidth: 3,
                      entity: "venue",
                      property: "stripeId",
                      columnHeader: "Stripe ID",
                      readOnly: true,
                      linkText: "View in Stripe",
                      linkUrl: `https://dashboard.stripe.com/customers/${venue.stripeId}`,
                      linkNewWindow: true,
                    })}
                    {Details.renderSwitch.bind(this)({
                      columnWidth: 3,
                      entity: "venue",
                      property: "useStripe",
                      columnHeader: "Use Stripe",
                      visible: venue.stripeId,
                    })}
                  </>
                ) : (
                  <div className="col-xs-3">
                    <Button
                      style={{ marginBottom: 30 }}
                      onClick={this.createStripeCustomer.bind(this)}
                      text="Create Stripe Customer"
                      disabled={changesToSave || venue.email.trim() === ""}
                    />
                  </div>
                )}
              </div>
              <hr />
              <div className="address-block">
                <img
                  src={Images.shredder}
                  onClick={() => {
                    this.setState({
                      shredderModalOpen: true,
                      shredderModalAddress: "billing",
                    });
                  }}
                />
                <p className="section-header">Billing Address</p>
                <div className="row">
                  {Details.renderField.bind(this)({
                    columnWidth: 4,
                    entity: "venue",
                    property: "billingName",
                    columnHeader: "Name",
                  })}
                  {Details.renderField.bind(this)({
                    columnWidth: 4,
                    entity: "venue",
                    property: "billingAddress1",
                    columnHeader: "Address 1",
                  })}
                  {Details.renderField.bind(this)({
                    columnWidth: 4,
                    entity: "venue",
                    property: "billingAddress2",
                    columnHeader: "Address 2",
                  })}
                </div>
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "venue",
                  property: "billingCity",
                  columnHeader: "City",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 1,
                  entity: "venue",
                  property: "billingState",
                  columnHeader: "State",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "venue",
                  property: "billingZip",
                  columnHeader: "Zip",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "venue",
                  property: "billingCountry",
                  columnHeader: "Country",
                })}
                <div className="col-xs-4">
                  <Button
                    text="Copy to Shipping Address"
                    onClick={() => {
                      this.clickCopyAddress();
                    }}
                    style={{
                      marginTop: "28px",
                    }}
                  />
                </div>
              </div>
              <hr />
              <div className="address-block">
                <img
                  src={Images.shredder}
                  onClick={() => {
                    this.setState({
                      shredderModalOpen: true,
                      shredderModalAddress: "shipping",
                    });
                  }}
                />
                <p className="section-header">Shipping Address</p>
                <div className="row">
                  {Details.renderField.bind(this)({
                    columnWidth: 4,
                    entity: "venue",
                    property: "shippingName",
                    columnHeader: "Name",
                  })}
                  {Details.renderField.bind(this)({
                    columnWidth: 4,
                    entity: "venue",
                    property: "shippingAddress1",
                    columnHeader: "Address 1",
                  })}
                  {Details.renderField.bind(this)({
                    columnWidth: 4,
                    entity: "venue",
                    property: "shippingAddress2",
                    columnHeader: "Address 2",
                  })}
                </div>
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "venue",
                  property: "shippingCity",
                  columnHeader: "City",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 1,
                  entity: "venue",
                  property: "shippingState",
                  columnHeader: "State",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "venue",
                  property: "shippingZip",
                  columnHeader: "Zip",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "venue",
                  property: "shippingCountry",
                  columnHeader: "Country",
                })}
              </div>
              <hr />
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 12,
                  entity: "venue",
                  property: "website",
                })}
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  type: "textbox",
                  columnWidth: 12,
                  entity: "venue",
                  property: "notes",
                  rows: 5,
                })}
              </div>
              <BottomButtons
                entityName="venue"
                confirmDelete={this.confirmDelete.bind(this)}
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
            <h1>Venue Bookings</h1>
            <div className="white-box">
              <GrayedOut visible={spinner} />
              <Spinner visible={spinner} />
              <div className="row">
                <div className="col-xs-12">
                  <Table
                    columns={[
                      {
                        name: "startDate",
                        date: true,
                      },
                      { name: "film" },
                      {
                        name: "totalGross",
                        displayFunction: (row) =>
                          row.valid ? row.totalGross : "Invalid",
                      },
                      {
                        name: "ourShare",
                        displayFunction: (row) =>
                          row.valid ? row.ourShare : "Invalid",
                      },
                      {
                        name: "received",
                        displayFunction: (row) =>
                          row.valid ? row.received : "Invalid",
                      },
                      {
                        name: "owed",
                        displayFunction: (row) =>
                          row.valid ? row.owed : "Invalid",
                      },
                    ]}
                    rows={this.state.bookings}
                    urlPrefix="bookings"
                  />
                </div>
              </div>
            </div>
          </div>
          <Modal
            isOpen={this.state.messageModalOpen}
            onRequestClose={this.closeModal.bind(this)}
            contentLabel="Modal"
            style={Common.messageModalStyles()}
          >
            <ModalMessage
              message={this.state.deleteError.message}
              memo={this.state.deleteError.memo}
            />
          </Modal>
          <Modal
            isOpen={this.state.shredderModalOpen}
            onRequestClose={this.closeModal.bind(this)}
            contentLabel="Modal"
            style={ShredderModalStyles}
          >
            <div className="shredder-modal handy-component admin-modal">
              <textarea
                onChange={this.clearShredderError.bind(this)}
              ></textarea>
              <div className="error-message"></div>
              <Button
                text="Split Address"
                onClick={this.clickSplitAddress.bind(this)}
              />
            </div>
          </Modal>
          {Common.renderJobModal.call(this, job)}
        </div>
        <style jsx>{`
          .address-block {
            position: relative;
          }
          img {
            position: absolute;
            cursor: pointer;
            width: 50px;
            height: 50px;
            top: -20px;
            right: -20px;
          }
          .shredder-modal textarea {
            height: 150px;
          }
          .shredder-modal .error-message {
            height: 18px;
            color: red;
            margin-bottom: 10px;
          }
        `}</style>
      </>
    );
  }

  componentDidUpdate() {
    Common.updateJobModal.call(this, {
      successCallback: (obj) => {
        const stripeId = obj.metadata.stripeId;
        const { venue } = this.state;
        venue.stripeId = stripeId;
        this.setState({ venue });
      },
    });
  }
}
