import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import ServerActions from '../actions/server-actions.js'
import JobStore from '../stores/job-store.js'
import { Common, Index } from 'handy-components'
import { fetchEntities, updateEntity } from '../actions/index'
import FM from '../../app/assets/javascripts/me/common.jsx'

class JobsIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: false,
      jobs: []
    };
  }

  componentDidMount() {
    this.props.fetchEntities({
      directory: 'jobs'
    }).then(() => {
      this.setState({
        jobs: this.props.jobs
      });
    });
  }

  killJob(e) {
    let id = e.target.dataset.id;
    let job = HandyTools.deepCopy(HandyTools.findObjectInArrayById(this.state.jobs, id));
    job.killed = true;
    this.setState({
      fetching: true
    });
    this.props.updateEntity({
      id,
      directory: 'jobs',
      entityName: 'job',
      entity: job
    }).then(() => {
      this.setState({
        fetching: false,
        jobs: this.props.jobs
      });
    });
  }

  render() {
    if (this.state.jobs.length > 0) {
      return(
        <div id="jobs-index" className="component">
          <div className="white-box" style={ { padding: 20 } }>
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -20, -20, 5) }
            <table className="fm-admin-table no-hover no-highlight">
              <thead>
                <tr>
                  <th>Currently Running Export Statement Jobs</th>
                  <th>Status</th>
                  <th style={ { width: 120 } }></th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td></tr>
                { this.state.jobs.map((job, index) => {
                  return(
                    <tr key={ index }>
                      <td className="name-column">
                        { job.jobId }
                      </td>
                      <td>
                        { `${job.currentValue} / ${job.totalValue}` }
                      </td>
                      <td>
                        <a className="blue-outline-button small" onClick={ this.killJob.bind(this) } data-id={ job.id }>Kill Job</a>
                      </td>
                    </tr>
                  );
                }) }
              </tbody>
            </table>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntities, updateEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(JobsIndex);
