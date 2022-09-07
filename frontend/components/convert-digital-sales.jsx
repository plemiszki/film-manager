import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import { sendRequest, fetchEntity, fetchEntities, createEntity } from '../actions/index.js'
import { Common, deepCopy, removeFromArray, ModalSelect, ModalSelectStyles } from 'handy-components'

class ConvertDigitalSales extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      errors: [],
      films: [],
      currentTitle: ''
    };
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
          fetching: true,
        });
        this.props.sendRequest({
          url: '/api/films',
          data: {
            filmType: 'all'
          }
        }).then(() => {
          const { films } = this.props;
          this.setState({
            films,
            fetching: false
          });
        });
      });
    }
  }

  modalCloseAndRefresh() {
    this.setState({
      errorsModalOpen: false
    });
  }

  addAlias(e) {
    const index = e.target.dataset.index;
    this.setState({
      currentTitle: this.state.errors[index],
      filmsModalOpen: true
    });
  }

  selectFilm(option) {
    let filmId = option.id;
    this.setState({
      filmsModalOpen: false,
      fetching: true
    });
    this.props.createEntity({
      directory: 'aliases',
      entityName: 'alias',
      entity: {
        filmId,
        text: this.state.currentTitle
      }
    }).then(() => {
      let errors = deepCopy(this.state.errors);
      removeFromArray(errors, this.state.currentTitle);
      this.setState({
        errors,
        fetching: false
      });
    });
  }

  render() {
    const { job } = this.state;
    if (job) {
      const { status } = job;
      if (status === 'running' || status === 'success') {
        return(
          <div>
            { Common.renderJobModal.call(this, job) }
          </div>
        );
      } else if (status === 'failed') {
        if (job.errorsText === 'Unable to import spreadsheet') {
          return(
            <div>
              { Common.renderJobModal.call(this, job) }
            </div>
          );
        } else {
          return(
            <div className="component">
              <h1 style={ { width: '100%', textAlign: 'center' } }>There are unrecognized films in this sales report.</h1>
              <p className="text-center m-bottom">Please create aliases for the below titles, then re-upload the sales report.</p>
              <div className="white-box">
                <div className="row">
                  <div className="col-xs-12">
                    <table className="admin-table no-links no-cursor">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td></td><td></td></tr>
                        { this.state.errors.map((error, index) => {
                          return(
                            <tr key={ index }>
                              <td>
                                { error }
                              </td>
                              <td style={ { textDecoration: 'underline' } }>
                                <span style={ { cursor: 'pointer' } } onClick={ this.addAlias.bind(this) } data-index={ index }>Add Alias</span>
                              </td>
                            </tr>
                          );
                        }) }
                      </tbody>
                    </table>
                  </div>
                </div>
                { Common.renderSpinner(this.state.fetching) }
                { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
              </div>
              <Modal isOpen={ this.state.filmsModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ ModalSelectStyles }>
                <ModalSelect options={ this.state.films } property="title" func={ this.selectFilm.bind(this) } />
              </Modal>
            </div>
          );
        }
      }
    } else {
      return null;
    }
  }

  componentDidUpdate() {
    Common.updateJobModal.call(this, {
      failureCallback: (job) => {
        if (job.errorsText !== 'Unable to import spreadsheet') {
          this.setState({
            errors: JSON.parse(job.errorsText)
          });
        }
      }
    });
  }
}

const mapStateToProps = (reducers, props) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ sendRequest, fetchEntity, fetchEntities, createEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ConvertDigitalSales);
