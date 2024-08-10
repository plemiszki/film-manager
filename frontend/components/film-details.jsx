import React from "react";
import Modal from "react-modal";
import FilmRightsNew from "./film-rights-new.jsx";
import FilmRightsChangeDates from "./film-rights-change-dates.jsx";
import {
  alphabetizeArrayOfObjects,
  Button,
  Common,
  ConfirmDelete,
  ConfirmModal,
  createEntity,
  deepCopy,
  DeleteButton,
  deleteEntity,
  Details,
  fetchEntity,
  GrayedOut,
  ListBox,
  ListBoxReorderable,
  ModalSelect,
  OutlineButton,
  rearrangeFields,
  resetNiceSelect,
  SaveButton,
  sendRequest,
  setUpNiceSelect,
  sortArrayOfObjects,
  Spinner,
  updateEntity,
  Table,
  SearchBar,
} from "handy-components";
import FM from "../../app/assets/javascripts/me/common.jsx";
import NewEntity from "./new-entity.jsx";
import CopyEntity from "./copy-entity.jsx";
import { camelCase } from "change-case";

const NewRightsModalStyles = {
  overlay: {
    background: "rgba(0, 0, 0, 0.50)",
  },
  content: {
    background: "#F5F6F7",
    padding: 0,
    margin: "auto",
    maxWidth: 1000,
    height: 598,
  },
};

const ChangeDatesModalStyles = {
  overlay: {
    background: "rgba(0, 0, 0, 0.50)",
  },
  content: {
    background: "#F5F6F7",
    padding: 0,
    margin: "auto",
    maxWidth: 500,
    height: 240,
  },
};

export default class FilmDetails extends React.Component {
  constructor(props) {
    super(props);
    let job = {
      errors_text: "",
    };
    this.state = {
      actors: [],
      alternateAudios: [],
      alternateLengths: [],
      alternateSubs: [],
      amazonGenres: [],
      amazonGenreFilms: [],
      amazonLanguages: [],
      amazonLanguageFilms: [],
      artworkModalOpen: false,
      audioLanguages: [],
      bookings: [],
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
      errors: {},
      spinner: true,
      film: {
        xmlExportFilenameDefaults: {},
      },
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
      rightsSortBy: "name",
      schedule: [],
      searchText: "",
      sortBy: "startDate",
      subRights: [],
      subRightsSortBy: "sublicensorName",
      subtitleLanguages: [],
      tab: FM.params.tab ? FM.params.tab.toLowerCase() : "general",
      topics: [],
      virtualBookings: [],
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const {
        actors,
        alternateAudios,
        alternateLengths,
        alternateSubs,
        amazonGenres,
        amazonGenreFilms,
        amazonLanguages,
        amazonLanguageFilms,
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
      } = response;
      this.setState(
        {
          actors,
          alternateAudios,
          alternateLengths,
          alternateSubs,
          amazonGenres,
          amazonGenreFilms,
          amazonLanguages,
          amazonLanguageFilms,
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
          filmSaved: deepCopy(film),
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
        },
        () => {
          this.updatePercentageObject();
          setUpNiceSelect({
            selector: "select",
            func: Details.changeDropdownField.bind(this),
          });
        },
      );
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
      percentageObjectSaved: deepCopy(percentageObject),
      spinner: false,
    });
  }

  mouseDownHandle(e) {
    $("*").addClass("grabbing");
    let li = e.target.parentElement;
    li.classList.add("grabbed-element");
    let ul = e.target.parentElement.parentElement;
    ul.classList.add("grab-section");
  }

  mouseUpHandle(e) {
    $("*").removeClass("grabbing");
    let li = e.target.parentElement;
    li.classList.remove("grabbed-element");
    let ul = e.target.parentElement.parentElement;
    ul.classList.remove("grab-section");
  }

  dragOverHandler(e) {
    e.target.classList.add("highlight");
  }

  dragOutHandler(e) {
    e.target.classList.remove("highlight");
  }

  dragEndHandler() {
    $("*").removeClass("grabbing");
    $("body").removeAttr("style");
    $(".grabbed-element").removeClass("grabbed-element");
    $(".highlight").removeClass("highlight");
  }

  dropHandler(e, ui) {
    const filmId = this.state.film.id;
    let draggedIndex = ui.draggable[0].dataset.index;
    let dropZoneIndex = e.target.dataset.index;
    let currentOrder = {};
    let entityArray;
    let directory;
    switch (e.target.dataset.section) {
      case "countries":
        entityArray = "filmCountries";
        directory = "film_countries";
        break;
      case "languages":
        entityArray = "filmLanguages";
        directory = "film_languages";
        break;
      case "actors":
        entityArray = "actors";
        break;
      case "laurels":
        entityArray = "laurels";
        break;
      case "quotes":
        entityArray = "quotes";
        break;
      case "genres":
        entityArray = "filmGenres";
        directory = "film_genres";
        break;
      case "directors":
        entityArray = "directors";
        directory = "directors";
    }
    this.state[entityArray].forEach((entity) => {
      currentOrder[entity.order] = entity.id;
    });
    let newOrder = rearrangeFields({
      currentOrder,
      draggedIndex,
      dropZoneIndex,
    });
    let data;
    directory = directory || entityArray;
    if (directory === "actors") {
      data = {
        new_order: newOrder,
        actorable_id: filmId,
        actorable_type: "Film",
      };
    } else {
      data = {
        new_order: newOrder,
        film_id: filmId,
      };
    }
    this.setState({
      spinner: true,
    });
    sendRequest(`/api/${directory}/rearrange`, {
      method: "PATCH",
      data,
    }).then((response) => {
      this.setState({
        spinner: false,
        [entityArray]: response[entityArray],
      });
    });
  }

  changeFieldArgs() {
    return {
      defaultErrorsKey: "film",
      thing: "film",
      beforeSave: (newEntity, key, value) => {
        if (key === "dealTypeId") {
          if (value <= 4) {
            newEntity.grPercentage = "";
          } else {
            newEntity.grPercentage = "0";
          }
        }
        if (key === "reserve" && value === false) {
          newEntity.reservePercentage = 0;
          newEntity.reserveQuarters = 0;
        }
        if (key === "autoRenew" && value === false) {
          newEntity.autoRenewTerm = 0;
          newEntity.autoRenewDaysNotice = 0;
        }
        return newEntity;
      },
      changesFunction: this.checkForChanges.bind(this),
    };
  }

  checkForChanges() {
    const { film, filmSaved, percentageObject, percentageObjectSaved } =
      this.state;
    if (Tools.objectsAreEqual(film, filmSaved) === false) {
      return true;
    } else {
      return !Tools.objectsAreEqual(percentageObject, percentageObjectSaved);
    }
  }

  clickTab(e) {
    const tab = e.target.innerText.toLowerCase();
    if (this.state.tab !== tab) {
      $("select").niceSelect("destroy");
      this.setState(
        {
          tab,
        },
        () => {
          resetNiceSelect({
            selector: "select",
            func: Details.changeDropdownField.bind(this),
          });
        },
      );
    }
  }

  redirect(directory, id) {
    window.location = `/${directory}/${id}`;
  }

  clickQuote(e) {
    if (e.target.dataset.id) {
      window.location = "/quotes/" + e.target.dataset.id;
    }
  }

  clickSave() {
    this.setState(
      {
        spinner: true,
        justSaved: true,
      },
      () => {
        const { film, percentageObject } = this.state;
        const filmWithTentative = this.extractTentativeReleaseDates(film);
        updateEntity({
          entityName: "film",
          entity: Details.removeFinanceSymbolsFromEntity({
            entity: film,
            fields: [
              "mg",
              "expenseCap",
              "eAndO",
              "rentalPrice",
              "msrpPreStreet",
              "pprPreStreet",
              "drlPreStreet",
              "pprDrlPreStreet",
              "pprPostStreet",
              "drlPostStreet",
              "pprDrlPostStreet",
              "msrpPreStreetMember",
              "pprPreStreetMember",
              "drlPreStreetMember",
              "pprDrlPreStreetMember",
              "pprPostStreetMember",
              "drlPostStreetMember",
              "pprDrlPostStreetMember",
            ],
          }),
          additionalData: {
            percentages: percentageObject,
          },
        }).then(
          (response) => {
            const { film, filmRevenuePercentages, schedule } = response;
            this.setState(
              {
                changesToSave: false,
                film,
                filmSaved: deepCopy(film),
                filmRevenuePercentages,
                schedule,
              },
              () => {
                this.updatePercentageObject();
              },
            );
          },
          (response) => {
            const { errors } = response;
            this.setState({
              spinner: false,
              errors,
            });
          },
        );
      },
    );
  }

  extractTentativeReleaseDates(film) {
    const attributes = [
      "avodRelease",
      "svodRelease",
      "tvodRelease",
      "fmPlusRelease",
      "theatricalRelease",
    ];
    attributes.forEach((attribute) => {
      const tentativeAttribute = attribute.slice(0, -7) + "Tentative";
      let releaseDate = film[attribute];
      const tentative = releaseDate.charAt(releaseDate.length - 1) === "?";
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
    const entityNamePlural = camelCase(directory);
    const { id } = this.state.film;
    this.setState({
      spinner: true,
    });
    createEntity({
      directory,
      entityName,
      entity: {
        filmId: id,
        [key]: option.id,
      },
    }).then((response) => {
      const { videoFilenameExport } = response;
      let obj = {
        spinner: false,
        [entityNamePlural]: response[entityNamePlural],
      };
      otherArrays &&
        otherArrays.forEach((arrayName) => {
          obj[arrayName] = response[arrayName];
        });
      if (videoFilenameExport) {
        const { film } = this.state;
        film.xmlExportFilenameDefaults = {
          ...film.xmlExportFilenameDefaults,
          video: videoFilenameExport,
        };
        obj.film = film;
      }
      this.setState(obj);
      Common.closeModals.call(this);
    });
  }

  deleteFromList(args) {
    const { directory, otherArrays, id } = args;
    const entityNamePlural = camelCase(directory);
    this.setState({
      spinner: true,
    });
    deleteEntity({
      directory,
      id,
    }).then((response) => {
      const { videoFilenameExport } = response;
      let obj = {
        spinner: false,
        [entityNamePlural]: response[entityNamePlural],
      };
      otherArrays &&
        otherArrays.forEach((arrayName) => {
          obj[arrayName] = response[arrayName];
        });
      if (response.hasOwnProperty("videoFilenameExport")) {
        const { film } = this.state;
        film.xmlExportFilenameDefaults = {
          ...film.xmlExportFilenameDefaults,
          video: videoFilenameExport,
        };
        obj.film = film;
      }
      this.setState(obj);
    });
  }

  confirmDelete() {
    this.setState({
      spinner: true,
      deleteModalOpen: false,
    });
    const { id } = this.state.film;
    deleteEntity({
      directory: "films",
      id,
      redirectToIndex: true,
    });
  }

  confirmUpdateArtwork() {
    sendRequest("/api/films/update_artwork", {
      method: "POST",
      data: {
        triggerId: this.state.film.id,
      },
    }).then((response) => {
      const { job } = response;
      this.setState({
        job,
        artworkModalOpen: false,
        jobModalOpen: true,
      });
    });
  }

  rightsSort(object) {
    var property = object[this.state.rightsSortBy];
    return property.toLowerCase();
  }

  rightsSortSecond(object) {
    if (this.state.rightsSortBy === "name") {
      return object["territory"].toLowerCase();
    } else {
      return object["name"].toLowerCase();
    }
  }

  subRightsSort(object) {
    var property = object[this.state.subRightsSortBy];
    return property.toLowerCase();
  }

  subRightsSortSecond(object) {
    if (this.state.subRightsSortBy === "rightName") {
      return object["territory"].toLowerCase();
    } else {
      return object["rightName"].toLowerCase();
    }
  }

  updateChangedDates(filmRights) {
    this.setState({
      changeDatesModalOpen: false,
      filmRights,
    });
  }

  newFilmRightsCallback(filmRights) {
    this.setState({
      newRightsModalOpen: false,
      filmRights,
    });
  }

  createCallback(response, entityNamePlural) {
    this.setState(
      {
        [entityNamePlural]: response,
      },
      () => {
        Common.closeModals.call(this);
      },
    );
  }

  changePercentageField(e) {
    const filmRevenuePercentageId = e.target.dataset.id;
    const value = e.target.value;
    const { percentageObject, percentageErrors } = this.state;
    percentageObject[filmRevenuePercentageId] = value;
    if (percentageErrors[filmRevenuePercentageId]) {
      delete percentageErrors[filmRevenuePercentageId];
    }
    this.setState(
      {
        percentageObject,
      },
      () => {
        const changesToSave = this.changeFieldArgs().changesFunction.call();
        this.setState({
          changesToSave,
        });
      },
    );
  }

  render() {
    const { dvds, dvdTypes, film, tab, spinner, deleteModalOpen } = this.state;
    const title = {
      Short: "Short",
      Feature: "Film",
      "TV Series": "TV Series",
    }[film.filmType];
    return (
      <>
        <div className="handy-component">
          <h1>{title} Details</h1>
          <div
            className={`tabs-row${film.filmType === "TV Series" ? " tv" : ""}`}
          >
            {this.renderTopTab("General")}
            {this.renderTopTab("Contract")}
            {this.renderTopTab("Marketing")}
            {this.renderTopTab("Bookings")}
            {this.renderTopTab("Educational")}
            {this.renderTopTab("DVDs")}
            {this.renderTopTab("Statements")}
            {this.renderTopTab("Sublicensing")}
            {this.renderTopTab("Episodes")}
          </div>
          <div className="white-box">
            <div className="row">
              <div className="col-xs-1">
                <div
                  className={"key-art" + (film.artworkUrl ? "" : " empty")}
                  style={
                    film.artworkUrl
                      ? { backgroundImage: `url(${film.artworkUrl})` }
                      : {}
                  }
                  onClick={Common.changeState.bind(
                    this,
                    "artworkModalOpen",
                    true,
                  )}
                ></div>
              </div>
              {Details.renderField.bind(this)({
                columnWidth: 9,
                entity: "film",
                property: "title",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 2,
                entity: "film",
                property: "filmType",
                readOnly: true,
                columnHeader: "Type",
              })}
            </div>
            {this.renderTab(tab)}
            {this.renderButtons()}
            <Spinner visible={spinner} />
            <GrayedOut visible={spinner} />
          </div>
          <ModalSelect
            isOpen={this.state.crossedFilmModalOpen}
            options={this.state.otherCrossedFilms}
            property="title"
            func={this.selectEntityToCreate.bind(this, {
              directory: "crossed_films",
              entityName: "crossedFilm",
              key: "crossedFilmId",
              otherArrays: ["otherCrossedFilms"],
            })}
            onClose={Common.closeModals.bind(this)}
          />
          <ModalSelect
            isOpen={this.state.countriesModalOpen}
            options={this.state.countries}
            property="name"
            func={this.selectEntityToCreate.bind(this, {
              directory: "film_countries",
              entityName: "filmCountry",
              key: "countryId",
              otherArrays: ["countries"],
            })}
            onClose={Common.closeModals.bind(this)}
          />
          <ModalSelect
            isOpen={this.state.languagesModalOpen}
            options={this.state.languages}
            property="name"
            func={this.selectEntityToCreate.bind(this, {
              directory: "film_languages",
              entityName: "filmLanguage",
              key: "languageId",
              otherArrays: ["languages"],
            })}
            onClose={Common.closeModals.bind(this)}
          />
          <ModalSelect
            isOpen={this.state.alternateAudioModalOpen}
            options={this.state.audioLanguages}
            property="name"
            func={this.selectEntityToCreate.bind(this, {
              directory: "alternate_audios",
              entityName: "alternateAudio",
              key: "languageId",
              otherArrays: ["audioLanguages"],
            })}
            onClose={Common.closeModals.bind(this)}
          />
          <ModalSelect
            isOpen={this.state.alternateSubsModalOpen}
            options={this.state.subtitleLanguages}
            property="name"
            func={this.selectEntityToCreate.bind(this, {
              directory: "alternate_subs",
              entityName: "alternateSub",
              key: "languageId",
              otherArrays: ["subtitleLanguages"],
            })}
            onClose={Common.closeModals.bind(this)}
          />
          <ModalSelect
            isOpen={this.state.genresModalOpen}
            options={this.state.genres}
            property="name"
            func={this.selectEntityToCreate.bind(this, {
              directory: "film_genres",
              entityName: "filmGenre",
              key: "genreId",
              otherArrays: ["genres"],
            })}
            onClose={Common.closeModals.bind(this)}
          />
          <ModalSelect
            isOpen={this.state.topicsModalOpen}
            options={this.state.topics}
            property="name"
            func={this.selectEntityToCreate.bind(this, {
              directory: "film_topics",
              entityName: "filmTopic",
              key: "topicId",
              otherArrays: ["topics"],
            })}
            onClose={Common.closeModals.bind(this)}
          />
          <ModalSelect
            isOpen={this.state.relatedFilmsModalOpen}
            options={this.state.otherFilms}
            property="title"
            func={this.selectEntityToCreate.bind(this, {
              directory: "related_films",
              entityName: "relatedFilm",
              key: "otherFilmId",
              otherArrays: ["otherFilms"],
            })}
            onClose={Common.closeModals.bind(this)}
          />
          <ModalSelect
            isOpen={this.state.formatsModalOpen}
            options={this.state.formats}
            property="name"
            func={this.selectEntityToCreate.bind(this, {
              directory: "film_formats",
              entityName: "filmFormat",
              key: "formatId",
              otherArrays: ["formats"],
            })}
            onClose={Common.closeModals.bind(this)}
          />
          <ModalSelect
            isOpen={this.state.amazonGenresModalOpen}
            options={this.state.amazonGenres}
            property="code"
            func={this.selectEntityToCreate.bind(this, {
              directory: "amazon_genre_films",
              entityName: "amazonGenreFilm",
              key: "amazonGenreId",
              otherArrays: ["amazonGenres"],
            })}
            onClose={Common.closeModals.bind(this)}
          />
          <ModalSelect
            isOpen={this.state.amazonLanguagesModalOpen}
            options={this.state.amazonLanguages}
            property="name"
            func={this.selectEntityToCreate.bind(this, {
              directory: "amazon_language_films",
              entityName: "amazonLanguageFilm",
              key: "amazonLanguageId",
              otherArrays: ["amazonLanguages"],
            })}
            onClose={Common.closeModals.bind(this)}
          />
          <Modal
            isOpen={this.state.episodeModalOpen}
            onRequestClose={Common.closeModals.bind(this)}
            contentLabel="Modal"
            style={Common.newEntityModalStyles({ width: 1000 }, 1)}
          >
            <NewEntity
              context={this.props.context}
              entityName="episode"
              initialEntity={{
                filmId: film.id,
                title: "",
                length: "",
                episodeNumber: "",
                seasonNumber: "",
              }}
              redirectAfterCreate={true}
            />
          </Modal>
          <Modal
            isOpen={this.state.dvdModalOpen}
            onRequestClose={Common.closeModals.bind(this)}
            contentLabel="Modal"
            style={Common.newEntityModalStyles({ width: 500 }, 1)}
          >
            <NewEntity
              context={this.props.context}
              entityName="dvd"
              initialEntity={{
                featureFilmId: film.id,
                dvdTypeId: film.id && dvds.length < 6 ? dvdTypes[0].id : 1,
              }}
              passData={{ dvdTypes }}
              buttonText="Add DVD"
              redirectAfterCreate={true}
            />
          </Modal>
          <Modal
            isOpen={this.state.quoteModalOpen}
            onRequestClose={Common.closeModals.bind(this)}
            contentLabel="Modal"
            style={Common.newEntityModalStyles({ width: 750, height: 428 })}
          >
            <NewEntity
              context={this.props.context}
              entityName="quote"
              initialEntity={{
                filmId: film.id,
                text: "",
                author: "",
                publication: "",
              }}
              callback={this.createCallback.bind(this)}
            />
          </Modal>
          <Modal
            isOpen={this.state.laurelModalOpen}
            onRequestClose={Common.closeModals.bind(this)}
            contentLabel="Modal"
            style={Common.newEntityModalStyles({ width: 750 }, 2)}
          >
            <NewEntity
              context={this.props.context}
              entityName="laurel"
              initialEntity={{
                filmId: film.id,
                result: "Official Selection",
                awardName: "",
                festival: "",
              }}
              callback={this.createCallback.bind(this)}
            />
          </Modal>
          <Modal
            isOpen={this.state.directorModalOpen}
            onRequestClose={Common.closeModals.bind(this)}
            contentLabel="Modal"
            style={Common.newEntityModalStyles({ width: 750 }, 1)}
          >
            <NewEntity
              context={this.props.context}
              entityName="director"
              initialEntity={{ filmId: film.id, firstName: "", lastName: "" }}
              callback={this.createCallback.bind(this)}
            />
          </Modal>
          <Modal
            isOpen={this.state.actorModalOpen}
            onRequestClose={Common.closeModals.bind(this)}
            contentLabel="Modal"
            style={Common.newEntityModalStyles({ width: 750 }, 1)}
          >
            <NewEntity
              context={this.props.context}
              entityName="actor"
              initialEntity={{
                actorableId: film.id,
                actorableType: "Film",
                firstName: "",
                lastName: "",
              }}
              callback={this.createCallback.bind(this)}
            />
          </Modal>
          <Modal
            isOpen={this.state.newDigitalRetailerModalOpen}
            onRequestClose={Common.closeModals.bind(this)}
            contentLabel="Modal"
            style={Common.newEntityModalStyles({ width: 750 }, 1)}
          >
            <NewEntity
              context={this.props.context}
              entityName="digitalRetailerFilm"
              initialEntity={{
                filmId: film.id,
                url: "",
                digitalRetailerId: "1",
              }}
              fetchData={["digitalRetailers"]}
              callback={this.createCallback.bind(this)}
              buttonText={"Add Digital Retailer"}
            />
          </Modal>
          <Modal
            isOpen={this.state.newEduPlatformModalOpen}
            onRequestClose={Common.closeModals.bind(this)}
            contentLabel="Modal"
            style={Common.newEntityModalStyles({ width: 1000 }, 1)}
          >
            <NewEntity
              context={this.props.context}
              entityName="eduPlatformFilm"
              initialEntity={{
                filmId: this.state.film.id,
                url: "",
                eduPlatformId: "1",
              }}
              fetchData={["eduPlatforms"]}
              callback={this.createCallback.bind(this)}
            />
          </Modal>
          <Modal
            isOpen={this.state.newAltLengthModalOpen}
            onRequestClose={Common.closeModals.bind(this)}
            contentLabel="Modal"
            style={Common.newEntityModalStyles({ width: 500 }, 1)}
          >
            <NewEntity
              context={this.props.context}
              entityName="alternateLength"
              initialEntity={{ length: "", filmId: this.state.film.id }}
              callback={this.createCallback.bind(this)}
            />
          </Modal>
          <Modal
            isOpen={this.state.newRightsModalOpen}
            onRequestClose={Common.closeModals.bind(this)}
            contentLabel="Modal"
            style={NewRightsModalStyles}
          >
            <FilmRightsNew
              context={this.props.context}
              filmId={this.state.film.id}
              callback={this.newFilmRightsCallback.bind(this)}
            />
          </Modal>
          <Modal
            isOpen={this.state.changeDatesModalOpen}
            onRequestClose={Common.closeModals.bind(this)}
            contentLabel="Modal"
            style={ChangeDatesModalStyles}
          >
            <FilmRightsChangeDates
              context={this.props.context}
              filmId={this.state.film.id}
              updateChangedDates={this.updateChangedDates.bind(this)}
            />
          </Modal>
          <Modal
            isOpen={this.state.copyModalOpen}
            onRequestClose={Common.closeModals.bind(this)}
            contentLabel="Modal"
            style={Common.newEntityModalStyles({ width: 900 }, 1)}
          >
            <CopyEntity
              context={this.props.context}
              entityName="film"
              initialEntity={{
                title: "",
                year: "",
                length: "",
                filmType: film.filmType,
                copyFrom: film.id,
              }}
            />
          </Modal>
          <ConfirmModal
            isOpen={this.state.artworkModalOpen}
            headerText="Update artwork for all films now?"
            confirm={() => this.confirmUpdateArtwork()}
            cancel={Common.closeModals.bind(this)}
          />
          <ConfirmDelete
            isOpen={deleteModalOpen}
            entityName="film"
            confirmDelete={Details.confirmDelete.bind(this)}
            closeModal={Common.closeModals.bind(this)}
          />
          {Common.renderJobModal.call(this, this.state.job)}
        </div>
        <style jsx>{`
          .tabs-row {
            margin-left: 60px;
            display: inline-block;
            font-size: 14px;
            vertical-align: bottom;
          }
          .tabs-row.tv {
            margin-left: 30px;
            font-size: 11px;
          }
          .tabs-row.tv @media (min-width: 1450px) {
            margin-left: 60px;
            font-size: 14px;
          }
          div.key-art {
            width: 100%;
            height: 74px;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: 50%;
            cursor: pointer;
          }
          div.key-art.empty {
            border: 1px solid #e4e9ed;
            background-color: #fafafa;
          }
        `}</style>
      </>
    );
  }

  renderTopTab(label) {
    const { film, tab } = this.state;
    if (film.id) {
      if (
        [
          "General",
          "Contract",
          "Educational",
          "DVDs",
          "Bookings",
          "Marketing",
        ].indexOf(label) > -1 ||
        (["Statements", "Sublicensing"].indexOf(label) > -1 &&
          (film.filmType === "Feature" || film.filmType === "TV Series")) ||
        (label === "Episodes" && film.filmType === "TV Series")
      ) {
        return (
          <>
            <div
              className={
                "tab" + (tab === label.toLowerCase() ? " selected" : "")
              }
              onClick={this.clickTab.bind(this)}
            >
              {label}
            </div>
            <style jsx>{`
              .tab {
                float: left;
                background-color: white;
                vertical-align: bottom;
                padding: 20px 20px 15px 20px;
                border-top-right-radius: 10px;
                border-top-left-radius: 10px;
                user-select: none;
              }

              .tab:not(:first-of-type) {
                margin-left: 5px;
              }

              .tab:not(.selected) {
                margin-bottom: 2px;
                padding-bottom: 13px;
              }

              .tab:not(.selected):hover {
                cursor: pointer;
              }
            `}</style>
          </>
        );
      }
    }
  }

  renderTab(tab) {
    const {
      actors,
      alternateAudios,
      alternateLengths,
      alternateSubs,
      amazonGenreFilms,
      amazonLanguageFilms,
      crossedFilms,
      directors,
      dvds,
      episodes,
      film,
      filmCountries,
      filmFormats,
      filmGenres,
      filmLanguages,
      filmTopics,
      labels,
      laurels,
      quotes,
      schedule,
      searchText,
      spinner,
      subRights,
    } = this.state;
    if (tab === "contract") {
      return (
        <div>
          <hr />
          <div className="row">
            {Details.renderField.bind(this)({
              columnWidth: 5,
              entity: "film",
              property: "licensorId",
              type: "modal",
              optionDisplayProperty: "name",
              columnHeader: "Licensor",
            })}
            {Details.renderField.bind(this)({
              columnWidth: 2,
              entity: "film",
              property: "startDate",
              readOnly: !FM.user.hasAdminAccess,
            })}
            {Details.renderField.bind(this)({
              columnWidth: 2,
              entity: "film",
              property: "endDate",
              readOnly: !FM.user.hasAdminAccess,
            })}
            {Details.renderField.bind(this)({
              columnWidth: 3,
              entity: "film",
              property: "sageId",
              columnHeader: "Sage ID",
              readOnly: !FM.user.hasAdminAccess,
            })}
          </div>
          {this.renderRoyaltyFields()}
          <hr />
        </div>
      );
    } else if (tab === "episodes") {
      return (
        <div>
          <hr />
          <Table
            columns={[
              {
                name: "seasonNumber",
                header: "Season",
              },
              {
                name: "episodeNumber",
                header: "Episode",
              },
              {
                name: "title",
              },
            ]}
            rows={episodes}
            sortable={false}
            urlPrefix="episodes"
            style={{ marginBottom: 30 }}
          />
          <OutlineButton
            text="Add Episode"
            onClick={() => {
              this.setState({ episodeModalOpen: true });
            }}
            style={{ marginBottom: "30px" }}
          />
          <hr />
        </div>
      );
    } else if (tab === "dvds" && film.filmType !== "Short") {
      return (
        <div>
          <hr />
          <Table
            columns={[
              {
                name: "type",
                bold: true,
              },
            ]}
            rows={dvds}
            sortable={false}
            urlPrefix="dvds"
            style={{ marginBottom: 30 }}
          />
          {dvds.length < 6 && (
            <OutlineButton
              text="Add DVD"
              onClick={() => {
                this.setState({ dvdModalOpen: true });
              }}
              style={{ marginBottom: "30px" }}
            />
          )}
          <hr />
        </div>
      );
    } else if (tab === "dvds" && film.filmType === "Short") {
      return (
        <div>
          <hr />
          <Table
            columns={[
              {
                name: "featureTitle",
              },
              {
                name: "type",
              },
            ]}
            rows={dvds}
            sortable={false}
            urlPrefix="dvds"
            style={{ marginBottom: 30 }}
          />
          <hr />
        </div>
      );
    } else if (tab === "sublicensing") {
      return (
        <div>
          <hr />
          <p className="section-header">Sublicensed Rights</p>
          <div className="row">
            <div className="col-xs-12">
              <Table
                columns={[
                  {
                    name: "sublicensorName",
                    header: "Sublicensor",
                  },
                  {
                    name: "rightName",
                    header: "Right",
                  },
                  {
                    name: "territory",
                  },
                  {
                    name: "startDate",
                  },
                  {
                    name: "endDate",
                  },
                  {
                    name: "exclusive",
                  },
                ]}
                rows={subRights}
                links={false}
                style={{ marginBottom: 30 }}
              />
            </div>
          </div>
          <hr />
        </div>
      );
    } else if (tab === "bookings") {
      var joinedBookings = this.state.bookings.concat(
        this.state.virtualBookings,
      );
      return (
        <>
          <div>
            <hr />
            <p className="section-header">Screening Formats</p>
            <div className="row">
              <div className="col-xs-6">
                <ListBox
                  entityName="format"
                  displayProperty="format"
                  entities={alphabetizeArrayOfObjects(filmFormats, "format")}
                  clickDelete={(filmFormat) => {
                    this.deleteFromList({
                      id: filmFormat.id,
                      directory: "film_formats",
                      otherArrays: ["formats"],
                    });
                  }}
                  clickAdd={() => {
                    this.setState({ formatsModalOpen: true });
                  }}
                  style={{ marginBottom: 30 }}
                />
              </div>
            </div>
            <hr />
            <div className="row">
              {Details.renderField.bind(this)({
                columnWidth: 2,
                entity: "film",
                property: "rating",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 2,
                entity: "film",
                property: "aspectRatio",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 4,
                entity: "film",
                property: "soundConfig",
              })}
            </div>
            <hr />
            <p className="section-header">Bookings</p>
            <p className="total-box-office">
              Total Box Office: {film.totalBoxOffice}
            </p>
            <p className="missing-reports">
              Missing Box Office Reports: {film.missingReports}
            </p>
            <div style={{ position: "relative", marginBottom: 40 }}>
              <ul className="bookings-count-list clearfix">
                <li>Theatrical: {film.theatricalCount}</li>
                <li>Festival: {film.festivalCount}</li>
                <li>Non-Theatrical: {film.nonTheatricalCount}</li>
                <li>Virtual: {film.virtualCount}</li>
              </ul>
              <SearchBar
                onChange={FM.changeSearchText.bind(this)}
                value={searchText || ""}
                style={{
                  float: "none",
                  position: "absolute",
                  right: 0,
                }}
              />
            </div>
            <Table
              rows={joinedBookings}
              searchText={this.state.searchText}
              columns={[
                { name: "startDate", width: 180, date: true },
                { name: "venue" },
                { name: "type", width: 200 },
                {
                  name: "owed",
                  displayFunction: (booking) =>
                    booking.type === "Virtual"
                      ? "N/A"
                      : booking.valid
                        ? booking.owed
                        : "Invalid",
                },
              ]}
              style={{ marginBottom: 30 }}
              clickRow={(booking) => {
                if (booking.type === "Virtual") {
                  this.redirect.call(this, "virtual_bookings", booking.id);
                } else {
                  this.redirect.call(this, "bookings", booking.id);
                }
              }}
            />
            <hr />
          </div>
          <style>{`
            p.total-box-office {
              margin-bottom: 10px;
            }
            p.missing-reports {
              margin-bottom: 30px;
            }
            ul.bookings-count-list {
              display: inline-block;
              font-family: 'TeachableSans-Bold';
              font-size: 14px;
            }
            ul.bookings-count-list li {
              float: left;
              border: 1px solid #E4E9ED;
              border-radius: 10px;
              padding: 10px 20px;
            }
            ul.bookings-count-list li:not(:last-of-type) {
              margin-right: 20px;
            }
          `}</style>
        </>
      );
    } else if (tab === "statements") {
      return (
        <div>
          <hr />
          <div className="row">
            {Details.renderSwitch.bind(this)({
              columnWidth: 3,
              entity: "film",
              property: "exportReports",
            })}
            {Details.renderSwitch.bind(this)({
              columnWidth: 3,
              entity: "film",
              property: "sendReports",
              hidden: !this.state.film.exportReports,
            })}
            {Details.renderSwitch.bind(this)({
              columnWidth: 3,
              entity: "film",
              property: "ignoreSageId",
              columnHeader: "Ignore Sage ID on Import",
            })}
          </div>
          <hr style={{ marginTop: 30 }} />
          <div className="row">
            <div className="col-xs-6">
              <p className="section-header">Crossed Films</p>
              <ListBox
                entityName="crossedFilm"
                buttonText="Add Film"
                displayProperty="title"
                entities={crossedFilms}
                clickDelete={(crossedFilm) => {
                  this.deleteFromList({
                    id: crossedFilm.id,
                    directory: "crossed_films",
                    otherArrays: ["otherCrossedFilms"],
                  });
                }}
                clickAdd={() => {
                  this.setState({ crossedFilmModalOpen: true });
                }}
                style={{ marginBottom: 30 }}
              />
            </div>
          </div>
          <hr />
          <Table
            columns={[
              {
                name: "year",
              },
              {
                name: "quarter",
              },
            ]}
            rows={this.state.reports}
            sortable={false}
            urlPrefix="royalty_reports"
            style={{ marginBottom: 30 }}
          />
          <hr />
        </div>
      );
    } else if (tab === "general") {
      return (
        <div>
          <hr />
          <div className="row">
            <div className="col-xs-6">
              <h2>Director(s):</h2>
              <ListBoxReorderable
                entityName="director"
                entities={directors}
                displayFunction={(director) =>
                  `${director.firstName} ${director.lastName}`
                }
                clickAdd={() => {
                  this.setState({ directorModalOpen: true });
                }}
                clickDelete={(id) => {
                  this.deleteFromList({ id, directory: "directors" });
                }}
                style={{ marginBottom: "30px" }}
              />
            </div>
            {Details.renderDropDown.bind(this)({
              columnWidth: 2,
              entity: "film",
              property: "labelId",
              columnHeader: "Label",
              options: labels,
              optionDisplayProperty: "name",
              optionSortProperty: "id",
            })}
            {Details.renderField.bind(this)({
              columnWidth: 2,
              entity: "film",
              property: "year",
            })}
            {Details.renderField.bind(this)({
              columnWidth: 2,
              entity: "film",
              property: "length",
              columnHeader: "Length (minutes)",
            })}
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-6">
              <p className="section-header">Countries</p>
              <ListBoxReorderable
                entityName="country"
                entityNamePlural="countries"
                entities={filmCountries}
                displayProperty="country"
                clickAdd={() => {
                  this.setState({ countriesModalOpen: true });
                }}
                clickDelete={(id) => {
                  this.deleteFromList({
                    id,
                    directory: "film_countries",
                    otherArrays: ["countries"],
                  });
                }}
                style={{ marginBottom: "30px" }}
              />
            </div>
            <div className="col-xs-6">
              <p className="section-header">Languages</p>
              <ListBoxReorderable
                entityName="language"
                entities={filmLanguages}
                displayProperty="language"
                clickAdd={() => {
                  this.setState({ languagesModalOpen: true });
                }}
                clickDelete={(id) => {
                  this.deleteFromList({
                    id,
                    directory: "film_languages",
                    otherArrays: ["languages"],
                  });
                }}
                style={{ marginBottom: "30px" }}
              />
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-6">
              <p className="section-header">Cast</p>
              <ListBoxReorderable
                entityName="actor"
                entities={actors}
                displayFunction={(actor) =>
                  `${actor.firstName} ${actor.lastName}`
                }
                clickAdd={() => {
                  this.setState({ actorModalOpen: true });
                }}
                clickDelete={(id) => {
                  this.deleteFromList({ id, directory: "actors" });
                }}
                style={{ marginBottom: "30px" }}
              />
            </div>
            <div
              className={
                "col-xs-3" +
                (this.state.film.filmType === "Short" ? " hidden" : "")
              }
            >
              <p className="section-header">Release Dates</p>
              {Details.renderField.bind(this)({
                entity: "film",
                property: "theatricalRelease",
                readOnly: !FM.user.hasAdminAccess,
              })}
              {Details.renderField.bind(this)({
                entity: "film",
                property: "svodRelease",
                columnHeader: "SVOD Release",
                readOnly: !FM.user.hasAdminAccess,
              })}
              {Details.renderField.bind(this)({
                entity: "film",
                property: "tvodRelease",
                columnHeader: "TVOD/EST Release",
                readOnly: !FM.user.hasAdminAccess,
              })}
            </div>
            <div
              className={
                "col-xs-3" +
                (this.state.film.filmType === "Short" ? " hidden" : "")
              }
            >
              <div style={{ width: "100%", height: "47px" }}></div>
              {Details.renderField.bind(this)({
                entity: "film",
                property: "fmPlusRelease",
                columnHeader: "FM Plus Release",
                readOnly: !FM.user.hasAdminAccess,
              })}
              <div className={film.filmType === "Short" ? " hidden" : ""}>
                {Details.renderField.bind(this)({
                  entity: "film",
                  property: "avodRelease",
                  columnHeader: "AVOD Release",
                  readOnly: !FM.user.hasAdminAccess,
                })}
                {Details.renderField.bind(this)({
                  entity: "film",
                  property: "clubDate",
                  readOnly: !FM.user.hasAdminAccess,
                })}
              </div>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-12">
              <p className="section-header">Schedule</p>
              <ListBox
                style={{ marginBottom: "60px" }}
                entities={schedule}
                displayFunction={(revenueStream) =>
                  `${revenueStream.label} - ${revenueStream.date_string + (revenueStream.tentative ? " (?)" : "")}`
                }
                styleIf={[
                  {
                    func: (revenueStream) => revenueStream.tentative,
                    style: {
                      color: "red",
                      fontStyle: "italic",
                    },
                  },
                ]}
              />
            </div>
          </div>
        </div>
      );
    } else if (tab === "marketing") {
      if (film.filmType === "Short") {
        return (
          <div>
            <hr />
            <div className="row">
              {Details.renderField.bind(this)({
                columnWidth: 6,
                entity: "film",
                property: "fmPlusUrl",
                columnHeader: "Film Movement Plus Link",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 3,
                entity: "film",
                property: "imdbId",
                columnHeader: "IMDB ID",
              })}
            </div>
            <div className="row">
              {Details.renderField.bind(this)({
                type: "textbox",
                columnWidth: 12,
                entity: "film",
                property: "synopsis",
                rows: 8,
                characterCount: true,
              })}
            </div>
          </div>
        );
      } else {
        return (
          <>
            <div>
              <hr />
              <div className="row">
                {Details.renderSwitch.bind(this)({
                  columnWidth: 2,
                  entity: "film",
                  property: "active",
                  columnHeader: "Active on Website",
                })}
                {Details.renderSwitch.bind(this)({
                  columnWidth: 2,
                  entity: "film",
                  property: "eduPage",
                  columnHeader: "Educational Page",
                })}
                {Details.renderSwitch.bind(this)({
                  columnWidth: 2,
                  entity: "film",
                  property: "videoPage",
                  columnHeader: "Video Page",
                })}
                {Details.renderSwitch.bind(this)({
                  columnWidth: 2,
                  entity: "film",
                  property: "nowPlayingPage",
                  columnHeader: "Now Playing Page",
                })}
                {Details.renderSwitch.bind(this)({
                  columnWidth: 2,
                  entity: "film",
                  property: "dayAndDate",
                  columnHeader: "Day and Date",
                })}
              </div>
              <hr style={{ marginTop: 30 }} />
              <div className="row">
                {Details.renderField.bind(this)({
                  type: "textbox",
                  columnWidth: 12,
                  entity: "film",
                  property: "synopsis",
                  rows: 8,
                  characterCount: true,
                })}
                {Details.renderField.bind(this)({
                  type: "textbox",
                  columnWidth: 12,
                  entity: "film",
                  property: "vodSynopsis",
                  rows: 8,
                  columnHeader: "Synopsis - 400 characters",
                  characterCount: true,
                })}
                {Details.renderField.bind(this)({
                  type: "textbox",
                  columnWidth: 12,
                  entity: "film",
                  property: "shortSynopsis",
                  rows: 4,
                  columnHeader: "Synopsis - 240 characters",
                  characterCount: true,
                })}
                {Details.renderField.bind(this)({
                  type: "textbox",
                  columnWidth: 12,
                  entity: "film",
                  property: "logline",
                  rows: 2,
                  columnHeader: "Synopsis - 150 characters",
                  characterCount: true,
                })}
              </div>
              <hr style={{ marginTop: 30 }} />
              <div className="row">
                <div className="col-xs-12">
                  <p className="section-header">Laurels</p>
                  <ListBoxReorderable
                    entityName="laurel"
                    entities={laurels}
                    displayFunction={(laurel) =>
                      `${laurel.result}${laurel.awardName ? ` - ${laurel.awardName}` : ""} - ${laurel.festival}`
                    }
                    clickAdd={() => {
                      this.setState({ laurelModalOpen: true });
                    }}
                    clickDelete={(id) => {
                      this.deleteFromList({ id, directory: "laurels" });
                    }}
                    style={{ marginBottom: "30px" }}
                  />
                  <div className="row row-of-checkboxes badge-checkboxes">
                    {Details.renderSwitch.bind(this)({
                      columnWidth: 3,
                      entity: "film",
                      property: "certifiedFresh",
                    })}
                    {Details.renderSwitch.bind(this)({
                      columnWidth: 3,
                      entity: "film",
                      property: "criticsPick",
                      columnHeader: "Critic's Pick",
                    })}
                  </div>
                </div>
              </div>
              <hr style={{ marginTop: 30 }} />
              <div className="row">
                <div className="col-xs-12 quotes-list">
                  <p className="section-header quotes-header">Quotes</p>
                  <div
                    className="quote-drop-zone"
                    data-index="-1"
                    data-section="quotes"
                  ></div>
                  {sortArrayOfObjects(quotes, "order").map((quote, index) => {
                    let bottomLine = "";
                    bottomLine += quote.author ? quote.author : "";
                    bottomLine += quote.author && quote.publication ? ", " : "";
                    bottomLine += quote.publication ? quote.publication : "";
                    return (
                      <div key={quote.id} className="quote-container">
                        <div
                          className="quote"
                          onClick={this.clickQuote}
                          data-id={quote.id}
                          data-index={index}
                          data-section={"quotes"}
                        >
                          <p data-id={quote.id}>
                            {FM.user.id === 1 ? (
                              <span>({quote.order})&nbsp;&nbsp;</span>
                            ) : null}
                            &quot;{quote.text}&quot;
                          </p>
                          <p data-id={quote.id}>- {bottomLine}</p>
                          <div
                            className="handle"
                            onMouseDown={this.mouseDownHandle.bind(this)}
                            onMouseUp={this.mouseUpHandle.bind(this)}
                          ></div>
                        </div>
                        <div
                          className="quote-drop-zone"
                          data-index={index}
                          data-section="quotes"
                        ></div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="row">
                <div className="col-xs-12">
                  <OutlineButton
                    text="Add Quote"
                    onClick={() => {
                      this.setState({ quoteModalOpen: true });
                    }}
                    style={{ marginBottom: "30px" }}
                  />
                </div>
              </div>
              <hr />
              <div className="row">
                <div className="col-xs-6">
                  <p className="section-header">Genres</p>
                  <ListBoxReorderable
                    entityName="genre"
                    entities={filmGenres}
                    displayProperty="genre"
                    clickAdd={() => {
                      this.setState({ genresModalOpen: true });
                    }}
                    clickDelete={(id) => {
                      this.deleteFromList({
                        id,
                        directory: "film_genres",
                        otherArrays: ["genres"],
                      });
                    }}
                    style={{ marginBottom: "30px" }}
                  />
                </div>
                <div className="col-xs-6">
                  <p className="section-header">Related Films</p>
                  <ListBoxReorderable
                    entityName="relatedFilm"
                    entities={this.state.relatedFilms}
                    displayProperty="title"
                    clickAdd={() => {
                      this.setState({ relatedFilmsModalOpen: true });
                    }}
                    clickDelete={(id) => {
                      this.deleteFromList({
                        id,
                        directory: "related_films",
                        otherArrays: ["otherFilms"],
                      });
                    }}
                    style={{ marginBottom: "30px" }}
                  />
                </div>
              </div>
              <hr />
              <div className="row">
                <div className="col-xs-4">
                  <p className="section-header">Alternate Lengths</p>
                  <ListBox
                    entityName="alternateLength"
                    buttonText="Add Length"
                    entities={alternateLengths}
                    displayProperty="length"
                    clickAdd={() => {
                      this.setState({ newAltLengthModalOpen: true });
                    }}
                    clickDelete={(length) => {
                      this.deleteFromList({
                        id: length.id,
                        directory: "alternate_lengths",
                      });
                    }}
                    style={{ marginBottom: "30px" }}
                  />
                </div>
                <div className="col-xs-4">
                  <p className="section-header">Alternate Audio Tracks</p>
                  <ListBox
                    entityName="alternateAudio"
                    buttonText="Add Audio Track"
                    entities={alternateAudios}
                    displayProperty="languageName"
                    clickAdd={() => {
                      this.setState({ alternateAudioModalOpen: true });
                    }}
                    clickDelete={(audio) => {
                      this.deleteFromList({
                        id: audio.id,
                        directory: "alternate_audios",
                        otherArrays: ["audioLanguages"],
                      });
                    }}
                    style={{ marginBottom: "30px" }}
                  />
                </div>
                <div className="col-xs-4">
                  <p className="section-header">Alternate Subtitles</p>
                  <ListBox
                    entityName="alternateSub"
                    buttonText="Add Subtitles"
                    entities={alternateSubs}
                    displayProperty="languageName"
                    clickAdd={() => {
                      this.setState({ alternateSubsModalOpen: true });
                    }}
                    clickDelete={(sub) => {
                      this.deleteFromList({
                        id: sub.id,
                        directory: "alternate_subs",
                        otherArrays: ["audioLanguages"],
                      });
                    }}
                    style={{ marginBottom: "30px" }}
                  />
                </div>
              </div>
              <hr />
              <div className="row">
                <div className="col-xs-12">
                  <p className="section-header">Digital Retailers</p>
                  <Table
                    rows={this.state.digitalRetailerFilms}
                    urlPrefix="digital_retailer_films"
                    columns={[
                      { name: "name", width: 200, bold: true },
                      { name: "url", header: "URL" },
                    ]}
                    style={{ marginBottom: 30 }}
                  />
                  <OutlineButton
                    onClick={() => {
                      this.setState({ newDigitalRetailerModalOpen: true });
                    }}
                    text="Add Digital Retailer"
                    style={{ marginBottom: 30 }}
                  />
                </div>
              </div>
              <hr />
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: "film",
                  property: "fmPlusUrl",
                  columnHeader: "Film Movement Plus Link",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: "film",
                  property: "standaloneSite",
                })}
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: "film",
                  property: "vimeoTrailer",
                  columnHeader: "Vimeo Trailer Link",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: "film",
                  property: "youtubeTrailer",
                  columnHeader: "YouTube Trailer Link",
                })}
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: "film",
                  property: "proresTrailer",
                  columnHeader: "ProRes Trailer Link",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: "film",
                  property: "facebookLink",
                })}
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: "film",
                  property: "twitterLink",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: "film",
                  property: "instagramLink",
                })}
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: "film",
                  property: "rentalUrl",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "film",
                  property: "rentalPrice",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "film",
                  property: "rentalDays",
                })}
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "film",
                  property: "imdbId",
                  columnHeader: "IMDB ID",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "film",
                  property: "tvRating",
                  columnHeader: "TV Rating",
                })}
              </div>
              <hr style={{ marginTop: 30 }} />
              <div className="row">
                <div className="col-xs-6">
                  <p className="section-header">Amazon Genres</p>
                  <ListBox
                    entityName="amazonGenre"
                    displayProperty="code"
                    entities={alphabetizeArrayOfObjects(
                      amazonGenreFilms,
                      "code",
                    )}
                    clickDelete={(amazonGenreFilm) => {
                      this.deleteFromList({
                        id: amazonGenreFilm.id,
                        directory: "amazon_genre_films",
                        otherArrays: ["amazonGenres"],
                      });
                    }}
                    clickAdd={() => {
                      this.setState({ amazonGenresModalOpen: true });
                    }}
                    style={{ marginBottom: 30 }}
                  />
                </div>
                <div className="col-xs-6">
                  <p className="section-header">Amazon Language</p>
                  <ListBox
                    entityName="amazonLanguage"
                    displayProperty="name"
                    entities={alphabetizeArrayOfObjects(
                      amazonLanguageFilms,
                      "name",
                    )}
                    clickDelete={(amazonLanguageFilm) => {
                      this.deleteFromList({
                        id: amazonLanguageFilm.id,
                        directory: "amazon_language_films",
                        otherArrays: ["amazonLanguages"],
                      });
                    }}
                    clickAdd={
                      spinner || amazonLanguageFilms.length > 0
                        ? null
                        : () => {
                            this.setState({ amazonLanguagesModalOpen: true });
                          }
                    }
                    style={{ marginBottom: 30 }}
                  />
                </div>
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: "film",
                  property: "xmlMecFilename",
                  columnHeader: "MEC Filename",
                  placeholder: film.xmlExportFilenameDefaults.mec,
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: "film",
                  property: "xmlMmcFilename",
                  columnHeader: "MMC Filename",
                  placeholder: film.xmlExportFilenameDefaults.mmc,
                })}
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: "film",
                  property: "xmlVideoFilename",
                  columnHeader: "Video Filename",
                  placeholder: film.xmlExportFilenameDefaults.video,
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: "film",
                  property: "xmlSubtitlesFilename",
                  columnHeader: "Subtitles Filename",
                  placeholder: film.xmlExportFilenameDefaults.subtitles,
                })}
              </div>
              <div className="row" style={{ height: 103 }}>
                {Details.renderSwitch.bind(this)({
                  columnWidth: 2,
                  entity: "film",
                  property: "xmlIncludeCaptions",
                  columnHeader: "Include Captions",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: "film",
                  property: "xmlCaptionFilename",
                  columnHeader: "Captions Filename",
                  placeholder: film.xmlExportFilenameDefaults.captions,
                  hidden: !film.xmlIncludeCaptions,
                })}
              </div>
              <div className="row" style={{ height: 103 }}>
                {Details.renderSwitch.bind(this)({
                  columnWidth: 2,
                  entity: "film",
                  property: "xmlIncludeTrailer",
                  columnHeader: "Include Trailer",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: "film",
                  property: "xmlTrailerFilename",
                  columnHeader: "Trailer Filename",
                  placeholder: film.xmlExportFilenameDefaults.trailer,
                  hidden: !film.xmlIncludeTrailer,
                })}
              </div>
              <div className="row">
                <div className="col-xs-12">
                  <Button
                    text="Export MEC File"
                    marginRight
                    onClick={() => this.exportMEC()}
                  />
                  <Button
                    text="Export MMC File"
                    marginRight
                    onClick={() => this.exportMMC()}
                  />
                </div>
              </div>
              <hr style={{ marginTop: 30 }} />
            </div>
            <style jsx>{`
              .badge-checkboxes {
                margin-bottom: 10px;
              }
              .quotes-header {
                margin-bottom: 10px !important;
              }
              .quote-container .quote {
                position: relative;
                border: solid 1px #e4e9ed;
                border-radius: 3px;
                padding: 15px;
                padding-right: 80px;
                cursor: pointer;
              }
              .quote p {
                font-family: "TeachableSans-Medium";
              }
              .quote p:first-of-type {
                margin-bottom: 10px;
              }
              .quote-drop-zone {
                height: 20px;
              }
              .quote-drop-zone.highlight {
                border: dashed 1px black;
              }
              .quote .handle {
                display: inline-block;
                position: absolute;
                top: calc(50% - 8px);
                right: 30px;
                background-position: 50%;
                background-size: 17px;
                background-repeat: no-repeat;
                width: 17px;
                height: 17px;
                cursor: grab;
              }
            `}</style>
          </>
        );
      }
    } else if (this.state.tab === "educational") {
      return (
        <>
          <div>
            <hr />
            <div className="row">
              {Details.renderField.bind(this)({
                type: "textbox",
                columnWidth: 12,
                entity: "film",
                property: "institutionalSynopsis",
                rows: 8,
                characterCount: true,
              })}
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-2">
                <p className="section-header">Pricing</p>
                <div className="edu-subheader-container">
                  <p>Pre-Street</p>
                  <p>Non-Member</p>
                </div>
                {Details.renderField.bind(this)({
                  entity: "film",
                  property: "msrpPreStreet",
                  columnHeader: "SRP",
                })}
                {Details.renderField.bind(this)({
                  entity: "film",
                  property: "pprPreStreet",
                  columnHeader: "PPR",
                })}
                {Details.renderField.bind(this)({
                  entity: "film",
                  property: "drlPreStreet",
                  columnHeader: "DRL",
                })}
                {Details.renderField.bind(this)({
                  entity: "film",
                  property: "pprDrlPreStreet",
                  columnHeader: "PPR + DRL",
                })}
              </div>
              <div className="col-xs-2">
                <div style={{ width: "100%", height: "47px" }}></div>
                <div className="edu-subheader-container">
                  <p>Pre-Street</p>
                  <p>Member</p>
                </div>
                {Details.renderField.bind(this)({
                  entity: "film",
                  property: "msrpPreStreetMember",
                  columnHeader: "SRP",
                })}
                {Details.renderField.bind(this)({
                  entity: "film",
                  property: "pprPreStreetMember",
                  columnHeader: "PPR",
                })}
                {Details.renderField.bind(this)({
                  entity: "film",
                  property: "drlPreStreetMember",
                  columnHeader: "DRL",
                })}
                {Details.renderField.bind(this)({
                  entity: "film",
                  property: "pprDrlPreStreetMember",
                  columnHeader: "PPR + DRL",
                })}
              </div>
              <div className="col-xs-2">
                <div style={{ width: "100%", height: "47px" }}></div>
                <div className="edu-subheader-container">
                  <p>Post-Street</p>
                  <p>Non-Member</p>
                </div>
                <div style={{ paddingBottom: 103.33 }}></div>
                {Details.renderField.bind(this)({
                  entity: "film",
                  property: "pprPostStreet",
                  columnHeader: "PPR",
                })}
                {Details.renderField.bind(this)({
                  entity: "film",
                  property: "drlPostStreet",
                  columnHeader: "DRL",
                })}
                {Details.renderField.bind(this)({
                  entity: "film",
                  property: "pprDrlPostStreet",
                  columnHeader: "PPR + DRL",
                })}
              </div>
              <div className="col-xs-2">
                <div style={{ width: "100%", height: "47px" }}></div>
                <div className="edu-subheader-container">
                  <p>Post-Street</p>
                  <p>Member</p>
                </div>
                <div style={{ paddingBottom: 103.33 }}></div>
                {Details.renderField.bind(this)({
                  entity: "film",
                  property: "pprPostStreetMember",
                  columnHeader: "PPR",
                })}
                {Details.renderField.bind(this)({
                  entity: "film",
                  property: "drlPostStreetMember",
                  columnHeader: "DRL",
                })}
                {Details.renderField.bind(this)({
                  entity: "film",
                  property: "pprDrlPostStreetMember",
                  columnHeader: "PPR + DRL",
                })}
              </div>
              <div className="col-xs-4">
                <p className="section-header">Topics</p>
                <ListBox
                  entityName="topic"
                  entities={filmTopics}
                  sort
                  clickAdd={() => {
                    this.setState({ topicsModalOpen: true });
                  }}
                  clickDelete={(filmTopic) => {
                    this.deleteFromList({
                      id: filmTopic.id,
                      directory: "film_topics",
                      otherArrays: ["topics"],
                    });
                  }}
                  displayProperty="topic"
                  style={{ marginBottom: 15 }}
                />
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-12">
                <p className="section-header">
                  Educational Streaming Platforms
                </p>
                <Table
                  columns={[
                    {
                      name: "name",
                      bold: true,
                    },
                    {
                      name: "url",
                      header: "URL",
                    },
                  ]}
                  rows={this.state.eduPlatformFilms}
                  sortable={false}
                  urlPrefix="edu_platform_films"
                  style={{ marginBottom: 30 }}
                />
                <OutlineButton
                  text="Add Platform"
                  onClick={() => {
                    this.setState({
                      newEduPlatformModalOpen: true,
                    });
                  }}
                  marginBottom
                />
              </div>
            </div>
            <hr />
          </div>
          <style jsx>{`
            .edu-subheader-container {
              margin-top: -10px;
              font-family: "TeachableSans-Medium";
              font-size: 12px;
              font-style: italic;
              margin-bottom: 20px;
            }
          `}</style>
        </>
      );
    } else {
      return <div></div>;
    }
  }

  renderRoyaltyFields() {
    const {
      dealTemplates,
      film,
      filmRevenuePercentages,
      filmRights,
      percentageErrors,
      percentageObject,
      revenueStreams,
    } = this.state;
    return (
      <>
        <div>
          <div className={film.filmType === "Short" ? "hidden" : ""}>
            <div className="row">
              {Details.renderDropDown.bind(this)({
                columnWidth: 5,
                entity: "film",
                property: "dealTypeId",
                columnHeader: "Deal Type",
                options: dealTemplates,
                optionDisplayProperty: "name",
                readOnly: !FM.user.hasAdminAccess,
              })}
              {Details.renderField.bind(this)({
                columnWidth: 1,
                entity: "film",
                property: "grPercentage",
                columnHeader: "GR %",
                readOnly: !FM.user.hasAdminAccess,
                hidden: film.dealTypeId !== "5" && film.dealTypeId !== "6",
              })}
              {Details.renderDropDown.bind(this)({
                columnWidth: 3,
                entity: "film",
                property: "daysStatementDue",
                columnHeader: "Statements Due",
                options: [
                  { value: 30, text: "30 Days" },
                  { value: 45, text: "45 Days" },
                  { value: 60, text: "60 Days" },
                ],
                readOnly: !FM.user.hasAdminAccess,
              })}
              {Details.renderField.bind(this)({
                columnWidth: 3,
                entity: "film",
                property: "mg",
                columnHeader: "MG",
                readOnly: !FM.user.hasAdminAccess,
              })}
              {Details.renderField.bind(this)({
                columnWidth: 3,
                entity: "film",
                property: "eAndO",
                columnHeader: "E & O",
                readOnly: !FM.user.hasAdminAccess,
                hidden: film.filmType === "Short",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 3,
                entity: "film",
                property: "expenseCap",
                readOnly: !FM.user.hasAdminAccess,
              })}
              {Details.renderField.bind(this)({
                columnWidth: 3,
                entity: "film",
                property: "sellOffPeriod",
                columnHeader: "DVD Sell Off Period (Months)",
                readOnly: !FM.user.hasAdminAccess,
              })}
              {Details.renderField.bind(this)({
                columnWidth: 3,
                entity: "film",
                property: "acceptDelivery",
                columnHeader: "Delivery Acceptance Date",
                readOnly: !FM.user.hasAdminAccess,
              })}
            </div>
            <div className="row">
              {Details.renderField.bind(this)({
                type: "textbox",
                columnWidth: 6,
                entity: "film",
                property: "royaltyNotes",
                rows: 3,
                readOnly: !FM.user.hasAdminAccess,
              })}
              {Details.renderField.bind(this)({
                type: "textbox",
                columnWidth: 6,
                entity: "film",
                property: "contractualObligations",
                rows: 3,
                readOnly: !FM.user.hasAdminAccess,
              })}
            </div>
          </div>
          <hr />
          <p className="section-header">Licensed Rights</p>
          <div className="row">
            <div className="col-xs-12">
              <Table
                columns={[
                  {
                    header: "Right",
                    name: "name",
                  },
                  {
                    header: "Territory",
                    name: "territory",
                  },
                  {
                    header: "Start Date",
                    name: "startDate",
                  },
                  {
                    header: "End Date",
                    name: "endDate",
                  },
                  {
                    header: "Exclusive",
                    name: "exclusive",
                  },
                ]}
                rows={filmRights}
                urlPrefix="film_rights"
                marginBottom
              />
              {FM.user.hasAdminAccess && (
                <>
                  <OutlineButton
                    onClick={() => {
                      this.setState({ newRightsModalOpen: true });
                    }}
                    text="Add Rights"
                    style={{ marginBottom: "30px" }}
                  />
                  <OutlineButton
                    onClick={() => {
                      this.setState({ changeDatesModalOpen: true });
                    }}
                    text="Change All Dates"
                    style={{ marginBottom: "30px" }}
                    float
                  />
                </>
              )}
            </div>
          </div>
          <div className={this.state.film.filmType === "Short" ? "hidden" : ""}>
            <hr />
            <p className="section-header">Revenue Splits</p>
            <div className="row">
              {filmRevenuePercentages.map((revenuePercentage, index) => {
                const properErrorsArray = percentageErrors[revenuePercentage.id]
                  ? percentageErrors[revenuePercentage.id]
                  : [];
                const revenueStream = revenueStreams.find(
                  (stream) => stream.id === revenuePercentage.revenueStreamId,
                );
                return (
                  <div key={index}>
                    {Details.renderField.bind(this)({
                      columnWidth: 2,
                      entity: "percentageObject",
                      property: revenuePercentage.id,
                      errorsKey: revenuePercentage.id,
                      errorsProperty: "value",
                      columnHeader:
                        revenueStream.nickname || revenueStream.name,
                      readOnly: !FM.user.hasAdminAccess,
                      showFieldError: false,
                    })}
                  </div>
                );
              })}
            </div>
            <hr />
            <div
              className={
                "row reserve-section" +
                (this.state.film.reserve ? "" : " no-reserve")
              }
            >
              {Details.renderSwitch.bind(this)({
                columnWidth: 3,
                entity: "film",
                property: "reserve",
                columnHeader: "Reserve Against Returns",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 2,
                entity: "film",
                property: "reservePercentage",
                columnHeader: "Reserve %",
                hidden: !film.reserve,
                readOnly: !FM.user.hasAdminAccess,
              })}
              {Details.renderField.bind(this)({
                columnWidth: 2,
                entity: "film",
                property: "reserveQuarters",
                columnHeader: "# of Quarters",
                hidden: !film.reserve,
                readOnly: !FM.user.hasAdminAccess,
              })}
              <div
                className={`spacer${this.state.film.reserve ? " hidden" : ""}`}
              ></div>
            </div>
            <hr />
            <div
              className={
                "row auto-renew-section" +
                (this.state.film.autoRenew ? "" : " no-renew")
              }
            >
              {Details.renderSwitch.bind(this)({
                columnWidth: 3,
                entity: "film",
                property: "autoRenew",
                columnHeader: "Auto-Renew",
              })}
              {Details.renderField.bind(this)({
                columnWidth: 2,
                entity: "film",
                property: "autoRenewTerm",
                columnHeader: "Term (Months)",
                hidden: !film.autoRenew,
                readOnly: !FM.user.hasAdminAccess,
              })}
              {Details.renderField.bind(this)({
                columnWidth: 2,
                entity: "film",
                property: "autoRenewDaysNotice",
                columnHeader: "Days Notice",
                hidden: !film.autoRenew,
                readOnly: !FM.user.hasAdminAccess,
              })}
              {Details.renderSwitch.bind(this)({
                columnWidth: 2,
                entity: "film",
                property: "autoRenewOptOut",
                columnHeader: "Opt Out",
                hidden: !film.autoRenew,
                readOnly: !FM.user.hasAdminAccess,
              })}
              <div
                className={`spacer${this.state.film.autoRenew ? " hidden" : ""}`}
              ></div>
            </div>
          </div>
        </div>
        <style jsx>{`
          .spacer {
            height: 103px;
          }
        `}</style>
      </>
    );
  }

  renderButtons() {
    const { justSaved, changesToSave, spinner } = this.state;
    return (
      <div>
        <SaveButton
          justSaved={justSaved}
          changesToSave={changesToSave}
          disabled={spinner}
          onClick={() => {
            this.clickSave();
          }}
        />
        {this.renderErrorGuide()}
        {this.renderCopyAndDeleteButtons()}
      </div>
    );
  }

  renderCopyAndDeleteButtons() {
    if (FM.user.hasAdminAccess) {
      return (
        <>
          <DeleteButton
            entityName="film"
            confirmDelete={Details.confirmDelete.bind(this)}
          />
          ,
          <Button
            text="Copy Film"
            marginRight
            float
            onClick={() => {
              this.setState({ copyModalOpen: true });
            }}
          />
        </>
      );
    }
  }

  exportMEC() {
    const { film } = this.state;
    sendRequest("/api/films/export_xml", {
      method: "GET",
      data: {
        film_id: film.id,
      },
    }).then((response) => {
      const { job } = response;
      this.setState({
        job,
        jobModalOpen: true,
      });
    });
  }

  exportMMC() {
    const { film } = this.state;
    sendRequest("/api/films/export_xml_mmc", {
      method: "GET",
      data: {
        film_id: film.id,
      },
    }).then((response) => {
      const { job } = response;
      this.setState({
        job,
        jobModalOpen: true,
      });
    });
  }

  percentageErrorsExist() {
    const { errors } = this.state;
    var keys = Object.keys(this.state.percentageErrors);
    var result = false;
    if (keys.length > 0) {
      for (var i = 0; i < keys.length; i++) {
        if (this.state.percentageErrors[keys[i]].length > 0) {
          result = true;
          break;
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
          FM.errors.endDate,
        ],
        general: [
          FM.errors.year,
          FM.errors.length,
          FM.errors.avodRelease,
          FM.errors.svodRelease,
          FM.errors.tvodRelease,
          FM.errors.clubDate,
        ],
      };
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
      const string = result.length > 0 ? "(" + result.join(", ") + ")" : "";
      return (
        <div className="error-guide">
          {"Not saved. There were errors. " + string}
        </div>
      );
    }
  }

  componentDidUpdate() {
    $("li:not('drop-zone'), div.quote").draggable({
      cursor: "-webkit-grabbing",
      handle: ".handle",
      helper: () => "<div></div>",
      stop: this.dragEndHandler,
    });
    $("li.drop-zone, .quote-drop-zone").droppable({
      accept: FM.canIDrop,
      tolerance: "pointer",
      over: this.dragOverHandler,
      out: this.dragOutHandler,
      drop: this.dropHandler.bind(this),
    });
    Common.updateJobModal.call(this, {
      successCallback: this.artworkUpdateCallback.bind(this),
    });
  }

  artworkUpdateCallback(job) {
    let { film } = this.state;
    film.artworkUrl = job.metadata.newImage;
    this.setState({ film });
  }
}
