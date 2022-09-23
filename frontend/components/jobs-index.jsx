import React from 'react'
import { Common, deepCopy, fetchEntities, updateEntity } from 'handy-components'

export default class JobsIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: false,
      jobs: []
    };
  }

  componentDidMount() {
    fetchEntities({
      directory: 'jobs'
    }).then((response) => {
      this.setState({
        jobs: response.jobs,
      });
    });
  }

  goToJob(e) {
    let id = e.target.dataset.id;
    window.location = `/royalty_reports?job_id=${id}`;
  }

  killJob(e) {
    const { jobs } = this.state;
    const id = e.target.dataset.id;
    let job = deepCopy(jobs.find(job => job.id == id));
    job.status = 'killed';
    this.setState({
      fetching: true
    });
    updateEntity({
      id,
      directory: 'jobs',
      entityName: 'job',
      entity: job
    }).then((response) => {
      this.setState({
        fetching: false,
        jobs: response.jobs
      });
    });
  }

  render() {
    if (this.state.jobs.length > 0) {
      return(
        <div id="jobs-index" className="component">
          <div className="white-box" style={ { padding: 20 } }>
            <table className="fm-admin-table no-hover no-highlight">
              <thead>
                <tr>
                  <th>Currently Running Export Statement Jobs</th>
                  <th>Status</th>
                  <th style={ { width: 120 } }></th>
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
                        <a className="blue-outline-button small margin" onClick={ this.goToJob.bind(this) } data-id={ job.id }>Go to Job</a>
                      </td>
                      <td>
                        <a className="blue-outline-button small" onClick={ this.killJob.bind(this) } data-id={ job.id }>Kill Job</a>
                      </td>
                    </tr>
                  );
                }) }
              </tbody>
            </table>
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -20, -20, 5) }
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}
