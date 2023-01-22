import React from 'react'
import Modal from 'react-modal'
import { Common, deepCopy, removeFromArray, ModalSelect, ModalSelectStyles, fetchEntity, createEntity, sendRequest, Spinner, GrayedOut } from 'handy-components'

export default class ConvertDigitalSales extends React.Component {

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
      fetchEntity({
        directory: 'jobs',
        id: jobIdDiv.innerHTML,
      }).then((response) => {
        const { job } = response;
        this.setState({
          job,
          jobModalOpen: true,
          fetching: true,
        });
        sendRequest('/api/films', {
          data: {
            film_type: 'all',
          }
        }).then((response) => {
          const { films } = response;
          this.setState({
            fetching: false,
            films,
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
    createEntity({
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
    const { fetching, job, filmsModalOpen, errors, films } = this.state;
    if (job) {
      const { status } = job;
      if (status === 'running' || status === 'success') {
        return (
          <div>
            { Common.renderJobModal.call(this, job) }
          </div>
        );
      } else if (status === 'failed') {
        if (job.errorsText === 'Unable to import spreadsheet') {
          return (
            <div>
              { Common.renderJobModal.call(this, job) }
            </div>
          );
        } else {
          return (
            <>
              <div className="handy-component">
                <h1 style={ { width: '100%', textAlign: 'center' } }>There are unrecognized films in this sales report.</h1>
                <p className="text-center">Please create aliases for the below titles, then re-upload the sales report.</p>
                <div className="white-box">
                  <div className="row">
                    <div className="col-xs-12">
                      <table className="no-links no-cursor">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td></td><td></td></tr>
                          { errors.map((error, index) => {
                            return (
                              <tr key={ index }>
                                <td>
                                  <div className="link-padding">
                                    { error }
                                  </div>
                                </td>
                                <td style={ { textDecoration: 'underline' } }>
                                  <div className="link-padding">
                                    <span style={ { cursor: 'pointer' } } onClick={ this.addAlias.bind(this) } data-index={ index }>Add Alias</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          }) }
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <Spinner visible={ fetching } />
                  <GrayedOut visible={ fetching } />
                </div>
                <Modal isOpen={ filmsModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ ModalSelectStyles }>
                  <ModalSelect options={ films } property="title" func={ this.selectFilm.bind(this) } />
                </Modal>
              </div>
              <style jsx>{`
                .text-center {
                  margin-bottom: 30px;
                }
              `}</style>
            </>
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
