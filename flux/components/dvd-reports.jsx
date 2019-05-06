import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import ServerActions from '../actions/server-actions.js'
import DvdCustomersStore from '../stores/dvd-customers-store.js'
import JobStore from '../stores/job-store.js'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
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

class DvdReports extends React.Component {

  constructor(props) {
    super(props)
    var job = {
      errors_text: ""
    };
    this.state = {
      fetching: true,
      dvdCustomers: [],
      year: (new Date).getFullYear(),
      exportModalOpen: false,
      export: {
        startDate: HandyTools.stringifyDate(new Date),
        endDate: HandyTools.stringifyDate(new Date)
      },
      errors: [],
      jobModalOpen: !!job.id,
      job: job
    };
  }

  componentDidMount() {
    this.customerListener = DvdCustomersStore.addListener(this.getCustomers.bind(this));
    this.jobListener = JobStore.addListener(this.getJob.bind(this));
    $('#admin-right-column-content').css('padding', '30px 20px');
    ClientActions.fetchDvdReports(this.state.year);
  }

  componentWillUnmount() {
    this.customerListener.remove();
    this.jobListener.remove();
  }

  getCustomers() {
    this.setState({
      dvdSaved: DvdCustomersStore.all(),
      fetching: false
    });
  }

  getJob() {
    var job = JobStore.job();
    if (job.done) {
      this.setState({
        jobModalOpen: false,
        errorsModalOpen: job.errors_text !== "",
        job: job
      }, function() {
        if (job.errors_text === "") {
          window.location.href = job.first_line;
        }
      });
    } else {
      this.setState({
        jobModalOpen: true,
        job: job,
        fetching: false
      });
    }
  }

  clickPrev() {
    this.setState({
      year: (this.state.year -= 1),
      fetching: true
    }, () => {
      ClientActions.fetchDvdReports(this.state.year);
    });
  }

  clickNext() {
    this.setState({
      year: (this.state.year += 1),
      fetching: true
    }, () => {
      ClientActions.fetchDvdReports(this.state.year);
    });
  }

  openExportModal() {
    this.setState({
      exportModalOpen: true
    });
  }

  clickExport() {
    this.setState({
      exportModalOpen: false,
      fetching: true
    });
    ClientActions.exportDvdSales(this.state.export.startDate, this.state.export.endDate);
  }

  closeModal() {
    this.setState({
      exportModalOpen: false,
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
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  }

  render() {
    return(
      <div id="dvd-reports">
        <div className="component">
          <div className="text-center">
            <a className={"orange-button export-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.openExportModal.bind(this) }>Export</a>
            <div className="clearfix">
              <a className={ "orange-button float-button arrow-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNext.bind(this) }>&#62;&#62;</a>
              <h1>DVD Reports - { this.state.year }</h1>
              <a className={"orange-button float-button arrow-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickPrev.bind(this) }>&#60;&#60;</a>
            </div>
          </div>
          <div className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -30, -20, 5) }
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
                    { DvdCustomersStore.all().map((dvdCustomer, index) => {
                      return(
                        <tr key={index}>
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
                    { DvdCustomersStore.all().map((dvdCustomer, index) => {
                      return(
                        <tr key={index}>
                          <td className="bold">{ dvdCustomer.sales.total }</td>
                          <td>{ dvdCustomer.sales[1] }</td>
                          <td>{ dvdCustomer.sales[2] }</td>
                          <td>{ dvdCustomer.sales[3] }</td>
                          <td>{ dvdCustomer.sales[4] }</td>
                          <td>{ dvdCustomer.sales[5] }</td>
                          <td>{ dvdCustomer.sales[6] }</td>
                          <td>{ dvdCustomer.sales[7] }</td>
                          <td>{ dvdCustomer.sales[8] }</td>
                          <td>{ dvdCustomer.sales[9] }</td>
                          <td>{ dvdCustomer.sales[10] }</td>
                          <td>{ dvdCustomer.sales[11] }</td>
                          <td>{ dvdCustomer.sales[12] }</td>
                        </tr>
                      );
                    }) }
                    <tr className="bold">
                      <td>{ DvdCustomersStore.yearTotal() }</td>
                      { DvdCustomersStore.monthTotals().map((month, index) => {
                        return(
                          <td key={index}>{ month }</td>
                        );
                      }) }
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="component">
          <div className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -30, -20, 5) }
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
                    { DvdCustomersStore.dvds().map((dvd, index) => {
                      return(
                        <tr key={ index }>
                          <td className="name-column">
                            <div>{ HandyTools.ellipsis(dvd.title, 25) + (dvd.type != "Retail" ? (" - " + dvd.type) : "") }</div>
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
                      <th className="units">Amazon</th>
                      <th></th>
                      <th className="units">AEC</th>
                      <th></th>
                      <th className="units">B & T</th>
                      <th></th>
                      <th className="units">Ingram</th>
                      <th></th>
                      <th className="units">Midwest</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                     { DvdCustomersStore.dvds().map((dvd, index) => {
                      return(
                        <tr key={ index }>
                          <td>{ dvd.retailDate }</td>
                          <td className="bold">{ dvd.totalUnits }</td>
                          <td className="bold">{ dvd.totalSales }</td>
                          <td>{ dvd.amazonUnits }</td>
                          <td>{ dvd.amazonSales }</td>
                          <td>{ dvd.aecUnits }</td>
                          <td>{ dvd.aecSales }</td>
                          <td>{ dvd.bakerUnits }</td>
                          <td>{ dvd.bakerSales }</td>
                          <td>{ dvd.ingramUnits }</td>
                          <td>{ dvd.ingramSales }</td>
                          <td>{ dvd.midwestUnits }</td>
                          <td>{ dvd.midwestSales }</td>
                        </tr>
                      );
                    }) }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <Modal isOpen={ this.state.exportModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ exportModalStyles }>
          <div className="export-modal">
            <div className="row">
              <div className="col-xs-6">
                <h2>Start Date</h2>
                <input value={ this.state.export.startDate } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="startDate" />
              </div>
              <div className="col-xs-6">
                <h2>End Date</h2>
                <input value={ this.state.export.endDate } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="endDate" />
              </div>
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

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
    if (this.state.jobModalOpen) {
      window.setTimeout(() => {
        $.ajax({
          url: '/api/jobs/status',
          method: 'GET',
          data: {
            id: this.state.job.id,
            time: this.state.job.job_id
          },
          success: (response) => {
            ServerActions.receiveJob(response);
          }
        })
      }, 1500)
    }
  }
}

export default DvdReports;
