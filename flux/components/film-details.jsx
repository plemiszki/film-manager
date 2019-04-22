import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import ServerActions from '../actions/server-actions.js'
import FilmsStore from '../stores/films-store.js'
import FilmErrorsStore from '../stores/film-errors-store.js'
import CountriesStore from '../stores/countries-store.js'
import LanguagesStore from '../stores/languages-store.js'
import GenresStore from '../stores/genres-store.js'
import TopicsStore from '../stores/topics-store.js'
import QuotesStore from '../stores/quotes-store.js'
import LaurelsStore from '../stores/laurels-store.js'
import DirectorsStore from '../stores/directors-store.js'
import CrossedFilmsStore from '../stores/crossed-films-store.js'
import ActorsStore from '../stores/actors-store.js'
import RelatedFilmsStore from '../stores/related-films-store.js'
import NewThing from './new-thing.jsx'
import ModalSelect from './modal-select.jsx'
import FilmRightsNew from './film-rights-new.jsx'
import FilmRightsChangeDates from './film-rights-change-dates.jsx'
import FormatsStore from '../stores/formats-store.js'
import DigitalRetailersStore from '../stores/digital-retailers-store.js'
import JobStore from '../stores/job-store.js'
import FilmRightsStore from '../stores/film-rights-store.js'
import FilmRightsStore2 from '../stores/film-rights-store-2.js'

const LicensorModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#FFFFFF',
    margin: 'auto',
    maxWidth: 540,
    height: '90%',
    border: 'solid 1px #5F5F5F',
    borderRadius: '6px',
    textAlign: 'center',
    color: '#5F5F5F'
  }
};

const DvdModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 376
  }
};

const QuoteModalStyles = {
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

const LaurelModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 360
  }
};

const DirectorModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 250
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
    height: 575
  }
};

const ChangeDatesModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 240
  }
};

const ArtworkModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 600,
    height: 162
  }
};

const CopyModalStyles = {
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

class FilmDetails extends React.Component {

  constructor(props) {
    super(props)
    var job = {
      errors_text: ""
    };
    this.state = {
      fetching: true,
      film: {},
      filmSaved: {},
      filmErrors: [],
      percentages: {},
      percentagesSaved: {},
      percentageErrors: {},
      reports: [],
      dvds: [],
      bookings:[],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      licensorModalOpen: false,
      dvdModalOpen: false,
      countriesModalOpen: false,
      languagesModalOpen: false,
      genresModalOpen: false,
      topicsModalOpen: false,
      quoteModalOpen: false,
      laurelModalOpen: false,
      directorModalOpen: false,
      actorModalOpen: false,
      relatedFilmsModalOpen: false,
      formatsModalOpen: false,
      copyModalOpen: false,
      tab: (Common.params.tab ? HandyTools.capitalize(Common.params.tab) : 'General'),
      filmRights: [],
      filmCountries: [],
      filmLanguages: [],
      filmGenres: [],
      filmTopics: [],
      countries: [],
      languages: [],
      genres: [],
      topics: [],
      quotes: [],
      laurels: [],
      relatedFilms: [],
      otherFilms: [],
      actors: [],
      directors: [],
      searchText: '',
      sortBy: 'startDate',
      newRightsModalOpen: false,
      rightsSortBy: 'name',
      subRightsSortBy: 'sublicensorName',
      filmFormats: [],
      formats: [],
      digitalRetailerFilms: [],
      schedule: [],
      artworkModalOpen: false,
      jobModalOpen: !!job.id,
      job: job,
      crossedFilms: [],
      otherCrossedFilms: [],
      episodes: []
    };
  }

  componentDidMount() {
    this.filmListener = FilmsStore.addListener(this.getFilm.bind(this));
    this.jobListener = JobStore.addListener(this.getJob.bind(this));
    this.countriesListener = CountriesStore.addListener(this.getCountries.bind(this));
    this.languagesListener = LanguagesStore.addListener(this.getLanguages.bind(this));
    this.genresListener = GenresStore.addListener(this.getGenres.bind(this));
    this.topicsListener = TopicsStore.addListener(this.getTopics.bind(this));
    this.quotesListener = QuotesStore.addListener(this.getQuotes.bind(this));
    this.laurelsListener = LaurelsStore.addListener(this.getLaurels.bind(this));
    this.directorsListener = DirectorsStore.addListener(this.getDirectors.bind(this));
    this.actorsListener = ActorsStore.addListener(this.getActors.bind(this));
    this.relatedFilmsListener = RelatedFilmsStore.addListener(this.getRelatedFilms.bind(this));
    this.errorsListener = FilmErrorsStore.addListener(this.getErrors.bind(this));
    this.formatsListener = FormatsStore.addListener(this.getFormats.bind(this));
    this.digitalRetailersListener = DigitalRetailersStore.addListener(this.getDigitalRetailers.bind(this));
    this.crossedFilmsListener = CrossedFilmsStore.addListener(this.getCrossedFilms.bind(this));
    this.filmRights2Listener = FilmRightsStore2.addListener(this.getFilmRights2.bind(this));
    ClientActions.fetchFilm(window.location.pathname.split('/')[2]);
  }

  componentWillUnmount() {
    this.filmListener.remove();
    this.countriesListener.remove();
    this.languagesListener.remove();
    this.genresListener.remove();
    this.topicsListener.remove();
    this.quotesListener.remove();
    this.laurelsListener.remove();
    this.directorsListener.remove();
    this.actorsListener.remove();
    this.relatedFilmsListener.remove();
    this.errorsListener.remove();
    this.formatsListener.remove();
    this.digitalRetailersListener.remove();
    this.jobListener.remove();
    this.crossedFilmsListener.remove();
    this.filmRights2Listener.remove();
  }

  getFilm() {
    this.setState({
      film: Tools.deepCopy(FilmsStore.find(window.location.pathname.split('/')[2])),
      filmSaved: FilmsStore.find(window.location.pathname.split('/')[2]),
      percentages: Tools.deepCopy(FilmsStore.percentages()),
      percentagesSaved: FilmsStore.percentages(),
      reports: FilmsStore.reports(),
      dvds: FilmsStore.dvds(),
      bookings: FilmsStore.bookings(),
      schedule: FilmsStore.schedule(),
      crossedFilms: FilmsStore.crossedFilms(),
      otherCrossedFilms: FilmsStore.otherCrossedFilms(),
      episodes: FilmsStore.episodes(),
      filmRights: FilmsStore.rights(),
      fetching: false
    }, () => {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  }

  getFilmRights2() {
    this.setState({
      newRightsModalOpen: false,
      changeDatesModalOpen: false,
      filmRights: FilmRightsStore2.filmRights()
    });
  }

  getFormats() {
    this.setState({
      filmFormats: FormatsStore.filmFormats(),
      formats: FormatsStore.all(),
      formatsModalOpen: false
    });
  }

  getCountries() {
    this.setState({
      filmCountries: CountriesStore.filmCountries(),
      countries: CountriesStore.all(),
      countriesModalOpen: false
    });
  }

  getLanguages() {
    this.setState({
      filmLanguages: LanguagesStore.filmLanguages(),
      languages: LanguagesStore.all(),
      languagesModalOpen: false
    });
  }

  getGenres() {
    this.setState({
      filmGenres: GenresStore.filmGenres(),
      genres: GenresStore.all(),
      genresModalOpen: false
    });
  }

  getTopics() {
    this.setState({
      filmTopics: TopicsStore.filmTopics(),
      topics: TopicsStore.all(),
      topicsModalOpen: false
    });
  }

  getQuotes() {
    this.setState({
      quotes: QuotesStore.all(),
      quoteModalOpen: false
    });
  }

  getLaurels() {
    this.setState({
      laurels: LaurelsStore.all(),
      laurelModalOpen: false,
      fetching: false
    });
  }

  getRelatedFilms() {
    this.setState({
      relatedFilms: RelatedFilmsStore.all(),
      otherFilms: RelatedFilmsStore.otherFilms(),
      relatedFilmsModalOpen: false,
      fetching: false
    });
  }

  getDirectors() {
    this.setState({
      directors: DirectorsStore.all(),
      directorModalOpen: false,
      fetching: false
    });
  }

  getCrossedFilms() {
    this.setState({
      crossedFilms: CrossedFilmsStore.all(),
      otherCrossedFilms: CrossedFilmsStore.otherCrossedFilms(),
      crossedFilmModalOpen: false,
      fetching: false
    });
  }

  getActors() {
    this.setState({
      actors: ActorsStore.all(),
      actorModalOpen: false,
      fetching: false
    });
  }

  getErrors() {
    this.setState({
      filmErrors: FilmErrorsStore.filmErrors(),
      percentageErrors: FilmErrorsStore.percentageErrors(),
      fetching: false
    });
  }

  getDigitalRetailers() {
    this.setState({
      digitalRetailerFilms: DigitalRetailersStore.digitalRetailerFilms(),
      newDigitalRetailerModalOpen: false,
      fetching: false
    });
  }

  getJob() {
    var job = JobStore.job();
    if (job.done) {
      var film = this.state.film;
      film.artworkUrl = job.first_line;
      var filmSaved = this.state.filmSaved;
      filmSaved.artworkUrl = job.first_line;
      this.setState({
        film: film,
        filmSaved: filmSaved,
        jobModalOpen: false,
        job: job
      });
    } else {
      this.setState({
        jobModalOpen: true,
        job: job,
        fetching: false
      });
    }
  }

  mouseDownHandle(e) {
    $('*').addClass('grabbing');
    let li = e.target.parentElement;
    li.classList.add('grabbed-element');
    let ul = e.target.parentElement.parentElement;
    ul.classList.add('grab-section');
  }

  mouseUpHandle(e) {
    $('*').removeClass('grabbing');
    let li = e.target.parentElement;
    li.classList.remove('grabbed-element');
    let ul = e.target.parentElement.parentElement;
    ul.classList.remove('grab-section');
  }

  dragOverHandler(e) {
    e.target.classList.add('highlight');
  }

  dragOutHandler(e) {
    e.target.classList.remove('highlight');
  }

  dragEndHandler() {
    $('*').removeClass('grabbing');
    $('body').removeAttr('style');
    $('.grabbed-element').removeClass('grabbed-element');
    $('.highlight').removeClass('highlight');
  }

  dropHandler(e, ui) {
    let draggedIndex = ui.draggable[0].dataset.index;
    let dropZoneIndex = e.target.dataset.index;
    let currentOrder = {};
    let entityArray;
    let directory;
    switch (e.target.dataset.section) {
      case 'countries':
        entityArray = 'filmCountries';
        directory = 'film_countries';
        break
      case 'languages':
        entityArray = 'filmLanguages';
        directory = 'film_languages';
        break
      case 'cast':
        entityArray = 'actors';
        break
      case 'laurels':
        entityArray = 'laurels';
        break
      case 'quotes':
        entityArray = 'quotes';
        break
      case 'genres':
        entityArray = 'filmGenres';
        directory = 'film_genres'
    }
    this.state[entityArray].forEach((entity) => {
      currentOrder[entity.order] = entity.id;
    });
    let newOrder = HandyTools.rearrangeFields(currentOrder, draggedIndex, dropZoneIndex);
    ClientActions.rearrangeFilmEntities(this.state.film.id, directory || entityArray, newOrder);
  }

  clickTab(e) {
    var tab = e.target.innerText;
    if (this.state.tab !== tab) {
      $('select').niceSelect('destroy');
      this.setState({
        tab: tab
      });
    }
  }

  clickSave() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, () => {
        ClientActions.updateFilm(this.state.film, this.state.percentages);
      });
    }
  }

  clickDelete() {
    this.setState({
      deleteModalOpen: true
    });
  }

  clickCopy() {
    this.setState({
      copyModalOpen: true
    });
  }

  clickAddFormat() {
    this.setState({
      formatsModalOpen: true
    });
  }

  clickFormat(e) {
    ClientActions.createFilmFormat({ filmId: this.state.film.id, formatId: e.target.dataset.id })
  }

  clickDeleteFormat(e) {
    ClientActions.deleteFilmFormat(e.target.dataset.id);
  }

  clickAddCountry() {
    this.setState({
      countriesModalOpen: true
    });
  }

  clickCountry(e) {
    ClientActions.createFilmCountry({ film_id: this.state.film.id, country_id: e.target.dataset.id })
  }

  clickDeleteCountry(e) {
    ClientActions.deleteFilmCountry(e.target.dataset.id);
  }

  clickAddLanguage() {
    this.setState({
      languagesModalOpen: true
    });
  }

  clickLanguage(e) {
    ClientActions.createFilmLanguage({ film_id: this.state.film.id, language_id: e.target.dataset.id })
  }

  clickDeleteLanguage(e) {
    ClientActions.deleteFilmLanguage(e.target.dataset.id);
  }

  clickAddGenre() {
    this.setState({
      genresModalOpen: true
    });
  }

  clickGenre(e) {
    ClientActions.createFilmGenre({ film_id: this.state.film.id, genre_id: e.target.dataset.id })
  }

  clickDeleteGenre(e) {
    ClientActions.deleteFilmGenre(e.target.dataset.id);
  }

  clickAddTopic() {
    this.setState({
      topicsModalOpen: true
    });
  }

  clickTopic(e) {
    ClientActions.createFilmTopic({ film_id: this.state.film.id, topic_id: e.target.dataset.id })
  }

  clickDeleteTopic(e) {
    ClientActions.deleteFilmTopic(e.target.dataset.id);
  }

  clickSelectLicensorButton() {
    this.setState({
      licensorModalOpen: true
    });
  }

  clickLicensorButton(event) {
    var film = this.state.film;
    film.licensorId = event.target.dataset.id;
    this.setState({
      film: film,
      licensorModalOpen: false
    }, () => {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  }

  clickQuote(e) {
    if (e.target.dataset.id) {
      window.location = '/quotes/' + e.target.dataset.id;
    }
  }

  clickAddQuote() {
    this.setState({
      quoteModalOpen: true
    });
  }

  clickAddLaurel() {
    this.setState({
      laurelModalOpen: true
    });
  }

  clickAddRelatedFilm() {
    this.setState({
      relatedFilmsModalOpen: true
    });
  }

  clickAddDirector() {
    this.setState({
      directorModalOpen: true
    });
  }

  clickAddCrossedFilm() {
    this.setState({
      crossedFilmModalOpen: true
    });
  }

  clickAddActor() {
    this.setState({
      actorModalOpen: true
    });
  }

  clickAddDVDButton() {
    this.setState({
      dvdModalOpen: true
    });
  }

  clickAddEpisode() {
    this.setState({
      episodeModalOpen: true
    });
  }

  clickDeleteLaurel(e) {
    this.setState({
      fetching: true
    });
    ClientActions.deleteLaurel(e.target.dataset.id);
  }

  clickDeleteDirector(e) {
    this.setState({
      fetching: true
    });
    ClientActions.deleteDirector(e.target.dataset.id);
  }

  clickDeleteCrossedFilm(e) {
    this.setState({
      fetching: true
    });
    ClientActions.deleteCrossedFilm(e.target.dataset.id);
  }

  clickDeleteActor(e) {
    this.setState({
      fetching: true
    });
    ClientActions.deleteActor(e.target.dataset.id);
  }

  clickDeleteRelatedFilm(e) {
    this.setState({
      fetching: true
    });
    ClientActions.deleteRelatedFilm(e.target.dataset.id);
  }

  clickRelatedFilm(e) {
    ClientActions.createRelatedFilm({ filmId: this.state.film.id, otherFilmId: e.target.dataset.id });
  }

  clickCrossedFilm(e) {
    ClientActions.createCrossedFilm({ filmId: this.state.film.id, crossedFilmId: e.target.dataset.id });
  }

  clickAddDigitalRetailer() {
    this.setState({
      newDigitalRetailerModalOpen: true
    });
  }

  confirmDelete() {
    this.setState({
      fetching: true
    }, () => {
      ClientActions.deleteFilm(this.state.film.id);
    });
  }

  clickAddRight() {
    this.setState({
      newRightsModalOpen: true
    });
  }

  clickChangeRightsDates() {
    this.setState({
      changeDatesModalOpen: true
    });
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false,
      licensorModalOpen: false,
      dvdModalOpen: false,
      episodeModalOpen: false,
      countriesModalOpen: false,
      languagesModalOpen: false,
      genresModalOpen: false,
      topicsModalOpen: false,
      quoteModalOpen: false,
      laurelModalOpen: false,
      directorModalOpen: false,
      actorModalOpen: false,
      relatedFilmsModalOpen: false,
      newRightsModalOpen: false,
      formatsModalOpen: false,
      newDigitalRetailerModalOpen: false,
      artworkModalOpen: false,
      crossedFilmModalOpen: false,
      changeDatesModalOpen: false,
      copyModalOpen: false
    });
  }

  checkForChanges() {
    if (Tools.objectsAreEqual(this.state.film, this.state.filmSaved) == false) {
      return true;
    } else {
      return !Tools.objectsAreEqual(this.state.percentages, this.state.percentagesSaved);
    }
  }

  redirect(directory, id) {
    window.location = `/${directory}/${id}`;
  }

  changeCheckbox(property, e) {
    var film = this.state.film;
    var filmErrors = this.state.filmErrors;
    film[property] = e.target.checked;
    if (property === "reserve" && e.target.checked === false) {
      film.reservePercentage = 0;
      Common.errors.reservePercentage.forEach((message) => {
        HandyTools.removeFromArray(filmErrors, message);
      });
      film.reserveQuarters = 0;
      Common.errors.reserveQuarters.forEach((message) => {
        HandyTools.removeFromArray(filmErrors, message);
      });
    } else if (property === "autoRenew" && e.target.checked === false) {
      film.autoRenewTerm = 0;
      Common.errors.autoRenewTerm.forEach((message) => {
        HandyTools.removeFromArray(filmErrors, message);
      });
    }
    this.setState({
      film: film,
      filmErrors: filmErrors,
      justSaved: false
    }, () => {
      var changesToSave = this.changeFieldArgs().changesFunction.call();
      this.setState({changesToSave: changesToSave});
    });
  }

  clickRightsHeader(property) {
    this.setState({
      rightsSortBy: property
    });
  }

  clickSubRightsHeader(property) {
    this.setState({
      subRightsSortBy: property
    });
  }

  clickArtwork() {
    this.setState({
      artworkModalOpen: true
    });
  }

  confirmUpdateArtwork() {
    this.setState({
      artworkModalOpen: false
    });
    ClientActions.updateArtwork(this.state.film.id);
  }

  rightsSort(object) {
    var property = object[this.state.rightsSortBy];
    return property.toLowerCase();
  }

  rightsSortSecond(object) {
    if (this.state.rightsSortBy === 'name') {
      return object['territory'].toLowerCase();
    } else {
      return object['name'].toLowerCase();
    }
  }

  subRightsSort(object) {
    var property = object[this.state.subRightsSortBy];
    return property.toLowerCase();
  }

  subRightsSortSecond(object) {
    if (this.state.subRightsSortBy === 'rightName') {
      return object['territory'].toLowerCase();
    } else {
      return object['rightName'].toLowerCase();
    }
  }

  changeFieldArgs(errors) {
    return {
      thing: "film",
      errorsArray: errors || this.state.filmErrors,
      beforeSave: (newThing, key, value) => {
        if (key == "dealTypeId") {
          if (value <= 4) {
            newThing.grPercentage = "";
            Common.removeFieldError(this.state.filmErrors, "grPercentage")
          } else {
            newThing.grPercentage = "0";
          }
        }
      },
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  updateChangedDates() {
    this.setState({
      changeDatesModalOpen: false,
      fetching: true
    });
  }

  render() {
    let title = {
      'Short': 'Short',
      'Feature': 'Film',
      'TV Series': 'TV Series'
    }[this.state.film.filmType];
    return(
      <div className="film-details component details-component">
        <h1>{ title } Details</h1>
        { this.renderTopTabs() }
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <div className="row">
            <div className="col-xs-1">
              <div className={ "key-art" + (this.state.film.artworkUrl ? '' : ' empty') } style={ this.state.film.artworkUrl ? { 'backgroundImage': `url(${this.state.film.artworkUrl})` } : {} } onClick={ this.clickArtwork.bind(this) }></div>
            </div>
            <div className="col-xs-9">
              <h2>Title</h2>
              <input className={ Common.errorClass(this.state.filmErrors, ["Title can't be blank"]) } onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.title || ""} data-field="title" />
              { Common.renderFieldError(this.state.filmErrors, ["Title can't be blank"]) }
            </div>
            <div className="col-xs-2">
              <h2>Type</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.filmType || ""} readOnly={ true } />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
          </div>
          { this.renderTab(this.state.tab) }
          { this.renderButtons() }
        </div>
        <Modal isOpen={this.state.deleteModalOpen} onRequestClose={this.closeModal.bind(this)} contentLabel="Modal" style={Common.deleteModalStyles}>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this film&#63;</h1>
            Deleting a film will erase ALL of its information and data<br />
          <a className={ "red-button" } onClick={ this.confirmDelete.bind(this) }>
              Yes
            </a>
            <a className={ "orange-button" } onClick={ this.closeModal.bind(this) }>
              No
            </a>
          </div>
        </Modal>
        <Modal isOpen={this.state.licensorModalOpen} onRequestClose={this.closeModal.bind(this)} contentLabel="Modal" style={ LicensorModalStyles }>
          <ul className="licensor-modal-list">
            <li onClick={this.clickLicensorButton.bind(this)} data-id={null}>(None)</li>
            { FilmsStore.licensors().map((licensor, index) => {
              return(
                <li key={index} onClick={this.clickLicensorButton.bind(this)} data-id={licensor.id}>{licensor.name}</li>
              );
            }) }
          </ul>
        </Modal>
        <Modal isOpen={this.state.episodeModalOpen} onRequestClose={this.closeModal.bind(this)} contentLabel="Modal" style={ DirectorModalStyles }>
          <NewThing thing="episode" initialObject={ { filmId: this.state.film.id, title: '', length: '', episodeNumber: '', seasonNumber: '' } } />
        </Modal>
        <Modal isOpen={this.state.dvdModalOpen} onRequestClose={this.closeModal.bind(this)} contentLabel="Modal" style={ DvdModalStyles }>
          <NewThing thing="dvd" initialObject={{featureFilmId: this.state.film.id, dvdTypeId: (this.state.film.id && this.state.dvds.length < 6) ? FilmsStore.dvdTypes()[0].id : 1}} />
        </Modal>
        <Modal isOpen={this.state.quoteModalOpen} onRequestClose={this.closeModal.bind(this)} contentLabel="Modal" style={ QuoteModalStyles }>
          <NewThing thing="quote" initialObject={{ filmId: this.state.film.id, text: "", author: "", publication: "" }} />
        </Modal>
        <Modal isOpen={this.state.laurelModalOpen} onRequestClose={this.closeModal.bind(this)} contentLabel="Modal" style={ LaurelModalStyles }>
          <NewThing thing="laurel" initialObject={{ filmId: this.state.film.id, result: "Official Selection", awardName: "", festival: "" }} />
        </Modal>
        <Modal isOpen={this.state.directorModalOpen} onRequestClose={this.closeModal.bind(this)} contentLabel="Modal" style={ DirectorModalStyles }>
          <NewThing thing="director" initialObject={{ filmId: this.state.film.id, firstName: "", lastName: "" }} />
        </Modal>
        <Modal isOpen={this.state.crossedFilmModalOpen} onRequestClose={this.closeModal.bind(this)} contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ this.state.otherCrossedFilms } property={ "title" } func={ this.clickCrossedFilm.bind(this) } />
        </Modal>
        <Modal isOpen={this.state.actorModalOpen} onRequestClose={this.closeModal.bind(this)} contentLabel="Modal" style={ DirectorModalStyles }>
          <NewThing thing="actor" initialObject={{ actorableId: this.state.film.id, actorableType: 'Film', firstName: "", lastName: "" }} />
        </Modal>
        <Modal isOpen={ this.state.countriesModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ this.state.countries } property={ "name" } func={ this.clickCountry.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.languagesModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ this.state.languages } property={ "name" } func={ this.clickLanguage.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.genresModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ this.state.genres } property={ "name" } func={ this.clickGenre.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.topicsModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ this.state.topics } property={ "name" } func={ this.clickTopic.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.relatedFilmsModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ this.state.otherFilms } property={ "title" } func={ this.clickRelatedFilm.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.formatsModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ this.state.formats } property={ "name" } func={ this.clickFormat.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.newRightsModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ NewRightsModalStyles }>
          <FilmRightsNew filmId={ this.state.film.id } />
        </Modal>
        <Modal isOpen={ this.state.changeDatesModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ChangeDatesModalStyles }>
          <FilmRightsChangeDates filmId={ this.state.film.id } updateChangedDates={ this.updateChangedDates.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.newDigitalRetailerModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ DirectorModalStyles }>
          <NewThing thing="digitalRetailerFilm" initialObject={ { filmId: this.state.film.id, url: "", digitalRetailerId: "1" } } />
        </Modal>
        <Modal isOpen={ this.state.copyModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ CopyModalStyles }>
          <NewThing thing="film" copy={ true } initialObject={ { title: "", year: "", length: "", filmType: this.state.film.filmType, copyFrom: this.state.film.id } } />
        </Modal>
        <Modal isOpen={ this.state.artworkModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ArtworkModalStyles }>
          <h1 className="my-modal-header">Update artwork for all films now?</h1>
          <div className="text-center">
            <div className="orange-button small margin" onClick={ this.confirmUpdateArtwork.bind(this) }>Yes</div>
            <div className="cancel-button small" onClick={ this.closeModal.bind(this) }>No</div>
          </div>
        </Modal>
        { Common.jobModal.call(this, this.state.job) }
      </div>
    );
  }

  renderTopTabs() {
    return(
      <div className={ `tabs-row${this.state.film.filmType == 'TV Series' ? ' tv' : ''}` }>
        { this.renderTopTab("General") }
        { this.renderTopTab("Contract") }
        { this.renderTopTab("Synopses") }
        { this.renderTopTab("Marketing") }
        { this.renderTopTab("Bookings") }
        { this.renderTopTab("DVDs") }
        { this.renderTopTab("Statements") }
        { this.renderTopTab("Sublicensing") }
        { this.renderTopTab("Episodes") }
      </div>
    );
  }

  renderTopTab(label) {
    if (this.state.film.id) {
      if (['General', 'Contract', 'Synopses', 'DVDs'].indexOf(label) > -1 ||
          (['Marketing', 'Bookings', 'Statements', 'Sublicensing'].indexOf(label) > -1 && (this.state.film.filmType == 'Feature' || this.state.film.filmType == 'TV Series')) ||
          (label == 'Episodes' && this.state.film.filmType == 'TV Series'))
      {
        return(
          <div className={ "tab" + (this.state.tab === label ? " selected" : "") } onClick={ this.clickTab.bind(this) }>{ label }</div>
        );
      }
    }
  }

  renderTab(tab) {
    if (tab === "Contract") {
      return(
        <div>
          <hr />
          <div className="row">
            <div className="col-xs-12 col-sm-5">
              <h2>Licensor</h2>
              <input className={Common.errorClass(this.state.filmErrors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.licensorId ? FilmsStore.findLicensor(this.state.film.licensorId).name : "(None)"} data-field="licensorId" readOnly={true} />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className="col-sm-1 icons">
              <img src={ Images.openModal } onClick={ this.clickSelectLicensorButton.bind(this) } />
            </div>
            <div className="col-xs-3">
              <h2>Start Date</h2>
              <input className={ Common.errorClass(this.state.filmErrors, Common.errors.startDate) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.startDate || "" } data-field="startDate" />
              { Common.renderFieldError(this.state.filmErrors, Common.errors.startDate) }
            </div>
            <div className="col-xs-3">
              <h2>End Date</h2>
              <input className={ Common.errorClass(this.state.filmErrors, Common.errors.endDate) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.endDate || "" } data-field="endDate" />
              { Common.renderFieldError(this.state.filmErrors, Common.errors.endDate) }
            </div>
          </div>
          { this.renderRoyaltyFields() }
          <hr />
        </div>
      );
    } else if (this.state.tab === "Episodes") {
      return(
        <div>
          <hr />
          <table className={ "admin-table" }>
            <thead>
              <tr>
                <th>Season</th>
                <th>Episode</th>
                <th>Title</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { this.state.episodes.map((episode, index) => {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, "episodes", episode.id) }>
                    <td className="name-column">
                      { episode.seasonNumber }
                    </td>
                    <td>
                      { episode.episodeNumber }
                    </td>
                    <td>
                      { episode.title }
                    </td>
                  </tr>
                );
              }) }
            </tbody>
          </table>
          <a className="blue-outline-button small" onClick={ this.clickAddEpisode.bind(this) }>Add Episode</a>
          <hr />
        </div>
      );
    } else if (this.state.tab === "DVDs" && this.state.film.filmType !== 'Short') {
      return(
        <div>
          <hr />
          <table className={ "admin-table" }>
            <thead>
              <tr>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { this.state.dvds.map((dvd, index) => {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, "dvds", dvd.id) }>
                    <td className="name-column">
                      { dvd.type }
                    </td>
                  </tr>
                );
              }) }
            </tbody>
          </table>
          <a className={ 'blue-outline-button small' + (this.state.dvds.length === 6 ? ' hidden' : '') } onClick={ this.clickAddDVDButton.bind(this) }>Add DVD</a>
          <hr />
        </div>
      );
    } else if (this.state.tab === "DVDs" && this.state.film.filmType === 'Short') {
      return(
        <div>
          <hr />
          <table className="admin-table">
            <thead>
              <tr>
                <th>Feature Title</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td></tr>
              { this.state.dvds.map((dvd, index) => {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, 'dvds', dvd.id) }>
                    <td className="name-column">
                      { dvd.featureTitle }
                    </td>
                    <td>
                      { dvd.type }
                    </td>
                  </tr>
                );
              }) }
            </tbody>
          </table>
          <hr />
        </div>
      );
    } else if (this.state.tab === "Sublicensing") {
      return(
        <div>
          <hr />
          <h3>Sublicensed Rights:</h3>
          <div className="row">
            <div className="col-xs-12">
              <table className="admin-table no-hover">
                <thead>
                  <tr>
                    <th><div className={ this.state.subRightsSortBy === 'sublicensor' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickSubRightsHeader.bind(this, 'sublicensorName') }>Sublicensor</div></th>
                    <th><div className={ this.state.subRightsSortBy === 'name' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickSubRightsHeader.bind(this, 'rightName') }>Right</div></th>
                    <th><div className={ this.state.subRightsSortBy === 'territory' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickSubRightsHeader.bind(this, 'territory') }>Territory</div></th>
                    <th><div className={ this.state.subRightsSortBy === 'startDate' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickSubRightsHeader.bind(this, 'startDate') }>Start Date</div></th>
                    <th><div className={ this.state.subRightsSortBy === 'endDate' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickSubRightsHeader.bind(this, 'endDate') }>End Date</div></th>
                    <th><div className={ this.state.subRightsSortBy === 'exclusive' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickSubRightsHeader.bind(this, 'exclusive') }>Exclusive</div></th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                  { _.orderBy(FilmsStore.subRights(), [this.subRightsSort.bind(this), this.subRightsSortSecond.bind(this)]).map((subRight, index) => {
                    return(
                      <tr key={ index }>
                        <td className="indent">
                          { subRight.sublicensorName }
                        </td>
                        <td>
                          { subRight.rightName }
                        </td>
                        <td>
                          { subRight.territory }
                        </td>
                        <td>
                          { subRight.startDate }
                        </td>
                        <td>
                          { subRight.endDate }
                        </td>
                        <td>
                          { subRight.exclusive }
                        </td>
                      </tr>
                    );
                  }) }
                </tbody>
              </table>
            </div>
          </div>
          <hr />
        </div>
      );
    } else if (this.state.tab === "Bookings") {
      var filteredBookings = this.state.bookings.filterSearchText(this.state.searchText, this.state.sortBy);
      return(
        <div>
          <hr />
          <h3>Screening Formats:</h3>
          <div className="row">
            <div className="col-xs-6">
              <ul className="standard-list">
                { this.state.filmFormats.map((filmFormat) => {
                  return(
                    <li key={ filmFormat.id }>{ filmFormat.format }<div className="x-button" onClick={ this.clickDeleteFormat.bind(this) } data-id={ filmFormat.id }></div></li>
                  );
                }) }
              </ul>
              <a className={ 'blue-outline-button small' } onClick={ this.clickAddFormat.bind(this) }>Add Format</a>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-2">
              <h2>Rating</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.rating || "" } data-field="rating" />
              { Common.renderFieldError(this.state.filmErrors,[]) }
            </div>
            <div className="col-xs-2">
              <h2>Aspect Ratio</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.aspectRatio || "" } data-field="aspectRatio" />
              { Common.renderFieldError(this.state.filmErrors,[]) }
            </div>
            <div className="col-xs-4">
              <h2>Sound Configuration</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.soundConfig || "" } data-field="soundConfig" />
              { Common.renderFieldError(this.state.filmErrors,[]) }
            </div>
          </div>
          <hr />
          <h3>Bookings:</h3>
          <ul className="bookings-count-list clearfix">
            <li>Theatrical: { this.state.film.theatricalCount }</li>
            <li>Festival: { this.state.film.festivalCount }</li>
            <li>Non-Theatrical: { this.state.film.nonTheatricalCount }</li>
          </ul>
          <input className="search-box" onChange={ Common.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
          <table className="admin-table bookings-table">
            <thead>
              <tr>
                <th><div className={ Common.sortClass.call(this, "startDate") } onClick={ Common.clickHeader.bind(this, "startDate") }>Start Date</div></th>
                <th><div className={ Common.sortClass.call(this, "venue") } onClick={ Common.clickHeader.bind(this, "venue") }>Venue</div></th>
                <th><div className={ Common.sortClass.call(this, "type") } onClick={ Common.clickHeader.bind(this, "type") }>Type</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td><td></td></tr>
              { _.orderBy(filteredBookings, [Common.commonSort.bind(this)]).map((booking, index) => {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, "bookings", booking.id) }>
                    <td className="indent">
                      { booking.startDate }
                    </td>
                    <td>
                      { booking.venue }
                    </td>
                    <td>
                      { booking.type }
                    </td>
                  </tr>
                );
              }) }
            </tbody>
          </table>
          <hr />
        </div>
      )
    } else if (this.state.tab === "Statements") {
      return(
        <div>
          <hr className="smaller-margin" />
          <div className="row checkboxes">
            <div className="col-xs-4">
              <input id="export-reports" type="checkbox" checked={ this.state.film.exportReports } onChange={this.changeCheckbox.bind(this, 'exportReports')} /><label htmlFor="export-reports">Export Reports</label>
            </div>
            <div className={"col-xs-4" + (this.state.film.exportReports ? "" : " hidden")}>
              <input id="send-reports" type="checkbox" checked={ this.state.film.sendReports } onChange={this.changeCheckbox.bind(this, 'sendReports')} /><label htmlFor="send-reports">Send Reports</label>
            </div>
            <div className="col-xs-4">
              <input id="ignore-sage-id" type="checkbox" checked={ this.state.film.ignoreSageId } onChange={this.changeCheckbox.bind(this, 'ignoreSageId')} /><label htmlFor="ignore-sage-id">Ignore Sage ID on Import</label>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-6">
              <h3>Crossed Films</h3>
              <ul className="standard-list">
                { this.state.crossedFilms.map((crossedFilm) => {
                  return(
                    <li key={ crossedFilm.id }>{ crossedFilm.title }<div className="x-button" onClick={ this.clickDeleteCrossedFilm.bind(this) } data-id={ crossedFilm.id }></div></li>
                  );
                }) }
              </ul>
              <a className="blue-outline-button small" onClick={ this.clickAddCrossedFilm.bind(this) }>Add Film</a>
            </div>
          </div>
          <hr />
          <table className="admin-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Quarter</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td></tr>
              { this.state.reports.map((report, index) => {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, "royalty_reports", report.id) }>
                    <td className="name-column">
                      { report.year }
                    </td>
                    <td>
                      { report.quarter }
                    </td>
                  </tr>
                );
              }) }
            </tbody>
          </table>
          <hr />
        </div>
      );
    } else if (this.state.tab === "General") {
      return(
        <div>
          <hr />
          <div className="row">
            <div className="col-xs-6">
              <h2>Director(s):</h2>
              <ul className="standard-list">
                { this.state.directors.map((director) => {
                  return(
                    <li key={ director.id }>{ director.firstName } { director.lastName }<div className="x-button" onClick={ this.clickDeleteDirector.bind(this) } data-id={ director.id }></div></li>
                  );
                }) }
              </ul>
              <a className="blue-outline-button small" onClick={ this.clickAddDirector.bind(this) }>Add Director</a>
            </div>
            <div className="col-xs-2">
              <h2>Label</h2>
              <select onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="labelId" value={ this.state.film.labelId }>
                { FilmsStore.labels().map((label, index) => {
                  return(
                    <option key={ index } value={ label.id }>{ label.name }</option>
                  );
                }) }
              </select>
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className="col-xs-2">
              <h2>Year</h2>
              <input className={ Common.errorClass(this.state.filmErrors, Common.errors.year) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.year || "" } data-field="year" />
              { Common.renderFieldError(this.state.filmErrors, Common.errors.year) }
            </div>
            <div className="col-xs-2">
              <h2>Length (minutes)</h2>
              <input className={ Common.errorClass(this.state.filmErrors, Common.errors.length) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.length || "" } data-field="length" />
              { Common.renderFieldError(this.state.filmErrors, Common.errors.length) }
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-6">
              <h3>Countries:</h3>
              <ul className="standard-list reorderable">
                <li className="drop-zone" data-index="-1" data-section={ 'countries' }></li>
                { this.state.filmCountries.map((filmCountry, index) => {
                  return(
                    <div key={ filmCountry.id }>
                      <li data-id={ filmCountry.id } data-index={ index } data-section="countries">{ filmCountry.country }<div className="handle" onMouseDown={ this.mouseDownHandle.bind(this) } onMouseUp={ this.mouseUpHandle.bind(this) }></div><div className="x-button" onClick={ this.clickDeleteCountry.bind(this) } data-id={ filmCountry.id }></div></li>
                      <li className="drop-zone" data-index={ index } data-section="countries"></li>
                    </div>
                  );
                }) }
              </ul>
              <a className="blue-outline-button small" onClick={ this.clickAddCountry.bind(this) }>Add Country</a>
            </div>
            <div className="col-xs-6">
              <h3>Languages:</h3>
              <ul className="standard-list reorderable">
                <li className="drop-zone" data-index="-1" data-section="languages"></li>
                { this.state.filmLanguages.map((filmLanguage, index) => {
                  return(
                    <div key={ filmLanguage.id }>
                      <li data-index={ index } data-section="languages">{ filmLanguage.language }<div className="handle" onMouseDown={ this.mouseDownHandle.bind(this) } onMouseUp={ this.mouseUpHandle.bind(this) }></div><div className="x-button" onClick={ this.clickDeleteLanguage.bind(this) } data-id={ filmLanguage.id }></div></li>
                      <li className="drop-zone" data-index={ index } data-section="languages"></li>
                    </div>
                  );
                }) }
              </ul>
              <a className="blue-outline-button small" onClick={ this.clickAddLanguage.bind(this) }>Add Language</a>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-6">
              <h3>Cast:</h3>
              <ul className="standard-list reorderable">
                <li className="drop-zone" data-index="-1" data-section={ 'cast' }></li>
                { this.state.actors.map((actor, index) => {
                  return(
                    <div key={ actor.id }>
                      <li data-index={ index } data-section="cast">{ actor.firstName } { actor.lastName }<div className="handle" onMouseDown={ this.mouseDownHandle.bind(this) } onMouseUp={ this.mouseUpHandle.bind(this) }></div><div className="x-button" onClick={ this.clickDeleteActor.bind(this) } data-id={ actor.id }></div></li>
                      <li className="drop-zone" data-index={ index } data-section="cast"></li>
                    </div>
                  );
                }) }
              </ul>
              <a className="blue-outline-button small" onClick={ this.clickAddActor.bind(this) }>Add Actor</a>
            </div>
            <div className={ "col-xs-3" + (this.state.film.filmType == 'Short' ? ' hidden' : '') }>
              <h3>Release Dates:</h3>
              <h2>Theatrical Release</h2>
              <input className={ Common.errorClass(this.state.filmErrors, Common.errors.theatricalRelease) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.theatricalRelease || "" } data-field="theatricalRelease" />
              { Common.renderFieldError(this.state.filmErrors, Common.errors.theatricalRelease) }
              <h2>SVOD Release</h2>
              <input className={ Common.errorClass(this.state.filmErrors, Common.errors.svodRelease) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.svodRelease || "" } data-field="svodRelease" />
              { Common.renderFieldError(this.state.filmErrors, Common.errors.svodRelease) }
              <h2>TVOD/EST Release</h2>
              <input className={ Common.errorClass(this.state.filmErrors, Common.errors.tvodRelease) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.tvodRelease || "" } data-field="tvodRelease" />
              { Common.renderFieldError(this.state.filmErrors, Common.errors.tvodRelease) }
            </div>
            <div className={ "col-xs-3" + (this.state.film.filmType == 'Short' ? ' hidden' : '') }>
              <div style={ { width: '100%', height: '47px' } }></div>
              <h2>AVOD Release</h2>
              <input className={ Common.errorClass(this.state.filmErrors, Common.errors.avodRelease) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.avodRelease || "" } data-field="avodRelease" />
              { Common.renderFieldError(this.state.filmErrors, Common.errors.avodRelease) }
              <h2>Club Release</h2>
              <input className={ Common.errorClass(this.state.filmErrors, Common.errors.clubDate) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.clubDate || "" } data-field="clubDate" />
              { Common.renderFieldError(this.state.filmErrors, Common.errors.clubDate) }
            </div>
          </div>
          <hr />
          <div className={ "row" + (this.state.film.filmType == 'Short' ? ' hidden' : '') }>
            <div className="col-xs-12">
              <h3>Schedule:</h3>
              <ul className="standard-list schedule">
                { this.state.schedule.map((entry, index) => {
                  return(
                    <li key={ index } className={ entry.tentative ? 'tentative' : '' }>{ entry.label } - { entry.date + (entry.tentative ? ' (?)' : '') }</li>
                  );
                }) }
              </ul>
            </div>
          </div>
        </div>
      );
    } else if (this.state.tab === "Marketing") {
      return(
        <div>
          <hr className="smaller-margin" />
          <div className="row checkboxes">
            <div className="col-xs-12">
              <input id="active" type="checkbox" checked={ this.state.film.active || false } onChange={ this.changeCheckbox.bind(this, 'active') } /><label htmlFor="active">Active on Website</label>
              <input id="eduPage" type="checkbox" checked={ this.state.film.eduPage || false } onChange={ this.changeCheckbox.bind(this, 'eduPage') } /><label htmlFor="eduPage">Educational Page</label>
              <input id="videoPage" type="checkbox" checked={ this.state.film.videoPage || false } onChange={ this.changeCheckbox.bind(this, 'videoPage') } /><label htmlFor="videoPage">Video Page</label>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-12">
              <h3>Laurels:</h3>
              <ul className="standard-list reorderable">
                <li className="drop-zone" data-index="-1" data-section="laurels"></li>
                { this.state.laurels.map((laurel, index) => {
                  return(
                    <div key={ laurel.id }>
                      <li data-index={ index } data-section="laurels">{ laurel.result }{ laurel.awardName ? ` - ${laurel.awardName}` : '' } - { laurel.festival }<div className="handle" onMouseDown={ this.mouseDownHandle.bind(this) } onMouseUp={ this.mouseUpHandle.bind(this) }></div><div className="x-button" onClick={ this.clickDeleteLaurel.bind(this) } data-id={ laurel.id }></div></li>
                      <li className="drop-zone" data-index={ index } data-section="laurels"></li>
                    </div>
                  );
                }) }
              </ul>
              <a className="blue-outline-button small" onClick={ this.clickAddLaurel.bind(this) }>Add Laurel</a>
              <div className="row checkboxes badge-checkboxes">
                <div className="col-xs-4">
                  <input id="certified-fresh" type="checkbox" checked={ this.state.film.certifiedFresh } onChange={ this.changeCheckbox.bind(this, 'certifiedFresh') } /><label htmlFor="certified-fresh">Certified Fresh</label>
                </div>
                <div className="col-xs-4">
                  <input id="critics-pick" type="checkbox" checked={ this.state.film.criticsPick } onChange={ this.changeCheckbox.bind(this, 'criticsPick') } /><label htmlFor="critics-pick">Critic's Pick</label>
                </div>
              </div>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-12">
              <h3 className="quotes-header">Quotes:</h3>
              <div className="quote-drop-zone" data-index="-1" data-section="quotes"></div>
              { this.state.quotes.map((quote, index) => {
                return(
                  <div key={ quote.id } className="quote-container">
                    { this.renderQuote(quote, index) }
                  </div>
                );
              }) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              <a className="blue-outline-button small" onClick={ this.clickAddQuote.bind(this) }>Add Quote</a>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-6">
              <h3>Genres:</h3>
              <ul className="standard-list reorderable">
                <li className="drop-zone" data-index="-1" data-section={ 'genres' }></li>
                { this.state.filmGenres.map((filmGenre, index) => {
                  return(
                    <div key={ filmGenre.id }>
                      <li data-index={ index } data-section="genres">{ filmGenre.genre }<div className="handle" onMouseDown={ this.mouseDownHandle.bind(this) } onMouseUp={ this.mouseUpHandle.bind(this) }></div><div className="x-button" onClick={ this.clickDeleteGenre.bind(this) } data-id={ filmGenre.id }></div></li>
                      <li className="drop-zone" data-index={ index } data-section="genres"></li>
                    </div>
                  );
                }) }
              </ul>
              <a className="blue-outline-button small" onClick={ this.clickAddGenre.bind(this) }>Add Genre</a>
            </div>
            <div className="col-xs-6">
              <h3>Topics:</h3>
              <ul className="standard-list">
                { this.state.filmTopics.map((filmTopic) => {
                  return(
                    <li key={ filmTopic.id }>{ filmTopic.topic }<div className="x-button" onClick={ this.clickDeleteTopic.bind(this) } data-id={ filmTopic.id }></div></li>
                  );
                }) }
              </ul>
              <a className="blue-outline-button small" onClick={ this.clickAddTopic.bind(this) }>Add Topic</a>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-12">
              <h3>Related Films:</h3>
              <ul className="standard-list">
                { this.state.relatedFilms.map((relatedFilm) => {
                  return(
                    <li key={ relatedFilm.id }>{ relatedFilm.title }<div className="x-button" onClick={ this.clickDeleteRelatedFilm.bind(this) } data-id={ relatedFilm.id }></div></li>
                  );
                }) }
              </ul>
              <a className="blue-outline-button small" onClick={ this.clickAddRelatedFilm.bind(this) }>Add Related Film</a>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-12">
              <h3>Digital Retailers:</h3>
              <table className="admin-table digital-retailers-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Url</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td></td><td></td></tr>
                  { this.state.digitalRetailerFilms.map((digitalRetailerFilm, index) => {
                    return(
                      <tr key={ index } onClick={ this.redirect.bind(this, 'digital_retailer_films', digitalRetailerFilm.id) }>
                        <td className="name-column">
                          { digitalRetailerFilm.name }
                        </td>
                        <td>
                          { digitalRetailerFilm.url }
                        </td>
                      </tr>
                    );
                  }) }
                </tbody>
              </table>
              <a className="blue-outline-button small" onClick={ this.clickAddDigitalRetailer.bind(this) }>Add Digital Retailer</a>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-6">
              <h2>Film Movement Plus Link</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.fmPlusUrl || "" } data-field="fmPlusUrl" />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className="col-xs-6">
              <h2>Standalone Site</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.standaloneSite || "" } data-field="standaloneSite" />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-6">
              <h2>Vimeo Trailer Link</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.vimeoTrailer || "" } data-field="vimeoTrailer" />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className="col-xs-6">
              <h2>YouTube Trailer Link</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.youtubeTrailer || "" } data-field="youtubeTrailer" />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-6">
              <h2>ProRes Trailer Link</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.proresTrailer || "" } data-field="proresTrailer" />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className="col-xs-6">
              <h2>Facebook Link</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.facebookLink || "" } data-field="facebookLink" />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-6">
              <h2>Twitter Link</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.twitterLink || "" } data-field="twitterLink" />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className="col-xs-6">
              <h2>Instagram Link</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.instagramLink || "" } data-field="instagramLink" />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-3">
              <h2>IMDB ID</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.imdbId || "" } data-field="imdbId" />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
          </div>
        </div>
      )
    } else if (this.state.tab === "Synopses") {
      return(
        <div>
          <hr />
          <div className="row">
            <div className="col-xs-12">
              <h2>Synopsis</h2>
              <textarea rows="8" cols="20" onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.synopsis || "" } data-field="synopsis" />
            </div>
          </div>
          <div className={ 'row' + (this.state.film.filmType === 'Short' ? ' hidden' : '') }>
            <div className="col-xs-12">
              <h2>Short Synopsis</h2>
              <textarea rows="4" cols="20" onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.shortSynopsis || "" } data-field="shortSynopsis" />
            </div>
          </div>
          <div className={ 'row' + (this.state.film.filmType === 'Short' ? ' hidden' : '') }>
            <div className="col-xs-12">
              <h2>Logline</h2>
              <textarea rows="2" cols="20" onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.logline || "" } data-field="logline" />
            </div>
          </div>
          <div className={ 'row' + (this.state.film.filmType === 'Short' ? ' hidden' : '') }>
            <div className="col-xs-12">
              <h2>VOD Synopsis</h2>
              <textarea rows="8" cols="20" onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.vodSynopsis || "" } data-field="vodSynopsis" />
            </div>
          </div>
          <div className={ 'row' + (this.state.film.filmType === 'Short' ? ' hidden' : '') }>
            <div className="col-xs-12">
              <h2>institutional Synopsis</h2>
              <textarea rows="8" cols="20" onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.institutionalSynopsis || "" } data-field="institutionalSynopsis" />
            </div>
          </div>
        </div>
      )
    } else {
      return(
        <div>
        </div>
      );
    }
  }

  renderRoyaltyFields() {
    return(
      <div>
        <div className={ this.state.film.filmType == 'Short' ? 'hidden' : '' }>
          <div className="row">
            <div className="col-xs-12 col-sm-5">
              <h2>Deal Type</h2>
                <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="dealTypeId" value={this.state.film.dealTypeId}>
                  { FilmsStore.dealTemplates().map((dealTemplate, index) => {
                    return(
                      <option key={ index } value={ dealTemplate.id }>{ dealTemplate.name }</option>
                    );
                  }) }
                </select>
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className={"col-xs-12 col-sm-1" + ((this.state.film.dealTypeId != "5" && this.state.film.dealTypeId != "6") ? " hidden" : "")}>
              <h2>GR %</h2>
              <input className={Common.errorClass(this.state.filmErrors, Common.errors.grPercentage)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.grPercentage || ""} data-field="grPercentage" />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className={"col-xs-12 col-sm-3" + ((this.state.film.dealTypeId === "5" || this.state.film.dealTypeId === "6") ? "" : " col-sm-offset-1")}>
              <h2>Statements Due</h2>
                <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="daysStatementDue" value={this.state.film.daysStatementDue}>
                  <option value={"30"}>30 Days</option>
                  <option value={"45"}>45 Days</option>
                  <option value={"60"}>60 Days</option>
                </select>
              { Common.renderFieldError([], []) }
            </div>
            <div className="col-xs-12 col-sm-3">
              <h2>MG</h2>
              <input className={Common.errorClass(this.state.filmErrors, Common.errors.mg)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.mg || ""} data-field="mg" />
              {Common.renderFieldError(this.state.filmErrors, Common.errors.mg)}
            </div>
            <div className={"col-xs-12 col-sm-3" + (this.state.film.filmType === "Short" ? " hidden" : "")}>
              <h2>E & O</h2>
              <input className={Common.errorClass(this.state.filmErrors, Common.errors.eAndO)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.eAndO || ""} data-field="eAndO" />
              {Common.renderFieldError(this.state.filmErrors, Common.errors.eAndO)}
            </div>
            <div className="col-xs-12 col-sm-3">
              <h2>Expense Cap</h2>
              <input className={Common.errorClass(this.state.filmErrors, Common.errors.expenseCap)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.expenseCap || ""} data-field="expenseCap" />
              {Common.renderFieldError(this.state.filmErrors, Common.errors.expenseCap)}
            </div>
            <div className="col-xs-12 col-sm-3">
              <h2>Sage ID</h2>
              <input className={ Common.errorClass([], []) } onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.sageId || ""} data-field="sageId" />
              { Common.renderFieldError([], []) }
            </div>
            <div className="col-xs-12 col-sm-3">
              <h2>DVD Sell Off Period (Months)</h2>
              <input className={Common.errorClass(this.state.filmErrors, Common.errors.sellOffPeriod)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.sellOffPeriod} data-field="sellOffPeriod" />
              {Common.renderFieldError(this.state.filmErrors, Common.errors.sellOffPeriod)}
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              <h2>Royalty Notes</h2>
              <textarea rows="3" className={Common.errorClass(this.state.filmErrors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.royaltyNotes || ""} data-field="royaltyNotes" />
            </div>
          </div>
        </div>
        <hr />
        <h3>Licensed Rights:</h3>
        <div className="row">
          <div className="col-xs-12">
            <table className="admin-table">
              <thead>
                <tr>
                  <th><div className={ this.state.rightsSortBy === 'name' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'name') }>Right</div></th>
                  <th><div className={ this.state.rightsSortBy === 'territory' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'territory') }>Territory</div></th>
                  <th><div className={ this.state.rightsSortBy === 'startDate' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'startDate') }>Start Date</div></th>
                  <th><div className={ this.state.rightsSortBy === 'endDate' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'endDate') }>End Date</div></th>
                  <th><div className={ this.state.rightsSortBy === 'exclusive' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'exclusive') }>Exclusive</div></th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td><td></td><td></td><td></td><td></td></tr>
                { _.orderBy(this.state.filmRights, [this.rightsSort.bind(this), this.rightsSortSecond.bind(this)]).map((right, index) => {
                  return(
                    <tr key={ index } onClick={ this.redirect.bind(this, 'film_rights', right.id) }>
                      <td className="indent">
                        { right.name }
                      </td>
                      <td>
                        { right.territory }
                      </td>
                      <td>
                        { right.startDate }
                      </td>
                      <td>
                        { right.endDate }
                      </td>
                      <td>
                        { right.exclusive }
                      </td>
                    </tr>
                  );
                }) }
              </tbody>
            </table>
            <a className="blue-outline-button small m-right" onClick={ this.clickAddRight.bind(this) }>Add Rights</a>
            <a className="blue-outline-button small float-button" onClick={ this.clickChangeRightsDates.bind(this) }>Change All Dates</a>
          </div>
        </div>
        <div className={ this.state.film.filmType == 'Short' ? 'hidden' : '' }>
          <hr />
          <h3>Revenue Splits:</h3>
          <div className="row">
            <div className="col-xs-12 percentage-column">
              { FilmsStore.revenuePercentages().map((revenuePercentage, index) => {
                var properErrorsArray = this.state.percentageErrors[revenuePercentage.id] ? this.state.percentageErrors[revenuePercentage.id] : [];
                return(
                  <div className="revenue-percentage" key={ index }>
                    <h2>{FilmsStore.findRevenueStream(revenuePercentage.revenueStreamId).nickname || FilmsStore.findRevenueStream(revenuePercentage.revenueStreamId).name} %</h2>
                    <input className={Common.errorClass(properErrorsArray, Common.errors.value)} onChange={Common.changeField.bind(this, this.changeFieldArgs(properErrorsArray))} value={this.state.percentages[revenuePercentage.id] || ""} data-thing="percentages" data-field={revenuePercentage.id} />
                    { Common.renderFieldError([], []) }
                  </div>
                )
              }) }
            </div>
          </div>
          <hr />
          <div className={ "row reserve-section" + (this.state.film.reserve ? "" : " no-reserve") }>
            <div className="col-xs-3">
              <input id="returns-reserve" className="checkbox" type="checkbox" checked={this.state.film.reserve} onChange={this.changeCheckbox.bind(this, 'reserve')} /><label className="checkbox" htmlFor="reserve-returns">Reserve Against Returns</label>
            </div>
            <div className="col-xs-2">
              <h2>Reserve %</h2>
              <input className={Common.errorClass(this.state.filmErrors, Common.errors.reservePercentage)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.reservePercentage} data-field="reservePercentage" disabled={!this.state.film.reserve} />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className="col-xs-2">
              <h2># of Quarters</h2>
              <input className={Common.errorClass(this.state.filmErrors, Common.errors.reserveQuarters)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.reserveQuarters} data-field="reserveQuarters" disabled={!this.state.film.reserve} />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
          </div>
          <hr />
          <div className={"row auto-renew-section" + (this.state.film.autoRenew ? "" : " no-renew")}>
            <div className="col-xs-3">
              <input id="auto-renew" className="checkbox" type="checkbox" checked={this.state.film.autoRenew} onChange={this.changeCheckbox.bind(this, 'autoRenew')} /><label className="checkbox">Auto-Renew</label>
            </div>
            <div className="col-xs-2">
              <h2>Term (Months)</h2>
              <input className={Common.errorClass(this.state.filmErrors, Common.errors.autoRenewTerm)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.autoRenewTerm} data-field="autoRenewTerm" disabled={!this.state.film.autoRenew} />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderButtons() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        { this.renderErrorGuide() }
        <a id="delete" className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
          Delete Film
        </a>
        <a className={ "float-button orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickCopy.bind(this) }>
          Copy Film
        </a>
      </div>
    );
  }

  percentageErrorsExist() {
    var keys = Object.keys(this.state.percentageErrors);
    var result = false;
    if (keys.length > 0) {
      for (var i = 0; i < keys.length; i++) {
        if (this.state.percentageErrors[keys[i]].length > 0) {
          result = true;
          break
        }
      }
    }
    return result;
  }

  renderErrorGuide() {
    if (this.state.filmErrors.length > 0 || this.percentageErrorsExist()) {
      var tabs = {
        contract: [
          Common.errors.grPercentage,
          Common.errors.eAndO,
          Common.errors.mg,
          Common.errors.expenseCap,
          Common.errors.sellOffPeriod,
          Common.errors.reservePercentage,
          Common.errors.reserveQuarters,
          Common.errors.autoRenewTerm,
          Common.errors.startDate,
          Common.errors.endDate
        ],
        general: [
          Common.errors.year,
          Common.errors.length,
          Common.errors.avodRelease,
          Common.errors.svodRelease,
          Common.errors.tvodRelease,
          Common.errors.clubDate
        ]
      }
      var result = [];
      if (this.percentageErrorsExist()) {
        result.push("Contract Tab");
      }
      this.state.filmErrors.forEach(function(error) {
        if (result.indexOf("Contract Tab") === -1) {
          tabs.contract.forEach((errorsArray) => {
            if (errorsArray.indexOf(error) > -1) {
              result.push("Contract Tab");
            }
          });
        }
        if (result.indexOf("General Tab") === -1) {
          tabs.general.forEach((errorsArray) => {
            if (errorsArray.indexOf(error) > -1) {
              result.push("General Tab");
            }
          });
        }
      });
      var string = (result.length > 0 ? ("(" + result.join(", ") + ")") : "");
      return(
        <div className="error-guide">
          { "Not saved. There were errors. " + string }
        </div>
      );
    }
  }

  renderQuote(quote, index) {
    var bottomLine = "";
    bottomLine += quote.author ? quote.author : "";
    bottomLine += quote.author && quote.publication ? ", " : "";
    bottomLine += quote.publication ? quote.publication : "";
    return(
      <div>
        <div className="quote" onClick={ this.clickQuote } data-id={ quote.id } data-index={ index } data-section={ 'quotes' }>
          <p data-id={ quote.id }>"{ quote.text }"</p>
          <p data-id={ quote.id }>- { bottomLine }</p>
          <div className="handle" onMouseDown={ this.mouseDownHandle.bind(this) } onMouseUp={ this.mouseUpHandle.bind(this) }></div>
        </div>
        <div className="quote-drop-zone" data-index={ index } data-section="quotes"></div>
      </div>
    );
  }

  componentDidUpdate() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $("li:not('drop-zone'), div.quote").draggable({
      cursor: '-webkit-grabbing',
      handle: '.handle',
      helper: () => '<div></div>',
      stop: this.dragEndHandler
    });
    $('li.drop-zone, .quote-drop-zone').droppable({
      accept: Common.canIDrop,
      tolerance: 'pointer',
      over: this.dragOverHandler,
      out: this.dragOutHandler,
      drop: this.dropHandler.bind(this)
    });
    $('.match-height-layout').matchHeight();
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
      }, 1500)
    }
  }
}

export default FilmDetails;
