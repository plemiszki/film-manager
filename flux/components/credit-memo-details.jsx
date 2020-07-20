import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import { fetchEntity, updateEntity, deleteEntity } from '../actions/index'
import FM from '../../app/assets/javascripts/me/common.jsx'

class CreditMemoDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      creditMemo: {},
      rows: []
    };
  }

  componentDidMount() {
    this.props.fetchEntity({
      directory: 'credit_memos',
      id: window.location.pathname.split('/')[2]
    }).then(() => {
      this.setState({
        fetching: false,
        creditMemo: this.props.creditMemo,
        rows: this.props.rows
      });
    });
  }

  clickExport() {
    window.location.pathname = `api/credit_memos/${this.state.creditMemo.id}/export`;
  }

  render() {
    return(
      <div id="creditMemo-details">
        <div className="component">
          <h1>Credit Memo Details</h1>
          <div className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
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
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntity, updateEntity, deleteEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CreditMemoDetails);
