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

function OptionButton({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? "#7B8A98" : "#FFFFFF",
        color: selected ? "#FFFFFF" : "#5F5F5F",
        border: selected ? "1px solid #7B8A98" : "1px solid #D1D1D1",
        borderRadius: 5,
        padding: "6px 16px",
        cursor: "pointer",
        fontSize: 14,
      }}
    >
      {label}
    </button>
  );
}

export default class EmailsIndex extends Component {
  constructor(props) {
    super(props);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3) + 1;
    const previousQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
    const quarterYear =
      currentQuarter === 1
        ? currentDate.getFullYear() - 1
        : currentDate.getFullYear();
    this.state = {
      spinner: true,
      emails: [],
      licensorEmailAddresses: [],
      sendModalOpen: false,
      job: {},
      jobModalOpen: false,
      sendOptions: {
        quarter: previousQuarter,
        year: quarterYear,
      },
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
        licensorEmailAddresses: response.licensorEmailAddresses || [],
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
    const { licensorId } = this.props;
    const { spinner, emails, licensorEmailAddresses, sendModalOpen, job } =
      this.state;

    return (
      <div className="handy-component">
        <h1>Emails</h1>
        {this.props.sendReportButton && (
          <Button
            float
            text={`Email Report${licensorId ? "s" : ""}`}
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
              height:
                140 +
                licensorEmailAddresses.length * 30 +
                (licensorId ? 120 : 0),
              border: "solid 1px #5F5F5F",
              borderRadius: "6px",
              textAlign: "center",
              color: "#5F5F5F",
              padding: "20px",
            },
          }}
        >
          <h1 className="send-email-modal-header" style={{ marginBottom: 15 }}>
            {`Send report${licensorId ? "s" : ""} to ${licensorEmailAddresses.length > 1 ? "these email addresses" : "this email address"}?`}
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
          {licensorId && (
            <div
              style={{
                marginTop: 15,
                marginBottom: 5,
                border: "1px solid #D1D1D1",
                borderRadius: 8,
                padding: 15,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                {[1, 2, 3, 4].map((q) => (
                  <OptionButton
                    key={q}
                    label={`Q${q}`}
                    selected={this.state.sendOptions.quarter === q}
                    onClick={() => {
                      const sendOptions = this.state.sendOptions;
                      sendOptions.quarter = q;
                      this.setState({ sendOptions });
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const y = new Date().getFullYear() - i;
                  return (
                    <OptionButton
                      key={y}
                      label={y}
                      selected={this.state.sendOptions.year === y}
                      onClick={() => {
                        const sendOptions = this.state.sendOptions;
                        sendOptions.year = y;
                        this.setState({ sendOptions });
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
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
