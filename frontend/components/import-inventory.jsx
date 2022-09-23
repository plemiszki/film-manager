import React from 'react'
import { Common, sendRequest } from 'handy-components'

export default class ImportInventory extends React.Component {

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
    sendRequest('/api/purchase_orders/check_jobs').then((response) => {
      let { needToUpdate, job } = response;
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
