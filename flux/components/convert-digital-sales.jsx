import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import ServerActions from '../actions/server-actions.js'
import { createEntity } from '../actions/index.js'
import JobStore from '../stores/job-store.js'
import FilmsStore from '../stores/films-store.js'
import { Common, ConfirmDelete, Details, Index, ModalSelect, ModalSelectStyles } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

class ConvertDigitalSales extends React.Component {

  constructor(props) {
    super(props)
    var job = {
      errors_text: ""
    };
    if ($('#job-id').length == 1) {
      job.id = $('#job-id')[0].innerHTML;
      job.second_line = false;
      job.first_line = "Importing Sales Report";
    }
    this.state = {
      jobModalOpen: !!job.id,
      errorsModalOpen: false,
      job: job,
      errors: [],
      films: [],
      currentTitle: ''
    };
  }

  componentDidMount() {
    this.jobListener = JobStore.addListener(this.getJob.bind(this));
    this.filmsListener = FilmsStore.addListener(this.getFilms.bind(this));
    if (this.state.jobModalOpen) {
      window.setTimeout(() => {
        $.ajax({
          url: '/api/jobs/status',
          method: 'GET',
          data: {
            id: this.state.job.id,
            time: this.state.job.job_id
          },
          success(response) {
            ServerActions.receiveJob(response);
          }
        });
      }, 750);
    }
  }

  componentWillUnmount() {
    this.jobListener.remove();
    this.filmsListener.remove();
  }

  getJob() {
    var job = JobStore.job();
    if (job.done) {
      this.setState({
        jobModalOpen: false,
        job: job,
        errorsModalOpen: job.errors_text == "Unable to import spreadsheet"
      }, () => {
        if (job.errors_text) {
          if (!this.state.errorsModalOpen) {
            this.setState({
              errors: JSON.parse(job.errors_text),
              fetching: true
            }, () => {
              ClientActions.fetchFilms('all');
            });
          }
        } else {
          window.location.href = job.first_line;
        }
      });
    } else {
      this.setState({
        jobModalOpen: true,
        job: job
      });
    }
  }

  modalCloseAndRefresh() {
    this.setState({
      errorsModalOpen: false
    });
  }

  getFilms() {
    this.setState({
      fetching: false,
      films: FilmsStore.all()
    });
  }

  addAlias(e) {
    let index = e.target.dataset.index;
    this.setState({
      currentTitle: this.state.errors[index],
      filmsModalOpen: true
    });
  }

  closeModal() {
    this.setState({
      filmsModalOpen: false
    });
  }

  selectFilm(e) {
    let filmId = +e.target.dataset.id;
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
      let errors = HandyTools.deepCopy(this.state.errors);
      HandyTools.removeFromArray(errors, this.state.currentTitle);
      this.setState({
        errors,
        fetching: false
      });
    });
  }

  render() {
    if (this.state.job.errors_text == "Unable to import spreadsheet") {
      return(
        <div>
          { FM.jobErrorsModal.call(this) }
        </div>
      );
    } else if (this.state.errors.length === 0) {
      return(
        <div>
          { FM.jobModal.call(this, this.state.job) }
        </div>
      );
    } else {
      return(
        <div className="component">
          <h1 style={ { width: '100%', textAlign: 'center' } }>There are unrecognized films in this sales report.</h1>
          <p className="text-center m-bottom">Please create aliases for the below titles, then re-upload the sales report.</p>
          <div className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
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
          </div>
          <Modal isOpen={ this.state.filmsModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalSelectStyles }>
            <ModalSelect options={ this.state.films } property="title" func={ this.selectFilm.bind(this) } />
          </Modal>
        </div>
      );
    }
  }

  componentDidUpdate() {
    if (this.state.jobModalOpen) {
      window.setTimeout(() => {
        $.ajax({
          url: '/api/jobs/status',
          method: 'GET',
          data: {
            id: this.state.job.id,
            time: this.state.job.job_id
          },
          success: (response) => {
            ServerActions.receiveJob(response);
          }
        })
      }, 750)
    }
    $('.match-height-layout').matchHeight();
  }
}

const mapStateToProps = (reducers, props) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ConvertDigitalSales);
