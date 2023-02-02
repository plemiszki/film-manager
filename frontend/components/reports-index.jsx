import React from 'react'
import Modal from 'react-modal'
import { Common, setUpNiceSelect, ellipsis, pluralize, sendRequest, fetchEntities, fetchEntity, Button, SearchBar, Spinner, GrayedOut, Table } from 'handy-components'
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

export default class ReportsIndex extends React.Component {

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
      fetchEntity({
        id: jobId,
        directory: 'jobs',
        entityName: 'job'
      }).then((response) => {
        const { job } = response;
        this.setState({
          job,
          jobModalOpen: true
        });
      });
    }
  }

  fetchReports() {
    const { quarter, year } = this.state;
    fetchEntities({
      data: {
        quarter,
        year
      }
    }).then((response) => {
      const { reports } = response;
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
    sendRequest('/api/royalty_reports/export_all', {
      method: 'POST',
      data: {
        quarter,
        year,
        daysDue
      }
    }).then((response) => {
      const { job } = response;
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
    sendRequest('/api/royalty_reports/error_check', {
      method: 'POST',
      data: {
        quarter,
        year
      }
    }).then((response) => {
      const { job } = response;
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
    sendRequest('/api/royalty_reports/totals', {
      method: 'POST',
      data: {
        quarter,
        year,
        daysDue
      }
    }).then((response) => {
      const { job } = response;
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
    sendRequest('/api/royalty_reports/summary', {
      data: {
        quarter,
        year,
        daysDue
      }
    }).then((response) => {
      const { job } = response;
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
    sendRequest('/api/royalty_reports/send_all', {
      method: 'POST',
      data: {
        quarter,
        year,
        daysDue
      }
    }).then((response) => {
      const { job } = response;
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
    const { fetching, daysDue, reports, searchText, job } = this.state;
    const sortedReports = reports.sort(this.sortReports.bind(this)).filterDaysDue(this.state.daysDue);

    return (
      <>
        <div>
          <div className="handy-component">
            <h1>Statements - Q{ this.state.quarter }, { this.state.year }</h1>
            <Button
              square
              text="Send All"
              float
              disabled={ fetching || daysDue === 'all' || reports.length === 0 }
              onClick={ Common.changeState.bind(this, 'sendModalOpen', true) }
            />
            <Button
              square
              text="Export All"
              float
              styles={ { marginRight: 15 } }
              disabled={ fetching || daysDue === 'all' || reports.length === 0 }
              onClick={ () => { this.clickExport() } }
            />
            <Button
              square
              text="Summary"
              float
              styles={ { marginRight: 15 } }
              disabled={ fetching || reports.length === 0 }
              onClick={ () => { this.clickSummary() } }
            />
            <Button
              square
              text="Totals"
              float
              styles={ { marginRight: 15 } }
              disabled={ fetching || reports.length === 0 }
              onClick={ () => { this.clickTotals() } }
            />
            <Button
              square
              text="Error Check"
              float
              styles={ { marginRight: 15 } }
              disabled={ fetching || reports.length === 0 }
              onClick={ () => { this.clickErrorCheck() } }
            />
            <Button
              square
              text="Import"
              float
              styles={ { marginRight: 15 } }
              disabled={ fetching || reports.length === 0 }
              onClick={ Common.changeState.bind(this, 'importModalOpen', true) }
            />
            <Button
              square
              text=">>"
              float
              styles={ { marginRight: 15 } }
              disabled={ fetching }
              onClick={ this.clickNext.bind(this) }
            />
            <Button
              square
              text="<<"
              float
              styles={ { marginRight: 15 } }
              disabled={ fetching }
              onClick={ this.clickPrev.bind(this) }
            />
            <div className="white-box">
              <SearchBar
                onChange={ FM.changeSearchText.bind(this) }
                value={ searchText || "" }
                style={
                  { position: 'absolute', right: '32px', top: '12px' }
                }
              />
              <select className="days-filter" onChange={ (e) => { this.setState({ daysDue: e.target.value }) } } value={ this.state.daysDue }>
                <option value="all">All</option>
                <option value="30">30 days</option>
                <option value="45">45 days</option>
                <option value="60">60 days</option>
              </select>
              <Table
                urlPrefix="royalty_reports"
                searchText={ searchText }
                rows={ sortedReports }
                columns={[
                  {
                    name: "title",
                    bold: true,
                    displayFunction: report => ellipsis(report.title, 42),
                    width: "40%",
                  },
                  { name: "licensor", width: "30%" },
                  {
                    header: "",
                    displayFunction: report => `${report.days} days`,
                    width: "15%",
                  },
                  {
                    header: "",
                    displayFunction: (report) => {
                      return report.sendReport ? (report.dateSent ? Tools.formatDate(new Date(report.dateSent + " 0:00")) : "Not Sent") : "Do Not Send"
                    },
                    width: "15%",
                  },
                ]}
              />
              <Spinner visible={ fetching } />
              <GrayedOut visible={ fetching } />
            </div>
          </div>
          <Modal isOpen={ this.state.importModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ importModalStyles }>
            <div className="handy-component admin-modal">
              <h1>Import File</h1>
              <Button onClick={ () => { this.clickImportRevenue() } } text="Import Revenue" styles={ { marginTop: 30, marginRight: 20, marginLeft: 20 } } />
              <Button onClick={ () => { this.clickImportExpenses() } } text="Import Expenses" styles={ { marginTop: 30, marginRight: 20, marginLeft: 20 } } />
            </div>
          </Modal>
          <Modal isOpen={this.state.sendModalOpen} onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ sendModalStyles }>
            { this.renderSendModalHeader() }
          </Modal>
          { Common.renderJobModal.call(this, job) }
        </div>
        <style jsx>{`
          .white-box {
            position: relative;
          }
          .days-filter {
            position: absolute;
            width: 100px;
            top: 14px;
            right: 300px;
          }
        `}</style>
      </>
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
