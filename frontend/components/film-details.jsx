import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import { sendRequest, fetchEntity, createEntity, updateEntity, deleteEntity } from '../actions/index.js'
import FilmRightsNew from './film-rights-new.jsx'
import FilmRightsChangeDates from './film-rights-change-dates.jsx'
import { Common, Details, Index, ConfirmDelete, ModalSelect } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'
import NewEntity from './new-entity.jsx'
import CopyEntity from './copy-entity.jsx'
import ChangeCase from 'change-case'

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

const ChangeDatesModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 500,
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

class FilmDetails extends React.Component {

  constructor(props) {
    super(props)
    let job = {
      errors_text: ""
    };
    this.state = {
      actors: [],
      alternateAudios: [],
      alternateLengths: [],
      alternateSubs: [],
      artworkModalOpen: false,
      audioLanguages: [],
      bookings:[],
      changesToSave: false,
      countries: [],
      crossedFilms: [],
      dealTemplates: [],
      digitalRetailers: [],
      digitalRetailerFilms: [],
      directors: [],
      dvds: [],
      dvdTypes: [],
      eduPlatforms: [],
      eduPlatformFilms: [],
      episodes: [],
      errors: [],
      fetching: true,
      film: {},
      filmCountries: [],
      filmFormats: [],
      filmGenres: [],
      filmLanguages: [],
      filmRevenuePercentages: [],
      filmRights: [],
      filmSaved: {},
      filmTopics: [],
      formats: [],
      genres: [],
      job: job,
      jobModalOpen: !!job.id,
      justSaved: false,
      labels: [],
      languages: [],
      laurels: [],
      licensors: [],
      newRightsModalOpen: false,
      otherCrossedFilms: [],
      otherFilms: [],
      percentageErrors: {},
      percentageObject: {},
      percentageObjectSaved: {},
      quotes: [],
      relatedFilms: [],
      reports: [],
      revenueStreams: [],
      rights: [],
      rightsSortBy: 'name',
      schedule: [],
      searchText: '',
      sortBy: 'startDate',
      subRights: [],
      subRightsSortBy: 'sublicensorName',
      subtitleLanguages: [],
      tab: (FM.params.tab ? HandyTools.capitalize(FM.params.tab) : 'General'),
      topics: [],
      virtualBookings: [],
    };
  }

  componentDidMount() {
    this.props.fetchEntity({
      id: window.location.pathname.split('/')[2],
      directory: window.location.pathname.split('/')[1],
      entityName: 'film'
    }).then(() => {
      const {
        actors,
        alternateAudios,
        alternateLengths,
        alternateSubs,
        audioLanguages,
        bookings,
        countries,
        crossedFilms,
        dealTemplates,
        digitalRetailers,
        digitalRetailerFilms,
        directors,
        dvds,
        dvdTypes,
        eduPlatforms,
        eduPlatformFilms,
        episodes,
        film,
        filmCountries,
        filmFormats,
        filmGenres,
        filmLanguages,
        filmRevenuePercentages,
        filmRights,
        filmTopics,
        formats,
        genres,
        labels,
        languages,
        laurels,
        licensors,
        otherCrossedFilms,
        otherFilms,
        relatedFilms,
        reports,
        revenueStreams,
        schedule,
        subRights,
        subtitleLanguages,
        topics,
        quotes,
        virtualBookings,
      } = this.props;
      this.setState({
        actors,
        alternateAudios,
        alternateLengths,
        alternateSubs,
        audioLanguages,
        bookings,
        crossedFilms,
        countries,
        dealTemplates,
        digitalRetailers,
        digitalRetailerFilms,
        directors,
        dvds,
        dvdTypes,
        eduPlatforms,
        eduPlatformFilms,
        episodes,
        film,
        filmCountries,
        filmFormats,
        filmGenres,
        filmLanguages,
        filmRevenuePercentages,
        filmRights,
        filmSaved: HandyTools.deepCopy(film),
        filmTopics,
        formats,
        genres,
        labels,
        languages,
        laurels,
        licensors,
        otherCrossedFilms,
        otherFilms,
        relatedFilms,
        reports,
        revenueStreams,
        schedule,
        subRights,
        subtitleLanguages,
        topics,
        quotes,
        virtualBookings,
      }, () => {
        this.updatePercentageObject();
        HandyTools.setUpNiceSelect({ selector: 'select', func: Details.changeDropdownField.bind(this) });
      });
    });
  }

  updatePercentageObject() {
    let percentageObject = {};
    const { filmRevenuePercentages } = this.state;
    filmRevenuePercentages.forEach((filmRevenuePercentage) => {
      percentageObject[filmRevenuePercentage.id] = filmRevenuePercentage.value;
    });
    this.setState({
      percentageObject,
      percentageObjectSaved: HandyTools.deepCopy(percentageObject),
      fetching: false
    });
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
    const filmId = this.state.film.id;
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
        break
      case 'directors':
        entityArray = 'directors';
        directory = 'directors'
    }
    this.state[entityArray].forEach((entity) => {
      currentOrder[entity.order] = entity.id;
    });
    let newOrder = HandyTools.rearrangeFields({ currentOrder, draggedIndex, dropZoneIndex });
    let data;
    directory = directory || entityArray;
    if (directory == 'actors') {
      data = {
        new_order: newOrder,
        actorable_id: filmId,
        actorable_type: 'Film'
      };
    } else {
      data = {
        new_order: newOrder,
        film_id: filmId
      };
    }
    this.setState({
      fetching: true
    });
    this.props.sendRequest({
      url: `/api/${directory}/rearrange`,
      method: 'patch',
      data,
    }).then(() => {
      this.setState({
        fetching: false,
        [entityArray]: this.props[entityArray]
      });
    });
  }

  changeFieldArgs() {
    const { errors } = this.state;
    return {
      defaultErrorsKey: 'film',
      thing: "film",
      beforeSave: (newEntity, key, value) => {
        if (key == "dealTypeId") {
          if (value <= 4) {
            newEntity.grPercentage = "";
            FM.removeFieldError(errors, "grPercentage")
          } else {
            newEntity.grPercentage = "0";
          }
        }
        if (key == 'reserve' && value == false) {
          newEntity.reservePercentage = 0;
          FM.errors.reservePercentage.forEach((message) => {
            HandyTools.removeFromArray(errors, message);
          });
          newEntity.reserveQuarters = 0;
          FM.errors.reserveQuarters.forEach((message) => {
            HandyTools.removeFromArray(errors, message);
          });
        }
        if (key == 'autoRenew' && value == false) {
          newEntity.autoRenewTerm = 0;
          FM.errors.autoRenewTerm.forEach((message) => {
            HandyTools.removeFromArray(errors, message);
          });
          newEntity.autoRenewDaysNotice = 0;
          FM.errors.autoRenewDaysNotice.forEach((message) => {
            HandyTools.removeFromArray(errors, message);
          });
        }
        return newEntity;
      },
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  checkForChanges() {
    const { film, filmSaved, percentageObject, percentageObjectSaved } = this.state;
    if (Tools.objectsAreEqual(film, filmSaved) == false) {
      return true;
    } else {
      return !Tools.objectsAreEqual(percentageObject, percentageObjectSaved);
    }
  }

  clickTab(e) {
    const tab = e.target.innerText;
    if (this.state.tab !== tab) {
      $('select').niceSelect('destroy');
      this.setState({
        tab
      }, () => {
        FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
      });
    }
  }

  redirect(directory, id) {
    window.location = `/${directory}/${id}`;
  }

  clickQuote(e) {
    if (e.target.dataset.id) {
      window.location = '/quotes/' + e.target.dataset.id;
    }
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, () => {
      const { film, percentageObject } = this.state;
      const filmWithTentative = this.extractTentativeReleaseDates(film);
      this.props.updateEntity({
        id: window.location.pathname.split("/")[2],
        directory: window.location.pathname.split("/")[1],
        entityName: 'film',
        entity: Details.removeFinanceSymbolsFromEntity({
          entity: film,
          fields: [
            'mg',
            'expenseCap',
            'eAndO',
            'rentalPrice',
            'msrpPreStreet',
            'pprPreStreet',
            'drlPreStreet',
            'pprDrlPreStreet',
            'pprPostStreet',
            'drlPostStreet',
            'pprDrlPostStreet',
            'msrpPreStreetMember',
            'pprPreStreetMember',
            'drlPreStreetMember',
            'pprDrlPreStreetMember',
            'pprPostStreetMember',
            'drlPostStreetMember',
            'pprDrlPostStreetMember',
          ]
        }),
        additionalData: {
          percentages: percentageObject
        }
      }).then(() => {
        const { film, filmRevenuePercentages, schedule } = this.props;
        this.setState({
          changesToSave: false,
          film,
          filmSaved: HandyTools.deepCopy(film),
          filmRevenuePercentages,
          schedule
        }, () => {
          this.updatePercentageObject();
        });
      }, () => {
        const { errors } = this.props;
        this.setState({
          fetching: false,
          errors,
        });
      });
    });
  }

  extractTentativeReleaseDates(film) {
    const attributes = ['avodRelease', 'svodRelease', 'tvodRelease', 'fmPlusRelease', 'theatricalRelease'];
    attributes.forEach((attribute) => {
      const tentativeAttribute = attribute.slice(0, -7) + 'Tentative';
      let releaseDate = film[attribute];
      const tentative = releaseDate.charAt(releaseDate.length - 1) === '?';
      if (tentative) {
        film[tentativeAttribute] = true;
        film[attribute] = releaseDate.slice(0, -1);
      } else {
        film[tentativeAttribute] = false;
      }
    });
    return film;
  }

  selectEntityToCreate(args, option) {
    const { directory, entityName, key, otherArrays } = args;
    const entityNamePlural = ChangeCase.camelCase(directory);
    const { id } = this.state.film;
    this.setState({
      fetching: true
    });
    this.props.createEntity({
      directory,
      entityName,
      entity: {
        filmId: id,
        [key]: option.id
      }
    }).then(() => {
      let obj = {
        fetching: false,
        [entityNamePlural]: this.props[entityNamePlural]
      }
      otherArrays && otherArrays.forEach((arrayName) => {
        obj[arrayName] = this.props[arrayName];
      });
      this.setState(obj);
      Common.closeModals.call(this);
    });
  }

  deleteFromList(args, e) {
    const { directory, otherArrays } = args;
    const { id } = e.target.dataset;
    const entityNamePlural = ChangeCase.camelCase(directory);
    this.setState({
      fetching: true
    });
    this.props.deleteEntity({
      directory,
      id,
    }).then(() => {
      let obj = {
        fetching: false,
        [entityNamePlural]: this.props[entityNamePlural]
      }
      otherArrays && otherArrays.forEach((arrayName) => {
        obj[arrayName] = this.props[arrayName];
      });
      this.setState(obj);
    });
  }

  confirmDelete() {
    this.setState({
      fetching: true,
      deleteModalOpen: false
    });
    const { id } = this.state.film;
    this.props.deleteEntity({
      directory: 'films',
      id,
      redirectToIndex: true,
    });
  }

  confirmUpdateArtwork() {
    this.props.sendRequest({
      url: '/api/films/update_artwork',
      method: 'post',
      data: {
        triggerId: this.state.film.id
      }
    }).then(() => {
      const { job } = this.props;
      this.setState({
        job,
        artworkModalOpen: false,
        jobModalOpen: true
      });
    });
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

  updateChangedDates(filmRights) {
    this.setState({
      changeDatesModalOpen: false,
      filmRights
    });
  }

  newFilmRightsCallback(filmRights) {
    this.setState({
      newRightsModalOpen: false,
      filmRights
    });
  }

  createCallback(response, entityNamePlural) {
    this.setState({
      [entityNamePlural]: response
    }, () => {
      Common.closeModals.call(this);
    });
  }

  changePercentageField(e) {
    const filmRevenuePercentageId = e.target.dataset.id;
    const value = e.target.value;
    const { percentageObject, percentageErrors } = this.state;
    percentageObject[filmRevenuePercentageId] = value;
    if (percentageErrors[filmRevenuePercentageId]) {
      delete percentageErrors[filmRevenuePercentageId];
    }
    this.setState({
      percentageObject
    }, () => {
      const changesToSave = this.changeFieldArgs().changesFunction.call();
      this.setState({
        changesToSave
      });
    });
  }

  render() {
    const { dvds, dvdTypes, film, licensors } = this.state;
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
          <div className="row">
            <div className="col-xs-1">
              <div className={ "key-art" + (this.state.film.artworkUrl ? '' : ' empty') } style={ this.state.film.artworkUrl ? { 'backgroundImage': `url(${this.state.film.artworkUrl})` } : {} } onClick={ Common.changeState.bind(this, 'artworkModalOpen', true) }></div>
            </div>
            { Details.renderField.bind(this)({ columnWidth: 9, entity: 'film', property: 'title' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'film', property: 'filmType', readOnly: true, columnHeader: 'Type' }) }
          </div>
          { this.renderTab(this.state.tab) }
          { this.renderButtons() }
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
        </div>
        <Modal isOpen={ this.state.crossedFilmModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.selectModalStyles() }>
          <ModalSelect options={ this.state.otherCrossedFilms } property="title" func={ this.selectEntityToCreate.bind(this, { directory: 'crossed_films', entityName: 'crossedFilm', key: 'crossedFilmId', otherArrays: ['otherCrossedFilms'] }) } />
        </Modal>
        <Modal isOpen={ this.state.countriesModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.selectModalStyles() }>
          <ModalSelect options={ this.state.countries } property="name" func={ this.selectEntityToCreate.bind(this, { directory: 'film_countries', entityName: 'filmCountry', key: 'countryId', otherArrays: ['countries'] }) } />
        </Modal>
        <Modal isOpen={ this.state.languagesModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.selectModalStyles() }>
          <ModalSelect options={ this.state.languages } property="name" func={ this.selectEntityToCreate.bind(this, { directory: 'film_languages', entityName: 'filmLanguage', key: 'languageId', otherArrays: ['languages'] }) } />
        </Modal>
        <Modal isOpen={ this.state.alternateAudioModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.selectModalStyles() }>
          <ModalSelect options={ this.state.audioLanguages } property="name" func={ this.selectEntityToCreate.bind(this, { directory: 'alternate_audios', entityName: 'alternateAudio', key: 'languageId', otherArrays: ['audioLanguages'] }) } />
        </Modal>
        <Modal isOpen={ this.state.alternateSubsModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.selectModalStyles() }>
          <ModalSelect options={ this.state.subtitleLanguages } property="name" func={ this.selectEntityToCreate.bind(this, { directory: 'alternate_subs', entityName: 'alternateSub', key: 'languageId', otherArrays: ['subtitleLanguages'] }) } />
        </Modal>
        <Modal isOpen={ this.state.genresModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.selectModalStyles() }>
          <ModalSelect options={ this.state.genres } property="name" func={ this.selectEntityToCreate.bind(this, { directory: 'film_genres', entityName: 'filmGenre', key: 'genreId', otherArrays: ['genres'] }) } />
        </Modal>
        <Modal isOpen={ this.state.topicsModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.selectModalStyles() }>
          <ModalSelect options={ this.state.topics } property="name" func={ this.selectEntityToCreate.bind(this, { directory: 'film_topics', entityName: 'filmTopic', key: 'topicId', otherArrays: ['topics'] }) } />
        </Modal>
        <Modal isOpen={ this.state.relatedFilmsModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.selectModalStyles() }>
          <ModalSelect options={ this.state.otherFilms } property="title" func={ this.selectEntityToCreate.bind(this, { directory: 'related_films', entityName: 'relatedFilm', key: 'otherFilmId', otherArrays: ['otherFilms'] }) } />
        </Modal>
        <Modal isOpen={ this.state.formatsModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.selectModalStyles() }>
          <ModalSelect options={ this.state.formats } property="name" func={ this.selectEntityToCreate.bind(this, { directory: 'film_formats', entityName: 'filmFormat', key: 'formatId', otherArrays: ['formats'] }) } />
        </Modal>
        <Modal isOpen={ this.state.episodeModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 1000 }, 1) }>
          <NewEntity
            context={ this.props.context }
            entityName="episode"
            initialEntity={ { filmId: film.id, title: '', length: '', episodeNumber: '', seasonNumber: '' } }
            redirectAfterCreate={ true }
          />
        </Modal>
        <Modal isOpen={ this.state.dvdModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 500 }, 1) }>
          <NewEntity
            context={ this.props.context }
            entityName="dvd"
            initialEntity={ { featureFilmId: film.id, dvdTypeId: (film.id && dvds.length < 6) ? dvdTypes[0].id : 1 } }
            passData={
              { dvdTypes }
            }
            buttonText="Add DVD"
            redirectAfterCreate={ true }
          />
        </Modal>
        <Modal isOpen={ this.state.quoteModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 750, height: 428 }) }>
          <NewEntity
            context={ this.props.context }
            entityName="quote"
            initialEntity={ { filmId: film.id, text: "", author: "", publication: "" } }
            callback={ this.createCallback.bind(this) }
          />
        </Modal>
        <Modal isOpen={this.state.laurelModalOpen} onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 750 }, 2) }>
          <NewEntity
            context={ this.props.context }
            entityName="laurel"
            initialEntity={ { filmId: film.id, result: "Official Selection", awardName: "", festival: "" } }
            callback={ this.createCallback.bind(this) }
          />
        </Modal>
        <Modal isOpen={ this.state.directorModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 750 }, 1) }>
          <NewEntity
            context={ this.props.context }
            entityName="director"
            initialEntity={ { filmId: film.id, firstName: "", lastName: "" } }
            callback={ this.createCallback.bind(this) }
          />
        </Modal>
        <Modal isOpen={ this.state.actorModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 750 }, 1) }>
          <NewEntity
            context={ this.props.context }
            entityName="actor"
            initialEntity={ { actorableId: film.id, actorableType: 'Film', firstName: "", lastName: "" } }
            callback={ this.createCallback.bind(this) }
          />
        </Modal>
        <Modal isOpen={ this.state.newDigitalRetailerModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 750 }, 1) }>
          <NewEntity
            context={ this.props.context }
            entityName="digitalRetailerFilm"
            initialEntity={ { filmId: film.id, url: '', digitalRetailerId: '1' } }
            fetchData={ ['digitalRetailers'] }
            callback={ this.createCallback.bind(this) }
            buttonText={ 'Add Digital Retailer' }
          />
        </Modal>
        <Modal isOpen={ this.state.newEduPlatformModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 1000 }, 1) }>
          <NewEntity
            context={ this.props.context }
            entityName="eduPlatformFilm"
            initialEntity={ { filmId: this.state.film.id, url: "", eduPlatformId: "1" } }
            fetchData={ ['eduPlatforms'] }
            callback={ this.createCallback.bind(this) }
          />
        </Modal>
        <Modal isOpen={ this.state.newAltLengthModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 500 }, 1) }>
          <NewEntity
            context={ this.props.context }
            entityName="alternateLength"
            initialEntity={ { length: "", filmId: this.state.film.id } }
            callback={ this.createCallback.bind(this) }
          />
        </Modal>
        <Modal isOpen={ this.state.newRightsModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ NewRightsModalStyles }>
          <FilmRightsNew
            context={ this.props.context }
            filmId={ this.state.film.id }
            callback={ this.newFilmRightsCallback.bind(this) }
          />
        </Modal>
        <Modal isOpen={ this.state.changeDatesModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ ChangeDatesModalStyles }>
          <FilmRightsChangeDates
            context={ this.props.context }
            filmId={ this.state.film.id }
            updateChangedDates={ this.updateChangedDates.bind(this) }
          />
        </Modal>
        <Modal isOpen={ this.state.copyModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 900 }, 1) }>
          <CopyEntity
            context={ this.props.context }
            entityName="film"
            initialEntity={ { title: "", year: "", length: "", filmType: film.filmType, copyFrom: film.id } }
          />
        </Modal>
        <Modal isOpen={ this.state.artworkModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ ArtworkModalStyles }>
          <h1 className="my-modal-header">Update artwork for all films now?</h1>
          <div className="text-center">
            <div className="orange-button small margin" onClick={ this.confirmUpdateArtwork.bind(this) }>Yes</div>
            <div className="cancel-button small" onClick={ Common.closeModals.bind(this) }>No</div>
          </div>
        </Modal>
        <Modal isOpen={this.state.deleteModalOpen} onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete entityName="film" confirmDelete={ this.confirmDelete.bind(this) } closeModal={ Common.closeModals.bind(this) } />
        </Modal>
        { Common.renderJobModal.call(this, this.state.job) }
      </div>
    );
  }

  renderTopTabs() {
    return(
      <div className={ `tabs-row${this.state.film.filmType == 'TV Series' ? ' tv' : ''}` }>
        { this.renderTopTab("General") }
        { this.renderTopTab("Contract") }
        { this.renderTopTab("Marketing") }
        { this.renderTopTab("Bookings") }
        { this.renderTopTab("Educational") }
        { this.renderTopTab("DVDs") }
        { this.renderTopTab("Statements") }
        { this.renderTopTab("Sublicensing") }
        { this.renderTopTab("Episodes") }
      </div>
    );
  }

  renderTopTab(label) {
    if (this.state.film.id) {
      if (['General', 'Contract', 'Educational', 'DVDs', 'Bookings', 'Marketing'].indexOf(label) > -1 ||
          (['Statements', 'Sublicensing'].indexOf(label) > -1 && (this.state.film.filmType == 'Feature' || this.state.film.filmType == 'TV Series')) ||
          (label == 'Episodes' && this.state.film.filmType == 'TV Series'))
      {
        return(
          <div className={ "tab" + (this.state.tab === label ? " selected" : "") } onClick={ this.clickTab.bind(this) }>{ label }</div>
        );
      }
    }
  }

  renderTab(tab) {
    const { actors, alternateAudios, alternateLengths, alternateSubs, crossedFilms, directors, film, filmCountries, filmFormats, filmGenres, filmLanguages, filmTopics, labels, laurels, quotes, schedule, subRights } = this.state;
    if (tab === "Contract") {
      return(
        <div>
          <hr />
          <div className="row">
            { Details.renderField.bind(this)({ columnWidth: 5, entity: 'film', property: 'licensorId', type: 'modal', optionDisplayProperty: 'name', columnHeader: 'Licensor' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'film', property: 'startDate', readOnly: !FM.user.hasAdminAccess }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'film', property: 'endDate', readOnly: !FM.user.hasAdminAccess }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'film', property: 'sageId', columnHeader: 'Sage ID', readOnly: !FM.user.hasAdminAccess }) }
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
          <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'episodeModalOpen', true) }>Add Episode</a>
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
          <a className={ 'blue-outline-button small' + (this.state.dvds.length === 6 ? ' hidden' : '') } onClick={ Common.changeState.bind(this, 'dvdModalOpen', true) }>Add DVD</a>
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
          <h3>Sublicensed Rights</h3>
          <div className="row">
            <div className="col-xs-12">
              <table className="fm-admin-table no-hover">
                <thead>
                  <tr>
                    <th><div className={ this.state.subRightsSortBy === 'sublicensorName' ? "sort-header-active" : "sort-header-inactive" } onClick={ Common.changeState.bind(this, 'subRightsSortBy', 'sublicensorName') }>Sublicensor</div></th>
                    <th><div className={ this.state.subRightsSortBy === 'rightName' ? "sort-header-active" : "sort-header-inactive" } onClick={ Common.changeState.bind(this, 'subRightsSortBy', 'rightName') }>Right</div></th>
                    <th><div className={ this.state.subRightsSortBy === 'territory' ? "sort-header-active" : "sort-header-inactive" } onClick={ Common.changeState.bind(this, 'subRightsSortBy', 'territory') }>Territory</div></th>
                    <th><div className={ this.state.subRightsSortBy === 'startDate' ? "sort-header-active" : "sort-header-inactive" } onClick={ Common.changeState.bind(this, 'subRightsSortBy', 'startDate') }>Start Date</div></th>
                    <th><div className={ this.state.subRightsSortBy === 'endDate' ? "sort-header-active" : "sort-header-inactive" } onClick={ Common.changeState.bind(this, 'subRightsSortBy', 'endDate') }>End Date</div></th>
                    <th><div className={ this.state.subRightsSortBy === 'exclusive' ? "sort-header-active" : "sort-header-inactive" } onClick={ Common.changeState.bind(this, 'subRightsSortBy', 'exclusive') }>Exclusive</div></th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                  { _.orderBy(subRights, [this.subRightsSort.bind(this), this.subRightsSortSecond.bind(this)]).map((subRight, index) => {
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
      var filteredBookings = this.state.bookings.concat(this.state.virtualBookings).filterSearchText(this.state.searchText, this.state.sortBy);
      return(
        <div>
          <hr />
          <h3>Screening Formats</h3>
          <div className="row">
            <div className="col-xs-6">
              <ul className="standard-list screening-formats-list">
                { HandyTools.alphabetizeArrayOfObjects(filmFormats, 'format').map((filmFormat) => {
                  return(
                    <li key={ filmFormat.id }>
                      { filmFormat.format }<div className="x-button" onClick={ this.deleteFromList.bind(this, { directory: 'film_formats', otherArrays: ['formats'] }) } data-id={ filmFormat.id }></div>
                    </li>
                  );
                }) }
              </ul>
              <a className={ 'blue-outline-button small' } onClick={ Common.changeState.bind(this, 'formatsModalOpen', true) }>Add Format</a>
            </div>
          </div>
          <hr />
          <div className="row">
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'film', property: 'rating' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'film', property: 'aspectRatio' }) }
            { Details.renderField.bind(this)({ columnWidth: 4, entity: 'film', property: 'soundConfig' }) }
          </div>
          <hr />
          <h3>Bookings</h3>
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
                  <tr
                    key={ index }
                    onClick={ () => {
                      if (booking.type === 'Virtual') {
                        this.redirect.call(this, "virtual_bookings", booking.id);
                      } else {
                        this.redirect.call(this, "bookings", booking.id)
                      }
                    }}
                  >
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
                      { booking.type === 'Virtual' ? 'N/A' : (booking.valid ? booking.owed : 'Invalid') }
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
          <hr />
          <div className="row">
            { Details.renderSwitch.bind(this)({ columnWidth: 3, entity: 'film', property: 'exportReports' }) }
            { Details.renderSwitch.bind(this)({ columnWidth: 3, entity: 'film', property: 'sendReports', hidden: !this.state.film.exportReports }) }
            { Details.renderSwitch.bind(this)({ columnWidth: 3, entity: 'film', property: 'ignoreSageId', columnHeader: 'Ignore Sage ID on Import' }) }
          </div>
          <hr style={ { marginTop: 30 } } />
          <div className="row">
            <div className="col-xs-6">
              <h3>Crossed Films</h3>
              <ul className="standard-list crossed-films-list">
                { crossedFilms.map((crossedFilm) => {
                  return(
                    <li key={ crossedFilm.id }>
                      { crossedFilm.title }<div className="x-button" onClick={ this.deleteFromList.bind(this, { directory: 'crossed_films', otherArrays: ['otherCrossedFilms'] }) } data-id={ crossedFilm.id }></div>
                    </li>
                  );
                }) }
              </ul>
              <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'crossedFilmModalOpen', true) }>Add Film</a>
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
              <ul className="standard-list reorderable directors-list">
                <li className="drop-zone" data-index="-1" data-section={ 'directors' }></li>
                { HandyTools.sortArrayOfObjects(directors, 'order').map((director, index) => {
                  return(
                    <div key={ director.id }>
                      <li data-id={ director.id } data-index={ index } data-section="directors">
                        { director.firstName } { director.lastName }<div className="handle" onMouseDown={ this.mouseDownHandle.bind(this) } onMouseUp={ this.mouseUpHandle.bind(this) }></div><div className="x-button" onClick={ this.deleteFromList.bind(this, { directory: 'directors' }) } data-id={ director.id }></div>
                      </li>
                      <li className="drop-zone" data-index={ index } data-section="directors"></li>
                    </div>
                  );
                }) }
              </ul>
              <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'directorModalOpen', true) }>Add Director</a>
            </div>
            { Details.renderDropDown.bind(this)({ columnWidth: 2, entity: 'film', property: 'labelId', columnHeader: 'Label', options: labels, optionDisplayProperty: 'name', optionSortProperty: 'id' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'film', property: 'year' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'film', property: 'length', columnHeader: 'Length (minutes)' }) }
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-6">
              <h3>Countries</h3>
              <ul className="standard-list reorderable countries-list">
                <li className="drop-zone" data-index="-1" data-section={ 'countries' }></li>
                { HandyTools.sortArrayOfObjects(filmCountries, 'order').map((filmCountry, index) => {
                  return(
                    <div key={ filmCountry.id }>
                      <li data-id={ filmCountry.id } data-index={ index } data-section="countries">
                        { filmCountry.country }<div className="handle" onMouseDown={ this.mouseDownHandle.bind(this) } onMouseUp={ this.mouseUpHandle.bind(this) }></div><div className="x-button" onClick={ this.deleteFromList.bind(this, { directory: 'film_countries', otherArrays: ['countries'] }) } data-id={ filmCountry.id }></div>
                      </li>
                      <li className="drop-zone" data-index={ index } data-section="countries"></li>
                    </div>
                  );
                }) }
              </ul>
              <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'countriesModalOpen', true) }>Add Country</a>
            </div>
            <div className="col-xs-6">
              <h3>Languages</h3>
              <ul className="standard-list reorderable languages-list">
                <li className="drop-zone" data-index="-1" data-section="languages"></li>
                { HandyTools.sortArrayOfObjects(filmLanguages, 'order').map((filmLanguage, index) => {
                  return(
                    <div key={ filmLanguage.id }>
                      <li data-index={ index } data-section="languages">
                        { filmLanguage.language }<div className="handle" onMouseDown={ this.mouseDownHandle.bind(this) } onMouseUp={ this.mouseUpHandle.bind(this) }></div><div className="x-button" onClick={ this.deleteFromList.bind(this, { directory: 'film_languages', otherArrays: ['languages'] }) } data-id={ filmLanguage.id }></div>
                      </li>
                      <li className="drop-zone" data-index={ index } data-section="languages"></li>
                    </div>
                  );
                }) }
              </ul>
              <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'languagesModalOpen', true) }>Add Language</a>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-6">
              <h3>Cast</h3>
              <ul className="standard-list reorderable actors-list">
                <li className="drop-zone" data-index="-1" data-section={ 'cast' }></li>
                { HandyTools.sortArrayOfObjects(actors, 'order').map((actor, index) => {
                  return(
                    <div key={ actor.id }>
                      <li data-index={ index } data-section="cast">
                        { actor.firstName } { actor.lastName }<div className="handle" onMouseDown={ this.mouseDownHandle.bind(this) } onMouseUp={ this.mouseUpHandle.bind(this) }></div><div className="x-button" onClick={ this.deleteFromList.bind(this, { directory: 'actors' }) } data-id={ actor.id }></div>
                      </li>
                      <li className="drop-zone" data-index={ index } data-section="cast"></li>
                    </div>
                  );
                }) }
              </ul>
              <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'actorModalOpen', true) }>Add Actor</a>
            </div>
            <div className={ "col-xs-3" + (this.state.film.filmType == 'Short' ? ' hidden' : '') }>
              <h3>Release Dates</h3>
              { Details.renderField.bind(this)({ entity: 'film', property: 'theatricalRelease', readOnly: !FM.user.hasAdminAccess }) }
              { Details.renderField.bind(this)({ entity: 'film', property: 'svodRelease', columnHeader: 'SVOD Release', readOnly: !FM.user.hasAdminAccess }) }
              { Details.renderField.bind(this)({ entity: 'film', property: 'tvodRelease', columnHeader: 'TVOD/EST Release', readOnly: !FM.user.hasAdminAccess }) }
            </div>
            <div className={ "col-xs-3" + (this.state.film.filmType == 'Short' ? ' hidden' : '') }>
              <div style={ { width: '100%', height: '47px' } }></div>
              { Details.renderField.bind(this)({ entity: 'film', property: 'fmPlusRelease', columnHeader: 'FM Plus Release', readOnly: !FM.user.hasAdminAccess }) }
              <div className={ film.filmType == 'Short' ? ' hidden' : '' }>
                { Details.renderField.bind(this)({ entity: 'film', property: 'avodRelease', columnHeader: 'AVOD Release', readOnly: !FM.user.hasAdminAccess }) }
                { Details.renderField.bind(this)({ entity: 'film', property: 'clubDate', readOnly: !FM.user.hasAdminAccess }) }
              </div>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-12">
              <h3>Schedule</h3>
              <ul className="standard-list schedule">
                { schedule.map((entry, index) => {
                  return(
                    <li key={ index } className={ entry.tentative ? 'tentative' : '' }>{ entry.label } - { entry.date_string + (entry.tentative ? ' (?)' : '') }</li>
                  );
                }) }
              </ul>
            </div>
          </div>
        </div>
      );
    } else if (this.state.tab === "Marketing") {
      if (this.state.film.filmType === "Short") {
        return(
          <div>
            <hr />
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'film', property: 'fmPlusUrl', columnHeader: 'Film Movement Plus Link' }) }
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'film', property: 'imdbId', columnHeader: 'IMDB ID' }) }
            </div>
            <div className="row">
              { Details.renderTextBox.bind(this)({ columnWidth: 12, entity: 'film', property: 'synopsis', rows: 8, characterCount: true }) }
            </div>
          </div>
        )
      } else {
        return(
          <div>
            <hr />
            <div className="row">
              { Details.renderSwitch.bind(this)({ columnWidth: 3, entity: 'film', property: 'active', columnHeader: 'Active on Website' }) }
              { Details.renderSwitch.bind(this)({ columnWidth: 3, entity: 'film', property: 'eduPage', columnHeader: 'Educational Page' }) }
              { Details.renderSwitch.bind(this)({ columnWidth: 3, entity: 'film', property: 'videoPage', columnHeader: 'Video Page' }) }
              { Details.renderSwitch.bind(this)({ columnWidth: 3, entity: 'film', property: 'dayAndDate', columnHeader: 'Day and Date' }) }
            </div>
            <hr style={ { marginTop: 30 } } />
            <div className="row">
              { Details.renderTextBox.bind(this)({ columnWidth: 12, entity: 'film', property: 'synopsis', rows: 8, characterCount: true }) }
              { Details.renderTextBox.bind(this)({ columnWidth: 12, entity: 'film', property: 'vodSynopsis', rows: 8, columnHeader: 'Synopsis - 500 characters', characterCount: true }) }
              { Details.renderTextBox.bind(this)({ columnWidth: 12, entity: 'film', property: 'shortSynopsis', rows: 4, columnHeader: 'Synopsis - 240 characters', characterCount: true }) }
              { Details.renderTextBox.bind(this)({ columnWidth: 12, entity: 'film', property: 'logline', rows: 2, columnHeader: 'Synopsis - 150 characters', characterCount: true }) }
            </div>
            <hr style={ { marginTop: 30 } } />
            <div className="row">
              <div className="col-xs-12">
                <h3>Laurels</h3>
                <ul className="standard-list reorderable laurels-list">
                  <li className="drop-zone" data-index="-1" data-section="laurels"></li>
                  { HandyTools.sortArrayOfObjects(laurels, 'order').map((laurel, index) => {
                    return(
                      <div key={ laurel.id }>
                        <li data-index={ index } data-section="laurels">
                          { laurel.result }{ laurel.awardName ? ` - ${laurel.awardName}` : '' } - { laurel.festival }<div className="handle" onMouseDown={ this.mouseDownHandle.bind(this) } onMouseUp={ this.mouseUpHandle.bind(this) }></div><div className="x-button" onClick={ this.deleteFromList.bind(this, { directory: 'laurels' }) } data-id={ laurel.id }></div>
                        </li>
                        <li className="drop-zone" data-index={ index } data-section="laurels"></li>
                      </div>
                    );
                  }) }
                </ul>
                <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'laurelModalOpen', true) }>Add Laurel</a>
                <div className="row row-of-checkboxes badge-checkboxes">
                  { Details.renderSwitch.bind(this)({ columnWidth: 3, entity: 'film', property: 'certifiedFresh' }) }
                  { Details.renderSwitch.bind(this)({ columnWidth: 3, entity: 'film', property: 'criticsPick', columnHeader: "Critic's Pick" }) }
                </div>
              </div>
            </div>
            <hr style={ { marginTop: 30 } } />
            <div className="row">
              <div className="col-xs-12 quotes-list">
                <h3 className="quotes-header">Quotes</h3>
                <div className="quote-drop-zone" data-index="-1" data-section="quotes"></div>
                { HandyTools.sortArrayOfObjects(quotes, 'order').map((quote, index) => {
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
                <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'quoteModalOpen', true) }>Add Quote</a>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-6">
                <h3>Genres</h3>
                <ul className="standard-list reorderable genres-list">
                  <li className="drop-zone" data-index="-1" data-section={ 'genres' }></li>
                  { HandyTools.sortArrayOfObjects(filmGenres, 'order').map((filmGenre, index) => {
                    return(
                      <div key={ filmGenre.id }>
                        <li data-index={ index } data-section="genres">
                          { filmGenre.genre }<div className="handle" onMouseDown={ this.mouseDownHandle.bind(this) } onMouseUp={ this.mouseUpHandle.bind(this) }></div><div className="x-button" onClick={ this.deleteFromList.bind(this, { directory: 'film_genres', otherArrays: ['genres'] }) } data-id={ filmGenre.id }></div>
                        </li>
                        <li className="drop-zone" data-index={ index } data-section="genres"></li>
                      </div>
                    );
                  }) }
                </ul>
                <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'genresModalOpen', true) }>Add Genre</a>
              </div>
              <div className="col-xs-6">
                <h3>Related Films</h3>
                <ul className="standard-list related-films-list">
                  { this.state.relatedFilms.map((relatedFilm) => {
                    return(
                      <li key={ relatedFilm.id }>
                        { relatedFilm.title }<div className="x-button" onClick={ this.deleteFromList.bind(this, { directory: 'related_films', otherArrays: ['otherFilms'] }) } data-id={ relatedFilm.id }></div>
                      </li>
                    );
                  }) }
                </ul>
                <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'relatedFilmsModalOpen', true) }>Add Related Film</a>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-4">
                <h3>Alternate Lengths</h3>
                <ul className="standard-list alternate-lengths-list">
                  { HandyTools.sortArrayOfObjects(alternateLengths, 'length').map((alternateLength) => {
                    return(
                      <li key={ alternateLength.id }>
                        { alternateLength.length }<div className="x-button" onClick={ this.deleteFromList.bind(this, { directory: 'alternate_lengths' }) } data-id={ alternateLength.id }></div>
                      </li>
                    );
                  }) }
                </ul>
                <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'newAltLengthModalOpen', true) }>Add Length</a>
              </div>
              <div className="col-xs-4">
                <h3>Alternate Audio Tracks</h3>
                <ul className="standard-list alternate-audios-list">
                  { HandyTools.alphabetizeArrayOfObjects(alternateAudios, 'languageName').map((alternateAudio) => {
                    return(
                      <li key={ alternateAudio.id }>
                        { alternateAudio.languageName }<div className="x-button" onClick={ this.deleteFromList.bind(this, { directory: 'alternate_audios', otherArrays: ['audioLanguages'] }) } data-id={ alternateAudio.id }></div>
                      </li>
                    );
                  }) }
                </ul>
                <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'alternateAudioModalOpen', true) }>Add Audio Track</a>
              </div>
              <div className="col-xs-4">
                <h3>Alternate Subtitles</h3>
                <ul className="standard-list alternate-subtitles-list">
                  { HandyTools.alphabetizeArrayOfObjects(alternateSubs, 'languageName').map((alternateSub) => {
                    return(
                      <li key={ alternateSub.id }>
                        { alternateSub.languageName }<div className="x-button" onClick={ this.deleteFromList.bind(this, { directory: 'alternate_subs', otherArrays: ['subtitleLanguages'] }) } data-id={ alternateSub.id }></div>
                      </li>
                    );
                  }) }
                </ul>
                <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'alternateSubsModalOpen', true) }>Add Subtitles</a>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-12">
                <h3>Digital Retailers</h3>
                <table className="fm-admin-table digital-retailers-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>URL</th>
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
                <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'newDigitalRetailerModalOpen', true) }>Add Digital Retailer</a>
              </div>
            </div>
            <hr />
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'film', property: 'fmPlusUrl', columnHeader: 'Film Movement Plus Link' }) }
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'film', property: 'standaloneSite' }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'film', property: 'vimeoTrailer', columnHeader: 'Vimeo Trailer Link' }) }
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'film', property: 'youtubeTrailer', columnHeader: 'YouTube Trailer Link' }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'film', property: 'proresTrailer', columnHeader: 'ProRes Trailer Link' }) }
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'film', property: 'facebookLink' }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'film', property: 'twitterLink' }) }
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'film', property: 'instagramLink' }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'film', property: 'rentalUrl' }) }
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'film', property: 'rentalPrice' }) }
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'film', property: 'rentalDays' }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'film', property: 'imdbId', columnHeader: 'IMDB ID' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'film', property: 'tvRating', columnHeader: 'TV Rating' }) }
            </div>
            <hr style={ { marginTop: 30 } } />
          </div>
        );
      }
    } else if (this.state.tab === "Educational") {
      return(
        <>
          <div>
            <hr />
            <div className="row">
              { Details.renderTextBox.bind(this)({ columnWidth: 12, entity: 'film', property: 'institutionalSynopsis', rows: 8, characterCount: true }) }
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-2">
                <h3>Pricing</h3>
                <div className="edu-subheader-container">
                  <p>Pre-Street</p>
                  <p>Non-Member</p>
                </div>
                { Details.renderField.bind(this)({ entity: 'film', property: 'msrpPreStreet', columnHeader: 'SRP' }) }
                { Details.renderField.bind(this)({ entity: 'film', property: 'pprPreStreet', columnHeader: 'PPR' }) }
                { Details.renderField.bind(this)({ entity: 'film', property: 'drlPreStreet', columnHeader: 'DRL' }) }
                { Details.renderField.bind(this)({ entity: 'film', property: 'pprDrlPreStreet', columnHeader: 'PPR + DRL' }) }
              </div>
              <div className="col-xs-2">
                <div style={ { width: '100%', height: '47px' } }></div>
                <div className="edu-subheader-container">
                  <p>Pre-Street</p>
                  <p>Member</p>
                </div>
                { Details.renderField.bind(this)({ entity: 'film', property: 'msrpPreStreetMember', columnHeader: 'SRP' }) }
                { Details.renderField.bind(this)({ entity: 'film', property: 'pprPreStreetMember', columnHeader: 'PPR' }) }
                { Details.renderField.bind(this)({ entity: 'film', property: 'drlPreStreetMember', columnHeader: 'DRL' }) }
                { Details.renderField.bind(this)({ entity: 'film', property: 'pprDrlPreStreetMember', columnHeader: 'PPR + DRL' }) }
              </div>
              <div className="col-xs-2">
                <div style={ { width: '100%', height: '47px' } }></div>
                <div className="edu-subheader-container">
                  <p>Post-Street</p>
                  <p>Non-Member</p>
                </div>
                <div style={ { paddingBottom: 103.33 } }></div>
                { Details.renderField.bind(this)({ entity: 'film', property: 'pprPostStreet', columnHeader: 'PPR' }) }
                { Details.renderField.bind(this)({ entity: 'film', property: 'drlPostStreet', columnHeader: 'DRL' }) }
                { Details.renderField.bind(this)({ entity: 'film', property: 'pprDrlPostStreet', columnHeader: 'PPR + DRL' }) }
              </div>
              <div className="col-xs-2">
                <div style={ { width: '100%', height: '47px' } }></div>
                <div className="edu-subheader-container">
                  <p>Post-Street</p>
                  <p>Member</p>
                </div>
                <div style={ { paddingBottom: 103.33 } }></div>
                { Details.renderField.bind(this)({ entity: 'film', property: 'pprPostStreetMember', columnHeader: 'PPR' }) }
                { Details.renderField.bind(this)({ entity: 'film', property: 'drlPostStreetMember', columnHeader: 'DRL' }) }
                { Details.renderField.bind(this)({ entity: 'film', property: 'pprDrlPostStreetMember', columnHeader: 'PPR + DRL' }) }
              </div>
              <div className="col-xs-4">
                <h3>Topics</h3>
                <ul className="standard-list topics-list">
                  { HandyTools.alphabetizeArrayOfObjects(filmTopics, 'topic').map((filmTopic) => {
                    return(
                      <li key={ filmTopic.id }>
                        { filmTopic.topic }<div className="x-button" onClick={ this.deleteFromList.bind(this, { directory: 'film_topics', otherArrays: ['topics'] }) } data-id={ filmTopic.id }></div>
                      </li>
                    );
                  }) }
                </ul>
                <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'topicsModalOpen', true) }>Add Topic</a>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-12">
                <h3>Educational Streaming Platforms</h3>
                <table className="fm-admin-table edu-platforms-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td></td><td></td></tr>
                    { this.state.eduPlatformFilms.map((eduPlatformFilm, index) => {
                      return(
                        <tr key={ index } onClick={ this.redirect.bind(this, 'edu_platform_films', eduPlatformFilm.id) }>
                          <td className="name-column">
                            { eduPlatformFilm.name }
                          </td>
                          <td>
                            { eduPlatformFilm.url }
                          </td>
                        </tr>
                      );
                    }) }
                  </tbody>
                </table>
                <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'newEduPlatformModalOpen', true) }>Add Platform</a>
              </div>
            </div>
            <hr />
          </div>
          <style jsx>{`
            .edu-subheader-container {
              margin-top: -10px;
              font-family: 'TeachableSans-Medium';
              font-size: 12px;
              font-style: italic;
              margin-bottom: 20px;
            }
          `}</style>
        </>
      );
    } else {
      return(
        <div>
        </div>
      );
    }
  }

  renderRoyaltyFields() {
    const { dealTemplates, film, filmRevenuePercentages, filmRights, percentageErrors, percentageObject, revenueStreams } = this.state;
    return(
      <div>
        <div className={ film.filmType == 'Short' ? 'hidden' : '' }>
          <div className="row">
            { Details.renderDropDown.bind(this)({ columnWidth: 5, entity: 'film', property: 'dealTypeId', columnHeader: 'Deal Type', options: dealTemplates, optionDisplayProperty: 'name', readOnly: !FM.user.hasAdminAccess }) }
            { Details.renderField.bind(this)({ columnWidth: 1, entity: 'film', property: 'grPercentage', columnHeader: 'GR %', readOnly: !FM.user.hasAdminAccess, hidden: film.dealTypeId != "5" && film.dealTypeId != "6" }) }
            { Details.renderDropDown.bind(this)({ columnWidth: 3, entity: 'film', property: 'daysStatementDue', columnHeader: 'Statements Due', options: [{ value: 30, text: '30 Days' }, { value: 45, text: '45 Days' }, { value: 60, text: '60 Days' }], readOnly: !FM.user.hasAdminAccess }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'film', property: 'mg', columnHeader: 'MG', readOnly: !FM.user.hasAdminAccess }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'film', property: 'eAndO', columnHeader: 'E & O', readOnly: !FM.user.hasAdminAccess, hidden: film.filmType === "Short" }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'film', property: 'expenseCap', readOnly: !FM.user.hasAdminAccess }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'film', property: 'sellOffPeriod', columnHeader: 'DVD Sell Off Period (Months)', readOnly: !FM.user.hasAdminAccess }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'film', property: 'acceptDelivery', columnHeader: 'Delivery Acceptance Date', readOnly: !FM.user.hasAdminAccess }) }
          </div>
          <div className="row">
            { Details.renderTextBox.bind(this)({ columnWidth: 6, entity: 'film', property: 'royaltyNotes', rows: 3, readOnly: !FM.user.hasAdminAccess }) }
            { Details.renderTextBox.bind(this)({ columnWidth: 6, entity: 'film', property: 'contractualObligations', rows: 3, readOnly: !FM.user.hasAdminAccess }) }
          </div>
        </div>
        <hr />
        <h3>Licensed Rights</h3>
        <div className="row">
          <div className="col-xs-12">
            <table className="fm-admin-table">
              <thead>
                <tr>
                  <th><div className={ this.state.rightsSortBy === 'name' ? "sort-header-active" : "sort-header-inactive" } onClick={ Common.changeState.bind(this, 'rightsSortBy', 'name') }>Right</div></th>
                  <th><div className={ this.state.rightsSortBy === 'territory' ? "sort-header-active" : "sort-header-inactive" } onClick={ Common.changeState.bind(this, 'rightsSortBy', 'territory') }>Territory</div></th>
                  <th><div className={ this.state.rightsSortBy === 'startDate' ? "sort-header-active" : "sort-header-inactive" } onClick={ Common.changeState.bind(this, 'rightsSortBy', 'startDate') } >Start Date</div></th>
                  <th><div className={ this.state.rightsSortBy === 'endDate' ? "sort-header-active" : "sort-header-inactive" } onClick={ Common.changeState.bind(this, 'rightsSortBy', 'endDate') }>End Date</div></th>
                  <th><div className={ this.state.rightsSortBy === 'exclusive' ? "sort-header-active" : "sort-header-inactive" } onClick={ Common.changeState.bind(this, 'rightsSortBy', 'exclusive') }>Exclusive</div></th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td><td></td><td></td><td></td><td></td></tr>
                { _.orderBy(filmRights, [this.rightsSort.bind(this), this.rightsSortSecond.bind(this)]).map((right, index) => {
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
          <h3>Revenue Splits</h3>
          <div className="row">
            { filmRevenuePercentages.map((revenuePercentage, index) => {
              const properErrorsArray = percentageErrors[revenuePercentage.id] ? percentageErrors[revenuePercentage.id] : [];
              const revenueStream = revenueStreams.find(stream => stream.id == revenuePercentage.revenueStreamId);
              return(
                <div key={ index }>
                  { Details.renderField.bind(this)({
                    columnWidth: 2,
                    entity: 'percentageObject',
                    property: revenuePercentage.id,
                    errorsKey: revenuePercentage.id,
                    errorsProperty: 'value',
                    columnHeader: revenueStream.nickname || revenueStream.name,
                    readOnly: !FM.user.hasAdminAccess,
                    showFieldError: false,
                  }) }
                </div>
              );
            }) }
          </div>
          <hr />
          <div className={ "row reserve-section" + (this.state.film.reserve ? "" : " no-reserve") }>
            { Details.renderSwitch.bind(this)({ columnWidth: 3, entity: 'film', property: 'reserve', columnHeader: 'Reserve Against Returns' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'film', property: 'reservePercentage', columnHeader: 'Reserve %', hidden: !film.reserve, readOnly: !FM.user.hasAdminAccess }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'film', property: 'reserveQuarters', columnHeader: '# of Quarters', hidden: !film.reserve, readOnly: !FM.user.hasAdminAccess }) }
            <div className={ `spacer${this.state.film.reserve ? ' hidden' : ''}` }></div>
          </div>
          <hr />
          <div className={ "row auto-renew-section" + (this.state.film.autoRenew ? "" : " no-renew") }>
            { Details.renderSwitch.bind(this)({ columnWidth: 3, entity: 'film', property: 'autoRenew', columnHeader: 'Auto-Renew' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'film', property: 'autoRenewTerm', columnHeader: 'Term (Months)', hidden: !film.autoRenew, readOnly: !FM.user.hasAdminAccess }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'film', property: 'autoRenewDaysNotice', columnHeader: 'Days Notice', hidden: !film.autoRenew, readOnly: !FM.user.hasAdminAccess }) }
            <div className={ `spacer${this.state.film.autoRenew ? ' hidden' : ''}` }></div>
          </div>
        </div>
      </div>
    );
  }

  renderRightsButtons() {
    if (FM.user.hasAdminAccess) {
      return([
        <a key={ 1 } className="blue-outline-button small m-right" onClick={ Common.changeState.bind(this, 'newRightsModalOpen', true) }>Add Rights</a>,
        <a key={ 2 } className="blue-outline-button small float-button" onClick={ Common.changeState.bind(this, 'changeDatesModalOpen', true) }>Change All Dates</a>
      ]);
    }
  }

  renderButtons() {
    return(
      <div>
        <a className={ "btn blue-button standard-width" + Common.renderDisabledButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
          { Details.saveButtonText.call(this) }
        </a>
        { this.renderErrorGuide() }
        { this.renderCopyAndDeleteButtons() }
      </div>
    );
  }

  renderCopyAndDeleteButtons() {
    if (FM.user.hasAdminAccess) {
      return([
        <a key={ 1 } className={ "btn delete-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Common.changeState.bind(this, 'deleteModalOpen', true) }>
          Delete
        </a>,
        <a key={ 2 } style={ { marginRight: 30 } } className={ "btn float-button orange-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Common.changeState.bind(this, 'copyModalOpen', true) }>
          Copy Film
        </a>
      ]);
    }
  }

  percentageErrorsExist() {
    const { errors } = this.state;
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
    const { errors } = this.state;
    if (errors.length > 0 || this.percentageErrorsExist()) {
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
      let result = [];
      if (this.percentageErrorsExist()) {
        result.push("Contract Tab");
      }
      errors.forEach((error) => {
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
      const string = (result.length > 0 ? ("(" + result.join(", ") + ")") : "");
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
          <p data-id={ quote.id }>{ FM.user.id === 1 ? (<span>({ quote.order })&nbsp;&nbsp;</span>) : null }"{ quote.text }"</p>
          <p data-id={ quote.id }>- { bottomLine }</p>
          <div className="handle" onMouseDown={ this.mouseDownHandle.bind(this) } onMouseUp={ this.mouseUpHandle.bind(this) }></div>
        </div>
        <div className="quote-drop-zone" data-index={ index } data-section="quotes"></div>
      </div>
    );
  }

  componentDidUpdate() {
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
    Common.updateJobModal.call(this, { successCallback: this.artworkUpdateCallback.bind(this) });
  }

  artworkUpdateCallback(job) {
    let { film } = this.state;
    film.artworkUrl = job.metadata.newImage;
    this.setState({ film });
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ sendRequest, fetchEntity, createEntity, updateEntity, deleteEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(FilmDetails);
