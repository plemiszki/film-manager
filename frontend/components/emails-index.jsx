import React, { Component } from "react";
import { Table, Spinner, GrayedOut } from "handy-components";

const STATIC_EMAILS = [
  {
    id: 1,
    emailType: "Statement",
    sentAt: "2025-01-15 10:30:00",
    sentBy: "Michael Rosenberg",
    status: "delivered",
  },
  {
    id: 2,
    emailType: "Statement",
    sentAt: "2025-01-15 10:31:00",
    sentBy: "Michael Rosenberg",
    status: "delivered",
  },
  {
    id: 3,
    emailType: "Statement",
    sentAt: "2025-01-15 10:32:00",
    sentBy: "Michael Rosenberg",
    status: "pending",
  },
  {
    id: 4,
    emailType: "Statement",
    sentAt: "2025-01-15 10:33:00",
    sentBy: "Michael Rosenberg",
    status: "failed",
  },
  {
    id: 5,
    emailType: "Statement",
    sentAt: "2025-01-15 10:34:00",
    sentBy: "Michael Rosenberg",
    status: "bounced",
  },
];

export default class EmailsIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spinner: false,
      emails: STATIC_EMAILS,
    };
  }

  render() {
    const { spinner, emails } = this.state;

    return (
      <div className="handy-component">
        <h1>Emails</h1>
        <div className="white-box">
          <Table
            rows={emails}
            columns={[
              { name: "emailType", header: "Type" },
              { name: "sentAt", header: "Sent At" },
              { name: "sentBy", header: "Sent By" },
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
      </div>
    );
  }
}
