import React from 'react';
import { fetchEntity, GrayedOut, Spinner, Table, Button } from 'handy-components';

export default class CreditMemoDetails extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      spinner: true,
      creditMemo: {},
      rows: [],
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      this.setState({
        spinner: false,
        creditMemo: response.creditMemo,
        rows: response.rows,
      });
    });
  }

  clickExport() {
    window.location.pathname = `credit_memos/${this.state.creditMemo.id}/export`;
  }

  render() {
    const { spinner, creditMemo, rows } = this.state;
    return (
      <>
        <div className="handy-component">
          <h1>Credit Memo Details</h1>
          <div className="white-box">
            <div className="row">
              <div className="col-xs-2">
                <h2>Number</h2>
                { creditMemo.number }
              </div>
              <div className="col-xs-2">
                <h2>Sent Date</h2>
                { creditMemo.sentDate }
              </div>
              <div className="col-xs-2">
                <h2>Return Number</h2>
                { creditMemo.returnNumber }
              </div>
              <div className="col-xs-4">
                <h2>DVD Customer</h2>
                { creditMemo.customerName }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-4">
                <h2>Billing Address</h2>
                <p>{ creditMemo.billingName }</p>
                <p>{ creditMemo.billingAddress1 }</p>
                <p>{ creditMemo.billingAddress2 }</p>
                <p>{ creditMemo.billingCity }, { creditMemo.billingState } { creditMemo.billingZip }</p>
                <p>{ creditMemo.billingCountry === 'USA' ? '' : creditMemo.billingCountry }</p>
              </div>
            </div>
            <hr />
            <Table
              rows={ rows }
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
                { creditMemo.total }
              </div>
            </div>
            <Button
              text="Export"
              onClick={ () => { this.clickExport(); } }
              disabled={ spinner }
            />
            <GrayedOut visible={ spinner } />
            <Spinner visible={ spinner } />
          </div>
        </div>
        <style jsx>{`
          .row, table { margin-bottom: 30px; }
        `}</style>
      </>
    );
  }
}
