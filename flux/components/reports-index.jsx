var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var ReportsStore = require('../stores/reports-store.js');
var FileStore = require('../stores/file-store.js');

var ReportsIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      exporting: false,
      searchText: "",
      quarter: 4,
      year: 2016,
      reports: [],
      daysDue: 'all',
      // deleteModalOpen: false
    });
  },

  componentDidMount: function() {
    this.reportsListener = ReportsStore.addListener(this.getReports);
    this.fileListener = FileStore.addListener(this.fileDone);
    Common.resetNiceSelect('select', function(e) { this.setState({daysDue: e.target.value}); }.bind(this));
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
    this.setState({deleteModalOpen: false});
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
            <a className={"orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.handleAddNewClick}>Import</a>
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
        <Modal isOpen={this.state.deleteModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={Common.deleteModalStyles}>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this user&#63;</h1>
            Deleting a user will erase ALL of their information and data<br />
            <a className={"red-button"} onClick={this.confirmDelete}>
              Yes
            </a>
            <a className={"orange-button"} onClick={this.handleModalClose}>
              No
            </a>
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
