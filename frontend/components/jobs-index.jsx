import React from 'react';
import { deepCopy, fetchEntities, updateEntity, GrayedOut, Spinner, OutlineButton, Table } from 'handy-components';

export default class JobsIndex extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      spinner: false,
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
    let job = deepCopy(jobs.find(job => job.id === id));
    job.status = 'killed';
    this.setState({
      spinner: true
    });
    updateEntity({
      id,
      directory: 'jobs',
      entityName: 'job',
      entity: job
    }).then((response) => {
      this.setState({
        spinner: false,
        jobs: response.jobs
      });
    });
  }

  render() {
    const { spinner, jobs } = this.state;
    if (jobs.length) {
      return (
        <div className="handy-component">
          <div className="white-box" style={ { padding: 20 } }>
            <Table
              sortable={ false }
              links={ false }
              hover={ true }
              test="jobs"
              columns={[
                { name: "jobId", header: "Currently Running Export Statement Jobs" },
                { name: "status", displayFunction: job => `${job.currentValue} / ${job.totalValue}` },
                {
                  isButton: true,
                  buttonText: "Go to Job",
                  bold: true,
                  clickButton: job => window.location = `/royalty_reports?job_id=${job.id}`,
                  width: 120,
                },
                {
                  isButton: true,
                  buttonText: "Kill Job",
                  bold: true,
                  clickButton: job => this.killJob(job.id),
                  width: 120,
                },
              ]}
              rows={ jobs }
            />
            <GrayedOut visible={ spinner } />
            <Spinner visible={ spinner } />
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}
