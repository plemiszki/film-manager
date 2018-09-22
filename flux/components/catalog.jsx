var React = require('react');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var ServerActions = require('../actions/server-actions.js');
var JobStore = require('../stores/job-store.js');

var Catalog = React.createClass({

  getInitialState: function() {
    var job = {
      errors_text: ""
    };
    if ($('#job-id').length == 1) {
      job.id = $('#job-id')[0].innerHTML;
      job.second_line = false;
      job.first_line = "Reading Spreadsheet";
    }
    return({
      jobModalOpen: !!job.id,
      job: job
    });
  },

  componentDidMount: function() {
    this.jobListener = JobStore.addListener(this.getJob);
    if (this.state.jobModalOpen) {
      window.setTimeout(function() {
        $.ajax({
          url: '/api/jobs/status',
          method: 'GET',
          data: {
            id: this.state.job.id,
            time: this.state.job.job_id
          },
          success: function(response) {
            ServerActions.receiveJob(response);
          }.bind(this)
        })
      }.bind(this), 750)
    }
  },

  componentWillUnmount: function() {
    this.jobListener.remove();
  },

  getJob: function() {
    var job = JobStore.job();
    if (job.done) {
      this.setState({
        jobModalOpen: false,
        job: job
      }, function() {
        window.location.href = job.first_line;
      });
    } else {
      this.setState({
        jobModalOpen: true,
        job: job
      });
    }
  },

  render: function() {
    return(
      <div>
        { Common.jobModal.call(this, this.state.job) }
      </div>
    );
  },

  componentDidUpdate: function() {
    if (this.state.jobModalOpen) {
      window.setTimeout(function() {
        $.ajax({
          url: '/api/jobs/status',
          method: 'GET',
          data: {
            id: this.state.job.id,
            time: this.state.job.job_id
          },
          success: function(response) {
            ServerActions.receiveJob(response);
          }.bind(this)
        })
      }.bind(this), 750)
    }
  }
});

module.exports = Catalog;
