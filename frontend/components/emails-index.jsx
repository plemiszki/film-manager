import React, { Component } from "react";
import { Table, Spinner, GrayedOut, fetchEntities } from "handy-components";

export default class EmailsIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spinner: true,
      emails: [],
    };
  }

  componentDidMount() {
    fetchEntities({ directory: "emails" }).then((response) => {
      this.setState({
        spinner: false,
        emails: response.emails,
      });
    });
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
