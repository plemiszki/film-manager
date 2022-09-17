import React from 'react'
import Modal from 'react-modal'
import { Common, stringifyDate, Details, ellipsis } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

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
    fetch(`/api/dvd_reports?${new URLSearchParams({
      year: this.state.year,
    })}`).then((response) => response.json()).then((response) => {
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
    fetch(`/api/dvd_reports/export?${new URLSearchParams({
      start_date: this.state.export.startDate,
      end_date: this.state.export.endDate,
    })}`).then((response) => response.json()).then((response) => {
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
    return(
      <div id="dvd-reports">
        <div className="component">
          <div className="text-center">
            <a className={"orange-button export-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ Common.changeState.bind(this, 'exportModalOpen', true) }>Export</a>
            <div className="clearfix">
              <a className={ "orange-button float-button arrow-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNext.bind(this) }>&#62;&#62;</a>
              <h1>DVD Reports - { this.state.year }</h1>
              <a className={"orange-button float-button arrow-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickPrev.bind(this) }>&#60;&#60;</a>
            </div>
          </div>
          <div className="white-box months-report">
            <div className="row">
              <div className="col-xs-3">
                <table className="fm-admin-table no-hover no-highlight">
                  <thead>
                    <tr>
                      <th className="name-column"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td></td></tr>
                    { this.state.customers.map((dvdCustomer, index) => {
                      return(
                        <tr key={ index }>
                          <td className="name-column">
                            <div>{ dvdCustomer.name }</div>
                          </td>
                        </tr>
                      );
                    }) }
                    <tr>
                      <td className="name-column">TOTAL</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-xs-9">
                <table className="month fm-admin-table no-hover no-highlight">
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
                    { this.state.customers.map((dvdCustomer, index) => {
                      return(
                        <tr key={ index }>
                          <td data-test={ `${dvdCustomer.nickname}-total` } className="bold">{ dvdCustomer.sales.total }</td>
                          <td data-test={ `${dvdCustomer.nickname}-jan` }>{ dvdCustomer.sales[1] }</td>
                          <td data-test={ `${dvdCustomer.nickname}-feb` }>{ dvdCustomer.sales[2] }</td>
                          <td data-test={ `${dvdCustomer.nickname}-mar` }>{ dvdCustomer.sales[3] }</td>
                          <td data-test={ `${dvdCustomer.nickname}-apr` }>{ dvdCustomer.sales[4] }</td>
                          <td data-test={ `${dvdCustomer.nickname}-may` }>{ dvdCustomer.sales[5] }</td>
                          <td data-test={ `${dvdCustomer.nickname}-jun` }>{ dvdCustomer.sales[6] }</td>
                          <td data-test={ `${dvdCustomer.nickname}-jul` }>{ dvdCustomer.sales[7] }</td>
                          <td data-test={ `${dvdCustomer.nickname}-aug` }>{ dvdCustomer.sales[8] }</td>
                          <td data-test={ `${dvdCustomer.nickname}-sep` }>{ dvdCustomer.sales[9] }</td>
                          <td data-test={ `${dvdCustomer.nickname}-oct` }>{ dvdCustomer.sales[10] }</td>
                          <td data-test={ `${dvdCustomer.nickname}-nov` }>{ dvdCustomer.sales[11] }</td>
                          <td data-test={ `${dvdCustomer.nickname}-dec` }>{ dvdCustomer.sales[12] }</td>
                        </tr>
                      );
                    }) }
                    <tr className="bold">
                      <td data-test="year-total">{ this.state.yearTotal }</td>
                      { this.state.monthTotals.map((month, index) => {
                        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                        return(
                          <td key={ index } data-test={ `total-${months[index]}` }>{ month }</td>
                        );
                      }) }
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -30, -20, 5) }
          </div>
        </div>
        <div className="component">
          <div className="white-box titles-report">
            <div className="row">
              <div className="col-xs-3">
                <table className="fm-admin-table no-hover no-highlight">
                  <thead>
                    <tr>
                      <th className="name-column"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td></td></tr>
                    { this.state.dvds.map((dvd, index) => {
                      return(
                        <tr key={ index }>
                          <td className="name-column">
                            <div>{ ellipsis(dvd.title, 25) + (dvd.type != "Retail" ? (" - " + dvd.type) : "") }</div>
                          </td>
                        </tr>
                      );
                    }) }
                  </tbody>
                </table>
              </div>
              <div className="col-xs-9">
                <table className="title fm-admin-table no-hover no-highlight">
                  <thead>
                    <tr>
                      <th className="date">Date</th>
                      <th className="units">TOTAL</th>
                      <th></th>
                      { this.renderDvdCustomerHeaders() }
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                     { this.state.dvds.map((dvd, index) => {
                      return(
                        <tr key={ index }>
                          <td>{ dvd.retailDate }</td>
                          <td className="bold" data-test={ `${dvd.id}-total-units` }>{ dvd.totalUnits }</td>
                          <td className="bold" data-test={ `${dvd.id}-total-sales` }>{ dvd.totalSales }</td>
                          { this.renderDvdCustomerData(dvd) }
                        </tr>
                      );
                    }) }
                  </tbody>
                </table>
              </div>
            </div>
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -30, -20, 5) }
          </div>
        </div>
        <Modal isOpen={ this.state.exportModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ exportModalStyles }>
          <div className="export-modal">
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
                <a className="orange-button" onClick={ this.clickExport.bind(this) }>Export Sales Report</a>
              </div>
            </div>
          </div>
        </Modal>
        { FM.jobModal.call(this, this.state.job) }
        { FM.jobErrorsModal.call(this) }
      </div>
    );
  }

  renderDvdCustomerHeaders() {
    return this.state.customers.map((customer, index) => {
      if (customer.includeInTitleReport) {
        return([
          <th key={ index } className="units">{ customer.nickname || customer.name }</th>,
            <th key={ `${index}-B`}></th>
          ]);
      }
    })
  }

  renderDvdCustomerData(dvd) {
    return this.state.customers.map((customer, index) => {
      if (customer.includeInTitleReport) {
        const obj = dvd.sales.find(element => element.dvdCustomerId === customer.id);
        return([
          <td key={ index } className="units" data-test={ `${dvd.id}-${customer.nickname}-units` }>{ obj.units }</td>,
          <td key={ `${index}-B`} data-test={ `${dvd.id}-${customer.nickname}-sales` }>{ obj.amount }</td>
        ]);
      }
    })
  }

  componentDidUpdate() {
    Common.updateJobModal.call(this);
  }
}
