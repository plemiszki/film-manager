import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import ServerActions from '../actions/server-actions.js'
import JobStore from '../stores/job-store.js'
import { Common, Index } from 'handy-components'
import { fetchEntities } from '../actions/index'
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

  render() {
    console.log(this.state.jobs);
    return(
      <div id="jobs-index" className="component">
        <div className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
        </div>
      </div>
    );
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntities }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(JobsIndex);
