import React from "react";
import {
  Common,
  Details,
  convertObjectKeysToUnderscore,
  Button,
  Spinner,
  GrayedOut,
} from "handy-components";

export default class NewInvoice extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rows: [],
    };
  }

  componentDidMount() {
    const { editMode, invoiceToEdit } = this.props;
    let result = [];
    this.props.rows.forEach((row) => {
      if (editMode) {
        const sentRow = invoiceToEdit.rows.find(
          (sentRow) => sentRow.label === row.label,
        );
        if (sentRow) {
          row.active = true;
          row.sentAmount = sentRow.amount;
        } else {
          row.active = false;
        }
      }
      result.push(row);
    });
    this.props.payments.forEach((payment) => {
      let sentRow;
      if (editMode) {
        sentRow = invoiceToEdit.rows.find(
          (sentRow) => sentRow.label === `Payment (${payment.date})`,
        );
      }
      result.push({
        payment: true,
        active: editMode && sentRow ? true : false,
        label: `Payment (${payment.date})`,
        amount: payment.amount,
      });
    });
    this.setState({
      rows: result,
    });
  }

  flipSwitch(index) {
    let { rows } = this.state;
    rows[index].active = !rows[index].active;
    this.setState({
      rows,
    });
  }

  clickSend(editMode) {
    const { bookingId, bookingType, invoiceToEdit } = this.props;
    const { rows } = this.state;
    this.props.callback({
      editMode,
      invoiceToEdit,
      bookingId,
      bookingType,
      rows: this.convertAndFilterRows(rows),
    });
  }

  convertAndFilterRows(rows) {
    const activeRows = rows.filter((row) => row.active);
    return activeRows.map((row) => {
      row = Details.removeFinanceSymbolsFromEntity({
        entity: row,
        fields: ["amount"],
      });
      row = convertObjectKeysToUnderscore(row);
      if (row.payment) {
        row.amount = row.amount * -1;
      }
      return row;
    });
  }

  render() {
    const { editMode, bookingEmail } = this.props;
    const { spinner } = this.state;
    return (
      <>
        <div className="handy-component admin-modal">
          <div className="white-box">
            {this.renderRows()}
            <div className="button-container">
              <Button
                disabled={
                  spinner || this.insufficientInvoiceRows() || !bookingEmail
                }
                disabledTooltip={
                  bookingEmail
                    ? null
                    : "Invoices cannot be sent without an email address for the booking."
                }
                onClick={() => {
                  this.clickSend(editMode);
                }}
                text={`${editMode ? "Resend" : "Send"} Invoice`}
              />
            </div>
            <Spinner visible={spinner} />
            <GrayedOut visible={spinner} />
          </div>
        </div>
        <style jsx>{`
          .button-container {
            text-align: center;
          }
        `}</style>
      </>
    );
  }

  renderRows() {
    return this.state.rows.map((row, index) => {
      const amount = row.payment ? `(${row.amount})` : row.amount;
      return (
        <React.Fragment key={index}>
          <div>
            <div className="switch-container">
              {Common.renderSwitchComponent({
                checked: row.active,
                onChange: this.flipSwitch.bind(this, index),
                testLabel: `switch-${index}`,
                readOnly: row.disabled,
              })}
            </div>
            <p className={row.active ? "" : "disabled"}>
              {row.label} - {row.sentAmount ? `${row.sentAmount} → ` : null}
              {amount}
            </p>
          </div>
          <style jsx>{`
            .switch-container {
              display: inline-block;
              margin-right: 20px;
              margin-bottom: 20px;
            }
            p {
              display: inline-block;
              font-family: "TeachableSans-SemiBold";
              color: #2c2f33;
            }
            p.disabled {
              color: gray;
            }
          `}</style>
        </React.Fragment>
      );
    });
  }

  insufficientInvoiceRows() {
    const sufficientActiveRows = this.state.rows.filter(
      (row) => row.active && row.sufficient,
    );
    return sufficientActiveRows.length === 0;
  }
}
