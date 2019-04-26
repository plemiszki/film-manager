import React, { Component } from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import ServerActions from '../actions/server-actions.js'
import FilmsStore from '../stores/films-store.js'
import NewThing from './new-thing.jsx'
import FilmRightsNew from './film-rights-new.jsx'
import JobStore from '../stores/job-store.js'
import { Common, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

const ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 236
  }
};

const newRightsModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 575
  }
};

class FilmsIndex extends React.Component {

  constructor(props) {
    super(props)

    let job = {
      errors_text: ""
    };
    this.state = {
      fetching: true,
      searchText: '',
      sortBy: 'title',
      films: [],
      modalOpen: false,
      jobModalOpen: !!job.id,
      job: job
    };
  }

  componentDidMount() {
    this.filmsListener = FilmsStore.addListener(this.getFilms.bind(this));
    this.jobListener = JobStore.addListener(this.getJob.bind(this));
    if (this.props.advanced) {
      ClientActions.fetchFilmsAdvanced(this.props.filmType);
    } else {
      ClientActions.fetchFilms(this.props.filmType);
    }
  }

  componentWillUnmount() {
    this.filmsListener.remove();
    this.jobListener.remove();
  }

  getFilms() {
    this.setState({
      fetching: false,
      films: FilmsStore.all(),
      modalOpen: false
    });
  }

  getJob() {
    var job = JobStore.job();
    if (job.done) {
      this.setState({
        jobModalOpen: false,
        searchModalOpen: false,
        job: job
      }, function() {
        window.location.href = job.first_line;
      });
    } else {
      this.setState({
        jobModalOpen: true,
        searchModalOpen: false,
        job: job,
        fetching: false
      });
    }
  }

  redirect(id) {
    window.location.pathname = "films/" + id;
  }

  clickNew() {
    this.setState({
      modalOpen: true
    });
  }

  closeModal() {
    this.setState({
      modalOpen: false,
      searchModalOpen: false
    });
  }

  clickAdvanced() {
    this.setState({
      searchModalOpen: true
    });
  }

  clickExportMetadata(filmType, exportType, searchCriteria) {
    if (!this.state.fetching) {
      this.setState({
        fetching: true,
        searchModalOpen: false
      });
      if (exportType == 'all') {
        var filmIds = this.state.films.map(function(film) {
          return film.id;
        });
        var searchCriteria = {};
      }
      ClientActions.exportFilms(filmType, filmIds, searchCriteria);
    }
  }

  render() {
    var filteredFilms = this.state.films.filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="films-index" className="component">
        <div className="clearfix">
          { this.renderHeader() }
          { this.renderAddNewButton() }
          { this.renderExportMetadataButton() }
          { this.renderCustomButton() }
          <input className="search-box" onChange={ FM.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        </div>
        <div className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={ "admin-table" }>
            <thead>
              <tr>
                <th><div className={ FM.sortClass.call(this, "title") } onClick={ FM.clickHeader.bind(this, "title") }>Title</div></th>
                <th><div className={ FM.sortClass.call(this, "endDate") } onClick={ FM.clickHeader.bind(this, "endDate") }>Expiration Date</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td></tr>
              { _.orderBy(filteredFilms, [FM.commonSort.bind(this)]).map(function(film, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, film.id) }>
                    <td className="name-column">
                      { film.title }
                    </td>
                    <td className={ new Date(film.endDate) < Date.now() ? 'expired' : '' }>
                      { film.endDate }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing={ 'film' } initialObject={ { title: "", filmType: this.props.filmType, labelId: 1, year: '' } } />
        </Modal>
        <Modal isOpen={ this.state.searchModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ newRightsModalStyles }>
          <FilmRightsNew search={ true } filmType={ this.props.filmType } availsExport={ this.clickExportMetadata.bind(this) } />
        </Modal>
        { FM.jobModal.call(this, this.state.job) }
      </div>
    );
  }

  renderHeader() {
    let header = this.props.filmType == 'TV Series' ? 'TV Series' : `${this.props.filmType}s`;
    return(
      <h1>{ header }</h1>
    );
  }

  renderAddNewButton() {
    let buttonText = {
      'Feature': 'Film',
      'Short': 'Short',
      'TV Series': 'TV Series'
    }[this.props.filmType];
    if (!this.props.advanced) {
      return(
        <a className={ "orange-button float-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew.bind(this) }>Add { buttonText }</a>
      );
    }
  }

  renderExportMetadataButton() {
    if (this.props.filmType != 'TV Series') {
      return(
        <a className={ "orange-button float-button metadata-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ function() { this.clickExportMetadata(this.props.filmType, 'all') }.bind(this) }>Export All</a>
      );
    }
  }

  renderCustomButton() {
    if (this.props.filmType != 'TV Series') {
      return(
        <a className={ "orange-button float-button advanced-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickAdvanced.bind(this) }>Export Custom</a>
      );
    }
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
    if (this.state.jobModalOpen) {
      window.setTimeout(function() {
        $.ajax({
          url: '/api/jobs/status',
          method: 'GET',
          data: {
            id: this.state.job.id,
            time: this.state.job.job_id
          },
          success: function(response) {
            ServerActions.receiveJob(response);
          }.bind(this)
        })
      }.bind(this), 1500)
    }
  }
}

export default FilmsIndex;
