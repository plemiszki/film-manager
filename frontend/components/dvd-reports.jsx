import React from 'react'
import Modal from 'react-modal'
import { Common, stringifyDate, Details, sendRequest, Button, GrayedOut, Spinner, Table } from 'handy-components'

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
      spinner: true,
      titlesReportCustomers: [],
      titlesReport: [],
      customersReport: [],
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
      const { customersReport, titlesReport, titlesReportCustomers } = response;
      this.setState({
        spinner: false,
        customersReport,
        titlesReport,
        titlesReportCustomers,
      });
    });
  }

  clickPrev() {
    this.setState({
      year: (this.state.year -= 1),
      spinner: true
    }, () => {
      this.fetchReportData();
    });
  }

  clickNext() {
    this.setState({
      year: (this.state.year += 1),
      spinner: true
    }, () => {
      this.fetchReportData();
    });
  }

  clickExport() {
    this.setState({
      exportModalOpen: false,
      spinner: true
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
        spinner: false
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

  titlesReportColumns() {
    const UNITS_COLUMN_WIDTH = 60;
    const SALES_COLUMN_WIDTH = 120;
    const { titlesReportCustomers } = this.state;
    let result = [
      { name: 'title', bold: true, width: 400 },
      { name: 'type', bold: true, header: 'Format', width: 120 },
      { name: 'retailDate', header: 'Street Date', date: true, width: 130 },
      { name: 'totalUnits', header: 'TOTAL', width: UNITS_COLUMN_WIDTH, sortDir: 'desc' },
      { name: 'totalSales', blankHeader: true, width: SALES_COLUMN_WIDTH },
    ];
    titlesReportCustomers.forEach((customer) => {
      const prefix = customer.name.toLowerCase();
      result = result.concat([
        { name: `${prefix}Units`, header: customer.name, width: UNITS_COLUMN_WIDTH, sortDir: 'desc' },
        { name: `${prefix}Sales`, blankHeader: true, width: SALES_COLUMN_WIDTH }
      ])
    });
    return result;
  }

  render() {
    const { spinner, customersReport, titlesReport, year, exportModalOpen, job } = this.state;
    return (
      <>
        <div>
          <div className="handy-component">
            <div className="text-center">
              <div className="header">
                <Button
                  disabled={ spinner }
                  text="<<"
                  onClick={ () => { this.clickPrev() } }
                />
                <h1>DVD Reports - { year }</h1>
                <Button
                  disabled={ spinner }
                  text=">>"
                  onClick={ () => { this.clickNext() } }
                />
              </div>
              <Button
                disabled={ spinner }
                text="Export"
                onClick={ () => { this.setState({ exportModalOpen: true }) } }
                style={{
                  position: 'absolute',
                  right: 0,
                }}
              />
            </div>
            <div className="white-box">
              <div className="row">
                <div className="col-xs-3">
                  <Table
                    hover={ false }
                    links={ false }
                    sortable={ false }
                    columns={[{
                      name: 'name',
                      header: 'Customer',
                      bold: true,
                    }]}
                    rows={ customersReport }
                  />
                </div>
                <div className="col-xs-9">
                  <Table
                    fixed
                    test="customers-report"
                    defaultColumnWidth={ 120 }
                    hover={ false }
                    links={ false }
                    sortable={ false }
                    columns={ [{ name: 'total', header: 'TOTAL', bold: true }, 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] }
                    rows={ customersReport }
                  />
                </div>
              </div>
              <GrayedOut visible={ spinner } />
              <Spinner visible={ spinner } />
            </div>
          </div>
          <div className="handy-component">
            <div className="white-box">
              <div className="row">
                <div className="col-xs-12">
                  <Table
                    fixed
                    test="titles-report"
                    hover={ false }
                    links={ false }
                    defaultSearchColumn="retailDate"
                    columns={ this.titlesReportColumns() }
                    rows={ titlesReport }
                  />
                </div>
              </div>
              <Spinner visible={ spinner } />
              <GrayedOut visible={ spinner } />
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
        `}</style>
      </>
    );
  }

  componentDidUpdate() {
    Common.updateJobModal.call(this);
  }
}
