import React from "react";
import {
  Button,
  Common,
  Details,
  deepCopy,
  fetchEntity,
  updateEntity,
  Table,
  BottomButtons,
  GrayedOut,
  Spinner,
  sendRequest,
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

  componentDidUpdate() {
    Common.updateJobModal.call(this);
  }

  clickSave() {
    this.setState({ spinner: true, justSaved: true }, () => {
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
          this.setState({ spinner: false, errors: response.errors });
        },
      );
    });
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
    return { changesFunction: this.checkForChanges.bind(this) };
  }

  generateStatementsSummary() {
    const { licensor } = this.state;
    this.setState({
      jobModalOpen: true,
      job: { firstLine: "Generating Statements Summary" },
    });
    sendRequest(
      `/api/licensors/${licensor.id}/generate_statements_summary`,
    ).then((response) => {
      const { job } = response;
      this.setState({ job });
    });
  }

  render() {
    const { justSaved, changesToSave, spinner, job } = this.state;
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
            >
              <Button
                float
                marginRight
                text="Statements Summary"
                onClick={() => this.generateStatementsSummary()}
                disabled={spinner}
              />
            </BottomButtons>
            <GrayedOut visible={spinner} />
            <Spinner visible={spinner} />
          </div>
        </div>
        {Common.renderJobModal.call(this, job)}
      </div>
    );
  }
}
