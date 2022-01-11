import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import HandyTools from 'handy-tools'
import { sendRequest } from '../actions/index'
import FM from '../../app/assets/javascripts/me/common.jsx'

class Catalog extends React.Component {

  constructor(props) {
    super(props)
    let job = {
      errors_text: ""
    };
    if ($('#job-id').length == 1) {
      job.id = $('#job-id')[0].innerHTML;
      job.secondLine = false;
      job.firstLine = "Reading Spreadsheet";
    }
    this.state = {
      jobModalOpen: !!job.id,
      job: job
    };
  }

  componentDidMount() {
    if (this.state.jobModalOpen) {
      this.updateJobModal();
    }
  }

  updateJobModal() {
    this.props.sendRequest({
      url: '/api/jobs/status_new',
      data: {
        id: this.state.job.id,
        time: this.state.job.jobId
      }
    }).then(() => {
      let { job } = this.props;
      let interval = window.setInterval(() => {
        this.props.sendRequest({
          url: '/api/jobs/status_new',
          data: {
            id: this.state.job.id
          }
        }).then(() => {
          let job = this.props.job;
          if (job.done) {
            clearInterval(interval);
            this.setState({
              jobModalOpen: false,
              job: job
            }, () => {
              window.location.href = job.firstLine;
            });
          } else {
            this.setState({
              job: job
            });
          }
        })
      }, 1000);
    });
  }

  render() {
    return(
      <div>
        { FM.jobModal.call(this, this.state.job) }
      </div>
    );
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ sendRequest }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Catalog);
