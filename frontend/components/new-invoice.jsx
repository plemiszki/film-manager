import React from 'react'
import { Common, Details, convertObjectKeysToUnderscore, sendRequest, Button, Spinner, GrayedOut } from 'handy-components'

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
    console.log(invoiceToEdit);
    console.log(editMode);
    this.props.rows.forEach((row) => {
      console.log(row);
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
    const { bookingId, bookingType, invoiceToEdit } = this.props;
    const { rows } = this.state;
    this.setState({
      fetching: true
    });
    sendRequest(`/api/invoices/${editMode ? invoiceToEdit.number : ''}`, {
      method: (editMode ? 'PATCH' : 'POST'),
      data: {
        bookingId,
        bookingType,
        rows: this.convertAndFilterRows(rows),
      }
    }).then((response) => {
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
    const { fetching } = this.state;
    return (
      <>
        <div className="handy-component admin-modal">
          <div className="white-box">
            { this.renderRows() }
            <div className="button-container">
              <Button
                disabled={ fetching || this.insufficientInvoiceRows() }
                onClick={ () => { this.clickSend(editMode) } }
                text={ `${ editMode ? 'Resend' : 'Send' } Invoice` }
              />
            </div>
            <Spinner visible={ fetching } />
            <GrayedOut visible={ fetching } />
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
      return (
        <React.Fragment key={ index }>
          <div>
            <div className="switch-container">
              { Common.renderSwitchComponent({
                checked: row.active,
                onChange: this.flipSwitch.bind(this, index),
                testLabel: `switch-${index}`,
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

  insufficientInvoiceRows() {
    const sufficientActiveRows = this.state.rows.filter((row) => row.active && row.sufficient);
    return sufficientActiveRows.length === 0;
  }
}
