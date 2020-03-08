import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import ServerActions from '../actions/server-actions.js'
import { createEntity, deleteEntity } from '../actions/index.js'
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
import { Common, Details, Index, ConfirmDelete } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'
import NewEntity from './new-entity.jsx'

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
    height: 613
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

const AltLengthModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 500,
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
      tab: (FM.params.tab ? HandyTools.capitalize(FM.params.tab) : 'General'),
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
      episodes: [],
      alternateLengths: [],
      alternateAudios: [],
      alternateSubtitles: [],
      subtitleLanguages: [],
      audioLanguages: []
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
      fetching: false,
      alternateAudios: FilmsStore.alternateAudios(),
      alternateLengths: FilmsStore.alternateLengths(),
      alternateSubtitles: FilmsStore.alternateSubtitles(),
      audioLanguages: FilmsStore.audioLanguages(),
      subtitleLanguages: FilmsStore.subtitleLanguages()
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
      fetching: false,
      filmCountries: CountriesStore.filmCountries(),
      countries: CountriesStore.all(),
      countriesModalOpen: false
    });
  }

  getLanguages() {
    this.setState({
      fetching: false,
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
    this.setState({
      fetching: true
    });
    ClientActions.deleteFilmFormat(e.target.dataset.id);
  }

  clickAddCountry() {
    this.setState({
      countriesModalOpen: true
    });
  }

  clickCountry(e) {
    this.setState({
      fetching: true
    });
    ClientActions.createFilmCountry({ film_id: this.state.film.id, country_id: e.target.dataset.id })
  }

  clickDeleteCountry(e) {
    this.setState({
      fetching: true
    });
    ClientActions.deleteFilmCountry(e.target.dataset.id);
  }

  clickAddLanguage() {
    this.setState({
      languagesModalOpen: true
    });
  }

  clickLanguage(e) {
    this.setState({
      fetching: true
    });
    ClientActions.createFilmLanguage({ film_id: this.state.film.id, language_id: e.target.dataset.id })
  }

  clickAlternateAudio(e) {
    Common.closeModals.call(this);
    this.setState({
      fetching: true
    });
    let languageId = e.target.dataset.id;
    this.props.createEntity({
      directory: 'alternate_audios',
      entityName: 'alternate_audio',
      entity: {
        filmId: this.state.film.id,
        languageId
      }
    }).then(() => {
      this.setState({
        fetching: false,
        alternateAudios: this.props.alternateAudios,
        audioLanguages: this.props.audioLanguages
      });
    });
  }

  clickAlternateSubtitle(e) {
    Common.closeModals.call(this);
    this.setState({
      fetching: true
    });
    let languageId = e.target.dataset.id;
    this.props.createEntity({
      directory: 'alternate_subs',
      entityName: 'alternate_sub',
      entity: {
        filmId: this.state.film.id,
        languageId
      }
    }).then(() => {
      this.setState({
        fetching: false,
        alternateSubtitles: this.props.alternateSubs,
        subtitleLanguages: this.props.subtitleLanguages
      });
    });
  }

  clickDeleteLanguage(e) {
    this.setState({
      fetching: true
    });
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
    this.setState({
      fetching: true
    });
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
    this.setState({
      fetching: true
    });
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
      copyModalOpen: false,
      newAltLengthModalOpen: false,
      newAltAudioModalOpen: false,
      newAltSubModalOpen: false
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
      FM.errors.reservePercentage.forEach((message) => {
        HandyTools.removeFromArray(filmErrors, message);
      });
      film.reserveQuarters = 0;
      FM.errors.reserveQuarters.forEach((message) => {
        HandyTools.removeFromArray(filmErrors, message);
      });
    } else if (property === "autoRenew" && e.target.checked === false) {
      film.autoRenewTerm = 0;
      FM.errors.autoRenewTerm.forEach((message) => {
        HandyTools.removeFromArray(filmErrors, message);
      });
      film.autoRenewDaysNotice = 0;
      FM.errors.autoRenewDaysNotice.forEach((message) => {
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

  clickDeleteAltLength(e) {
    let id = e.target.dataset.id;
    this.setState({
      fetching: true
    });
    this.props.deleteEntity({
      directory: 'alternate_lengths',
      id,
      callback: (response) => {
        this.setState({
          fetching: false,
          alternateLengths: response.alternateLengths
        });
      }
    });
  }

  clickDeleteAltSub(e) {
    let id = e.target.dataset.id;
    this.setState({
      fetching: true
    });
    this.props.deleteEntity({
      directory: 'alternate_subs',
      id,
      callback: (response) => {
        this.setState({
          fetching: false,
          alternateSubtitles: response.alternateSubs,
          subtitleLanguages: response.subtitleLanguages
        });
      }
    });
  }

  clickDeleteAltAudio(e) {
    let id = e.target.dataset.id;
    this.setState({
      fetching: true
    });
    this.props.deleteEntity({
      directory: 'alternate_audios',
      id,
      callback: (response) => {
        this.setState({
          fetching: false,
          alternateAudios: response.alternateAudios,
          audioLanguages: response.audioLanguages
        });
      }
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
            FM.removeFieldError(this.state.filmErrors, "grPercentage")
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
      changeDatesModalOpen: false
    });
  }

  updateAlternateLengths(alternateLengths) {
    this.setState({
      newAltLengthModalOpen: false,
      alternateLengths
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
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <div className="row">
            <div className="col-xs-1">
              <div className={ "key-art" + (this.state.film.artworkUrl ? '' : ' empty') } style={ this.state.film.artworkUrl ? { 'backgroundImage': `url(${this.state.film.artworkUrl})` } : {} } onClick={ this.clickArtwork.bind(this) }></div>
            </div>
            <div className="col-xs-9">
              <h2>Title</h2>
              <input className={ Details.errorClass(this.state.filmErrors, FM.errors.title) } onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.title || ""} data-field="title" />
              { Details.renderFieldError(this.state.filmErrors, FM.errors.title) }
            </div>
            <div className="col-xs-2">
              <h2>Type</h2>
              <input className={ Details.errorClass(this.state.filmErrors, []) } onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.filmType || ""} readOnly={ true } />
              { Details.renderFieldError(this.state.filmErrors, []) }
            </div>
          </div>
          { this.renderTab(this.state.tab) }
          { this.renderButtons() }
        </div>
        <Modal isOpen={this.state.deleteModalOpen} onRequestClose={this.closeModal.bind(this)} contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete entityName="film" confirmDelete={ this.confirmDelete.bind(this) } closeModal={ Common.closeModals.bind(this) } />
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
        <Modal isOpen={this.state.crossedFilmModalOpen} onRequestClose={this.closeModal.bind(this)} contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.otherCrossedFilms } property={ "title" } func={ this.clickCrossedFilm.bind(this) } />
        </Modal>
        <Modal isOpen={this.state.actorModalOpen} onRequestClose={this.closeModal.bind(this)} contentLabel="Modal" style={ DirectorModalStyles }>
          <NewThing thing="actor" initialObject={{ actorableId: this.state.film.id, actorableType: 'Film', firstName: "", lastName: "" }} />
        </Modal>
        <Modal isOpen={ this.state.countriesModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.countries } property={ "name" } func={ this.clickCountry.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.languagesModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.languages } property={ "name" } func={ this.clickLanguage.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.alternateAudioModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ HandyTools.alphabetizeArrayOfObjects(this.state.audioLanguages, 'name') } property="name" func={ this.clickAlternateAudio.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.alternateSubtitleModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ HandyTools.alphabetizeArrayOfObjects(this.state.subtitleLanguages, 'name') } property="name" func={ this.clickAlternateSubtitle.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.genresModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.genres } property="name" func={ this.clickGenre.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.topicsModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.topics } property={ "name" } func={ this.clickTopic.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.relatedFilmsModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.otherFilms } property={ "title" } func={ this.clickRelatedFilm.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.formatsModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
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
        <Modal isOpen={ this.state.newAltLengthModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 500 }, 1) }>
          <NewEntity entityName="alternateLength" initialEntity={ { length: "", filmId: this.state.film.id } } context={ this.props.context } callback={ this.updateAlternateLengths.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.artworkModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ArtworkModalStyles }>
          <h1 className="my-modal-header">Update artwork for all films now?</h1>
          <div className="text-center">
            <div className="orange-button small margin" onClick={ this.confirmUpdateArtwork.bind(this) }>Yes</div>
            <div className="cancel-button small" onClick={ this.closeModal.bind(this) }>No</div>
          </div>
        </Modal>
        { FM.jobModal.call(this, this.state.job) }
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
      if (['General', 'Contract', 'Synopses', 'DVDs', 'Bookings'].indexOf(label) > -1 ||
          (['Marketing', 'Statements', 'Sublicensing'].indexOf(label) > -1 && (this.state.film.filmType == 'Feature' || this.state.film.filmType == 'TV Series')) ||
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
            <div className="col-xs-4">
              <h2>Licensor</h2>
              <input className={Details.errorClass(this.state.filmErrors, [])} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.licensorId ? FilmsStore.findLicensor(this.state.film.licensorId).name : "(None)"} data-field="licensorId" readOnly={true} />
              { Details.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className={ `col-xs-1 icons${FM.user.hasAdminAccess ? '' : ' hidden'}` }>
              <img src={ Images.openModal } onClick={ this.clickSelectLicensorButton.bind(this) } />
            </div>
            <div className="col-xs-2">
              <h2>Start Date</h2>
              <input className={ Details.errorClass(this.state.filmErrors, FM.errors.startDate) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.startDate || "" } data-field="startDate" readOnly={ !FM.user.hasAdminAccess } />
              { Details.renderFieldError(this.state.filmErrors, FM.errors.startDate) }
            </div>
            <div className="col-xs-2">
              <h2>End Date</h2>
              <input className={ Details.errorClass(this.state.filmErrors, FM.errors.endDate) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.endDate || "" } data-field="endDate" readOnly={ !FM.user.hasAdminAccess } />
              { Details.renderFieldError(this.state.filmErrors, FM.errors.endDate) }
            </div>
            <div className="col-xs-3">
              <h2>Sage ID</h2>
              <input className={ Details.errorClass([], []) } onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.sageId || ""} data-field="sageId" readOnly={ !FM.user.hasAdminAccess } />
              { Details.renderFieldError([], []) }
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
          <table className="fm-admin-table">
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
          <table className="fm-admin-table">
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
          <table className="fm-admin-table">
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
              <table className="fm-admin-table no-hover">
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
              <ul className="standard-list screening-formats-list">
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
              <input className={ Details.errorClass(this.state.filmErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.rating || "" } data-field="rating" />
              { Details.renderFieldError(this.state.filmErrors,[]) }
            </div>
            <div className="col-xs-2">
              <h2>Aspect Ratio</h2>
              <input className={ Details.errorClass(this.state.filmErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.aspectRatio || "" } data-field="aspectRatio" />
              { Details.renderFieldError(this.state.filmErrors,[]) }
            </div>
            <div className="col-xs-4">
              <h2>Sound Configuration</h2>
              <input className={ Details.errorClass(this.state.filmErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.soundConfig || "" } data-field="soundConfig" />
              { Details.renderFieldError(this.state.filmErrors,[]) }
            </div>
          </div>
          <hr />
          <h3>Bookings:</h3>
          <ul className="bookings-count-list clearfix">
            <li>Theatrical: { this.state.film.theatricalCount }</li>
            <li>Festival: { this.state.film.festivalCount }</li>
            <li>Non-Theatrical: { this.state.film.nonTheatricalCount }</li>
          </ul>
          <input className="search-box margin" onChange={ FM.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
          <table className="fm-admin-table bookings-table">
            <thead>
              <tr>
                <th><div className={ FM.sortClass.call(this, "startDate") } onClick={ FM.clickHeader.bind(this, "startDate") }>Start Date</div></th>
                <th><div className={ FM.sortClass.call(this, "venue") } onClick={ FM.clickHeader.bind(this, "venue") }>Venue</div></th>
                <th><div className={ FM.sortClass.call(this, "type") } onClick={ FM.clickHeader.bind(this, "type") }>Type</div></th>
                <th><div className={ FM.sortClass.call(this, "owed") } onClick={ FM.clickHeader.bind(this, "owed") }>Owed</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td><td></td></tr>
              { _.orderBy(filteredBookings, [FM.commonSort.bind(this)]).map((booking, index) => {
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
                    <td>
                      { booking.valid ? booking.owed : 'Invalid' }
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
              <ul className="standard-list crossed-films-list">
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
          <table className="fm-admin-table">
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
              <ul className="standard-list directors-list">
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
              <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="labelId" value={ this.state.film.labelId }>
                { FilmsStore.labels().map((label, index) => {
                  return(
                    <option key={ index } value={ label.id }>{ label.name }</option>
                  );
                }) }
              </select>
              { Details.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className="col-xs-2">
              <h2>Year</h2>
              <input className={ Details.errorClass(this.state.filmErrors, FM.errors.year) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.year || "" } data-field="year" />
              { Details.renderFieldError(this.state.filmErrors, FM.errors.year) }
            </div>
            <div className="col-xs-2">
              <h2>Length (minutes)</h2>
              <input className={ Details.errorClass(this.state.filmErrors, FM.errors.length) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.length || "" } data-field="length" />
              { Details.renderFieldError(this.state.filmErrors, FM.errors.length) }
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-6">
              <h3>Countries:</h3>
              <ul className="standard-list reorderable countries-list">
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
              <ul className="standard-list reorderable languages-list">
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
              <ul className="standard-list reorderable actors-list">
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
              <input className={ Details.errorClass(this.state.filmErrors, FM.errors.theatricalRelease) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.theatricalRelease || "" } data-field="theatricalRelease" readOnly={ !FM.user.hasAdminAccess } />
              { Details.renderFieldError(this.state.filmErrors, FM.errors.theatricalRelease) }
              <h2>SVOD Release</h2>
              <input className={ Details.errorClass(this.state.filmErrors, FM.errors.svodRelease) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.svodRelease || "" } data-field="svodRelease" readOnly={ !FM.user.hasAdminAccess } />
              { Details.renderFieldError(this.state.filmErrors, FM.errors.svodRelease) }
              <h2>TVOD/EST Release</h2>
              <input className={ Details.errorClass(this.state.filmErrors, FM.errors.tvodRelease) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.tvodRelease || "" } data-field="tvodRelease" readOnly={ !FM.user.hasAdminAccess } />
              { Details.renderFieldError(this.state.filmErrors, FM.errors.tvodRelease) }
            </div>
            <div className={ "col-xs-3" + (this.state.film.filmType == 'Short' ? ' hidden' : '') }>
              <div style={ { width: '100%', height: '47px' } }></div>
              <h2>AVOD Release</h2>
              <input className={ Details.errorClass(this.state.filmErrors, FM.errors.avodRelease) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.avodRelease || "" } data-field="avodRelease" readOnly={ !FM.user.hasAdminAccess } />
              { Details.renderFieldError(this.state.filmErrors, FM.errors.avodRelease) }
              <h2>Club Release</h2>
              <input className={ Details.errorClass(this.state.filmErrors, FM.errors.clubDate) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.clubDate || "" } data-field="clubDate" readOnly={ !FM.user.hasAdminAccess } />
              { Details.renderFieldError(this.state.filmErrors, FM.errors.clubDate) }
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
              <input id="dayAndDate" type="checkbox" checked={ this.state.film.dayAndDate || false } onChange={ this.changeCheckbox.bind(this, 'dayAndDate') } /><label htmlFor="dayAndDate">Day and Date</label>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-12">
              <h3>Laurels:</h3>
              <ul className="standard-list reorderable laurels-list">
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
              <ul className="standard-list reorderable genres-list">
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
              <ul className="standard-list topics-list">
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
            <div className="col-xs-4">
              <h3>Alternate Lengths:</h3>
              <ul className="standard-list alternate-lengths-list">
                { HandyTools.sortArrayOfObjects(this.state.alternateLengths, 'length').map((alternateLength) => {
                  return(
                    <li key={ alternateLength.id }>{ alternateLength.length }<div className="x-button" onClick={ this.clickDeleteAltLength.bind(this) } data-id={ alternateLength.id }></div></li>
                  );
                }) }
              </ul>
              <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'newAltLengthModalOpen', true) }>Add Length</a>
            </div>
            <div className="col-xs-4">
              <h3>Alternate Audio Tracks:</h3>
              <ul className="standard-list alternate-audios-list">
                { HandyTools.alphabetizeArrayOfObjects(this.state.alternateAudios, 'languageName').map((alternateAudio) => {
                  return(
                    <li key={ alternateAudio.id }>{ alternateAudio.languageName }<div className="x-button" onClick={ this.clickDeleteAltAudio.bind(this) } data-id={ alternateAudio.id }></div></li>
                  );
                }) }
              </ul>
              <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'alternateAudioModalOpen', true) }>Add Audio Track</a>
            </div>
            <div className="col-xs-4">
              <h3>Alternate Subtitles:</h3>
              <ul className="standard-list alternate-subtitles-list">
                { HandyTools.alphabetizeArrayOfObjects(this.state.alternateSubtitles, 'languageName').map((alternateSubtitle) => {
                  return(
                    <li key={ alternateSubtitle.id }>{ alternateSubtitle.languageName }<div className="x-button" onClick={ this.clickDeleteAltSub.bind(this) } data-id={ alternateSubtitle.id }></div></li>
                  );
                }) }
              </ul>
              <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'alternateSubtitleModalOpen', true) }>Add Subtitles</a>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-12">
              <h3>Related Films:</h3>
              <ul className="standard-list related-films-list">
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
              <table className="fm-admin-table digital-retailers-table">
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
              <input className={ Details.errorClass(this.state.filmErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.fmPlusUrl || "" } data-field="fmPlusUrl" />
              { Details.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className="col-xs-6">
              <h2>Standalone Site</h2>
              <input className={ Details.errorClass(this.state.filmErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.standaloneSite || "" } data-field="standaloneSite" />
              { Details.renderFieldError(this.state.filmErrors, []) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-6">
              <h2>Vimeo Trailer Link</h2>
              <input className={ Details.errorClass(this.state.filmErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.vimeoTrailer || "" } data-field="vimeoTrailer" />
              { Details.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className="col-xs-6">
              <h2>YouTube Trailer Link</h2>
              <input className={ Details.errorClass(this.state.filmErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.youtubeTrailer || "" } data-field="youtubeTrailer" />
              { Details.renderFieldError(this.state.filmErrors, []) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-6">
              <h2>ProRes Trailer Link</h2>
              <input className={ Details.errorClass(this.state.filmErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.proresTrailer || "" } data-field="proresTrailer" />
              { Details.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className="col-xs-6">
              <h2>Facebook Link</h2>
              <input className={ Details.errorClass(this.state.filmErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.facebookLink || "" } data-field="facebookLink" />
              { Details.renderFieldError(this.state.filmErrors, []) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-6">
              <h2>Twitter Link</h2>
              <input className={ Details.errorClass(this.state.filmErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.twitterLink || "" } data-field="twitterLink" />
              { Details.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className="col-xs-6">
              <h2>Instagram Link</h2>
              <input className={ Details.errorClass(this.state.filmErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.instagramLink || "" } data-field="instagramLink" />
              { Details.renderFieldError(this.state.filmErrors, []) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-3">
              <h2>IMDB ID</h2>
              <input className={ Details.errorClass(this.state.filmErrors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.imdbId || "" } data-field="imdbId" />
              { Details.renderFieldError(this.state.filmErrors, []) }
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
              <textarea rows="8" cols="20" onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.synopsis || "" } data-field="synopsis" />
              { this.characterCount.call(this, 'synopsis') }
            </div>
          </div>
          <div className={ 'row' + (this.state.film.filmType === 'Short' ? ' hidden' : '') }>
            <div className="col-xs-12">
              <h2>Synopsis - 500 characters</h2>
              <textarea rows="8" cols="20" onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.vodSynopsis || "" } data-field="vodSynopsis" />
              { this.characterCount.call(this, 'vodSynopsis') }
            </div>
          </div>
          <div className={ 'row' + (this.state.film.filmType === 'Short' ? ' hidden' : '') }>
            <div className="col-xs-12">
              <h2>Synopsis - 240 characters</h2>
              <textarea rows="4" cols="20" onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.shortSynopsis || "" } data-field="shortSynopsis" />
              { this.characterCount.call(this, 'shortSynopsis') }
            </div>
          </div>
          <div className={ 'row' + (this.state.film.filmType === 'Short' ? ' hidden' : '') }>
            <div className="col-xs-12">
              <h2>Synopsis - 150 characters</h2>
              <textarea rows="2" cols="20" onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.logline || "" } data-field="logline" />
              { this.characterCount.call(this, 'logline') }
            </div>
          </div>
          <div className={ 'row' + (this.state.film.filmType === 'Short' ? ' hidden' : '') }>
            <div className="col-xs-12">
              <h2>Institutional Synopsis</h2>
              <textarea rows="8" cols="20" onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.institutionalSynopsis || "" } data-field="institutionalSynopsis" />
              { this.characterCount.call(this, 'institutionalSynopsis') }
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

  characterCount(field) {
    let count = this.state.film[field] ? this.state.film[field].length : 0;
    return(
      <div className="character-count">({ count } characters)</div>
    );
  }

  renderRoyaltyFields() {
    return(
      <div>
        <div className={ this.state.film.filmType == 'Short' ? 'hidden' : '' }>
          <div className="row">
            { this.renderDealTypeMenu() }
            <div className={ "col-xs-1" + ((this.state.film.dealTypeId != "5" && this.state.film.dealTypeId != "6") ? " hidden" : "") }>
              <h2>GR %</h2>
              <input className={ Details.errorClass(this.state.filmErrors, FM.errors.grPercentage) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.grPercentage || "" } data-field="grPercentage" readOnly={ !FM.user.hasAdminAccess } />
              { Details.renderFieldError(this.state.filmErrors, []) }
            </div>
            { this.renderStatementsDueMenu() }
            <div className="col-xs-3">
              <h2>MG</h2>
              <input className={Details.errorClass(this.state.filmErrors, FM.errors.mg)} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.mg || ""} data-field="mg" readOnly={ !FM.user.hasAdminAccess } />
              {Details.renderFieldError(this.state.filmErrors, FM.errors.mg)}
            </div>
            <div className={ "col-xs-3" + (this.state.film.filmType === "Short" ? " hidden" : "") }>
              <h2>E & O</h2>
              <input className={Details.errorClass(this.state.filmErrors, FM.errors.eAndO)} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.eAndO || ""} data-field="eAndO" readOnly={ !FM.user.hasAdminAccess } />
              {Details.renderFieldError(this.state.filmErrors, FM.errors.eAndO)}
            </div>
            <div className="col-xs-3">
              <h2>Expense Cap</h2>
              <input className={Details.errorClass(this.state.filmErrors, FM.errors.expenseCap)} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.expenseCap || ""} data-field="expenseCap" readOnly={ !FM.user.hasAdminAccess } />
              {Details.renderFieldError(this.state.filmErrors, FM.errors.expenseCap)}
            </div>
            <div className="col-xs-3">
              <h2>DVD Sell Off Period (Months)</h2>
              <input className={Details.errorClass(this.state.filmErrors, FM.errors.sellOffPeriod)} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.sellOffPeriod} data-field="sellOffPeriod" readOnly={ !FM.user.hasAdminAccess } />
              {Details.renderFieldError(this.state.filmErrors, FM.errors.sellOffPeriod)}
            </div>
            <div className="col-xs-3">
              <h2>Delivery Acceptance Date</h2>
              <input className={ Details.errorClass(this.state.filmErrors, FM.errors.acceptDelivery) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.acceptDelivery } data-field="acceptDelivery" readOnly={ !FM.user.hasAdminAccess } />
              { Details.renderFieldError(this.state.filmErrors, FM.errors.acceptDelivery) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              <h2>Royalty Notes</h2>
              <textarea rows="3" className={Details.errorClass(this.state.filmErrors, [])} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.royaltyNotes || ""} data-field="royaltyNotes" readOnly={ !FM.user.hasAdminAccess } />
            </div>
          </div>
        </div>
        <hr />
        <h3>Licensed Rights:</h3>
        <div className="row">
          <div className="col-xs-12">
            <table className="fm-admin-table">
              <thead>
                <tr>
                  <th><div className={ this.state.rightsSortBy === 'name' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'name') }>Right</div></th>
                  <th><div className={ this.state.rightsSortBy === 'territory' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'territory') }>Territory</div></th>
                  <th><div className={ this.state.rightsSortBy === 'startDate' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'startDate') } >Start Date</div></th>
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
            { this.renderRightsButtons.call(this) }
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
                    <input className={Details.errorClass(properErrorsArray, FM.errors.value)} onChange={FM.changeField.bind(this, this.changeFieldArgs(properErrorsArray))} value={this.state.percentages[revenuePercentage.id] || ""} data-thing="percentages" data-field={revenuePercentage.id} readOnly={ !FM.user.hasAdminAccess } />
                    { Details.renderFieldError([], []) }
                  </div>
                )
              }) }
            </div>
          </div>
          <hr />
          <div className={ "row reserve-section" + (this.state.film.reserve ? "" : " no-reserve") }>
            <div className="col-xs-3">
              <input id="returns-reserve" className="checkbox" type="checkbox" checked={ this.state.film.reserve } onChange={ this.changeCheckbox.bind(this, 'reserve') } disabled={ !FM.user.hasAdminAccess } /><label className="checkbox" htmlFor="reserve-returns">Reserve Against Returns</label>
            </div>
            <div className={ `col-xs-2${this.state.film.reserve ? '' : ' hidden'}` }>
              <h2>Reserve %</h2>
              <input className={Details.errorClass(this.state.filmErrors, FM.errors.reservePercentage)} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.reservePercentage} data-field="reservePercentage" disabled={ !this.state.film.reserve } readOnly={ !FM.user.hasAdminAccess } />
              { Details.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className={ `col-xs-2${this.state.film.reserve ? '' : ' hidden'}` }>
              <h2># of Quarters</h2>
              <input className={Details.errorClass(this.state.filmErrors, FM.errors.reserveQuarters)} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.reserveQuarters} data-field="reserveQuarters" disabled={ !this.state.film.reserve } readOnly={ !FM.user.hasAdminAccess } />
              { Details.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className={ `spacer${this.state.film.reserve ? ' hidden' : ''}` }></div>
          </div>
          <hr />
          <div className={ "row auto-renew-section" + (this.state.film.autoRenew ? "" : " no-renew") }>
            <div className="col-xs-3">
              <input id="auto-renew" className="checkbox" type="checkbox" checked={ this.state.film.autoRenew } onChange={ this.changeCheckbox.bind(this, 'autoRenew') } disabled={ !FM.user.hasAdminAccess } /><label className="checkbox">Auto-Renew</label>
            </div>
            <div className={ `col-xs-2${this.state.film.autoRenew ? '' : ' hidden'}` }>
              <h2>Term (Months)</h2>
              <input className={ Details.errorClass(this.state.filmErrors, FM.errors.autoRenewTerm) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.autoRenewTerm } data-field="autoRenewTerm" readOnly={ !FM.user.hasAdminAccess } />
              { Details.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className={ `col-xs-2${this.state.film.autoRenew ? '' : ' hidden'}` }>
              <h2>Days Notice</h2>
              <input className={ Details.errorClass(this.state.filmErrors, FM.errors.autoRenewDaysNotice) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.autoRenewDaysNotice } data-field="autoRenewDaysNotice" readOnly={ !FM.user.hasAdminAccess } />
              { Details.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className={ `spacer${this.state.film.autoRenew ? ' hidden' : ''}` }></div>
          </div>
        </div>
      </div>
    );
  }

  renderDealTypeMenu() {
    if (FM.user.hasAdminAccess) {
      return(
        <div className="col-xs-5">
          <h2>Deal Type</h2>
            <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="dealTypeId" value={ this.state.film.dealTypeId }>
              { FilmsStore.dealTemplates().map((dealTemplate, index) => {
                return(
                  <option key={ index } value={ dealTemplate.id }>{ dealTemplate.name }</option>
                );
              }) }
            </select>
          { Details.renderFieldError(this.state.filmErrors, []) }
        </div>
      );
    } else {
      return(
        <div className="col-xs-5">
          <h2>Deal Type</h2>
          <input className={ Details.errorClass(this.state.filmErrors, []) } value={ this.state.film.dealTypeId ? HandyTools.findObjectInArrayById(FilmsStore.dealTemplates(), this.state.film.dealTypeId).name : '' } readOnly={ true } />
          { Details.renderFieldError(this.state.filmErrors, []) }
        </div>
      );
    }
  }

  renderStatementsDueMenu() {
    if (FM.user.hasAdminAccess) {
      return(
        <div className={"col-xs-3" + ((this.state.film.dealTypeId === "5" || this.state.film.dealTypeId === "6") ? "" : " col-xs-offset-1")}>
          <h2>Statements Due</h2>
          <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="daysStatementDue" value={ this.state.film.daysStatementDue }>
            <option value="30">30 Days</option>
            <option value="45">45 Days</option>
            <option value="60">60 Days</option>
          </select>
          { Details.renderFieldError([], []) }
        </div>
      );
    } else {
      return(
        <div className={"col-xs-3" + ((this.state.film.dealTypeId === "5" || this.state.film.dealTypeId === "6") ? "" : " col-xs-offset-1")}>
          <h2>Statements Due</h2>
          <input className={ Details.errorClass(this.state.filmErrors, []) } value={ this.state.film.dealTypeId ? `${this.state.film.daysStatementDue} Days` : '' } readOnly={ true } />
          { Details.renderFieldError([], []) }
        </div>
      );
    }
  }

  renderRightsButtons() {
    if (FM.user.hasAdminAccess) {
      return([
        <a key={ 1 } className="blue-outline-button small m-right" onClick={ this.clickAddRight.bind(this) }>Add Rights</a>,
        <a key={ 2 } className="blue-outline-button small float-button" onClick={ this.clickChangeRightsDates.bind(this) }>Change All Dates</a>
      ]);
    }
  }

  renderButtons() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={ "orange-button" + Common.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        { this.renderErrorGuide() }
        { this.renderCopyAndDeleteButtons() }
      </div>
    );
  }

  renderCopyAndDeleteButtons() {
    if (FM.user.hasAdminAccess) {
      return([
        <a key={ 2 } id="delete" className={ "orange-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
          Delete Film
        </a>,
        <a key={ 1 } className={ "float-button orange-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickCopy.bind(this) }>
          Copy Film
        </a>
      ]);
    }
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
          FM.errors.grPercentage,
          FM.errors.eAndO,
          FM.errors.mg,
          FM.errors.expenseCap,
          FM.errors.sellOffPeriod,
          FM.errors.reservePercentage,
          FM.errors.reserveQuarters,
          FM.errors.autoRenewTerm,
          FM.errors.startDate,
          FM.errors.endDate
        ],
        general: [
          FM.errors.year,
          FM.errors.length,
          FM.errors.avodRelease,
          FM.errors.svodRelease,
          FM.errors.tvodRelease,
          FM.errors.clubDate
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
    FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
    $("li:not('drop-zone'), div.quote").draggable({
      cursor: '-webkit-grabbing',
      handle: '.handle',
      helper: () => '<div></div>',
      stop: this.dragEndHandler
    });
    $('li.drop-zone, .quote-drop-zone').droppable({
      accept: FM.canIDrop,
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

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createEntity, deleteEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(FilmDetails);
