import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import ServerActions from '../actions/server-actions.js'
import ReturnsStore from '../stores/returns-store.js'
import NewThing from './new-thing.jsx'
import JobStore from '../stores/job-store.js'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

const ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 270
  }
};

const exportModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#FFFFFF',
    margin: 'auto',
    maxWidth: 540,
    height: 250,
    border: 'solid 1px black',
    borderRadius: '6px',
    color: '#5F5F5F',
    padding: '30px'
  }
};

class ReturnsIndex extends React.Component {

  constructor(props) {
    super(props)
    let job = {
      errors_text: ""
    };
    this.state = {
      fetching: true,
      searchText: "",
      sortBy: "date",
      returns: [],
      modalOpen: false,
      exportModalOpen: false,
      export: {
        startDate: HandyTools.stringifyDate(new Date),
        endDate: HandyTools.stringifyDate(new Date)
      },
      errors: [],
      jobModalOpen: !!job.id,
      job: job
    };
  }

  componentDidMount() {
    this.returnsListener = ReturnsStore.addListener(this.getReturns.bind(this));
    this.jobListener = JobStore.addListener(this.getJob.bind(this));
    ClientActions.fetchReturns();
  }

  componentWillUnmount() {
    this.returnsListener.remove();
    this.jobListener.remove();
  }

  getReturns() {
    this.setState({
      fetching: false,
      returns: ReturnsStore.all(),
      modalOpen: false
    });
  }

  getJob() {
    var job = JobStore.job();
    if (job.done) {
      this.setState({
        jobModalOpen: false,
        errorsModalOpen: job.errorsText !== "",
        job: job
      }, function() {
        if (job.errorsText === "") {
          window.location.href = job.firstLine;
        }
      });
    } else {
      this.setState({
        jobModalOpen: true,
        job: job,
        fetching: false
      });
    }
  }

  modalCloseAndRefresh() {
    this.setState({
      errorsModalOpen: false,
      noErrorsModalOpen: false,
      fetching: true
    }, function() {
      ClientActions.fetchPurchaseOrders();
    });
  }

  redirect(id) {
    window.location.pathname = "returns/" + id;
  }

  clickNew() {
    if (!this.state.fetching) {
      this.setState({ modalOpen: true });
    }
  }

  closeModal() {
    this.setState({
      modalOpen: false,
      exportModalOpen: false
    });
  }

  openExportModal() {
    if (!this.state.fetching) {
      this.setState({
        exportModalOpen: true
      });
    }
  }

  checkForChanges() {
    return true;
  }

  changeFieldArgs() {
    return {
      thing: "export",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  }

  clickExport() {
    this.setState({
      exportModalOpen: false,
      fetching: true
    });
    ClientActions.exportReturns(this.state.export.startDate, this.state.export.endDate);
  }

  render() {
    let filteredReturns = this.state.returns.filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="returns-index" className="component">
        <h1>DVD Returns</h1>
        <a className={ "orange-button float-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.openExportModal.bind(this) }>Export</a>
        <a className={ "orange-button float-button margin" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew.bind(this) }>Add New</a>
        <input className="search-box margin" onChange={ FM.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          <table className="fm-admin-table">
            <thead>
              <tr>
                <th><div className={ FM.sortClass.call(this, "date") } onClick={ FM.clickHeader.bind(this, "date") }>Date</div></th>
                <th><div className={ FM.sortClass.call(this, "number") } onClick={ FM.clickHeader.bind(this, "number") }>Number</div></th>
                <th><div className={ FM.sortClass.call(this, "customer") } onClick={ FM.clickHeader.bind(this, "customer") }>Customer</div></th>
                <th><div className={ FM.sortClass.call(this, "units") } onClick={ FM.clickHeader.bind(this, "units") }>Units</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { _.orderBy(filteredReturns, [FM.commonSort.bind(this)], [this.state.sortBy === 'date' ? 'desc' : 'asc']).map(function(r, index) {
                return(
                  <tr key={index} onClick={ this.redirect.bind(this, r.id) }>
                    <td className="indent">
                      { r.date }
                    </td>
                    <td>
                      { r.number }
                    </td>
                    <td>
                      { r.customer }
                    </td>
                    <td>
                      { r.units }
                    </td>
                  </tr>
                );
              }.bind(this))}
            </tbody>
          </table>
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="return" initialObject={ { number: "", date: "", customerId: ReturnsStore.customers()[0] ? ReturnsStore.customers()[0].id : "" } } />
        </Modal>
        <Modal isOpen={ this.state.exportModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ exportModalStyles }>
          <div className="export-modal">
            <div className="row">
              <div className="col-xs-6">
                <h2>Start Date</h2>
                <input value={ this.state.export.startDate } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="startDate" />
              </div>
              <div className="col-xs-6">
                <h2>End Date</h2>
                <input value={ this.state.export.endDate } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="endDate" />
              </div>
            </div>
            <div className="row button-row">
              <div className="col-xs-12">
                <a className="orange-button" onClick={ this.clickExport.bind(this) }>Export Returns</a>
              </div>
            </div>
          </div>
        </Modal>
        { FM.jobModal.call(this, this.state.job) }
      </div>
    );
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
    if (this.state.jobModalOpen) {
      window.setTimeout(() => {
        $.ajax({
          url: '/api/jobs/status',
          method: 'GET',
          data: {
            id: this.state.job.id,
            time: this.state.job.job_id
          },
          success: (response) => {
            ServerActions.receiveJob(response);
          }
        })
      }, 1500)
    }
  }
}

export default ReturnsIndex;
