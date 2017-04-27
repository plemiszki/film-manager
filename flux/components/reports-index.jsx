var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var ReportsStore = require('../stores/reports-store.js');

var ReportsIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      exporting: false,
      searchText: "",
      quarter: 1,
      year: 2017,
      reports: [],
      // deleteModalOpen: false
    });
  },

  componentDidMount: function() {
    this.reportsListener = ReportsStore.addListener(this.getReports);
    ClientActions.fetchReports(1, 2017);
  },

  componentWillUnmount: function() {
    this.reportsListener.remove();
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
  },

  confirmDelete: function() {
    this.setState({
      fetching: true
    }, function() {
      ClientActions.deleteUser(this.state.user.id);
    });
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
            <table className={"admin-table"}>
              <thead>
                <tr>
                  <th>Title</th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td></tr>
                {this.state.reports.filterSearchText(this.state.searchText).map(function(report, index) {
                  return(
                    <tr key={index} onClick={this.redirect.bind(this, report.id)}>
                      <td className="name-column">
                        {report.title}
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
    // Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = ReportsIndex;
