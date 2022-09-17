import React from 'react'
import { Common, fetchEntity } from 'handy-components'

export default class Catalog extends React.Component {

  constructor(props) {
    super(props)
    this.state = {};
  }

  componentDidMount() {
    const jobIdDiv = document.getElementById('job-id');
    if (jobIdDiv) {
      fetchEntity({
        directory: 'jobs',
        id: jobIdDiv.innerHTML,
      }).then((response) => {
        const { job } = response;
        this.setState({
          job,
          jobModalOpen: true,
        });
      });
    }
  }

  render() {
    const { job } = this.state;
    return(
      <div>
        { Common.renderJobModal.call(this, job) }
      </div>
    );
  }

  componentDidUpdate() {
    Common.updateJobModal.call(this);
  }
}
