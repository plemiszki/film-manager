import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import { Common, setUpNiceSelect, ellipsis, pluralize } from 'handy-components'
import { sendRequest, fetchEntities, fetchEntity } from '../actions/index'
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
      errorsText: ""
    };
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
    setUpNiceSelect({ selector: 'select', func: (e) => { this.setState({ daysDue: e.target.value }) } });
    $('#upload-form-sage #user_file').on('change', this.pickFile.bind(this));
    this.fetchReports();
    let jobId = null;
    if (FM.params.job_id) {
      jobId = FM.params.job_id;
    } else if ($('#sage-import-id').length == 1) {
      jobId = $('#sage-import-id')[0].innerHTML;
    }
    if (jobId) {
      this.props.fetchEntity({
        id: jobId,
        directory: 'jobs',
        entityName: 'job'
      }).then(() => {
        const { job } = this.props;
        this.setState({
          job,
          jobModalOpen: true
        });
      });
    }
  }

  fetchReports() {
    const { quarter, year } = this.state;
    this.props.fetchEntities({
      directory: 'royalty_reports',
      data: {
        quarter,
        year
      }
    }).then(() => {
      const { reports } = this.props;
      this.setState({
        fetching: false,
        reports
      });
    });
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
    }, () => {
      this.fetchReports();
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
      this.fetchReports();
    });
  }

  clickImportRevenue() {
    $('#upload-form-sage #quarter').val(this.state.quarter);
    $('#upload-form-sage #year').val(this.state.year);
    $('#upload-form-sage #label').val('revenue');
    if (document.getElementById('env').innerHTML !== 'test') {
      $('#upload-form-sage #user_file').click();
    }
  }

  clickImportExpenses() {
    $('#upload-form-sage #quarter').val(this.state.quarter);
    $('#upload-form-sage #year').val(this.state.year);
    $('#upload-form-sage #label').val('expenses');
    if (document.getElementById('env').innerHTML !== 'test') {
      $('#upload-form-sage #user_file').click();
    }
  }

  pickFile() {
    this.setState({
      importModalOpen: false,
      fetching: true
    }, () => {
      $('#upload-form-sage #submit-button-sage').click();
    });
  }

  clickExport() {
    const { quarter, year, daysDue } = this.state;
    this.setState({
      fetching: true
    });
    this.props.sendRequest({
      url: '/api/royalty_reports/export_all',
      method: 'post',
      data: {
        quarter,
        year,
        daysDue
      }
    }).then(() => {
      const { job } = this.props;
      this.setState({
        job,
        fetching: false,
        jobModalOpen: true
      });
    });
  }

  clickErrorCheck() {
    const { quarter, year } = this.state;
    this.setState({
      fetching: true,
    });
    this.props.sendRequest({
      url: '/api/royalty_reports/error_check',
      method: 'post',
      data: {
        quarter,
        year
      }
    }).then(() => {
      const { job } = this.props;
      this.setState({
        job,
        fetching: false,
        jobModalOpen: true
      });
    });
  }

  clickTotals() {
    const { quarter, year, daysDue } = this.state;
    this.setState({
      fetching: true,
    });
    this.props.sendRequest({
      url: '/api/royalty_reports/totals',
      method: 'post',
      data: {
        quarter,
        year,
        daysDue
      }
    }).then(() => {
      const { job } = this.props;
      this.setState({
        job,
        fetching: false,
        jobModalOpen: true
      });
    });
  }

  clickSummary() {
    const { quarter, year, daysDue } = this.state;
    this.setState({
      fetching: true,
    });
    this.props.sendRequest({
      url: '/api/royalty_reports/summary',
      data: {
        quarter,
        year,
        daysDue
      }
    }).then(() => {
      const { job } = this.props;
      this.setState({
        job,
        fetching: false,
        jobModalOpen: true
      });
    });
  }

  clickConfirmSend() {
    const { quarter, year, daysDue } = this.state;
    this.setState({
      fetching: true,
    });
    this.props.sendRequest({
      url: '/api/royalty_reports/send_all',
      method: 'post',
      data: {
        quarter,
        year,
        daysDue
      }
    }).then(() => {
      const { job } = this.props;
      this.setState({
        job,
        fetching: false,
        jobModalOpen: true
      });
    });
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
            <a className={ "btn orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching || this.state.daysDue === 'all' || this.state.reports.length === 0) } onClick={ Common.changeState.bind(this, 'sendModalOpen', true) }>Send All</a>
            <a className={ "btn orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching || this.state.daysDue === 'all' || this.state.reports.length === 0) } onClick={ this.clickExport.bind(this) }>Export All</a>
            <a className={ "btn orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching || this.state.reports.length === 0) } onClick={ this.clickSummary.bind(this) }>Summary</a>
            <a className={ "btn orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching || this.state.reports.length === 0) } onClick={ this.clickTotals.bind(this) }>Totals</a>
            <a className={ "btn orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching || this.state.reports.length === 0) } onClick={ this.clickErrorCheck.bind(this) }>Error Check</a>
            <a className={ "btn orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Common.changeState.bind(this, 'importModalOpen', true) }>Import</a>
            <a className={ "btn orange-button float-button arrow-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ this.clickNext.bind(this) }>&#62;&#62;</a>
            <a className={ "btn orange-button float-button arrow-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ this.clickPrev.bind(this) }>&#60;&#60;</a>
          </div>
          <div className="white-box">
            <input className="search-box" onChange={ FM.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
            <select id="days-filter" onChange={ (e) => { this.setState({ daysDue: e.target.value }); } } value={ this.state.daysDue }>
              <option value="all">All</option>
              <option value="30">30 days</option>
              <option value="45">45 days</option>
              <option value="60">60 days</option>
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
                        { ellipsis(report.title, 42) }
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
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          </div>
        </div>
        <Modal isOpen={ this.state.importModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ importModalStyles }>
          <div className="import-file">
            <h1>Import File</h1>
            <a className="orange-button" onClick={ this.clickImportRevenue.bind(this) }>Import Revenue</a>
            <a className="orange-button" onClick={ this.clickImportExpenses.bind(this) }>Import Expenses</a>
          </div>
        </Modal>
        <Modal isOpen={this.state.sendModalOpen} onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ sendModalStyles }>
          { this.renderSendModalHeader() }
        </Modal>
        { Common.renderJobModal.call(this, this.state.job) }
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
          <a className="orange-button" onClick={ Common.closeModals.bind(this) }>No</a>
        </div>
      )
    } else if (unsent === 0) {
      return(
        <div className="send-modal">
          <h1>All reports have been sent.</h1>
          <a className="orange-button" onClick={ Common.closeModals.bind(this) }>OK</a>
        </div>
      )
    } else {
      return(
        <div className="send-modal">
          <h1>Send remaining { unsent } { pluralize('report', unsent) } now&#63;</h1>
          <a className="orange-button" onClick={ this.clickConfirmSend.bind(this) }>Yes</a>
          <a className="orange-button" onClick={ Common.closeModals.bind(this) }>No</a>
        </div>
      )
    }
  }

  componentDidUpdate() {
    Common.updateJobModal.call(this, { ensureCallback: this.importCallback.bind(this) });
  }

  importCallback() {
    this.setState({
      fetching: true
    });
    this.fetchReports();
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ sendRequest, fetchEntities, fetchEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ReportsIndex);
