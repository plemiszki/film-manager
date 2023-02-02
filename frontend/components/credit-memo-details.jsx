import React from 'react'
import { Common, fetchEntity, GrayedOut, Spinner, Table } from 'handy-components'

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
    const { fetching } = this.state;
    return (
      <>
        <div className="handy-component">
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
            <Table
              rows={ this.state.rows }
              columns={[
                { name: 'label', header: 'Item' },
                { name: 'price' },
                { name: 'qty' },
                { name: 'totalPrice'},
              ]}
              links={ false }
              sortable={ false }
              marginBottom
            />
            <hr />
            <div className="row">
              <div className="col-xs-12">
                <h2>Total</h2>
                { this.state.creditMemo.total }
              </div>
            </div>
            <a className={ "standard-button btn " + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickExport.bind(this) }>
              Export
            </a>
            <GrayedOut visible={ fetching } />
            <Spinner visible={ fetching } />
          </div>
        </div>
        <style jsx>{`
          .row, table { margin-bottom: 30px; }
        `}</style>
      </>
    );
  }
}
