var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var ReportStore = require('../stores/reports-store.js');
var ReportErrorsStore = require('../stores/film-errors-store.js');

var ReportDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      report: {},
      reportSaved: {},
      reportErrors: [],
      streams: [],
      streamsSaved: [],
      streamErrors: {},
      reports: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    });
  },

  componentDidMount: function() {
    this.reportListener = ReportStore.addListener(this.getReport);
    this.errorsListener = ReportErrorsStore.addListener(this.getErrors);
    ClientActions.fetchReport(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.reportListener.remove();
    this.errorsListener.remove();
  },

  getReport: function() {
    this.setState({
      report: Tools.deepCopy(ReportStore.report()),
      reportSaved: ReportStore.report(),
      streams: Tools.deepCopy(ReportStore.streams()),
      streamsSaved: ReportStore.streams(),
      fetching: false
    }, function() {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  },

  getErrors: function() {
    this.setState({
      reportErrors: ReportErrorsStore.reportErrors(),
      percentageErrors: ReportErrorsStore.percentageErrors(),
      fetching: false
    });
  },

  clickSave: function() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, function() {
        ClientActions.updateReport(this.state.report, this.state.streams);
      });
    }
  },

  clickTitle: function() {
    window.location.pathname = "films/" + this.state.report.filmId;
  },

  clickDelete: function() {
    this.setState({
      deleteModalOpen: true
    });
  },

  confirmDelete: function() {
    this.setState({
      fetching: true
    }, function() {
      ClientActions.deleteReport(this.state.report.id);
    });
  },

  handleModalClose: function() {
    this.setState({
      deleteModalOpen: false
    });
  },

  checkForChanges: function() {
    if (Tools.objectsAreEqual(this.state.report, this.state.reportSaved) == false) {
      return true;
    } else {
      return !Tools.objectsAreEqual(this.state.streams, this.state.streamsSaved);
    }
  },

  changeFieldArgs: function(errors) {
    return {
      thing: "report",
      errorsArray: errors || this.state.reportErrors,
      changesFunction: this.checkForChanges
    }
  },

  render: function() {
    return(
      <div className="component">
        <h1><span onClick={this.clickTitle}>{this.state.report.film}</span></h1>
        <h3>{this.state.report.year} - Q{this.state.report.quarter}</h3>
        <div className="white-box">
          {Common.renderSpinner(this.state.fetching)}
          {Common.renderGrayedOut(this.state.fetching)}
          <h4>Current Period</h4>
          {this.renderRowHeaders()}
          {this.state.streams.map(function(stream, index) {
            return(
              <div key={index} className="row">
                <div className="col-xs-1 stream-name">
                  {stream.nickname}
                </div>
                <div className="col-xs-2">
                  <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={stream.currentRevenue} data-thing="streams" data-thingid={index} data-field="currentRevenue" />
                  {Common.renderFieldError(this.state.reportErrors, ["Title can't be blank"])}
                </div>
                <div className={"col-xs-2" + this.grClass()}>
                  <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={stream.currentGr} />
                  {Common.renderFieldError(this.state.reportErrors, ["Title can't be blank"])}
                </div>
                <div className={"col-xs-2" + this.expenseClass()}>
                  <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={stream.currentExpense} data-thing="streams" data-thingid={index} data-field="currentExpense" />
                  {Common.renderFieldError(this.state.reportErrors, ["Title can't be blank"])}
                </div>
                <div className={"col-xs-2" + this.expenseClass()}>
                  <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={stream.currentDifference} />
                  {Common.renderFieldError(this.state.reportErrors, ["Title can't be blank"])}
                </div>
                <div className="col-xs-1">
                  <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={stream.licensorPercentage} />
                  {Common.renderFieldError(this.state.reportErrors, ["Title can't be blank"])}
                </div>
                <div className="col-xs-2">
                  <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={stream.currentLicensorShare} />
                  {Common.renderFieldError(this.state.reportErrors, ["Title can't be blank"])}
                </div>
              </div>
            )
          }.bind(this))}
          <div className="row">
            <div className="col-xs-1 stream-name">
              Total
            </div>
            <div className={"col-xs-2"}>
              <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={this.state.report.currentTotalRevenue || ""} />
              {Common.renderFieldError(this.state.reportErrors, ["Title can't be blank"])}
            </div>
            <div className={"col-xs-2" + this.grClass()}>
            </div>
            <div className={"col-xs-2" + this.expenseClass()}>
              <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={this.state.report.currentTotalExpenses || ""} />
              {Common.renderFieldError(this.state.reportErrors, ["Title can't be blank"])}
            </div>
            <div className={"col-xs-2"}>
            </div>
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
              <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={this.state.report.currentTotal || ""} />
              {Common.renderFieldError(this.state.reportErrors, ["Title can't be blank"])}
            </div>
          </div>
          <hr />
          <h4>Cumulative</h4>
          {this.renderRowHeaders()}
          {this.state.streams.map(function(stream, index) {
            return(
              <div key={index} className="row">
                <div className="col-xs-1 stream-name">
                  {stream.nickname}
                </div>
                <div className="col-xs-2">
                  <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={stream.cumeRevenue} data-thing="streams" data-thingid={index} data-field="cumeRevenue" />
                  {Common.renderFieldError(this.state.reportErrors, ["Title can't be blank"])}
                </div>
                <div className={"col-xs-2" + this.grClass()}>
                  <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={stream.cumeGr} />
                  {Common.renderFieldError(this.state.reportErrors, ["Title can't be blank"])}
                </div>
                <div className={"col-xs-2" + this.expenseClass()}>
                  <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={stream.cumeExpense} data-thing="streams" data-thingid={index} data-field="cumeExpense" />
                  {Common.renderFieldError(this.state.reportErrors, ["Title can't be blank"])}
                </div>
                <div className={"col-xs-2" + this.expenseClass()}>
                  <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={this.state.streams[index].cumeDifference} />
                  {Common.renderFieldError(this.state.reportErrors, ["Title can't be blank"])}
                </div>
                <div className="col-xs-1">
                  <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={stream.licensorPercentage} />
                  {Common.renderFieldError(this.state.reportErrors, ["Title can't be blank"])}
                </div>
                <div className="col-xs-2">
                  <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={this.state.streams[index].cumeLicensorShare} />
                  {Common.renderFieldError(this.state.reportErrors, ["Title can't be blank"])}
                </div>
              </div>
            )
          }.bind(this))}
          <div className="row">
            <div className="col-xs-12">
              <h2>MG</h2>
              <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.report.mg || ""} data-field="mg" />
              {Common.renderFieldError(this.state.reportErrors, ["Title can't be blank"])}
            </div>
          </div>
          {this.renderButtons()}
        </div>
        <Modal isOpen={this.state.deleteModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={Common.deleteModalStyles}>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this report&#63;</h1>
            Deleting a report will erase ALL of its information and data<br />
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

  renderRowHeaders: function() {
    return(
      <div className="row headers">
        <div className="col-xs-1">
        </div>
        <div className="col-xs-2">
          Revenue
        </div>
        <div className={"col-xs-2" + this.grClass()}>
          {this.state.report.grPercentage}% Fee
        </div>
        <div className={"col-xs-2" + this.expenseClass()}>
          Expenses
        </div>
        <div className={"col-xs-2" + this.expenseClass()}>
          Difference
        </div>
        <div className="col-xs-1">
          %
        </div>
        <div className="col-xs-2">
          Net Licensor Share
        </div>
      </div>
    )
  },

  renderButtons: function() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={"orange-button " + Common.renderDisabledButtonClass(this.state.fetching) + Common.renderInactiveButtonClass(this.state.changesToSave)} onClick={this.clickSave}>
          {buttonText}
        </a>
        <a id="delete" className={"orange-button " + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.clickDelete}>
          Delete Report
        </a>
      </div>
    )
  },

  grClass: function() {
    if (this.state.report.dealId >= 5) {
      return "";
    } else {
      return " hidden"
    }
  },

  expenseClass: function() {
    if (this.state.report.dealId !== 4) {
      return "";
    } else {
      return " hidden"
    }
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
    $('.match-height-row').matchHeight();
  }
});

module.exports = ReportDetails;
