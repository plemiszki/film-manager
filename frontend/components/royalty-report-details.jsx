import React from "react";
import {
  Common,
  removeFinanceSymbols,
  Details,
  fetchEntity,
  updateEntity,
  deepCopy,
  sendRequest,
  Spinner,
  GrayedOut,
  Button,
  SaveButton,
} from "handy-components";

const NO_EXPENSES_DEAL_ID = 1;
const EXPENSES_FROM_TOP_DEAL_ID = 2;
const THEATRICAL_EXPENSES_FROM_TOP_DEAL_ID = 3;
const EXPENSES_FROM_BOTTOM_DEAL_ID = 4;
const GR_PERCENTAGE_DEAL_ID = 5;
const GR_PERCENTAGE_THEATRICAL_DEAL_ID = 6;

export default class ReportDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spinner: true,
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
      job: {},
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { report, streams, films } = response;
      this.setState(
        {
          report,
          reportSaved: deepCopy(report),
          streams,
          streamsSaved: deepCopy(streams),
          spinner: false,
          films,
        },
        () => {
          this.setState({
            changesToSave: this.checkForChanges(),
          });
        },
      );
    });
  }

  clickSave() {
    let newStreams = {};
    this.state.streams.forEach((stream) => {
      newStreams[stream.id] = {
        licensor_percentage: stream.licensorPercentage,
        current_revenue: removeFinanceSymbols(stream.currentRevenue),
        current_expense: removeFinanceSymbols(stream.currentExpense),
        cume_revenue: removeFinanceSymbols(stream.cumeRevenue),
        cume_expense: removeFinanceSymbols(stream.cumeExpense),
      };
    });
    this.setState(
      {
        spinner: true,
        justSaved: true,
      },
      () => {
        const { report } = this.state;
        updateEntity({
          entityName: "report",
          entity: {
            mg: removeFinanceSymbols(report.mg),
            e_and_o: removeFinanceSymbols(report.eAndO),
            amount_paid: removeFinanceSymbols(report.amountPaid),
            current_total_expenses: removeFinanceSymbols(
              report.currentTotalExpenses,
            ),
            cume_total_expenses: removeFinanceSymbols(report.cumeTotalExpenses),
          },
          additionalData: {
            streams: newStreams,
          },
        }).then(
          (response) => {
            const { report, streams, films } = response;
            this.setState({
              spinner: false,
              changesToSave: false,
              report,
              reportSaved: deepCopy(report),
              streams,
              streamsSaved: deepCopy(streams),
              films,
            });
          },
          (response) => {
            const { errors } = response;
            this.setState({
              spinner: false,
              errors,
            });
          },
        );
      },
    );
  }

  clickTitle(id) {
    window.location.pathname = `films/${id}`;
  }

  clickToggle() {
    this.setState({
      showJoined: !this.state.showJoined,
    });
  }

  clickExport() {
    window.location.pathname =
      "api/royalty_reports/" +
      window.location.pathname.split("/")[2] +
      "/export";
  }

  clickExportUncrossed() {
    this.setState(
      {
        spinner: true,
      },
      () => {
        const { films, report } = this.state;
        sendRequest("/api/royalty_reports/export_uncrossed", {
          data: {
            filmIds: films.map((film) => film.id),
            quarter: report.quarter,
            year: report.year,
          },
        }).then((response) => {
          const { job } = response;
          this.setState({
            spinner: false,
            job,
            jobModalOpen: true,
          });
        });
      },
    );
  }

  checkForChanges() {
    if (
      Tools.objectsAreEqual(this.state.report, this.state.reportSaved) === false
    ) {
      return true;
    } else {
      return !Tools.objectsAreEqual(
        this.state.streams,
        this.state.streamsSaved,
      );
    }
  }

  changeFieldArgs(errors) {
    return {
      thing: "report",
      errorsArray: errors || this.state.reportErrors,
      changesFunction: this.checkForChanges.bind(this),
    };
  }

  render() {
    const { showJoined, report, streams, spinner, justSaved, changesToSave } =
      this.state;
    const { dealId } = report;
    const crossedStatement = report.id === 0;

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

    const inputStyles = {
      padding: "8px",
      marginBottom: "10px",
    };

    return (
      <>
        <div className="handy-component">
          {this.renderHeader()}
          <div className="white-box">
            {/* Current Period */}
            <h4>Current Period</h4>
            {this.renderRowHeaders(showExpenseColumn, showGRColumn)}
            {this.state.streams.map((stream, index) => {
              const errorsKey = streams[index].id;
              return (
                <div key={index} className="row">
                  <div className="col-xs-1 stream-name">{stream.nickname}</div>
                  {Details.renderField.bind(this)({
                    hideHeader: true,
                    columnWidth: 2,
                    entities: "streams",
                    entitiesIndex: index,
                    property: "currentRevenue",
                    readOnly: crossedStatement,
                    showErrorText: false,
                    errorsKey,
                    inputStyles,
                  })}
                  {showGRColumn ? (
                    <>
                      {Details.renderField.bind(this)({
                        hideHeader: true,
                        columnWidth: 2,
                        entities: "streams",
                        entitiesIndex: index,
                        property: "currentGr",
                        readOnly: crossedStatement,
                        showErrorText: false,
                        inputStyles,
                      })}
                    </>
                  ) : null}
                  {showExpenseColumn ? (
                    <>
                      {Details.renderField.bind(this)({
                        hideHeader: true,
                        columnWidth: 2,
                        entities: "streams",
                        entitiesIndex: index,
                        property: "currentExpense",
                        readOnly: crossedStatement,
                        showErrorText: false,
                        errorsKey,
                        inputStyles,
                      })}
                      {Details.renderField.bind(this)({
                        hideHeader: true,
                        columnWidth: 2,
                        entities: "streams",
                        entitiesIndex: index,
                        property: "currentDifference",
                        readOnly: true,
                        showErrorText: false,
                        errorsKey,
                        inputStyles,
                      })}
                    </>
                  ) : null}
                  {Details.renderField.bind(this)({
                    hideHeader: true,
                    columnWidth: 1,
                    entities: "streams",
                    entitiesIndex: index,
                    property: "licensorPercentage",
                    readOnly: crossedStatement,
                    showErrorText: false,
                    errorsKey,
                    inputStyles,
                  })}
                  {Details.renderField.bind(this)({
                    hideHeader: true,
                    columnWidth: 2,
                    entities: "streams",
                    entitiesIndex: index,
                    property: "currentLicensorShare",
                    readOnly: true,
                    showErrorText: false,
                    errorsKey,
                    inputStyles,
                  })}
                </div>
              );
            })}

            {/* Current Period Totals */}
            <div className="row">
              <div className="col-xs-1 stream-name">Total</div>
              {Details.renderField.bind(this)({
                hideHeader: true,
                columnWidth: 2,
                entity: "report",
                property: "currentTotalRevenue",
                readOnly: true,
                showErrorText: false,
                inputStyles,
              })}
              {showGRColumn ? <div className="col-xs-2"></div> : null}
              {showExpenseColumn ? (
                <>
                  {Details.renderField.bind(this)({
                    hideHeader: true,
                    columnWidth: 2,
                    entity: "report",
                    property: "currentTotalExpenses",
                    readOnly: true,
                    showErrorText: false,
                    inputStyles,
                  })}
                  <div className="col-xs-2"></div>
                </>
              ) : null}
              <div className="col-xs-1"></div>
              {Details.renderField.bind(this)({
                hideHeader: true,
                columnWidth: 2,
                entity: "report",
                leftLabel: "Total",
                property: "currentTotal",
                readOnly: true,
                showErrorText: false,
                inputStyles,
              })}
            </div>

            {/* Current Reserve */}
            <div
              className={
                "row" + (report.currentReserve === "$0.00" ? " hidden" : "")
              }
            >
              <div className="col-xs-3"></div>
              {showGRColumn ? <div className="col-xs-2"></div> : null}
              {showExpenseColumn ? <div className="col-xs-4"></div> : null}
              <div className="col-xs-1"></div>
              {Details.renderField.bind(this)({
                hideHeader: true,
                columnWidth: 2,
                leftLabel: "Reserve Against Returns",
                entity: "report",
                property: "currentReserve",
                readOnly: true,
                showErrorText: false,
                inputStyles,
              })}
            </div>

            {/* Current Liquidated Reserve */}
            {report.currentLiquidatedReserve === "$0.00" ? null : (
              <div className="row">
                <div className="col-xs-3"></div>
                {showGRColumn ? <div className="col-xs-2"></div> : null}
                {showExpenseColumn ? <div className="col-xs-4"></div> : null}
                <div className="col-xs-1"></div>
                {Details.renderField.bind(this)({
                  hideHeader: true,
                  columnWidth: 2,
                  leftLabel: "Liquidated Reserve",
                  entity: "report",
                  property: "currentLiquidatedReserve",
                  readOnly: true,
                  showErrorText: false,
                  inputStyles,
                })}
              </div>
            )}

            {/* Current Expenses (Deal 4 Only) */}
            {dealId === EXPENSES_FROM_BOTTOM_DEAL_ID ? (
              <div className="row">
                {Details.renderField.bind(this)({
                  hideHeader: true,
                  columnWidth: 2,
                  columnOffset: 4,
                  leftLabel: "Current Expenses",
                  entity: "report",
                  property: "currentTotalExpenses",
                  readOnly: crossedStatement,
                  showErrorText: false,
                  errorsKey: "report",
                  inputStyles,
                })}
              </div>
            ) : null}

            {/* Current Licensor Share (Deal 4 Only) */}
            {dealId === EXPENSES_FROM_BOTTOM_DEAL_ID ? (
              <div className="row">
                {Details.renderField.bind(this)({
                  hideHeader: true,
                  columnWidth: 2,
                  columnOffset: 4,
                  leftLabel: "Current Licensor Share",
                  entity: "report",
                  property: "currentShareMinusExpenses",
                  readOnly: true,
                  showErrorText: false,
                  inputStyles,
                })}
              </div>
            ) : null}

            <hr />

            {/* Cumulative Period */}
            <h4>Cumulative</h4>
            {this.renderRowHeaders(showExpenseColumn, showGRColumn)}
            {this.state.streams.map((stream, index) => {
              const errorsKey = streams[index].id;
              return (
                <div key={index} className="row">
                  <div className="col-xs-1 stream-name">{stream.nickname}</div>
                  {Details.renderField.bind(this)({
                    hideHeader: true,
                    columnWidth: 2,
                    entities: "streams",
                    entitiesIndex: index,
                    property: showJoined ? "joinedRevenue" : "cumeRevenue",
                    readOnly: crossedStatement || showJoined,
                    showErrorText: false,
                    errorsKey,
                    inputStyles,
                  })}
                  {showGRColumn ? (
                    <>
                      {Details.renderField.bind(this)({
                        hideHeader: true,
                        columnWidth: 2,
                        entities: "streams",
                        entitiesIndex: index,
                        property: showJoined ? "joinedGr" : "cumeGr",
                        readOnly: true,
                        showErrorText: false,
                        errorsKey,
                        inputStyles,
                      })}
                    </>
                  ) : null}
                  {showExpenseColumn ? (
                    <>
                      {Details.renderField.bind(this)({
                        hideHeader: true,
                        columnWidth: 2,
                        entities: "streams",
                        entitiesIndex: index,
                        property: showJoined ? "joinedExpense" : "cumeExpense",
                        readOnly: crossedStatement || showJoined,
                        showErrorText: false,
                        errorsKey,
                        inputStyles,
                      })}
                      {Details.renderField.bind(this)({
                        hideHeader: true,
                        columnWidth: 2,
                        entities: "streams",
                        entitiesIndex: index,
                        property: showJoined
                          ? "joinedDifference"
                          : "cumeDifference",
                        readOnly: true,
                        showErrorText: false,
                        errorsKey,
                        inputStyles,
                      })}
                    </>
                  ) : null}
                  {Details.renderField.bind(this)({
                    hideHeader: true,
                    columnWidth: 1,
                    entities: "streams",
                    entitiesIndex: index,
                    property: "licensorPercentage",
                    readOnly: true,
                    showErrorText: false,
                    errorsKey,
                    inputStyles,
                  })}
                  {Details.renderField.bind(this)({
                    hideHeader: true,
                    columnWidth: 2,
                    entities: "streams",
                    entitiesIndex: index,
                    property: showJoined
                      ? "joinedLicensorShare"
                      : "cumeLicensorShare",
                    readOnly: true,
                    showErrorText: false,
                    errorsKey,
                    inputStyles,
                  })}
                </div>
              );
            })}

            {/* Cume Totals */}
            <div className="row">
              <div className="col-xs-1 stream-name">Total</div>
              {Details.renderField.bind(this)({
                hideHeader: true,
                columnWidth: 2,
                entity: "report",
                property: showJoined
                  ? "joinedTotalRevenue"
                  : "cumeTotalRevenue",
                readOnly: true,
                showErrorText: false,
                inputStyles,
              })}
              {showGRColumn ? <div className="col-xs-2"></div> : null}
              {showExpenseColumn ? (
                <>
                  {Details.renderField.bind(this)({
                    hideHeader: true,
                    columnWidth: 2,
                    entity: "report",
                    property: showJoined
                      ? "joinedTotalExpenses"
                      : "cumeTotalExpenses",
                    readOnly: true,
                    showErrorText: false,
                    inputStyles,
                  })}
                  <div className="col-xs-2"></div>
                </>
              ) : null}
              <div className="col-xs-1"></div>
              {Details.renderField.bind(this)({
                hideHeader: true,
                columnWidth: 2,
                leftLabel: "Total",
                entity: "report",
                property: showJoined ? "joinedTotal" : "cumeTotal",
                readOnly: true,
                showErrorText: false,
                inputStyles,
              })}
            </div>

            {/* Cumulative Expenses, Expense Cap (Deal 4 only) */}
            {dealId === EXPENSES_FROM_BOTTOM_DEAL_ID ? (
              <div className="row">
                {Details.renderField.bind(this)({
                  hideHeader: true,
                  leftLabel: "Cumulative Expenses",
                  columnWidth: 2,
                  columnOffset: 4,
                  entity: "report",
                  property: showJoined
                    ? "joinedTotalExpenses"
                    : "cumeTotalExpenses",
                  readOnly: showJoined || crossedStatement,
                  showErrorText: false,
                  inputStyles,
                })}
                {Details.renderField.bind(this)({
                  hideHeader: true,
                  columnWidth: 2,
                  columnOffset: 2,
                  leftLabel: "Expense Cap",
                  entity: "report",
                  property: "expenseCap",
                  readOnly: true,
                  showErrorText: false,
                  inputStyles,
                })}
              </div>
            ) : null}

            {/* Expense Cap, E & O */}
            <div className="row">
              <div className="col-xs-3"></div>
              {showGRColumn ? <div className="col-xs-2"></div> : null}
              {showExpenseColumn ? (
                <>
                  {Details.renderField.bind(this)({
                    hideHeader: true,
                    columnWidth: 2,
                    leftLabel: "Expense Cap",
                    entity: "report",
                    property: "expenseCap",
                    readOnly: true,
                    showErrorText: false,
                    inputStyles,
                  })}
                  <div className="col-xs-2"></div>
                </>
              ) : null}
              <div className="col-xs-1"></div>
              {Details.renderField.bind(this)({
                hideHeader: true,
                columnWidth: 2,
                leftLabel: "E & O",
                entity: "report",
                property: "eAndO",
                errorsKey: "report",
                readOnly: crossedStatement,
                showErrorText: false,
                inputStyles,
              })}
            </div>

            {/* MG */}
            <div className="row">
              <div className="col-xs-3"></div>
              {showGRColumn ? <div className="col-xs-2"></div> : null}
              {showExpenseColumn ? <div className="col-xs-4"></div> : null}
              <div className="col-xs-1"></div>
              {Details.renderField.bind(this)({
                hideHeader: true,
                columnWidth: 2,
                leftLabel: "MG",
                entity: "report",
                property: "mg",
                errorsKey: "report",
                readOnly: crossedStatement,
                showErrorText: false,
                inputStyles,
              })}
            </div>

            {/* Reserve Against Returns */}
            <div
              className={
                "row" +
                (this.state.report.joinedReserve === "$0.00" ? " hidden" : "")
              }
            >
              <div className="col-xs-3"></div>
              {showGRColumn ? <div className="col-xs-2"></div> : null}
              {showExpenseColumn ? <div className="col-xs-4"></div> : null}
              <div className="col-xs-1"></div>
              {Details.renderField.bind(this)({
                hideHeader: true,
                columnWidth: 2,
                leftLabel: "Reserve Against Returns",
                entity: "report",
                property: showJoined ? "joinedReserve" : "cumeReserve",
                readOnly: true,
                showErrorText: false,
                inputStyles,
              })}
            </div>

            {/* Liquidated Reserve */}
            <div
              className={
                "row" +
                (this.state.report.joinedLiquidatedReserve === "$0.00"
                  ? " hidden"
                  : "")
              }
            >
              <div className="col-xs-3"></div>
              {showGRColumn ? <div className="col-xs-2"></div> : null}
              {showExpenseColumn ? <div className="col-xs-4"></div> : null}
              <div className="col-xs-1"></div>
              {Details.renderField.bind(this)({
                hideHeader: true,
                columnWidth: 2,
                leftLabel: "Liquidated Reserve",
                entity: "report",
                property: showJoined
                  ? "joinedLiquidatedReserve"
                  : "cumeLiquidatedReserve",
                readOnly: true,
                showErrorText: false,
                inputStyles,
              })}
            </div>

            {/* Amount Paid */}
            <div className="row">
              <div className="col-xs-3"></div>
              {showGRColumn ? <div className="col-xs-2"></div> : null}
              {showExpenseColumn ? <div className="col-xs-4"></div> : null}
              <div className="col-xs-1"></div>
              {Details.renderField.bind(this)({
                hideHeader: true,
                columnWidth: 2,
                leftLabel: "Amount Paid",
                entity: "report",
                property: "amountPaid",
                readOnly: crossedStatement,
                showErrorText: false,
                errorsKey: "report",
                inputStyles,
              })}
            </div>

            {/* Amount Due */}
            <div className="row last-row">
              <div className="col-xs-3"></div>
              {showGRColumn ? <div className="col-xs-2"></div> : null}
              {showExpenseColumn ? <div className="col-xs-4"></div> : null}
              <div className="col-xs-1"></div>
              {Details.renderField.bind(this)({
                hideHeader: true,
                columnWidth: 2,
                leftLabel: "Amount Due",
                entity: "report",
                property: showJoined ? "joinedAmountDue" : "amountDue",
                readOnly: true,
                showErrorText: false,
                inputStyles,
              })}
            </div>
            <div>
              <SaveButton
                justSaved={justSaved}
                changesToSave={changesToSave}
                disabled={spinner}
                onClick={() => {
                  this.clickSave();
                }}
              />
              <Button
                text="Export PDF"
                onClick={() => {
                  this.clickExport();
                }}
                disabled={spinner}
                float
              />
              <Button
                text={
                  showJoined
                    ? "Including Current Period"
                    : "Not Including Current Period"
                }
                onClick={() => {
                  this.clickToggle();
                }}
                disabled={spinner}
                float
                marginRight
              />
            </div>
            <GrayedOut visible={spinner} />
            <Spinner visible={spinner} />
          </div>
          {Common.renderJobModal.call(this, this.state.job)}
        </div>
        <style jsx>{`
          h4 {
            display: block;
            color: black;
            font-size: 18px;
            text-align: center;
            margin: auto;
            margin-bottom: 15px;
          }
          .stream-name {
            margin-top: 10px;
            text-align: center;
            font-family: "TeachableSans-Medium";
            font-size: 12px;
            color: #2c2f33;
          }
          .last-row {
            margin-bottom: 60px;
          }
          hr {
            margin-top: 20px;
          }
        `}</style>
      </>
    );
  }

  renderHeader() {
    const { spinner, films, report } = this.state;
    if (films.length === 0) {
      return null;
    } else if (films.length === 1) {
      let film = films[0];
      return (
        <div>
          <h1 key="1">
            <span onClick={this.clickTitle.bind(this, film.id)}>
              {film.title}
            </span>
          </h1>
          <h3 key="2">
            {report.year} - Q{report.quarter}
          </h3>
          <style jsx>{`
            h1,
            h3 {
              display: block;
              text-align: center;
              margin: auto;
            }
            h1 {
              margin-bottom: 10px;
            }
            h3 {
              font-size: 18px;
              margin-bottom: 15px;
            }
          `}</style>
        </div>
      );
    } else {
      return (
        <div>
          <h1 key="1">Crossed Films Statement</h1>
          <h3 key="2">
            {report.year} - Q{report.quarter}
          </h3>
          <div key="3" className="white-box crossed-statement-header">
            <Spinner visible={spinner} />
            <GrayedOut visible={spinner} />
            <div>
              {films.map((film, index) => {
                return (
                  <a key={index} href={`/films/${film.id}`}>
                    {film.title}
                  </a>
                );
              })}
            </div>
            <Button
              disabled={spinner}
              text="Export Uncrossed Statements"
              onClick={() => {
                this.clickExportUncrossed();
              }}
              style={{ marginTop: "20px" }}
            />
          </div>
          <style jsx>{`
            h1,
            h3 {
              display: block;
              text-align: center;
              margin: auto;
            }
            h1 {
              margin-bottom: 10px;
            }
            h3 {
              font-size: 18px;
              margin-bottom: 15px;
            }
            a {
              display: inline-block;
              width: calc(100% / 3);
              font-size: 12px;
              color: black;
              margin-bottom: 10px;
            }
            .crossed-statement-header {
              margin-bottom: 20px;
            }
          `}</style>
        </div>
      );
    }
  }

  renderRowHeaders(showExpenseColumn, showGRColumn) {
    return (
      <>
        <div className="row headers">
          <div className="col-xs-1"></div>
          <div className="col-xs-2">Revenue</div>
          {showGRColumn ? (
            <div className="col-xs-2">
              {this.state.report.grPercentage}% Fee
            </div>
          ) : null}
          {showExpenseColumn ? (
            <>
              <div className="col-xs-2">Expenses</div>
              <div className="col-xs-2">Difference</div>
            </>
          ) : null}
          <div className="col-xs-1">%</div>
          <div className="col-xs-2">Net Licensor Share</div>
        </div>
        <style jsx>{`
          .headers {
            color: black;
            margin-bottom: 10px;
            text-align: center;
          }
        `}</style>
      </>
    );
  }

  componentDidUpdate() {
    Common.updateJobModal.call(this);
  }
}
