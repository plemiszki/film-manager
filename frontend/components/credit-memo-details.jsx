import React from 'react'
import { Common, fetchEntity } from 'handy-components'

export default class CreditMemoDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      creditMemo: {},
      rows: []
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      this.setState({
        fetching: false,
        creditMemo: response.creditMemo,
        rows: response.rows
      });
    });
  }

  clickExport() {
    window.location.pathname = `credit_memos/${this.state.creditMemo.id}/export`;
  }

  render() {
    return(
      <div id="credit-memo-details">
        <div className="component">
          <h1>Credit Memo Details</h1>
          <div className="white-box">
            <div className="row">
              <div className="col-xs-2">
                <h2>Number</h2>
                { this.state.creditMemo.number }
              </div>
              <div className="col-xs-2">
                <h2>Sent Date</h2>
                { this.state.creditMemo.sentDate }
              </div>
              <div className="col-xs-2">
                <h2>Return Number</h2>
                { this.state.creditMemo.returnNumber }
              </div>
              <div className="col-xs-4">
                <h2>DVD Customer</h2>
                { this.state.creditMemo.customerName }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-4">
                <h2>Billing Address</h2>
                <p>{ this.state.creditMemo.billingName }</p>
                <p>{ this.state.creditMemo.billingAddress1 }</p>
                <p>{ this.state.creditMemo.billingAddress2 }</p>
                <p>{ this.state.creditMemo.billingCity }, { this.state.creditMemo.billingState } { this.state.creditMemo.billingZip }</p>
                <p>{ this.state.creditMemo.billingCountry == 'USA' ? '' : this.state.creditMemo.billingCountry }</p>
              </div>
            </div>
            <hr />
            <table className="fm-admin-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total Price</th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td><td></td><td></td><td></td></tr>
                { this.state.rows.map((row, index) => {
                  return(
                    <tr key={ index }>
                      <td className="indent">
                        { row.label }
                      </td>
                      <td>
                        { row.price }
                      </td>
                      <td>
                        { row.qty }
                      </td>
                      <td>
                        { row.totalPrice }
                      </td>
                    </tr>
                  );
                }) }
              </tbody>
            </table>
            <hr />
            <div className="row">
              <div className="col-xs-12">
                <h2>Total</h2>
                { this.state.creditMemo.total }
              </div>
            </div>
            <a id="export" className={ "orange-button " + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickExport.bind(this) }>
              Export
            </a>
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          </div>
        </div>
      </div>
    );
  }
}
