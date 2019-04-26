import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import ReportStore from '../stores/reports-store.js'
import ReportErrorsStore from '../stores/report-errors-store.js'
import { Common, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

class ReportDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      report: {},
      reportSaved: {},
      reportErrors: [],
      streams: [],
      streamsSaved: [],
      streamErrors: {},
      reports: [],
      films: [],
      changesToSave: false,
      justSaved: false,
      showJoined: true
    };
  }

  componentDidMount() {
    this.reportListener = ReportStore.addListener(this.getReport.bind(this));
    this.errorsListener = ReportErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchReport(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.reportListener.remove();
    this.errorsListener.remove();
  }

  getReport() {
    this.setState({
      report: Tools.deepCopy(ReportStore.report()),
      reportSaved: ReportStore.report(),
      streams: Tools.deepCopy(ReportStore.streams()),
      streamsSaved: ReportStore.streams(),
      fetching: false,
      films: ReportStore.films()
    }, () => {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  }

  getErrors() {
    this.setState({
      reportErrors: ReportErrorsStore.reportErrors(),
      streamErrors: ReportErrorsStore.streamErrors(),
      fetching: false
    });
  }

  clickSave() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, () => {
        ClientActions.updateReport(this.state.report, this.state.streams);
      });
    }
  }

  clickTitle(id) {
    window.location.pathname = "films/" + id;
  }

  clickToggle() {
    this.setState({
      showJoined: !this.state.showJoined
    });
  }

  clickExport() {
    window.location.pathname = 'api/royalty_reports/' + window.location.pathname.split('/')[2] + '/export';
  }

  checkForChanges() {
    if (Tools.objectsAreEqual(this.state.report, this.state.reportSaved) == false) {
      return true;
    } else {
      return !Tools.objectsAreEqual(this.state.streams, this.state.streamsSaved);
    }
  }

  changeFieldArgs(errors) {
    return {
      thing: "report",
      errorsArray: errors || this.state.reportErrors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    return(
      <div className="component">
        { this.state.films.map((film, index) => {
          return(
            <h1 key={ index }><span onClick={ this.clickTitle.bind(this, film.id) }>{ film.title }</span></h1>
          );
        }) }
        <h3>{this.state.report.year} - Q{this.state.report.quarter}</h3>
        <div className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <h4>Current Period</h4>
          { this.renderRowHeaders() }
          { this.state.streams.map((stream, index) => {
            var properErrorsArray = this.state.streamErrors[stream.id] ? this.state.streamErrors[stream.id] : [];
            return(
              <div key={ index } className="row">
                <div className="col-xs-1 stream-name">
                  { stream.nickname }
                </div>
                <div className="col-xs-2">
                  <input className={ Details.errorClass(properErrorsArray, FM.errors.currentRevenue) } onChange={ FM.changeField.bind(this, this.changeFieldArgs(properErrorsArray)) } readOnly={ this.state.report.id === 0 } value={ stream.currentRevenue } data-thing="streams" data-thingid={ index } data-field="currentRevenue" />
                </div>
                <div className={ "col-xs-2" + this.grClass() }>
                  <input className={ Details.errorClass(properErrorsArray, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ true } value={ stream.currentGr } />
                </div>
                <div className={ "col-xs-2" + this.expenseClass() }>
                  <input className={ Details.errorClass(properErrorsArray, FM.errors.currentExpense) } onChange={ FM.changeField.bind(this, this.changeFieldArgs(properErrorsArray)) } readOnly={ this.state.report.id === 0 } value={ stream.currentExpense } data-thing="streams" data-thingid={ index } data-field="currentExpense" />
                </div>
                <div className={ "col-xs-2" + this.expenseClass() }>
                  <input className={ Details.errorClass(properErrorsArray, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ true } value={ stream.currentDifference } />
                </div>
                <div className="col-xs-1">
                  <input className={ Details.errorClass(properErrorsArray, FM.errors.licensorPercentage) } onChange={ FM.changeField.bind(this, this.changeFieldArgs(properErrorsArray)) } readOnly={ this.state.report.id === 0 } value={ stream.licensorPercentage } data-thing="streams" data-thingid={ index } data-field="licensorPercentage" />
                </div>
                <div className="col-xs-2">
                  <input className={ Details.errorClass(properErrorsArray, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ true } value={ stream.currentLicensorShare } />
                </div>
              </div>
            )
          }) }
          <div className="row">
            <div className="col-xs-1 stream-name">
              Total
            </div>
            <div className="col-xs-2">
              <input className={ Details.errorClass(this.state.reportErrors, ["Title can't be blank"]) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ true } value={ this.state.report.currentTotalRevenue || "" } />
            </div>
            <div className={ "col-xs-2" + this.grClass() }>
            </div>
            <div className={ "col-xs-2" + this.expenseClass() }>
              <input className={ Details.errorClass(this.state.reportErrors, ["Title can't be blank"]) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ true } value={ this.state.report.currentTotalExpenses || "" } />
            </div>
            <div className={ "col-xs-2" + this.expenseClass() }>
            </div>
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
              <div className="label">Total</div>
              <input className={ Details.errorClass(this.state.reportErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ true } value={ this.state.report.currentTotal || "" } />
            </div>
          </div>
          <div className={ "row" + (this.state.report.currentReserve === "$0.00" ? " hidden" : "") }>
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
            </div>
            <div className={ "col-xs-2" + this.grClass() }>
            </div>
            <div className={ "col-xs-2" + this.expenseClass() }>
            </div>
            <div className={ "col-xs-2" + this.expenseClass() }>
            </div>
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
              <div className="label">Reserve Against Returns</div>
              <input className={ Details.errorClass(this.state.reportErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ true } value={ this.state.report.currentReserve || "" } />
            </div>
          </div>
          <div className={ "row" + this.dealType4Only() }>
            <div className="col-xs-2 col-xs-offset-4">
              <div className="label">Current Expenses</div>
              <input className={ Details.errorClass(this.state.reportErrors, FM.errors.currentTotalExpenses) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ this.state.report.id === 0 } value={ this.state.report.currentTotalExpenses || "" } data-field="currentTotalExpenses" />
            </div>
          </div>
          <div className={ "row" + this.dealType4Only() }>
            <div className="col-xs-2 col-xs-offset-4">
              <div className="label">Current Licensor Share</div>
              <input onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ true } value={ this.state.report.currentShareMinusExpenses || "" } />
            </div>
          </div>
          <hr />
          <h4>Cumulative</h4>
          { this.renderRowHeaders() }
          { this.state.streams.map((stream, index) => {
            var properErrorsArray = this.state.streamErrors[stream.id] ? this.state.streamErrors[stream.id] : [];
            return(
              <div key={ index } className="row">
                <div className="col-xs-1 stream-name">
                  { stream.nickname }
                </div>
                <div className="col-xs-2">
                  <input className={ Details.errorClass(properErrorsArray, FM.errors.cumeRevenue) } onChange={ FM.changeField.bind(this, this.changeFieldArgs(properErrorsArray)) } readOnly={ this.state.report.id === 0 || this.state.showJoined } value={ this.state.showJoined ? stream.joinedRevenue : stream.cumeRevenue } data-thing="streams" data-thingid={index} data-field="cumeRevenue" />
                </div>
                <div className={ "col-xs-2" + this.grClass() }>
                  <input className={ Details.errorClass(this.state.reportErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ true } value={ this.state.showJoined ? stream.joinedGr : stream.cumeGr } />
                </div>
                <div className={ "col-xs-2" + this.expenseClass() }>
                  <input className={ Details.errorClass(properErrorsArray, FM.errors.cumeExpense) } onChange={ FM.changeField.bind(this, this.changeFieldArgs(properErrorsArray)) } readOnly={ this.state.report.id === 0 || this.state.showJoined } value={ this.state.showJoined ? stream.joinedExpense : stream.cumeExpense } data-thing="streams" data-thingid={index} data-field="cumeExpense" />
                </div>
                <div className={ "col-xs-2" + this.expenseClass() }>
                  <input className={ Details.errorClass(this.state.reportErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ true } value={ this.state.showJoined ? stream.joinedDifference : stream.cumeDifference } />
                </div>
                <div className="col-xs-1">
                  <input className={ Details.errorClass(properErrorsArray, FM.errors.licensorPercentage) } onChange={ FM.changeField.bind(this, this.changeFieldArgs(properErrorsArray)) } readOnly={ this.state.report.id === 0 } value={ stream.licensorPercentage } data-thing="streams" data-thingid={ index } data-field="licensorPercentage" />
                </div>
                <div className="col-xs-2">
                  <input className={ Details.errorClass(this.state.reportErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ true } value={ this.state.showJoined ? stream.joinedLicensorShare : stream.cumeLicensorShare } />
                </div>
              </div>
            )
          }) }
          <div className="row">
            <div className="col-xs-1 stream-name">
              Total
            </div>
            <div className="col-xs-2">
              <input className={ Details.errorClass(this.state.reportErrors, ["Title can't be blank"]) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ true } value={ this.state.showJoined ? (this.state.report.joinedTotalRevenue || "") : (this.state.report.cumeTotalRevenue || "") } />
            </div>
            <div className={ "col-xs-2" + this.grClass() }>
            </div>
            <div className={ "col-xs-2" + this.expenseClass() }>
              <input className={ Details.errorClass(this.state.reportErrors, ["Title can't be blank"]) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ true } value={ this.state.showJoined ? (this.state.report.joinedTotalExpenses || "") : (this.state.report.cumeTotalExpenses || "") } />
            </div>
            <div className={ "col-xs-2" + this.expenseClass() }>
            </div>
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
              <div className="label">Total</div>
              <input className={ Details.errorClass(this.state.reportErrors, ["Title can't be blank"]) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ true } value={ this.state.showJoined ? (this.state.report.joinedTotal || "") : (this.state.report.cumeTotal || "") } />
            </div>
          </div>
          <div className={ "row" + this.dealType4Only() }>
            <div className="col-xs-2 col-xs-offset-4">
              <div className="label">Cumulative Expenses</div>
              <input className={ Details.errorClass(this.state.reportErrors, FM.errors.cumeTotalExpenses) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ this.state.report.id === 0 || this.state.showJoined } value={ this.state.showJoined ? (this.state.report.joinedTotalExpenses || "") : (this.state.report.cumeTotalExpenses || "") } data-field="cumeTotalExpenses" />
            </div>
            <div className="col-xs-2 col-xs-offset-2">
              <div className="label">Expense Cap</div>
                <input className={ Details.errorClass(this.state.reportErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ true } value={ this.state.report.expenseCap || "" } />
              </div>
          </div>
          <div className="row">
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
            </div>
            <div className={ "col-xs-2" + this.grClass() }>
            </div>
            <div className={ "col-xs-2" + this.expenseClass() }>
              <div className="label">Expense Cap</div>
              <input className={ Details.errorClass(this.state.reportErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ true } value={ this.state.report.expenseCap || "" } />
            </div>
            <div className={ "col-xs-2" + this.expenseClass() }>
            </div>
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
              <div className="label">E & O</div>
              <input className={ Details.errorClass(this.state.reportErrors, FM.errors.eAndO) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ this.state.report.id === 0 } value={ this.state.report.eAndO || "" } data-field="eAndO" />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
            </div>
            <div className={ "col-xs-2" + this.grClass() }>
            </div>
            <div className={ "col-xs-2" + this.expenseClass() }>
            </div>
            <div className={ "col-xs-2" + this.expenseClass() }>
            </div>
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
              <div className="label">MG</div>
              <input className={ Details.errorClass(this.state.reportErrors, FM.errors.mg) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ this.state.report.id === 0 } value={ this.state.report.mg || "" } data-field="mg" />
            </div>
          </div>
          <div className={ "row" + (this.state.report.joinedReserve === "$0.00" ? " hidden" : "") }>
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
            </div>
            <div className={ "col-xs-2" + this.grClass() }>
            </div>
            <div className={ "col-xs-2" + this.expenseClass() }>
            </div>
            <div className={ "col-xs-2" + this.expenseClass() }>
            </div>
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
              <div className="label">Reserve Against Returns</div>
              <input className={ Details.errorClass(this.state.reportErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ true } value={ this.state.showJoined ? (this.state.report.joinedReserve || "") : (this.state.report.cumeReserve || "") } />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
            </div>
            <div className={ "col-xs-2" + this.grClass() }>
            </div>
            <div className={ "col-xs-2" + this.expenseClass() }>
            </div>
            <div className={ "col-xs-2" + this.expenseClass() }>
            </div>
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
              <div className="label">Amount Paid</div>
              <input className={ Details.errorClass(this.state.reportErrors, FM.errors.amountPaid) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ this.state.report.id === 0 } value={ this.state.report.amountPaid || "" } data-field="amountPaid" />
            </div>
          </div>
          <div className="row last-row">
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
            </div>
            <div className={ "col-xs-2" + this.grClass() }>
            </div>
            <div className={ "col-xs-2" + this.expenseClass() }>
            </div>
            <div className={ "col-xs-2" + this.expenseClass() }>
            </div>
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
              <div className="label">Amount Due</div>
              <input className={ Details.errorClass(this.state.reportErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } readOnly={ true } value={ this.state.showJoined ? (this.state.report.joinedAmountDue || "") : (this.state.report.amountDue || "") } />
            </div>
          </div>
          { this.renderButtons() }
        </div>
      </div>
    );
  }

  renderRowHeaders() {
    return(
      <div className="row headers">
        <div className="col-xs-1">
        </div>
        <div className="col-xs-2">
          Revenue
        </div>
        <div className={ "col-xs-2" + this.grClass() }>
          { this.state.report.grPercentage }% Fee
        </div>
        <div className={ "col-xs-2" + this.expenseClass() }>
          Expenses
        </div>
        <div className={ "col-xs-2" + this.expenseClass() }>
          Difference
        </div>
        <div className="col-xs-1">
          %
        </div>
        <div className="col-xs-2">
          Net Licensor Share
        </div>
      </div>
    );
  }

  renderButtons() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={ "orange-button " + Common.renderInactiveButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        <a id="export" className={ "orange-button " + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickExport.bind(this) }>
          Export PDF
        </a>
        <a id="toggle" className={ "orange-button " + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickToggle.bind(this) }>
          { this.state.showJoined ? "Including Current Period" : "Not Including Current Period" }
        </a>
      </div>
    )
  }

  grClass() {
    if (this.state.report.dealId >= 5) {
      return "";
    } else {
      return " hidden"
    }
  }

  expenseClass() {
    if (this.state.report.dealId !== 1 && this.state.report.dealId !== 4) {
      return "";
    } else {
      return " hidden"
    }
  }

  dealType4Only() {
    if (this.state.report.dealId == 4) {
      return "";
    } else {
      return " hidden"
    }
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
    $('.match-height-row').matchHeight();
  }
}

export default ReportDetails;
