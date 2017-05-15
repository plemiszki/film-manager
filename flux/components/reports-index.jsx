var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var ServerActions = require('../actions/server-actions.js');
var ReportsStore = require('../stores/reports-store.js');
var FileStore = require('../stores/file-store.js');
var JobStore = require('../stores/job-store.js');

var ReportsIndex = React.createClass({

  importModalStyles: {
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
  },

  errorsModalStyles: {
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
  },

  getInitialState: function() {
    return({
      fetching: true,
      searchText: "",
      quarter: 1,
      year: 2017,
      reports: [],
      daysDue: 'all',
      importModalOpen: false,
      errorsModalOpen: false,
      jobModalOpen: false,
      job: {
        errors_text: ""
      }
    });
  },

  componentDidMount: function() {
    this.reportsListener = ReportsStore.addListener(this.getReports);
    this.fileListener = FileStore.addListener(this.fileDone);
    this.jobListener = JobStore.addListener(this.getJob);
    Common.resetNiceSelect('select', function(e) { this.setState({daysDue: e.target.value}); }.bind(this));
    $('#upload-form #user_file').on('change', this.pickFile);
    ClientActions.fetchReports(this.state.quarter, this.state.year);
  },

  componentWillUnmount: function() {
    this.reportsListener.remove();
    this.fileListener.remove();
  },

  getReports: function() {
    this.setState({
      reports: ReportsStore.all(),
      errors: ReportsStore.errors(),
      errorsModalOpen: ReportsStore.errors().length > 0,
      fetching: false
    });
  },

  getJob: function() {
    var job = JobStore.job();
    var open = job.first_line !== "Done!";
    var errorsModalOpen = (job.first_line === "Done!" && job.errors_text)
    this.setState({
      jobModalOpen: open,
      errorsModalOpen: errorsModalOpen,
      job: job,
      fetching: false
    });
  },

  clickPrev: function() {
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
  },

  clickNext: function() {
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
    }, function() {
      ClientActions.fetchReports(this.state.quarter, this.state.year);
    });
  },

  clickImport: function() {
    this.setState({
      importModalOpen: true
    });
  },

  clickImportRevenue: function() {
    $('#upload-form #quarter').val(this.state.quarter);
    $('#upload-form #year').val(this.state.year);
    $('#upload-form #label').val('revenue');
    $('#upload-form #user_file').click();
  },

  clickImportExpenses: function() {
    $('#upload-form #quarter').val(this.state.quarter);
    $('#upload-form #year').val(this.state.year);
    $('#upload-form #label').val('expenses');
    $('#upload-form #user_file').click();
  },

  pickFile: function() {
    this.setState({
      importModalOpen: false,
      fetching: true
    }, function() {
      $('#upload-form #submit-button').click();
    });
  },

  clickExport: function() {
    this.setState({
      fetching: true
    });
    ClientActions.exportAll(this.state.daysDue, this.state.quarter, this.state.year);
  },

  clickSend: function(e) {
    if (!e.target.classList.contains('inactive')) {      
      this.setState({
        fetching: true,
        jobFirstLine: "Exporting Reports"
      });
      ClientActions.sendAll(this.state.daysDue, this.state.quarter, this.state.year);
    }
  },

  fileDone: function() {
    this.setState({
      fetching: false,
    });
    window.location.pathname = 'api/royalty_reports/zip';
  },

  handleModalClose: function() {
    this.setState({
      importModalOpen: false,
      errorsModalOpen: false
    });
  },

  redirect: function(id) {
    window.location.pathname = "royalty_reports/" + id;
  },

  render: function() {
    return(
      <div>
        <div id="reports-index" className="component">
          <div className="clearfix">
            <h1>Statements - Q{this.state.quarter}, {this.state.year}</h1>
            <a className={"orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching) + Common.renderDisabledButtonClass(this.state.daysDue === 'all')} onClick={this.clickSend}>Send All</a>
            <a className={"disabled orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.clickExport}>Export All</a>
            <a className={"disabled orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.clickImport}>Import</a>
            <a className={"orange-button float-button arrow-button" + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.clickNext}>&#62;&#62;</a>
            <a className={"orange-button float-button arrow-button" + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.clickPrev}>&#60;&#60;</a>
          </div>
          <div className="white-box">
            {Common.renderSpinner(this.state.fetching)}
            {Common.renderGrayedOut(this.state.fetching)}
            <input className="search-box" onChange={Common.changeSearchText.bind(this)} value={this.state.searchText || ""} data-field="searchText" />
            <select onChange={function(e) { this.setState({daysDue: e.target.value}); }.bind(this)} value={this.state.daysDue}>
              <option value={"all"}>All</option>
              <option value={"30"}>30 days</option>
              <option value={"45"}>45 days</option>
              <option value={"60"}>60 days</option>
            </select>
            <table className={"admin-table"}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Licensor</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td><td></td><td></td></tr>
                {this.state.reports.filterDaysDue(this.state.daysDue).filterSearchText(this.state.searchText).map(function(report, index) {
                  return(
                    <tr key={index} onClick={this.redirect.bind(this, report.id)}>
                      <td className="name-column">
                        {report.title.cap(42)}
                      </td>
                      <td>
                        {report.licensor}
                      </td>
                      <td>
                        {report.days} days
                      </td>
                    </tr>
                  );
                }.bind(this))}
              </tbody>
            </table>
          </div>
        </div>
        <Modal isOpen={this.state.importModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={this.importModalStyles}>
          <div className="import-file">
            <h1>Import File</h1>
            <a className="orange-button" onClick={this.clickImportRevenue}>Import Revenue</a>
            <a className="orange-button" onClick={this.clickImportExpenses}>Import Expenses</a>
          </div>
        </Modal>
        <Modal isOpen={this.state.errorsModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={this.errorsModalStyles}>
          <div className="errors-modal">
            <h1>Oops. There were some errors.</h1>
            {this.state.job.errors_text.split("\n").map(function(error, index) {
              return(
                <div key={index} className="import-error">{error}</div>
              );
            }.bind(this))}
            <a className="orange-button" onClick={this.handleModalClose}>OK</a>
          </div>
        </Modal>
        {Common.jobModal.call(this, this.state.job)}
      </div>
    );
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', function(e) { this.setState({daysDue: e.target.value}); }.bind(this));
    $('.match-height-layout').matchHeight();
    if (this.state.jobModalOpen) {
      window.setTimeout(function() {
        $.ajax({
          url: '/api/jobs/status',
          method: 'GET',
          data: {
            time: this.state.job.job_id
          },
          success: function(response) {
            ServerActions.receiveJob(response);
          }.bind(this)
        })
      }.bind(this), 1500)
    }
  }
});

module.exports = ReportsIndex;
