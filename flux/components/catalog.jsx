import React from 'react'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import ServerActions from '../actions/server-actions.js'
import JobStore from '../stores/job-store.js'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

class Catalog extends React.Component {

  constructor(props) {
    super(props)
    var job = {
      errors_text: ""
    };
    if ($('#job-id').length == 1) {
      job.id = $('#job-id')[0].innerHTML;
      job.second_line = false;
      job.first_line = "Reading Spreadsheet";
    }
    this.state = {
      jobModalOpen: !!job.id,
      job: job
    };
  }

  componentDidMount() {
    this.jobListener = JobStore.addListener(this.getJob.bind(this));
    if (this.state.jobModalOpen) {
      window.setTimeout(() => {
        $.ajax({
          url: '/api/jobs/status',
          method: 'GET',
          data: {
            id: this.state.job.id,
            time: this.state.job.job_id
          },
          success(response) {
            ServerActions.receiveJob(response);
          }
        })
      }, 750)
    }
  }

  componentWillUnmount() {
    this.jobListener.remove();
  }

  getJob() {
    var job = JobStore.job();
    if (job.done) {
      this.setState({
        jobModalOpen: false,
        job: job
      }, () => {
        window.location.href = job.first_line;
      });
    } else {
      this.setState({
        jobModalOpen: true,
        job: job
      });
    }
  }

  render() {
    return(
      <div>
        { FM.jobModal.call(this, this.state.job) }
      </div>
    );
  }

  componentDidUpdate() {
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
      }, 750)
    }
  }
}

export default Catalog;
