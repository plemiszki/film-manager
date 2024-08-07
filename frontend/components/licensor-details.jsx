import React from "react";
import {
  Details,
  deepCopy,
  fetchEntity,
  updateEntity,
  Table,
  BottomButtons,
  GrayedOut,
  Spinner,
} from "handy-components";

export default class LicensorDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spinner: true,
      licensor: {},
      licensorSaved: {},
      films: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { licensor, films } = response;
      this.setState({
        spinner: false,
        licensor,
        licensorSaved: deepCopy(licensor),
        films,
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
        updateEntity({
          entityName: "licensor",
          entity: this.state.licensor,
        }).then(
          (response) => {
            const { licensor } = response;
            this.setState({
              spinner: false,
              licensor,
              licensorSaved: deepCopy(licensor),
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

  redirect(id) {
    window.location.pathname = "films/" + id;
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(
      this.state.licensor,
      this.state.licensorSaved,
    );
  }

  changeFieldArgs() {
    return {
      changesFunction: this.checkForChanges.bind(this),
    };
  }

  render() {
    const { justSaved, changesToSave, spinner } = this.state;
    return (
      <div className="licensor-details">
        <div className="handy-component">
          <h1>Licensor Details</h1>
          <div className="white-box">
            <div className="row">
              {Details.renderField.bind(this)({
                columnWidth: 4,
                entity: "licensor",
                property: "name",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 5,
                entity: "licensor",
                property: "email",
                columnHeader: "Royalty Emails",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 3,
                entity: "licensor",
                property: "sageId",
                columnHeader: "Sage ID",
              })}
            </div>
            <div className="row">
              {Details.renderField.bind(this)({
                type: "textbox",
                columnWidth: 12,
                entity: "licensor",
                property: "address",
                rows: 5,
              })}
            </div>
            <div className="row">
              <div className="col-xs-12">
                <Table
                  style={{ marginBottom: 30 }}
                  columns={["title"]}
                  rows={this.state.films}
                  urlPrefix="films"
                  sortable={false}
                />
              </div>
            </div>
            <hr />
            <BottomButtons
              entityName="licensor"
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
      </div>
    );
  }
}
