import React from 'react'
import { Common, deepCopy, removeFromArray, ModalSelect, ModalSelectStyles, fetchEntity, createEntity, sendRequest, Spinner, GrayedOut, Table } from 'handy-components'

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
          spinner: true,
        });
        sendRequest('/api/films', {
          data: {
            film_type: 'all',
          }
        }).then((response) => {
          const { films } = response;
          this.setState({
            spinner: false,
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

  addAlias(row) {
    this.setState({
      currentTitle: row.title,
      filmsModalOpen: true
    });
  }

  selectFilm(option) {
    let filmId = option.id;
    this.setState({
      filmsModalOpen: false,
      spinner: true
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
        spinner: false
      });
    });
  }

  render() {
    const { spinner, job, filmsModalOpen, errors, films } = this.state;
    const mappedErrors = errors.map(error => {
      return { title: error }
    });
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
                      <Table
                        links={ false }
                        sortable={ false }
                        columns={[
                          'title',
                          {
                            isButton: true,
                            buttonText: 'Add Alias',
                            clickButton: row => this.addAlias(row),
                            bold: true,
                          },
                        ]}
                        rows={ mappedErrors }
                      />
                    </div>
                  </div>
                  <Spinner visible={ spinner } />
                  <GrayedOut visible={ spinner } />
                </div>
                <ModalSelect
                  isOpen={ filmsModalOpen }
                  onRequestClose={ Common.closeModals.bind(this) }
                  options={ films }
                  property="title"
                  func={ this.selectFilm.bind(this) }
                />
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
