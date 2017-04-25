var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var ReportStore = require('../stores/reports-store.js');
var ReportErrorsStore = require('../stores/report-errors-store.js');

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
      deleteModalOpen: false,
      showJoined: true
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
      streamErrors: ReportErrorsStore.streamErrors(),
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

  clickToggle: function() {
    this.setState({
      showJoined: !this.state.showJoined
    });
  },

  clickExport: function() {
    window.location.pathname = 'api/royalty_reports/' + this.state.report.id + '/export'
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
            var properErrorsArray = this.state.streamErrors[stream.id] ? this.state.streamErrors[stream.id] : [];
            return(
              <div key={index} className="row">
                <div className="col-xs-1 stream-name">
                  {stream.nickname}
                </div>
                <div className="col-xs-2">
                  <input className={Common.errorClass(properErrorsArray, Common.errors.currentRevenue)} onChange={Common.changeField.bind(this, this.changeFieldArgs(properErrorsArray))} value={stream.currentRevenue} data-thing="streams" data-thingid={index} data-field="currentRevenue" />
                </div>
                <div className={"col-xs-2" + this.grClass()}>
                  <input className={Common.errorClass(properErrorsArray, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={stream.currentGr} />
                </div>
                <div className={"col-xs-2" + this.expenseClass()}>
                  <input className={Common.errorClass(properErrorsArray, Common.errors.currentExpense)} onChange={Common.changeField.bind(this, this.changeFieldArgs(properErrorsArray))} value={stream.currentExpense} data-thing="streams" data-thingid={index} data-field="currentExpense" />
                </div>
                <div className={"col-xs-2" + this.expenseClass()}>
                  <input className={Common.errorClass(properErrorsArray, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={stream.currentDifference} />
                </div>
                <div className="col-xs-1">
                  <input className={Common.errorClass(properErrorsArray, Common.errors.licensorPercentage)} onChange={Common.changeField.bind(this, this.changeFieldArgs(properErrorsArray))} value={stream.licensorPercentage} data-thing="streams" data-thingid={index} data-field="licensorPercentage" />
                </div>
                <div className="col-xs-2">
                  <input className={Common.errorClass(properErrorsArray, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={stream.currentLicensorShare} />
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
            </div>
            <div className={"col-xs-2" + this.grClass()}>
            </div>
            <div className={"col-xs-2" + this.expenseClass()}>
              <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={this.state.report.currentTotalExpenses || ""} />
            </div>
            <div className={"col-xs-2" + this.expenseClass()}>
            </div>
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
              <div className="label">Total</div>
              <input className={Common.errorClass(this.state.reportErrors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={this.state.report.currentTotal || ""} />
            </div>
          </div>
          <div className={"row" + this.dealType4Only()}>
            <div className="col-xs-2 col-xs-offset-4">
              <div className="label">Current Expenses</div>
              <input className={Common.errorClass(this.state.reportErrors, Common.errors.currentTotalExpenses)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.report.currentTotalExpenses || ""} data-field="currentTotalExpenses" />
            </div>
          </div>
          <div className={"row" + this.dealType4Only()}>
            <div className="col-xs-2 col-xs-offset-4">
              <div className="label">Current Licensor Share</div>
              <input onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={this.state.report.currentShareMinusExpenses || ""} />
            </div>
          </div>
          <hr />
          <h4>Cumulative</h4>
          {this.renderRowHeaders()}
          {this.state.streams.map(function(stream, index) {
            var properErrorsArray = this.state.streamErrors[stream.id] ? this.state.streamErrors[stream.id] : [];
            return(
              <div key={index} className="row">
                <div className="col-xs-1 stream-name">
                  {stream.nickname}
                </div>
                <div className="col-xs-2">
                  <input className={Common.errorClass(properErrorsArray, Common.errors.cumeRevenue)} onChange={Common.changeField.bind(this, this.changeFieldArgs(properErrorsArray))} readOnly={this.state.showJoined} value={this.state.showJoined ? stream.joinedRevenue : stream.cumeRevenue} data-thing="streams" data-thingid={index} data-field="cumeRevenue" />
                </div>
                <div className={"col-xs-2" + this.grClass()}>
                  <input className={Common.errorClass(this.state.reportErrors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={this.state.showJoined ? stream.joinedGr : stream.cumeGr} />
                </div>
                <div className={"col-xs-2" + this.expenseClass()}>
                  <input className={Common.errorClass(properErrorsArray, Common.errors.cumeExpense)} onChange={Common.changeField.bind(this, this.changeFieldArgs(properErrorsArray))} readOnly={this.state.showJoined} value={this.state.showJoined ? stream.joinedExpense : stream.cumeExpense} data-thing="streams" data-thingid={index} data-field="cumeExpense" />
                </div>
                <div className={"col-xs-2" + this.expenseClass()}>
                  <input className={Common.errorClass(this.state.reportErrors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={this.state.showJoined ? stream.joinedDifference : stream.cumeDifference} />
                </div>
                <div className="col-xs-1">
                  <input className={Common.errorClass(properErrorsArray, Common.errors.licensorPercentage)} onChange={Common.changeField.bind(this, this.changeFieldArgs(properErrorsArray))} value={stream.licensorPercentage} data-thing="streams" data-thingid={index} data-field="licensorPercentage" />
                </div>
                <div className="col-xs-2">
                  <input className={Common.errorClass(this.state.reportErrors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={this.state.showJoined ? stream.joinedLicensorShare : stream.cumeLicensorShare} />
                </div>
              </div>
            )
          }.bind(this))}
          <div className="row">
            <div className="col-xs-1 stream-name">
              Total
            </div>
            <div className={"col-xs-2"}>
              <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={this.state.showJoined ? (this.state.report.joinedTotalRevenue || "") : (this.state.report.cumeTotalRevenue || "")} />
            </div>
            <div className={"col-xs-2" + this.grClass()}>
            </div>
            <div className={"col-xs-2" + this.expenseClass()}>
              <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={this.state.showJoined ? (this.state.report.joinedTotalExpenses || "") : (this.state.report.cumeTotalExpenses || "")} />
            </div>
            <div className={"col-xs-2" + this.expenseClass()}>
            </div>
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
              <div className="label">Total</div>
              <input className={Common.errorClass(this.state.reportErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={this.state.showJoined ? (this.state.report.joinedTotal || "") : (this.state.report.cumeTotal || "")} />
            </div>
          </div>
          <div className={"row" + this.dealType4Only()}>
            <div className="col-xs-2 col-xs-offset-4">
              <div className="label">Cumulative Expenses</div>
              <input className={Common.errorClass(this.state.reportErrors, Common.errors.cumeTotalExpenses)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={this.state.showJoined} value={this.state.showJoined ? (this.state.report.joinedTotalExpenses || "") : (this.state.report.cumeTotalExpenses || "")} data-field="cumeTotalExpenses" />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-1">
            </div>
            <div className={"col-xs-2"}>
            </div>
            <div className={"col-xs-2" + this.grClass()}>
            </div>
            <div className={"col-xs-2" + this.expenseClass()}>
              <div className="label">Expense Cap</div>
              <input className={Common.errorClass(this.state.reportErrors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={this.state.report.expenseCap || ""} />
            </div>
            <div className={"col-xs-2" + this.expenseClass()}>
            </div>
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
              <div className="label">E & O</div>
              <input className={Common.errorClass(this.state.reportErrors, Common.errors.eAndO)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.report.eAndO || ""} data-field="eAndO" />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-1">
            </div>
            <div className={"col-xs-2"}>
            </div>
            <div className={"col-xs-2" + this.grClass()}>
            </div>
            <div className={"col-xs-2" + this.expenseClass()}>
            </div>
            <div className={"col-xs-2" + this.expenseClass()}>
            </div>
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
              <div className="label">MG</div>
              <input className={Common.errorClass(this.state.reportErrors, Common.errors.mg)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.report.mg || ""} data-field="mg" />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-1">
            </div>
            <div className={"col-xs-2"}>
            </div>
            <div className={"col-xs-2" + this.grClass()}>
            </div>
            <div className={"col-xs-2" + this.expenseClass()}>
            </div>
            <div className={"col-xs-2" + this.expenseClass()}>
            </div>
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
              <div className="label">Amount Paid</div>
              <input className={Common.errorClass(this.state.reportErrors, Common.errors.amountPaid)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.report.amountPaid || ""} data-field="amountPaid" />
            </div>
          </div>
          <div className="row last-row">
            <div className="col-xs-1">
            </div>
            <div className={"col-xs-2"}>
            </div>
            <div className={"col-xs-2" + this.grClass()}>
            </div>
            <div className={"col-xs-2" + this.expenseClass()}>
            </div>
            <div className={"col-xs-2" + this.expenseClass()}>
            </div>
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
              <div className="label">Amount Due</div>
              <input className={Common.errorClass(this.state.reportErrors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} readOnly={true} value={this.state.showJoined ? (this.state.report.joinedAmountDue || "") : (this.state.report.amountDue || "")} />
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
        <a id="export" className={"orange-button " + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.clickExport}>
          Export PDF
        </a>
        <a id="toggle" className={"orange-button " + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.clickToggle}>
          {this.state.showJoined ? "Including Current Period" : "Not Including Current Period"}
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
    if (this.state.report.dealId !== 1 && this.state.report.dealId !== 4) {
      return "";
    } else {
      return " hidden"
    }
  },

  dealType4Only: function() {
    if (this.state.report.dealId == 4) {
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
