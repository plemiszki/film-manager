import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { sendRequest } from '../actions/index'
import { Common } from 'handy-components'

class ImportInventory extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      errorsModalOpen: false,
      noErrorsModalOpen: false,
      jobModalOpen: false,
      checkedJobs: false
    };
  }

  componentDidMount() {
    $('#upload-form-inventory #user_file').on('change', this.pickFile);
    this.props.sendRequest({
      url: '/api/purchase_orders/check_jobs',
      method: 'get'
    }).then(() => {
      let { needToUpdate, job } = this.props;
      this.setState({
        needToUpdate,
        job,
        jobModalOpen: !!job
      });
    });
  }

  componentDidUpdate() {
    Common.updateJobModal.call(this);
  }

  clickUpdateStock() {
    $('#upload-form-inventory #user_file').click();
  }

  pickFile() {
    $('#upload-form-inventory #submit-button-inventory').click();
  }

  render() {
    return(
      <>
        <div id="import-inventory" className="component">
          <a className="orange-button" onClick={ this.clickUpdateStock.bind(this) }>
            <img className={ this.state.needToUpdate ? "" : "hidden" } src={ Images.attention } />
            Update Stock
          </a>
          { Common.renderJobModal.call(this, this.state.job) }
        </div>
        <style jsx>{`
          a {
            position: relative;
            margin-right: 20px;
          }
          a img {
            position: absolute;
            top: -8px;
            right: -8px;
            width: 30px;
            height: 30px;
          }
        `}</style>
      </>
    );
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ sendRequest }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportInventory);
