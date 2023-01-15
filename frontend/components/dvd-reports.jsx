import React from 'react'
import Modal from 'react-modal'
import { Common, stringifyDate, Details, ellipsis, sendRequest, Button, GrayedOut, Spinner } from 'handy-components'

const exportModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#FFFFFF',
    margin: 'auto',
    maxWidth: 540,
    height: 250,
    border: 'solid 1px black',
    borderRadius: '6px',
    color: '#5F5F5F',
    padding: '30px'
  }
};

export default class DvdReports extends React.Component {

  constructor(props) {
    super(props)
    var job = {
      errorsText: ""
    };
    this.state = {
      fetching: true,
      customers: [],
      titleReportCustomers: [],
      yearTotal: null,
      monthTotals: [],
      dvds: [],
      year: (new Date).getFullYear(),
      exportModalOpen: false,
      export: {
        startDate: stringifyDate(new Date),
        endDate: stringifyDate(new Date)
      },
      errors: [],
      jobModalOpen: !!job.id,
      job: job
    };
  }

  componentDidMount() {
    $('#admin-right-column-content').css('padding', '30px 20px');
    this.fetchReportData();
  }

  fetchReportData() {
    const { year } = this.state;
    sendRequest('/api/dvd_reports', {
      data: {
        year,
      },
    }).then((response) => {
      const { yearTotal, dvds, dvdCustomers, monthTotals, titleReportCustomers } = response;
      this.setState({
        fetching: false,
        yearTotal,
        customers: dvdCustomers,
        dvds,
        monthTotals,
        titleReportCustomers
      });
    });
  }

  clickPrev() {
    this.setState({
      year: (this.state.year -= 1),
      fetching: true
    }, () => {
      this.fetchReportData();
    });
  }

  clickNext() {
    this.setState({
      year: (this.state.year += 1),
      fetching: true
    }, () => {
      this.fetchReportData();
    });
  }

  clickExport() {
    this.setState({
      exportModalOpen: false,
      fetching: true
    });
    sendRequest('/api/dvd_reports/export', {
      data: {
        start_date: this.state.export.startDate,
        end_date: this.state.export.endDate,
      },
    }).then((response) => {
      this.setState({
        jobModalOpen: true,
        job: response.job,
        fetching: false
      });
    });
  }

  modalCloseAndRefresh() {
    this.setState({
      errorsModalOpen: false
    });
  }

  checkForChanges() {
    return true;
  }

  changeFieldArgs() {
    return {
      thing: "export",
      changesFunction: this.checkForChanges,
    }
  }

  render() {
    const { fetching, year, customers, yearTotal, monthTotals, dvds, exportModalOpen, job } = this.state;
    return (
      <>
        <div>
          <div className="handy-component">
            <div className="text-center">
              <div className="header">
                <Button
                  disabled={ fetching }
                  text="<<"
                  onClick={ () => { this.clickPrev() } }
                />
                <h1>DVD Reports - { year }</h1>
                <Button
                  disabled={ fetching }
                  text=">>"
                  onClick={ () => { this.clickNext() } }
                />
              </div>
              <Button
                disabled={ fetching }
                text="Export"
                onClick={ () => { this.setState({ exportModalOpen: true }) } }
                styles={{
                  position: 'absolute',
                  right: 0,
                }}
              />
            </div>
            <div className="white-box months-report">
              <div className="row">
                <div className="col-xs-3 vendor-names">
                  <table className="no-hover">
                    <thead>
                      <tr>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td></td></tr>
                      { customers.map((dvdCustomer, index) => {
                        return(
                          <tr key={ index }>
                            <td className="bold">
                              <div className="link-padding">{ dvdCustomer.name }</div>
                            </td>
                          </tr>
                        );
                      }) }
                      <tr>
                        <td className="bold"><div className="link-padding">TOTAL</div></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-xs-9 months">
                  <table className="month no-hover">
                    <thead>
                      <tr>
                        <th>TOTAL</th>
                        <th>Jan</th>
                        <th>Feb</th>
                        <th>Mar</th>
                        <th>Apr</th>
                        <th>May</th>
                        <th>Jun</th>
                        <th>Jul</th>
                        <th>Aug</th>
                        <th>Sep</th>
                        <th>Oct</th>
                        <th>Nov</th>
                        <th>Dec</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                      { customers.map((dvdCustomer, index) => {
                        return (
                          <tr key={ index }>
                            <td data-test={ `${dvdCustomer.nickname}-total` } className="bold">
                              <div className="link-padding">{ dvdCustomer.sales.total }</div>
                            </td>
                            { ['total', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map((suffix, index) => {
                              return (
                                <td key={ index } data-test={ `${dvdCustomer.nickname}-${suffix}` }>
                                  <div className="link-padding">{ dvdCustomer.sales[index + 1] }</div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      }) }
                      <tr className="bold">
                        <td data-test="year-total">{ yearTotal }</td>
                        { monthTotals.map((month, index) => {
                            const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                            return (
                              <td key={ index } data-test={ `total-${months[index]}` }><div className="link-padding">{ month }</div></td>
                            );
                        }) }
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <GrayedOut visible={ fetching } />
              <Spinner visible={ fetching } />
            </div>
          </div>
          <div className="handy-component">
            <div className="white-box titles-report">
              <div className="row">
                <div className="col-xs-3">
                  <table className="title no-hover">
                    <thead>
                      <tr>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td></td></tr>
                      { dvds.map((dvd, index) => {
                        return (
                          <tr key={ index }>
                            <td className="bold">
                              <div className="link-padding">{ ellipsis(dvd.title, 25) + (dvd.type != "Retail" ? (" - " + dvd.type) : "") }</div>
                            </td>
                          </tr>
                        );
                      }) }
                    </tbody>
                  </table>
                </div>
                <div className="col-xs-9">
                  <table className="sales no-hover">
                    <thead>
                      <tr>
                        <th className="date">Date</th>
                        <th className="units">TOTAL</th>
                        <th></th>
                        { customers.map((customer, index) => {
                          if (customer.includeInTitleReport) {
                            return([
                              <th key={ index } className="units">{ customer.nickname || customer.name }</th>,
                              <th key={ `${index}-B`}></th>
                            ]);
                          }
                        }) }
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                      { dvds.map((dvd, index) => {
                        return (
                          <tr key={ index }>
                            <td><div className="link-padding">{ dvd.retailDate }</div></td>
                            <td className="bold" data-test={ `${dvd.id}-total-units` }>{ dvd.totalUnits }</td>
                            <td className="bold" data-test={ `${dvd.id}-total-sales` }>{ dvd.totalSales }</td>
                            { customers.map((customer, index) => {
                              if (customer.includeInTitleReport) {
                                const obj = dvd.sales.find(element => element.dvdCustomerId === customer.id);
                                return (
                                  <React.Fragment key={ index }>
                                    <td className="units" data-test={ `${dvd.id}-${customer.nickname}-units` }>{ obj.units }</td>
                                    <td data-test={ `${dvd.id}-${customer.nickname}-sales` }>{ obj.amount }</td>
                                  </React.Fragment>
                                );
                              }
                            })}
                          </tr>
                        )
                      }) }
                    </tbody>
                  </table>
                </div>
              </div>
              <Spinner visible={ fetching } />
              <GrayedOut visible={ fetching } />
            </div>
          </div>
          <Modal isOpen={ exportModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ exportModalStyles }>
            <div className="handy-component admin-modal">
              <div className="row">
                { Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: 'export',
                  property: 'startDate'
                }) }
                { Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: 'export',
                  property: 'endDate'
                }) }
              </div>
              <div className="row button-row">
                <div className="col-xs-12">
                  <Button
                    text="Export Sales Report"
                    onClick={ () => { this.clickExport() } }
                  />
                </div>
              </div>
            </div>
          </Modal>
          { Common.renderJobModal.call(this, job) }
        </div>
        <style jsx>{`
          .white-box {
            padding: 30px 20px;
          }
          .text-center {
            position: relative;
          }
          .header {
            display: inline-block;
            text-align: center;
            margin-bottom: 10px;
          }
          .header h1 {
            padding: 0 70px;
          }
          th {
            height: 37px;
            white-space: nowrap;
          }
          div.link-padding {
            white-space: nowrap;
          }
          .vendor-names thead {
            border-bottom: none;
          }
          .vendor-names td {
            border-right: solid 1px #DADEE2;
          }
          .months {
            overflow-y: scroll;
          }
          .months table {
            table-layout: fixed;
          }
          .months th.bold {
            width: 300px;
          }
          .months th:not(.bold) {
            width: 150px;
          }
          .sales {
            table-layout: fixed;
          }
          .sales th {
            width: 100px;
          }
          .sales th.date {
            width: 130px;
          }
          .sales th.units {
            width: 40px;
          }
        `}</style>
      </>
    );
  }

  componentDidUpdate() {
    Common.updateJobModal.call(this);
  }
}
