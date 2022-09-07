import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchEntity } from '../actions/index'
import { Common } from 'handy-components'

class Catalog extends React.Component {

  constructor(props) {
    super(props)
    this.state = {};
  }

  componentDidMount() {
    const jobIdDiv = document.getElementById('job-id');
    if (jobIdDiv) {
      this.props.fetchEntity({
        directory: 'jobs',
        id: jobIdDiv.innerHTML,
      }).then(() => {
        const { job } = this.props;
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

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Catalog);
