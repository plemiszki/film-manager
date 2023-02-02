import React, { Component } from 'react'
import Modal from 'react-modal'
import NewEntity from './new-entity.jsx'
import FilmRightsNew from './film-rights-new.jsx'
import { Common, convertObjectKeysToUnderscore, removeFromArray, fetchEntities, sendRequest, Button, Spinner, GrayedOut, SearchBar, Table } from 'handy-components'
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

export default class FilmsIndex extends Component {

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
    fetchEntities({
      directory: 'films',
      data: {
        filmType: this.props.filmType
      }
    }).then((response) => {
      const { films, alternateAudios, alternateSubs, alternateLengths } = response;
      this.setState({
        fetching: false,
        films,
        allAltAudios: alternateAudios,
        allAltSubs: alternateSubs,
        allAltLengths: alternateLengths
      });
    });
  }

  clickExportAll() {
    this.setState({
      fetching: true
    });
    sendRequest('/api/films/export', {
      method: 'POST',
      data: {
        filmType: this.props.filmType,
        filmIds: this.state.films.map(film => film.id),
      }
    }).then((response) => {
      const { job } = response;
      this.setState({
        job,
        fetching: false,
        jobModalOpen: true,
      });
    });
  }

  clickExportCustom(searchCriteria) {
    this.setState({
      fetching: true,
    });
    sendRequest('/api/films/export', {
      method: 'POST',
      data: {
        filmType: this.props.filmType,
        searchCriteria: convertObjectKeysToUnderscore(searchCriteria),
      }
    }).then((response) => {
      const { job } = response;
      this.setState({
        job,
        fetching: false,
        jobModalOpen: true,
      });
    });
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
      removeFromArray(array, value);
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
    const { searchText, fetching } = this.state;
    var filteredFilms = this.state[this.state.filterActive ? 'filteredFilms' : 'films'].filterSearchText(this.state.searchText, this.state.sortBy);
    return (
      <>
        <div className="handy-component">
          <div>
            { this.renderHeader() }
            { this.renderExportMetadataButton() }
            { this.renderCustomButton() }
            { this.renderFilterButton() }
            { this.renderAddNewButton() }
            <SearchBar
              onChange={ FM.changeSearchText.bind(this) }
              value={ searchText || "" }
            />
          </div>
          <div className="white-box">
            <Table
              rows={ filteredFilms }
              columns={[
                {
                  name: "title",
                  bold: true,
                },
                {
                  name: "endDate",
                  header: 'Expiration Date',
                  date: true,
                  dateSortLast: [""],
                  redIf: film => new Date(film.endDate) < Date.now(),
                },
              ]}
              urlPrefix="films"
            />
            <Spinner visible={ fetching } />
            <GrayedOut visible={ fetching } />
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
      </>
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
        <a className={ "square-button margin btn orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Common.changeState.bind(this, 'newFilmModalOpen', true) }>Add { buttonText }</a>
      );
    }
  }

  renderExportMetadataButton() {
    if (this.props.filmType != 'TV Series') {
      return(
        <a className={ "square-button margin btn orange-button float-button metadata-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ this.clickExportAll.bind(this) }>Export All</a>
      );
    }
  }

  renderFilterButton() {
    if (this.props.filmType === 'Feature') {
      return(
        <a className={ "square-button margin btn orange-button float-button metadata-button" + Common.renderDisabledButtonClass(this.state.fetching) + (this.state.filterActive ? ' green' : '') } onClick={ Common.changeState.bind(this, 'filterModalOpen', true) }>Filter</a>
      );
    }
  }

  filterActive() {
    return this.state.selectedAltSubs.length > 0 || this.state.selectedAltAudios.length > 0 || this.state.selectedAltLengths.length > 0;
  }

  renderCustomButton() {
    if (this.props.filmType != 'TV Series') {
      return(
        <a className={ "square-button margin btn orange-button float-button advanced-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Common.changeState.bind(this, 'searchModalOpen', true) }>Export Custom</a>
      );
    }
  }

  renderFilter() {
    return (
      <>
        <div className="handy-component admin-modal">
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
          <div className="row text-center">
            <Button text="Close Filter" onClick={ () => { this.updateFilter() } } />
          </div>
        </div>
        <style jsx>{`
          .admin-modal {
            padding: 30px;
            background-color: white;
          }
          .checkbox-list {
            border: 1px solid #E4E9ED;
            border-radius: 3px;
            height: 253px;
            margin-bottom: 30px;
            overflow-y: scroll;
          }
          label {
            font-family: 'TeachableSans-SemiBold';
            color: black;
            margin-right: 10px;
            margin-left: 20px;
          }
          [type="checkbox"] {
            margin-right: 10px;
            margin-left: 20px;
            margin-bottom: 15px;
          }
          .checkbox-container:first-of-type [type="checkbox"] {
            margin-top: 20px;
          }
          .checkbox-container:last-of-type [type="checkbox"] {
            margin-bottom: 20px;
          }
        `}</style>
      </>
    );
  }

  componentDidUpdate() {
    Common.updateJobModal.call(this);
  }
}
