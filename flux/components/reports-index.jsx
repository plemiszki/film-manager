var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var ReportsStore = require('../stores/reports-store.js');
var FileStore = require('../stores/file-store.js');

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

  getInitialState: function() {
    return({
      fetching: true,
      exporting: false,
      searchText: "",
      quarter: 4,
      year: 2016,
      reports: [],
      daysDue: 'all',
      file: '',
      importModalOpen: false
      // deleteModalOpen: false
    });
  },

  componentDidMount: function() {
    this.reportsListener = ReportsStore.addListener(this.getReports);
    this.fileListener = FileStore.addListener(this.fileDone);
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
      fetching: false
    });
  },

  clickImport: function() {
    this.setState({
      importModalOpen: true
    });
  },

  clickImportRevenue: function() {
    this.setState({
      file: 'revenue'
    }, function() {
      $('#upload-form #user_file').click();
    });
  },

  clickImportExpenses: function() {
    console.log('import expenses');
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
      fetching: true,
      exporting: true
    });
    ClientActions.exportAll(this.state.daysDue, this.state.quarter, this.state.year);
  },

  fileDone: function() {
    this.setState({
      fetching: false,
      exporting: false
    });
    window.location.pathname = 'api/royalty_reports/zip';
  },

  handleModalClose: function() {
    this.setState({
      importModalOpen: false
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
            <a className={"orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.handleAddNewClick}>Send All</a>
            <a className={"orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.clickExport}>{this.state.exporting ? "Exporting..." : "Export All"}</a>
            <a className={"orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.clickImport}>Import</a>
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
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td><td></td></tr>
                {this.state.reports.filterDaysDue(this.state.daysDue).filterSearchText(this.state.searchText).map(function(report, index) {
                  return(
                    <tr key={index} onClick={this.redirect.bind(this, report.id)}>
                      <td className="name-column">
                        {report.title}
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
      </div>
    );
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', function(e) { this.setState({daysDue: e.target.value}); }.bind(this));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = ReportsIndex;
