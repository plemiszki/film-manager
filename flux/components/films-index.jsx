import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import ServerActions from '../actions/server-actions.js'
import FilmsStore from '../stores/films-store.js'
import NewEntity from './new-entity.jsx'
import FilmRightsNew from './film-rights-new.jsx'
import JobStore from '../stores/job-store.js'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import { sendRequest, fetchEntities } from '../actions/index'
import FM from '../../app/assets/javascripts/me/common.jsx'

const FilterModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 420
  }
};

const NewRightsModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 598
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
      filterActive: false,
      films: [],
      allAltLengths: [],
      selectedAltLengths: [],
      allAltAudios: [],
      selectedAltAudios: [],
      allAltSubs: [],
      selectedAltSubs: [],
      jobModalOpen: !!job.id,
      job: job
    };
  }

  componentDidMount() {
    this.props.fetchEntities({
      directory: 'films',
      data: {
        filmType: this.props.filmType
      }
    }).then(() => {
      const { films, alternateAudios, alternateSubs, alternateLengths } = this.props;
      this.setState({
        fetching: false,
        films,
        allAltAudios: alternateAudios,
        allAltSubs: alternateSubs,
        allAltLengths: alternateLengths
      });
    });
  }

  getFilms() {
    let films = FilmsStore.all();
    let allAltLengths = [];
    let allAltAudios = [];
    let allAltSubs = [];
    films.forEach((film) => {
      film.alternateLengths.forEach((length) => {
        if (allAltLengths.indexOf(length) === -1) {
          allAltLengths.push(length);
        }
      });
      film.alternateAudios.forEach((audio) => {
        if (allAltAudios.indexOf(audio) === -1) {
          allAltAudios.push(audio);
        }
      });
      film.alternateSubs.forEach((sub) => {
        if (allAltSubs.indexOf(sub) === -1) {
          allAltSubs.push(sub);
        }
      });
    });
    this.setState({
      fetching: false,
      films,
      newFilmModalOpen: false,
      allAltLengths: allAltLengths.sort(),
      allAltAudios: allAltAudios.sort(),
      allAltSubs: allAltSubs.sort()
    });
  }

  getJob() {
    var job = JobStore.job();
    if (job.done) {
      this.setState({
        jobModalOpen: false,
        searchModalOpen: false,
        job: job
      }, () => {
        window.location.href = job.firstLine;
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

  clickExportAll() {
    this.setState({
      fetching: true
    });
    this.props.sendRequest({
      url: '/api/films/export',
      method: 'post',
      data: {
        filmType: this.props.filmType,
        filmIds: this.state.films.map(film => film.id)
      }
    }).then(() => {
      this.setState({
        job: this.props.job,
        fetching: false,
        jobModalOpen: true
      });
    });
  }

  clickExportCustom(searchCriteria) {
    this.setState({
      fetching: true
    });
    this.props.sendRequest({
      url: '/api/films/export',
      method: 'post',
      data: {
        filmType: this.props.filmType,
        searchCriteria: HandyTools.convertObjectKeysToUnderscore(searchCriteria)
      }
    }).then(() => {
      this.setState({
        job: this.props.job,
        fetching: false,
        jobModalOpen: true
      });
    });
  }

  clickExportMetadata(filmType, exportType, searchCriteria) {
    if (!this.state.fetching) {
      this.setState({
        fetching: true,
        searchModalOpen: false
      });
      if (exportType == 'all') {
        var filmIds = this.state.films.map((film) => {
          return film.id;
        });
        var searchCriteria = {};
      }
      ClientActions.exportFilms(filmType, filmIds, searchCriteria);
    }
  }

  clickFilterCheckBox(e) {
    let { selectedAltLengths, selectedAltAudios, selectedAltSubs } = this.state;
    let array;
    let arrayName;
    let value = e.target.parentElement.children[1].innerHTML;
    switch(e.target.parentElement.parentElement.dataset.array) {
      case 'lengths':
        array = selectedAltLengths;
        arrayName = 'selectedAltLengths';
        break;
      case 'audios':
        array = selectedAltAudios;
        arrayName = 'selectedAltAudios';
        break;
      case 'subtitles':
        array = selectedAltSubs;
        arrayName = 'selectedAltSubs';
    }
    if (e.target.checked) {
      array.push(value);
    } else {
      HandyTools.removeFromArray(array, value);
    }
    this.setState({
      [arrayName]: array
    });
  }

  updateFilter() {
    let { films, selectedAltSubs, selectedAltAudios, selectedAltLengths } = this.state;
    let filteredFilms = [];
    let includeFilm;
    films.forEach((film) => {
      includeFilm = true;
      selectedAltLengths.forEach((length) => {
        if (film.alternateLengths.indexOf(length) === -1) {
          includeFilm = false;
        }
      });
      selectedAltAudios.forEach((audio) => {
        if (film.alternateAudios.indexOf(audio) === -1) {
          includeFilm = false;
        }
      });
      selectedAltSubs.forEach((sub) => {
        if (film.alternateSubs.indexOf(sub) === -1) {
          includeFilm = false;
        }
      });
      if (includeFilm) {
        filteredFilms.push(film);
      }
    });
    Common.closeModals.call(this);
    this.setState({
      filteredFilms,
      filterActive: (selectedAltLengths.length > 0 || selectedAltAudios.length > 0 || selectedAltSubs.length > 0)
    });
  }

  render() {
    var filteredFilms = this.state[this.state.filterActive ? 'filteredFilms' : 'films'].filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="films-index" className="component">
        <div className="clearfix">
          { this.renderHeader() }
          { this.renderExportMetadataButton() }
          { this.renderCustomButton() }
          { this.renderFilterButton() }
          { this.renderAddNewButton() }
          <input className="search-box" onChange={ FM.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        </div>
        <div className="white-box">
          <table className="fm-admin-table">
            <thead>
              <tr>
                <th><div className={ FM.sortClass.call(this, "title") } onClick={ FM.clickHeader.bind(this, "title") }>Title</div></th>
                <th><div className={ FM.sortClass.call(this, "endDate") } onClick={ FM.clickHeader.bind(this, "endDate") }>Expiration Date</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td></tr>
              { _.orderBy(filteredFilms, [FM.commonSort.bind(this)]).map((film, index) => {
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
              }) }
            </tbody>
          </table>
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
        </div>
        <Modal isOpen={ this.state.newFilmModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 1000 }, 1) }>
          <NewEntity
            context={ this.props.context }
            entityName="film"
            initialEntity={ { title: "", filmType: this.props.filmType, labelId: 1, year: "" } }
            redirectAfterCreate={ true }
          />
        </Modal>
        <Modal isOpen={ this.state.searchModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ NewRightsModalStyles }>
          <FilmRightsNew
            context={ this.props.context }
            search={ true }
            filmType={ this.props.filmType }
            availsExport={ this.clickExportCustom.bind(this) }
          />
        </Modal>
        <Modal isOpen={ this.state.filterModalOpen } onRequestClose={ this.updateFilter.bind(this) } contentLabel="Modal" style={ FilterModalStyles }>
          { this.renderFilter() }
        </Modal>
        { Common.renderJobModal.call(this, this.state.job) }
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
    if (FM.user.hasAdminAccess & !this.props.advanced) {
      return(
        <a className={ "btn orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Common.changeState.bind(this, 'newFilmModalOpen', true) }>Add { buttonText }</a>
      );
    }
  }

  renderExportMetadataButton() {
    if (this.props.filmType != 'TV Series') {
      return(
        <a className={ "btn orange-button float-button metadata-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ this.clickExportAll.bind(this) }>Export All</a>
      );
    }
  }

  renderFilterButton() {
    if (this.props.filmType === 'Feature') {
      return(
        <a className={ "btn orange-button float-button metadata-button" + Common.renderDisabledButtonClass(this.state.fetching) + (this.state.filterActive ? ' green' : '') } onClick={ Common.changeState.bind(this, 'filterModalOpen', true) }>Filter</a>
      );
    }
  }

  filterActive() {
    return this.state.selectedAltSubs.length > 0 || this.state.selectedAltAudios.length > 0 || this.state.selectedAltLengths.length > 0;
  }

  renderCustomButton() {
    if (this.props.filmType != 'TV Series') {
      return(
        <a className={ "btn orange-button float-button advanced-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Common.changeState.bind(this, 'searchModalOpen', true) }>Export Custom</a>
      );
    }
  }

  renderFilter() {
    return(
      <div className="films-index-filter white-box">
        <div className="row">
          <div className="col-xs-4">
            <h2>Alternate Lengths</h2>
            <div className="checkbox-list" data-array="lengths">
              { this.state.allAltLengths.map((length, index) => {
                return(
                  <div key={ index } className="checkbox-container">
                    <input id={ length } type="checkbox" checked={ this.state.selectedAltLengths.indexOf(length.toString()) > -1 } onChange={ this.clickFilterCheckBox.bind(this) } /><label htmlFor={ length }>{ length }</label>
                  </div>
                );
              }) }
            </div>
          </div>
          <div className="col-xs-4">
            <h2>Alternate Audio Tracks</h2>
            <div className="checkbox-list" data-array="audios">
              { this.state.allAltAudios.map((audio, index) => {
                return(
                  <div key={ index } className="checkbox-container">
                    <input id={ audio } type="checkbox" checked={ this.state.selectedAltAudios.indexOf(audio) > -1 } onChange={ this.clickFilterCheckBox.bind(this) } /><label htmlFor={ audio }>{ audio }</label>
                  </div>
                );
              }) }
            </div>
          </div>
          <div className="col-xs-4">
            <h2>Alternate Subtitles</h2>
            <div className="checkbox-list" data-array="subtitles">
              { this.state.allAltSubs.map((sub, index) => {
                return(
                  <div key={ index } className="checkbox-container">
                    <input id={ sub } type="checkbox" checked={ this.state.selectedAltSubs.indexOf(sub) > -1 } onChange={ this.clickFilterCheckBox.bind(this) } /><label htmlFor={ sub }>{ sub }</label>
                  </div>
                );
              }) }
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 text-center">
            <a className="orange-button" onClick={ this.updateFilter.bind(this) }>Close Filter</a>
          </div>
        </div>
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
  return bindActionCreators({ sendRequest, fetchEntities }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(FilmsIndex);
