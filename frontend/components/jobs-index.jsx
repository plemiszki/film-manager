import React from 'react'
import { deepCopy, fetchEntities, updateEntity, GrayedOut, Spinner, OutlineButton } from 'handy-components'

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

  killJob(id) {
    const { jobs } = this.state;
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
    const { fetching, jobs } = this.state;
    if (this.state.jobs.length > 0) {
      return (
        <div id="jobs-index" className="handy-component">
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
                { jobs.map((job, index) => {
                  return (
                    <tr key={ index }>
                      <td className="name-column">
                        { job.jobId }
                      </td>
                      <td>
                        { `${job.currentValue} / ${job.totalValue}` }
                      </td>
                      <td>
                        <OutlineButton
                          text="Go to Job"
                          onClick={ () => window.location = `/royalty_reports?job_id=${job.id}` }
                        />
                      </td>
                      <td>
                        <OutlineButton
                          text="Kill Job"
                          onClick={ () => this.killJob(job.id) }
                        />
                      </td>
                    </tr>
                  );
                }) }
              </tbody>
            </table>
            <GrayedOut visible={ fetching } />
            <Spinner visible={ fetching } />
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}
