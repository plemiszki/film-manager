import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Common, removeFinanceSymbols, Details } from 'handy-components'
import { fetchEntity, updateEntity, exportUncrossedReports } from '../actions/index'

const NO_EXPENSES_DEAL_ID = 1;
const EXPENSES_FROM_TOP_DEAL_ID = 2;
const THEATRICAL_EXPENSES_FROM_TOP_DEAL_ID = 3;
const EXPENSES_FROM_BOTTOM_DEAL_ID = 4;
const GR_PERCENTAGE_DEAL_ID = 5;
const GR_PERCENTAGE_THEATRICAL_DEAL_ID = 6;

class ReportDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      report: {},
      reportSaved: {},
      errors: {},
      streams: [],
      streamsSaved: [],
      films: [],
      changesToSave: false,
      justSaved: false,
      showJoined: true,
      jobModalOpen: false,
      job: {}
    };
  }

  componentDidMount() {
    this.props.fetchEntity({
      directory: 'royalty_reports',
      id: window.location.pathname.split("/")[2]
    }).then(() => {
      this.setState({
        report: this.props.report,
        reportSaved: Tools.deepCopy(this.props.report),
        streams: this.props.streams,
        streamsSaved: Tools.deepCopy(this.props.streams),
        fetching: false,
        films: this.props.films
      }, () => {
        this.setState({
          changesToSave: this.checkForChanges()
        });
      });
    });
  }

  clickSave() {
    let newStreams = {}
    this.state.streams.forEach((stream) => {
      newStreams[stream.id] = {
        licensor_percentage: stream.licensorPercentage,
        current_revenue: removeFinanceSymbols(stream.currentRevenue),
        current_expense: removeFinanceSymbols(stream.currentExpense),
        cume_revenue: removeFinanceSymbols(stream.cumeRevenue),
        cume_expense: removeFinanceSymbols(stream.cumeExpense)
      }
    });
    this.setState({
      fetching: true,
      justSaved: true
    }, () => {
      this.props.updateEntity({
        id: window.location.pathname.split('/')[2],
        directory: 'royalty_reports',
        entityName: 'report',
        entity: {
          mg: removeFinanceSymbols(this.state.report.mg),
          e_and_o: removeFinanceSymbols(this.state.report.eAndO),
          amount_paid: removeFinanceSymbols(this.state.report.amountPaid),
          current_total_expenses: removeFinanceSymbols(this.state.report.currentTotalExpenses),
          cume_total_expenses: removeFinanceSymbols(this.state.report.cumeTotalExpenses)
        },
        additionalData: {
          streams: newStreams
        }
      }).then(() => {
        this.setState({
          fetching: false,
          changesToSave: false,
          report: this.props.report,
          reportSaved: Tools.deepCopy(this.props.report),
          streams: this.props.streams,
          streamsSaved: Tools.deepCopy(this.props.streams),
          films: this.props.films
        });
      }, () => {
        const { errors } = this.props;
        this.setState({
          fetching: false,
          errors,
        });
      });
    });
  }

  clickTitle(id) {
    window.location.pathname = `films/${id}`;
  }

  clickToggle() {
    this.setState({
      showJoined: !this.state.showJoined
    });
  }

  clickExport() {
    window.location.pathname = 'api/royalty_reports/' + window.location.pathname.split('/')[2] + '/export';
  }

  clickExportUncrossed() {
    this.setState({
      fetching: true
    }, () => {
      this.props.exportUncrossedReports({
        filmIds: this.state.films.map(film => film.id),
        quarter: this.state.report.quarter,
        year: this.state.report.year
      }).then(() => {
        this.setState({
          fetching: false,
          job: this.props.job,
          jobModalOpen: true
        });
      });
    });
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
    const { showJoined, report, streams } = this.state;
    const { dealId } = report;
    const crossedStatement = (report.id === 0);

    const showExpenseColumn = [
      EXPENSES_FROM_TOP_DEAL_ID,
      THEATRICAL_EXPENSES_FROM_TOP_DEAL_ID,
      GR_PERCENTAGE_DEAL_ID,
      GR_PERCENTAGE_THEATRICAL_DEAL_ID,
    ].includes(dealId);

    const showGRColumn = [
      GR_PERCENTAGE_DEAL_ID,
      GR_PERCENTAGE_THEATRICAL_DEAL_ID,
    ].includes(dealId);

    return(
      <div className="component">
        { this.renderHeader() }
        <div className="white-box">

          { /* Current Period */ }
          <h4>Current Period</h4>
          { this.renderRowHeaders(showExpenseColumn, showGRColumn) }
          { this.state.streams.map((stream, index) => {
            const errorsKey = streams[index].id;
            return(
              <div key={ index } className="row">
                <div className="col-xs-1 stream-name">
                  { stream.nickname }
                </div>
                { Details.renderField.bind(this)({
                  hideHeader: true,
                  columnWidth: 2,
                  entities: 'streams',
                  entitiesIndex: index,
                  property: 'currentRevenue',
                  readOnly: crossedStatement,
                  showErrorText: false,
                  errorsKey,
                }) }
                { showGRColumn ? (
                  <>
                    { Details.renderField.bind(this)({
                      hideHeader: true,
                      columnWidth: 2,
                      entities: 'streams',
                      entitiesIndex: index,
                      property: 'currentGr',
                      readOnly: crossedStatement,
                      showErrorText: false,
                    }) }
                  </>
                ) : null }
                { showExpenseColumn ? (
                  <>
                    { Details.renderField.bind(this)({
                      hideHeader: true,
                      columnWidth: 2,
                      entities: 'streams',
                      entitiesIndex: index,
                      property: 'currentExpense',
                      readOnly: crossedStatement,
                      showErrorText: false,
                      errorsKey,
                    }) }
                    { Details.renderField.bind(this)({
                      hideHeader: true,
                      columnWidth: 2,
                      entities: 'streams',
                      entitiesIndex: index,
                      property: 'currentDifference',
                      readOnly: true,
                      showErrorText: false,
                      errorsKey,
                    }) }
                  </>
                ) : null }
                { Details.renderField.bind(this)({
                  hideHeader: true,
                  columnWidth: 1,
                  entities: 'streams',
                  entitiesIndex: index,
                  property: 'licensorPercentage',
                  readOnly: crossedStatement,
                  showErrorText: false,
                  errorsKey,
                }) }
                { Details.renderField.bind(this)({
                  hideHeader: true,
                  columnWidth: 2,
                  entities: 'streams',
                  entitiesIndex: index,
                  property: 'currentLicensorShare',
                  readOnly: true,
                  showErrorText: false,
                  errorsKey,
                }) }
              </div>
            )
          }) }

          { /* Current Period Totals */ }
          <div className="row">
            <div className="col-xs-1 stream-name">
              Total
            </div>
            { Details.renderField.bind(this)({
              hideHeader: true,
              columnWidth: 2,
              entity: 'report',
              property: 'currentTotalRevenue',
              readOnly: true,
              showErrorText: false,
            }) }
            { showGRColumn ? (
              <div className="col-xs-2"></div>
            ) : null }
            { showExpenseColumn ? (
              <>
                { Details.renderField.bind(this)({
                  hideHeader: true,
                  columnWidth: 2,
                  entity: 'report',
                  property: 'currentTotalExpenses',
                  readOnly: true,
                  showErrorText: false,
                }) }
                <div className="col-xs-2"></div>
              </>
            ) : null }
            <div className="col-xs-1"></div>
            { Details.renderField.bind(this)({
              hideHeader: true,
              columnWidth: 2,
              entity: 'report',
              leftLabel: 'Total',
              property: 'currentTotal',
              readOnly: true,
              showErrorText: false,
            }) }
          </div>

          { /* Current Reserve */ }
          <div className={ "row" + (report.currentReserve === "$0.00" ? " hidden" : "") }>
            <div className="col-xs-3"></div>
            { showGRColumn ? (
              <div className="col-xs-2"></div>
            ) : null }
            { showExpenseColumn ? (
              <div className="col-xs-4"></div>
            ) : null }
            <div className="col-xs-1"></div>
            { Details.renderField.bind(this)({
              hideHeader: true,
              columnWidth: 2,
              leftLabel: 'Reserve Against Returns',
              entity: 'report',
              property: 'currentReserve',
              readOnly: true,
              showErrorText: false,
            }) }
          </div>

          { /* Current Liquidated Reserve */ }
          { report.currentLiquidatedReserve === "$0.00" ? null : (
            <div className="row">
              <div className="col-xs-3"></div>
              { showGRColumn ? (
                <div className="col-xs-2"></div>
              ) : null }
              { showExpenseColumn ? (
                <div className="col-xs-4"></div>
              ) : null }
              <div className="col-xs-1"></div>
              { Details.renderField.bind(this)({
                hideHeader: true,
                columnWidth: 2,
                leftLabel: 'Liquidated Reserve',
                entity: 'report',
                property: 'currentLiquidatedReserve',
                readOnly: true,
                showErrorText: false,
              }) }
            </div>
          ) }

          { /* Current Expenses (Deal 4 Only) */ }
          { dealId === EXPENSES_FROM_BOTTOM_DEAL_ID ? (
            <div className="row">
              { Details.renderField.bind(this)({
                hideHeader: true,
                columnWidth: 2,
                columnOffset: 4,
                leftLabel: 'Current Expenses',
                entity: 'report',
                property: 'currentTotalExpenses',
                readOnly: crossedStatement,
                showErrorText: false,
                errorsKey: 'report',
              }) }
            </div>
          ) : null }

          { /* Current Licensor Share (Deal 4 Only) */ }
          { dealId === EXPENSES_FROM_BOTTOM_DEAL_ID ? (
            <div className="row">
              { Details.renderField.bind(this)({
                hideHeader: true,
                columnWidth: 2,
                columnOffset: 4,
                leftLabel: 'Current Licensor Share',
                entity: 'report',
                property: 'currentShareMinusExpenses',
                readOnly: true,
                showErrorText: false,
              }) }
            </div>
          ) : null }

          <hr />

          { /* Cumulative Period */ }
          <h4>Cumulative</h4>
          { this.renderRowHeaders(showExpenseColumn, showGRColumn) }
          { this.state.streams.map((stream, index) => {
            const errorsKey = streams[index].id;
            return(
              <div key={ index } className="row">
                <div className="col-xs-1 stream-name">
                  { stream.nickname }
                </div>
                { Details.renderField.bind(this)({
                  hideHeader: true,
                  columnWidth: 2,
                  entities: 'streams',
                  entitiesIndex: index,
                  property: (showJoined ? 'joinedRevenue' : 'cumeRevenue'),
                  readOnly: (crossedStatement || showJoined),
                  showErrorText: false,
                  errorsKey,
                }) }
                { showGRColumn ? (
                  <>
                    { Details.renderField.bind(this)({
                      hideHeader: true,
                      columnWidth: 2,
                      entities: 'streams',
                      entitiesIndex: index,
                      property: (showJoined ? 'joinedGr' : 'cumeGr'),
                      readOnly: true,
                      showErrorText: false,
                      errorsKey,
                    }) }
                  </>
                ) : null }
                { showExpenseColumn ? (
                  <>
                    { Details.renderField.bind(this)({
                      hideHeader: true,
                      columnWidth: 2,
                      entities: 'streams',
                      entitiesIndex: index,
                      property: (showJoined ? 'joinedExpense' : 'cumeExpense'),
                      readOnly: (crossedStatement || showJoined),
                      showErrorText: false,
                      errorsKey,
                    }) }
                    { Details.renderField.bind(this)({
                      hideHeader: true,
                      columnWidth: 2,
                      entities: 'streams',
                      entitiesIndex: index,
                      property: (showJoined ? 'joinedDifference' : 'cumeDifference'),
                      readOnly: true,
                      showErrorText: false,
                      errorsKey,
                    }) }
                  </>
                ) : null }
                { Details.renderField.bind(this)({
                  hideHeader: true,
                  columnWidth: 1,
                  entities: 'streams',
                  entitiesIndex: index,
                  property: 'licensorPercentage',
                  readOnly: true,
                  showErrorText: false,
                  errorsKey,
                }) }
                { Details.renderField.bind(this)({
                  hideHeader: true,
                  columnWidth: 2,
                  entities: 'streams',
                  entitiesIndex: index,
                  property: (showJoined ? 'joinedLicensorShare' : 'cumeLicensorShare'),
                  readOnly: true,
                  showErrorText: false,
                  errorsKey,
                }) }
              </div>
            )
          }) }

          { /* Cume Totals */ }
          <div className="row">
            <div className="col-xs-1 stream-name">
              Total
            </div>
            { Details.renderField.bind(this)({
              hideHeader: true,
              columnWidth: 2,
              entity: 'report',
              property: (showJoined ? 'joinedTotalRevenue' : 'cumeTotalRevenue'),
              readOnly: true,
              showErrorText: false,
            }) }
            { showGRColumn ? (
              <div className="col-xs-2"></div>
            ) : null }
            { showExpenseColumn ? (
              <>
                { Details.renderField.bind(this)({
                  hideHeader: true,
                  columnWidth: 2,
                  entity: 'report',
                  property: (showJoined ? 'joinedTotalExpenses' : 'cumeTotalExpenses'),
                  readOnly: true,
                  showErrorText: false,
                }) }
                <div className="col-xs-2"></div>
              </>
            ) : null }
            <div className="col-xs-1"></div>
            { Details.renderField.bind(this)({
              hideHeader: true,
              columnWidth: 2,
              leftLabel: 'Total',
              entity: 'report',
              property: (showJoined ? 'joinedTotal' : 'cumeTotal'),
              readOnly: true,
              showErrorText: false,
            }) }
          </div>

          { /* Cumulative Expenses, Expense Cap (Deal 4 only) */ }
          { dealId === EXPENSES_FROM_BOTTOM_DEAL_ID ? (
            <div className="row">
              { Details.renderField.bind(this)({
                hideHeader: true,
                leftLabel: 'Cumulative Expenses',
                columnWidth: 2,
                columnOffset: 4,
                entity: 'report',
                property: (showJoined ? 'joinedTotalExpenses' : 'cumeTotalExpenses'),
                readOnly: (showJoined || crossedStatement),
                showErrorText: false,
              }) }
              { Details.renderField.bind(this)({
                hideHeader: true,
                columnWidth: 2,
                columnOffset: 2,
                leftLabel: 'Expense Cap',
                entity: 'report',
                property: 'expenseCap',
                readOnly: true,
                showErrorText: false,
              }) }
            </div>
          ) : null }

          { /* Expense Cap, E & O */ }
          <div className="row">
            <div className="col-xs-3"></div>
            { showGRColumn ? (
              <div className="col-xs-2"></div>
            ) : null }
            { showExpenseColumn ? (
              <>
                { Details.renderField.bind(this)({
                  hideHeader: true,
                  columnWidth: 2,
                  leftLabel: 'Expense Cap',
                  entity: 'report',
                  property: 'expenseCap',
                  readOnly: true,
                  showErrorText: false,
                }) }
                <div className="col-xs-2"></div>
              </>
            ) : null }
            <div className="col-xs-1"></div>
            { Details.renderField.bind(this)({
              hideHeader: true,
              columnWidth: 2,
              leftLabel: 'E & O',
              entity: 'report',
              property: 'eAndO',
              errorsKey: 'report',
              readOnly: crossedStatement,
              showErrorText: false,
            }) }
          </div>

          { /* MG */ }
          <div className="row">
            <div className="col-xs-3"></div>
            { showGRColumn ? (
              <div className="col-xs-2"></div>
            ) : null }
            { showExpenseColumn ? (
              <div className="col-xs-4"></div>
            ) : null }
            <div className="col-xs-1"></div>
            { Details.renderField.bind(this)({
              hideHeader: true,
              columnWidth: 2,
              leftLabel: 'MG',
              entity: 'report',
              property: 'mg',
              errorsKey: 'report',
              readOnly: crossedStatement,
              showErrorText: false,
            }) }
          </div>

          { /* Reserve Against Returns */ }
          <div className={ "row" + (this.state.report.joinedReserve === "$0.00" ? " hidden" : "") }>
            <div className="col-xs-3"></div>
            { showGRColumn ? (
              <div className="col-xs-2"></div>
            ) : null }
            { showExpenseColumn ? (
              <div className="col-xs-4"></div>
            ) : null }
            <div className="col-xs-1">
            </div>
            { Details.renderField.bind(this)({
              hideHeader: true,
              columnWidth: 2,
              leftLabel: 'Reserve Against Returns',
              entity: 'report',
              property: (showJoined ? 'joinedReserve' : 'cumeReserve'),
              readOnly: true,
              showErrorText: false,
            }) }
          </div>

          { /* Liquidated Reserve */ }
          <div className={ "row" + (this.state.report.joinedLiquidatedReserve === "$0.00" ? " hidden" : "") }>
            <div className="col-xs-3"></div>
            { showGRColumn ? (
              <div className="col-xs-2"></div>
            ) : null }
            { showExpenseColumn ? (
              <div className="col-xs-4"></div>
            ) : null }
            <div className="col-xs-1">
            </div>
            { Details.renderField.bind(this)({
              hideHeader: true,
              columnWidth: 2,
              leftLabel: 'Liquidated Reserve',
              entity: 'report',
              property: (showJoined ? 'joinedLiquidatedReserve' : 'cumeLiquidatedReserve'),
              readOnly: true,
              showErrorText: false,
            }) }
          </div>

          { /* Amount Paid */ }
          <div className="row">
            <div className="col-xs-3"></div>
            { showGRColumn ? (
              <div className="col-xs-2"></div>
            ) : null }
            { showExpenseColumn ? (
              <div className="col-xs-4"></div>
            ) : null }
            <div className="col-xs-1">
            </div>
            { Details.renderField.bind(this)({
              hideHeader: true,
              columnWidth: 2,
              leftLabel: 'Amount Paid',
              entity: 'report',
              property: 'amountPaid',
              readOnly: crossedStatement,
              showErrorText: false,
              errorsKey: 'report',
            }) }
          </div>

          { /* Amount Due */ }
          <div className="row last-row">
            <div className="col-xs-3"></div>
            { showGRColumn ? (
              <div className="col-xs-2"></div>
            ) : null }
            { showExpenseColumn ? (
              <div className="col-xs-4"></div>
            ) : null }
            <div className="col-xs-1">
            </div>
            { Details.renderField.bind(this)({
              hideHeader: true,
              columnWidth: 2,
              leftLabel: 'Amount Due',
              entity: 'report',
              property: (showJoined ? 'joinedAmountDue' : 'amountDue'),
              readOnly: true,
              showErrorText: false,
            }) }
          </div>
          { this.renderButtons() }
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
        </div>
        { Common.renderJobModal.call(this, this.state.job) }
      </div>
    );
  }

  renderHeader() {
    if (this.state.films.length === 0) {
      return null;
    } else if (this.state.films.length === 1) {
      let film = this.state.films[0];
      return([
        <h1 key="1"><span onClick={ this.clickTitle.bind(this, film.id) }>{ film.title }</span></h1>,
        <h3 key="2">{ this.state.report.year } - Q{ this.state.report.quarter }</h3>
      ]);
    } else {
      return([
        <h1 key="1">Crossed Films Statement</h1>,
        <h3 key="2">{ this.state.report.year } - Q{ this.state.report.quarter }</h3>,
        <div key="3" className="white-box crossed-statement-header">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <div>
            { this.state.films.map((film, index) => {
              return(
                <a key={ index } href={ `/films/${film.id}` }>{ film.title }</a>
              );
            }) }
          </div>
          <div id="export-uncrossed" className={ "btn orange-button " + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ this.clickExportUncrossed.bind(this) }>
            Export Uncrossed Statements
          </div>
        </div>
      ]);
    }
  }

  renderRowHeaders(showExpenseColumn, showGRColumn) {
    return(
      <div className="row headers">
        <div className="col-xs-1"></div>
        <div className="col-xs-2">
          Revenue
        </div>
        { showGRColumn ? (
          <div className="col-xs-2">
            { this.state.report.grPercentage }% Fee
          </div>
        ) : null }
        { showExpenseColumn ? (
          <>
            <div className="col-xs-2">
              Expenses
            </div>
            <div className="col-xs-2">
              Difference
            </div>
          </>
        ) : null }
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
        <a className={ "btn orange-button " + Common.renderDisabledButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        <a id="export" className={ "btn orange-button " + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ this.clickExport.bind(this) }>
          Export PDF
        </a>
        <a id="toggle" className={ "btn orange-button " + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ this.clickToggle.bind(this) }>
          { this.state.showJoined ? "Including Current Period" : "Not Including Current Period" }
        </a>
      </div>
    )
  }

  componentDidUpdate() {
    Common.updateJobModal.call(this);
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntity, updateEntity, exportUncrossedReports }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ReportDetails);
