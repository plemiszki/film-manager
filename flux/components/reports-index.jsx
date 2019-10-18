import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import ServerActions from '../actions/server-actions.js'
import ReportsStore from '../stores/reports-store.js'
import FileStore from '../stores/file-store.js'
import JobStore from '../stores/job-store.js'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

const importModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#FFFFFF',
    margin: 'auto',
    maxWidth: 540,
    height: 175,
    border: 'solid 1px #5F5F5F',
    borderRadius: '6px',
    textAlign: 'center',
    color: '#5F5F5F'
  }
};

const errorsModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#FFFFFF',
    margin: 'auto',
    maxWidth: 800,
    height: 550,
    border: 'solid 1px #5F5F5F',
    borderRadius: '6px',
    textAlign: 'center',
    color: '#5F5F5F'
  }
};

const sendModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#FFFFFF',
    margin: 'auto',
    maxWidth: 540,
    height: 140,
    border: 'solid 1px #5F5F5F',
    borderRadius: '6px',
    textAlign: 'center',
    color: '#5F5F5F'
  }
};

class ReportsIndex extends React.Component {

  constructor(props) {
    super(props)
    let date = new Date;
    let job = {
      errors_text: ""
    };
    if ($('#sage-import-id').length == 1) {
      job.id = $('#sage-import-id')[0].innerHTML;
      job.second_line = false;
      job.first_line = "Importing Q" + $('#sage-import-quarter')[0].innerHTML + " " + $('#sage-import-label')[0].innerHTML;
    }
    this.state = {
      fetching: true,
      sortBy: "title",
      searchText: "",
      quarter: FM.properStatementQuarter(date).quarter,
      year: FM.properStatementQuarter(date).year,
      reports: [],
      daysDue: 'all',
      importModalOpen: false,
      errorsModalOpen: false,
      noErrorsModalOpen: false,
      jobModalOpen: !!job.id,
      sendModalOpen: false,
      job: job
    };
  }

  componentDidMount() {
    this.reportsListener = ReportsStore.addListener(this.getReports.bind(this));
    this.fileListener = FileStore.addListener(this.fileDone);
    this.jobListener = JobStore.addListener(this.getJob.bind(this));
    FM.resetNiceSelect('select', (e) => { this.setState({daysDue: e.target.value}); });
    $('#upload-form-sage #user_file').on('change', this.pickFile.bind(this));
    ClientActions.fetchReports(this.state.quarter, this.state.year);
    if (FM.params.job_id) {
      ClientActions.fetchJob(FM.params.job_id);
    }
  }

  componentWillUnmount() {
    this.reportsListener.remove();
    this.fileListener.remove();
  }

  getReports() {
    this.setState({
      reports: ReportsStore.all(),
      errors: ReportsStore.errors(),
      errorsModalOpen: ReportsStore.errors().length > 0,
      fetching: false
    });
  }

  getJob() {
    var job = JobStore.job();
    if (job.done || job.first_line.slice(0, 5) === "Done!") {
      if (job.name === "export all") {
        this.setState({
          jobModalOpen: false,
          job: job
        }, function() {
          window.location.href = job.first_line;
        });
      } else {
        this.setState({
          jobModalOpen: false,
          errorsModalOpen: job.errors_text !== "",
          noErrorsModalOpen: job.errors_text === "",
          sendModalOpen: false,
          job: job
        });
      }
    } else {
      this.setState({
        jobModalOpen: true,
        sendModalOpen: false,
        job: job,
        fetching: false
      });
    }
  }

  clickPrev() {
    var newQuarter = this.state.quarter - 1;
    var newYear = this.state.year;
    if (newQuarter == 0) {
      newYear -= 1;
      newQuarter = 4;
    }
    this.setState({
      quarter: newQuarter,
      year: newYear,
      fetching: true
    }, function() {
      ClientActions.fetchReports(this.state.quarter, this.state.year);
    });
  }

  clickNext() {
    var newQuarter = this.state.quarter + 1;
    var newYear = this.state.year;
    if (newQuarter == 5) {
      newYear += 1;
      newQuarter = 1;
    }
    this.setState({
      quarter: newQuarter,
      year: newYear,
      fetching: true
    }, () => {
      ClientActions.fetchReports(this.state.quarter, this.state.year);
    });
  }

  clickImport() {
    this.setState({
      importModalOpen: true
    });
  }

  clickImportRevenue() {
    $('#upload-form-sage #quarter').val(this.state.quarter);
    $('#upload-form-sage #year').val(this.state.year);
    $('#upload-form-sage #label').val('revenue');
    $('#upload-form-sage #user_file').click();
  }

  clickImportExpenses() {
    $('#upload-form-sage #quarter').val(this.state.quarter);
    $('#upload-form-sage #year').val(this.state.year);
    $('#upload-form-sage #label').val('expenses');
    $('#upload-form-sage #user_file').click();
  }

  pickFile() {
    this.setState({
      importModalOpen: false,
      fetching: true
    }, function() {
      $('#upload-form-sage #submit-button-sage').click();
    });
  }

  clickExport(e) {
    if (!e.target.classList.contains('inactive')) {
      this.setState({
        fetching: true
      });
      ClientActions.exportAll(this.state.daysDue, this.state.quarter, this.state.year);
    }
  }

  clickSend(e) {
    if (!e.target.classList.contains('inactive')) {
      this.setState({
        sendModalOpen: true
      });
    }
  }

  clickErrorCheck(e) {
    if (!e.target.classList.contains('inactive')) {
      this.setState({
        fetching: true,
        jobFirstLine: "Checking For Errors"
      });
      ClientActions.errorCheck(this.state.quarter, this.state.year);
    }
  }

  clickTotals(e) {
    if (!e.target.classList.contains('inactive')) {
      this.setState({
        fetching: true,
        jobFirstLine: 'Calculating Totals'
      });
      ClientActions.statementTotals(this.state.quarter, this.state.year, this.state.daysDue);
    }
  }

  clickConfirmSend(e) {
    this.setState({
      fetching: true,
      jobFirstLine: "Exporting Reports"
    });
    ClientActions.sendAll(this.state.daysDue, this.state.quarter, this.state.year);
  }

  clickTitle(e) {
    this.setState({
      sortBy: "title"
    });
  }

  clickLicensor(e) {
    this.setState({
      sortBy: "licensor"
    });
  }

  fileDone() {
    this.setState({
      fetching: false,
    });
    window.location.pathname = 'api/royalty_reports/zip';
  }

  closeModal() {
    this.setState({
      importModalOpen: false,
      sendModalOpen: false
    });
  }

  modalCloseAndRefresh() {
    this.setState({
      errorsModalOpen: false,
      noErrorsModalOpen: false
    }, () => {
      ClientActions.fetchReports(this.state.quarter, this.state.year);
    });
  }

  redirect(id) {
    window.location.pathname = "royalty_reports/" + id;
  }

  sortReports(a, b) {
    if (this.state.sortBy === "title") {
      if (a.title.toLowerCase() < b.title.toLowerCase()) {
        return -1;
      } else if (a.title.toLowerCase() > b.title.toLowerCase()) {
        return 1;
      } else {
        return 0;
      }
    } else {
      if (a.licensor.toLowerCase() < b.licensor.toLowerCase()) {
        return -1;
      } else if (a.licensor.toLowerCase() > b.licensor.toLowerCase()) {
        return 1;
      } else {
        if (a.title.toLowerCase() < b.title.toLowerCase()) {
          return -1;
        } else if (a.title.toLowerCase() > b.title.toLowerCase()) {
          return 1;
        } else {
          return 0;
        }
      }
    }
  }

  render() {
    return(
      <div>
        <div id="reports-index" className="component">
          <div className="clearfix">
            <h1>Statements - Q{ this.state.quarter }, { this.state.year }</h1>
            <a className={ "orange-button float-button" + Common.renderInactiveButtonClass(this.state.fetching || this.state.daysDue === 'all' || this.state.reports.length === 0) } onClick={ this.clickSend.bind(this) }>Send All</a>
            <a className={ "orange-button float-button" + Common.renderInactiveButtonClass(this.state.fetching || this.state.daysDue === 'all' || this.state.reports.length === 0) } onClick={ this.clickExport.bind(this) }>Export All</a>
            <a className={ "orange-button float-button" + Common.renderInactiveButtonClass(this.state.fetching || this.state.reports.length === 0) } onClick={ this.clickTotals.bind(this) }>Totals</a>
            <a className={ "orange-button float-button" + Common.renderInactiveButtonClass(this.state.fetching || this.state.reports.length === 0) } onClick={ this.clickErrorCheck.bind(this) }>Error Check</a>
            <a className={ "orange-button float-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickImport.bind(this) }>Import</a>
            <a className={ "orange-button float-button arrow-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNext.bind(this) }>&#62;&#62;</a>
            <a className={ "orange-button float-button arrow-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickPrev.bind(this) }>&#60;&#60;</a>
          </div>
          <div className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <input className="search-box" onChange={ FM.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
            <select onChange={ (e) => { this.setState({ daysDue: e.target.value }); } } value={ this.state.daysDue }>
              <option value={ "all" }>All</option>
              <option value={ "30" }>30 days</option>
              <option value={ "45" }>45 days</option>
              <option value={ "60" }>60 days</option>
            </select>
            <table className="fm-admin-table">
              <thead>
                <tr>
                  <th><div className={ FM.sortClass.call(this, "title") } onClick={ this.clickTitle.bind(this) }>Title</div></th>
                  <th><div className={ FM.sortClass.call(this, "licensor") } onClick={ this.clickLicensor.bind(this) }>Licensor</div></th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td><td></td><td></td></tr>
                { this.state.reports.sort(this.sortReports.bind(this)).filterDaysDue(this.state.daysDue).filterSearchText(this.state.searchText, this.state.sortBy).map(function(report, index) {
                  return(
                    <tr key={ index } onClick={ this.redirect.bind(this, report.id) }>
                      <td className="name-column">
                        { HandyTools.ellipsis(report.title, 42) }
                      </td>
                      <td>
                        { report.licensor }
                      </td>
                      <td>
                        { report.days } days
                      </td>
                      <td>
                        { report.sendReport ? (report.dateSent ? Tools.formatDate(new Date(report.dateSent + " 0:00")) : "Not Sent") : "Do Not Send" }
                      </td>
                    </tr>
                  );
                }.bind(this)) }
              </tbody>
            </table>
          </div>
        </div>
        <Modal isOpen={ this.state.importModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ importModalStyles }>
          <div className="import-file">
            <h1>Import File</h1>
            <a className="orange-button" onClick={ this.clickImportRevenue.bind(this) }>Import Revenue</a>
            <a className="orange-button" onClick={ this.clickImportExpenses.bind(this) }>Import Expenses</a>
          </div>
        </Modal>
        <Modal isOpen={this.state.sendModalOpen} onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ sendModalStyles }>
          { this.renderSendModalHeader() }
        </Modal>
        { FM.jobModal.call(this, this.state.job) }
        { FM.jobErrorsModal.call(this) }
        { FM.jobNoErrorsModal.call(this) }
      </div>
    );
  }

  renderSendModalHeader() {
    var total = this.state.reports.filterDaysDue(this.state.daysDue).filter(function(report) {
      return report.sendReport === true;
    }).length;
    var unsent = this.state.reports.filterDaysDue(this.state.daysDue).filter(function(report) {
      return report.sendReport === true && report.dateSent === null;
    }).length;
    if (unsent === total) {
      return(
        <div className="send-modal">
          <h1>Send all { unsent } reports now&#63;</h1>
          <a className="orange-button" onClick={ this.clickConfirmSend.bind(this) }>Yes</a>
          <a className="orange-button" onClick={ this.closeModal.bind(this) }>No</a>
        </div>
      )
    } else if (unsent === 0) {
      return(
        <div className="send-modal">
          <h1>All reports have been sent.</h1>
          <a className="orange-button" onClick={ this.closeModal.bind(this) }>OK</a>
        </div>
      )
    } else {
      return(
        <div className="send-modal">
          <h1>Send remaining { unsent } { HandyTools.pluralize('report', unsent) } now&#63;</h1>
          <a className="orange-button" onClick={ this.clickConfirmSend.bind(this) }>Yes</a>
          <a className="orange-button" onClick={ this.closeModal.bind(this) }>No</a>
        </div>
      )
    }
  }

  componentDidUpdate() {
    FM.resetNiceSelect('select', (e) => { this.setState({ daysDue: e.target.value }); });
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
        });
      }, 1500)
    }
  }
}

export default ReportsIndex;
