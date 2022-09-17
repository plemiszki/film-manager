import React from 'react'
import { Common, Details, convertObjectKeysToUnderscore, getCsrfToken } from 'handy-components'

export default class NewInvoice extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rows: []
    };
  }

  componentDidMount() {
    const { editMode, invoiceToEdit } = this.props;
    let result = [];
    this.props.rows.forEach((row) => {
      if (editMode) {
        const sentRow = invoiceToEdit.rows.find(sentRow => sentRow.label === row.label);
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
        sentRow = invoiceToEdit.rows.find(sentRow => sentRow.label === `Payment (${payment.date})`);
      }
      result.push({
        payment: true,
        active: editMode && sentRow ? true : false,
        label: `Payment (${payment.date})`,
        amount: payment.amount
      });
    });
    this.setState({
      rows: result
    });
  }

  flipSwitch(index) {
    let { rows } = this.state;
    rows[index].active = !rows[index].active;
    this.setState({
      rows
    });
  }

  clickSend(editMode) {
    this.setState({
      fetching: true
    });
    fetch(`/api/invoices/${editMode ? this.props.invoiceToEdit.number : ''}`, {
      method: (editMode ? 'PATCH' : 'POST'),
      headers: {
        'x-csrf-token': getCsrfToken(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(convertObjectKeysToUnderscore({
        bookingId: this.props.bookingId,
        bookingType: 'virtualBooking',
        rows: this.convertAndFilterRows(this.state.rows)
      }))
    }).then((response) => response.json()).then((response) => {
      const { invoices } = response;
      this.props.callback(invoices);
    });
  }

  convertAndFilterRows(rows) {
    const activeRows = rows.filter(row => row.active);
    return activeRows.map((row) => {
      row = Details.removeFinanceSymbolsFromEntity({ entity: row, fields: ['amount'] });
      row = convertObjectKeysToUnderscore(row);
      if (row.payment) {
        row.amount = row.amount * -1;
      }
      return row;
    });
  }

  render() {
    const { editMode } = this.props;
    return(
      <>
        <div className="component admin-modal new-invoice">
          <div className="white-box">
            { this.renderRows() }
            <div className="button-container">
              <a className={ "btn blue-button" + this.renderDisabledButtonClass() } onClick={ this.clickSend.bind(this, editMode) }>
                { editMode ? 'Resend' : 'Send' } Invoice
              </a>
            </div>
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            { Common.renderSpinner(this.state.fetching) }
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
    const { editMode } = this.props;
    return this.state.rows.map((row, index) => {
      const amount = (row.payment ? `(${row.amount})` : row.amount );
      return(
        <React.Fragment key={ index }>
          <div>
            <div className="switch-container">
              { Common.renderSwitchComponent({
                checked: row.active,
                onChange: this.flipSwitch.bind(this, index)
              }) }
            </div>
            <p className={ row.active ? '' : 'disabled' }>
              { row.label } - { row.sentAmount ? `${row.sentAmount} → ` : null }{ amount }
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
              font-family: 'TeachableSans-SemiBold';
              color: #2C2F33;
            }
            p.disabled {
              color: gray;
            }
          `}</style>
        </React.Fragment>
      );
    });
  }

  renderDisabledButtonClass() {
    const disabledClass = ' disabled';
    if (this.state.fetching) {
      return disabledClass;
    }
    const sufficientActiveRows = this.state.rows.filter((row) => row.active && row.sufficient);
    if (sufficientActiveRows.length === 0) {
      return disabledClass;
    }
    return '';
  }
}
