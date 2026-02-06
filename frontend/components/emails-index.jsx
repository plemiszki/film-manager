import React, { Component } from "react";
import Modal from "react-modal";
import {
  Table,
  Spinner,
  GrayedOut,
  fetchEntities,
  sendRequest,
  Button,
  Common,
} from "handy-components";

export default class EmailsIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spinner: true,
      emails: [],
      licensorEmailAddresses: [],
      sendModalOpen: false,
      job: {},
      jobModalOpen: false,
    };
  }

  componentDidMount() {
    this.fetchEmails();
  }

  fetchEmails() {
    const { reportId, licensorId } = this.props;
    const data = {};
    if (reportId) data.reportId = reportId;
    if (licensorId) data.licensorId = licensorId;
    fetchEntities({
      directory: "emails",
      data: Object.keys(data).length > 0 ? data : null,
    }).then((response) => {
      this.setState({
        spinner: false,
        emails: response.emails,
        licensorEmailAddresses: response.licensorEmailAddresses,
      });
    });
  }

  clickSend() {
    const { reportId } = this.props;
    this.setState({ sendModalOpen: false, spinner: true });
    sendRequest(`/api/royalty_reports/${reportId}/send`, {
      method: "POST",
    }).then((response) => {
      this.setState({
        spinner: false,
        job: response.job,
        jobModalOpen: true,
      });
    });
  }

  componentDidUpdate() {
    Common.updateJobModal.call(this, {
      successCallback: () => {
        this.fetchEmails();
      },
    });
  }

  render() {
    const { spinner, emails, licensorEmailAddresses, sendModalOpen, job } =
      this.state;

    return (
      <div className="handy-component">
        <h1>Emails</h1>
        {this.props.sendReportButton && (
          <Button
            float
            text="Email Report"
            style={{ marginLeft: 20 }}
            onClick={() => this.setState({ sendModalOpen: true })}
          />
        )}
        <div className="white-box">
          <Table
            rows={emails}
            columns={[
              { name: "description", header: "Description" },
              { name: "sentBy", header: "Sent By" },
              { name: "sentTo", header: "Sent To" },
              { name: "sentAt", header: "Sent At" },
              {
                name: "status",
                header: "Status",
                displayFunction: (email) => {
                  const statusStyles = {
                    delivered: { color: "green" },
                    pending: { color: "orange" },
                    failed: { color: "red" },
                    bounced: { color: "red" },
                  };
                  const titleCase = (str) =>
                    str.charAt(0).toUpperCase() + str.slice(1);
                  return (
                    <span style={statusStyles[email.status] || {}}>
                      {titleCase(email.status)}
                    </span>
                  );
                },
              },
            ]}
            links={false}
            sortable={false}
          />
          <Spinner visible={spinner} />
          <GrayedOut visible={spinner} />
        </div>
        <Modal
          isOpen={sendModalOpen}
          onRequestClose={() => this.setState({ sendModalOpen: false })}
          contentLabel="Modal"
          style={{
            overlay: { background: "rgba(0, 0, 0, 0.50)" },
            content: {
              background: "#FFFFFF",
              margin: "auto",
              maxWidth: 500,
              height: 140 + licensorEmailAddresses.length * 30,
              border: "solid 1px #5F5F5F",
              borderRadius: "6px",
              textAlign: "center",
              color: "#5F5F5F",
              padding: "20px",
            },
          }}
        >
          <h1 className="send-email-modal-header" style={{ marginBottom: 15 }}>
            {`Send report to ${licensorEmailAddresses.length > 1 ? "these email addresses" : "this email address"}?`}
          </h1>
          {licensorEmailAddresses.map((email, index) => (
            <p
              key={index}
              style={{
                margin: 5,
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              {email}
            </p>
          ))}
          <div style={{ marginTop: 20 }}>
            <Button
              text="Send"
              onClick={() => this.clickSend()}
              style={{ marginRight: 30 }}
            />
            <Button
              text="Cancel"
              gray
              onClick={() => this.setState({ sendModalOpen: false })}
            />
          </div>
        </Modal>
        {Common.renderJobModal.call(this, job)}
        <style jsx>{`
          h1.send-email-modal-header {
            color: #2c2f33;
            font-family: "TeachableSans-SemiBold";
            font-size: 20px;
            line-height: 27px;
            margin-bottom: 20px;
          }
        `}</style>
      </div>
    );
  }
}
