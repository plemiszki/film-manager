import React from 'react'
import Modal from 'react-modal'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ChangeCase from 'change-case'
import { Common, Details } from 'handy-components'
import HandyTools from 'handy-tools'
import { createEntity, sendRequest } from '../actions/index'
import FM from '../../app/assets/javascripts/me/common.jsx'

class NewInvoice extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rows: []
    };
  }

  componentDidMount() {
    let result = [];
    this.props.rows.forEach((row) => {
      result.push(row);
    });
    this.props.payments.forEach((payment) => {
      result.push({
        active: false,
        label: `Payment (${payment.date}) - (${payment.amount})`
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

  clickSend() {
    this.setState({
      fetching: true
    });
    this.props.sendRequest({
      url: '/api/invoices',
      method: 'post',
      json: true,
      data: {
        bookingId: this.props.virtualBooking.id,
        bookingType: 'virtualBooking',
        rows: this.state.rows
      }
    }).then(() => {
      this.props.callback(this.props.invoices);
    });
  }

  render() {
    return(
      <>
        <div className="component admin-modal">
          <div className="white-box">
            { this.renderRows() }
            <div className="button-container">
              <a className={ "btn blue-button" + this.renderDisabledButtonClass() } onClick={ this.clickSend.bind(this) }>
                Send Invoice
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
    return this.state.rows.map((row, index) => {
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
              { row.label }
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

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createEntity, sendRequest }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(NewInvoice);
