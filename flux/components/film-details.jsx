var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var FilmsStore = require('../stores/films-store.js');
var FilmErrorsStore = require('../stores/film-errors-store.js');
var CountriesStore = require('../stores/countries-store.js');
var LanguagesStore = require('../stores/languages-store.js');
var GenresStore = require('../stores/genres-store.js');
var TopicsStore = require('../stores/topics-store.js');
var QuotesStore = require('../stores/quotes-store.js');
var LaurelsStore = require('../stores/laurels-store.js');
var RelatedFilmsStore = require('../stores/related-films-store.js');
var NewThing = require('./new-thing.jsx');
var ModalSelect = require('./modal-select.jsx');

var FilmDetails = React.createClass({

  licensorModalStyles: {
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
  },

  dvdModalStyles: {
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
  },

  quoteModalStyles: {
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
  },

  laurelModalStyles: {
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
  },

  getInitialState: function() {
    return({
      fetching: true,
      film: {},
      filmSaved: {},
      filmErrors: [],
      percentages: {},
      percentagesSaved: {},
      percentageErrors: {},
      reports: [],
      dvds: [],
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
      relatedFilmsModalOpen: false,
      tab: (Common.params.tab ? HandyTools.capitalize(Common.params.tab) : 'General'),
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
      otherFilms: []
    });
  },

  componentDidMount: function() {
    this.filmListener = FilmsStore.addListener(this.getFilm);
    this.countriesListener = CountriesStore.addListener(this.getCountries);
    this.languagesListener = LanguagesStore.addListener(this.getLanguages);
    this.genresListener = GenresStore.addListener(this.getGenres);
    this.topicsListener = TopicsStore.addListener(this.getTopics);
    this.quotesListener = QuotesStore.addListener(this.getQuotes);
    this.laurelsListener = LaurelsStore.addListener(this.getLaurels);
    this.relatedFilmsListener = RelatedFilmsStore.addListener(this.getRelatedFilms);
    this.errorsListener = FilmErrorsStore.addListener(this.getErrors);
    ClientActions.fetchFilm(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.filmListener.remove();
    this.countriesListener.remove();
    this.languagesListener.remove();
    this.genresListener.remove();
    this.topicsListener.remove();
    this.quotesListener.remove();
    this.laurelsListener.remove();
    this.relatedFilmsListener.remove();
    this.errorsListener.remove();
  },

  getFilm: function() {
    this.setState({
      film: Tools.deepCopy(FilmsStore.find(window.location.pathname.split("/")[2])),
      filmSaved: FilmsStore.find(window.location.pathname.split("/")[2]),
      percentages: Tools.deepCopy(FilmsStore.percentages()),
      percentagesSaved: FilmsStore.percentages(),
      reports: FilmsStore.reports(),
      dvds: FilmsStore.dvds(),
      fetching: false
    }, function() {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  },

  getCountries: function() {
    this.setState({
      filmCountries: CountriesStore.filmCountries(),
      countries: CountriesStore.all(),
      countriesModalOpen: false
    });
  },

  getLanguages: function() {
    this.setState({
      filmLanguages: LanguagesStore.filmLanguages(),
      languages: LanguagesStore.all(),
      languagesModalOpen: false
    });
  },

  getGenres: function() {
    this.setState({
      filmGenres: GenresStore.filmGenres(),
      genres: GenresStore.all(),
      genresModalOpen: false
    });
  },

  getTopics: function() {
    this.setState({
      filmTopics: TopicsStore.filmTopics(),
      topics: TopicsStore.all(),
      topicsModalOpen: false
    });
  },

  getQuotes: function() {
    this.setState({
      quotes: QuotesStore.all(),
      quoteModalOpen: false
    });
  },

  getLaurels: function() {
    this.setState({
      laurels: LaurelsStore.all(),
      laurelModalOpen: false,
      fetching: false
    });
  },

  getRelatedFilms: function() {
    this.setState({
      relatedFilms: RelatedFilmsStore.all(),
      otherFilms: RelatedFilmsStore.otherFilms(),
      relatedFilmsModalOpen: false,
      fetching: false
    });
  },

  getErrors: function() {
    this.setState({
      filmErrors: FilmErrorsStore.filmErrors(),
      percentageErrors: FilmErrorsStore.percentageErrors(),
      fetching: false
    });
  },

  clickTab: function(event) {
    var tab = event.target.innerText;
    if (this.state.tab !== tab) {
      $('select').niceSelect('destroy');
      this.setState({
        tab: tab
      });
    }
  },

  clickSave: function() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, function() {
        ClientActions.updateFilm(this.state.film, this.state.percentages);
      });
    }
  },

  clickDelete: function() {
    this.setState({
      deleteModalOpen: true
    });
  },

  clickAddCountry: function() {
    this.setState({
      countriesModalOpen: true
    });
  },

  clickCountry: function(e) {
    ClientActions.createFilmCountry({ film_id: this.state.film.id, country_id: e.target.dataset.id })
  },

  clickDeleteCountry: function(e) {
    ClientActions.deleteFilmCountry(e.target.dataset.id);
  },

  clickAddLanguage: function() {
    this.setState({
      languagesModalOpen: true
    });
  },

  clickLanguage: function(e) {
    ClientActions.createFilmLanguage({ film_id: this.state.film.id, language_id: e.target.dataset.id })
  },

  clickDeleteLanguage: function(e) {
    ClientActions.deleteFilmLanguage(e.target.dataset.id);
  },

  clickAddGenre: function() {
    this.setState({
      genresModalOpen: true
    });
  },

  clickGenre: function(e) {
    ClientActions.createFilmGenre({ film_id: this.state.film.id, genre_id: e.target.dataset.id })
  },

  clickDeleteGenre: function(e) {
    ClientActions.deleteFilmGenre(e.target.dataset.id);
  },

  clickAddTopic: function() {
    this.setState({
      topicsModalOpen: true
    });
  },

  clickTopic: function(e) {
    ClientActions.createFilmTopic({ film_id: this.state.film.id, topic_id: e.target.dataset.id })
  },

  clickDeleteTopic: function(e) {
    ClientActions.deleteFilmTopic(e.target.dataset.id);
  },

  clickSelectLicensorButton: function() {
    this.setState({
      licensorModalOpen: true
    });
  },

  clickLicensorButton: function(event) {
    var film = this.state.film;
    film.licensorId = event.target.dataset.id;
    this.setState({
      film: film,
      licensorModalOpen: false
    }, function() {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  },

  clickQuote: function(e) {
    window.location = '/quotes/' + e.target.dataset.id;
  },

  clickAddQuote: function() {
    this.setState({
      quoteModalOpen: true
    });
  },

  clickAddLaurel: function() {
    this.setState({
      laurelModalOpen: true
    });
  },

  clickAddRelatedFilm: function() {
    this.setState({
      relatedFilmsModalOpen: true
    });
  },

  clickAddDVDButton: function() {
    this.setState({
      dvdModalOpen: true
    });
  },

  clickDeleteLaurel: function(e) {
    this.setState({
      fetching: true
    });
    ClientActions.deleteLaurel(e.target.dataset.id)
  },

  clickDeleteRelatedFilm: function(e) {
    this.setState({
      fetching: true
    });
    ClientActions.deleteRelatedFilm(e.target.dataset.id)
  },

  clickRelatedFilm: function(e) {
    ClientActions.createRelatedFilm({ filmId: this.state.film.id, otherFilmId: e.target.dataset.id })
  },

  confirmDelete: function() {
    this.setState({
      fetching: true
    }, function() {
      ClientActions.deleteFilm(this.state.film.id);
    });
  },

  handleModalClose: function() {
    this.setState({
      deleteModalOpen: false,
      licensorModalOpen: false,
      dvdModalOpen: false,
      countriesModalOpen: false,
      languagesModalOpen: false,
      genresModalOpen: false,
      topicsModalOpen: false,
      quoteModalOpen: false,
      laurelModalOpen: false,
      relatedFilmsModalOpen: false
    });
  },

  checkForChanges: function() {
    if (Tools.objectsAreEqual(this.state.film, this.state.filmSaved) == false) {
      return true;
    } else {
      return !Tools.objectsAreEqual(this.state.percentages, this.state.percentagesSaved);
    }
  },

  redirect: function(directory, id) {
    window.location.pathname = directory + "/" + id;
  },

  changeCheckbox: function(property, e) {
    var film = this.state.film;
    var filmErrors = this.state.filmErrors;
    film[property] = e.target.checked;
    if (property === "reserve" && e.target.checked === false) {
      film.reservePercentage = 0;
      Common.errors.reservePercentage.forEach(function(message) {
        HandyTools.removeFromArray(filmErrors, message);
      });
      film.reserveQuarters = 0;
      Common.errors.reserveQuarters.forEach(function(message) {
        HandyTools.removeFromArray(filmErrors, message);
      });
    } else if (property === "autoRenew" && e.target.checked === false) {
      film.autoRenewTerm = 0;
      Common.errors.autoRenewTerm.forEach(function(message) {
        HandyTools.removeFromArray(filmErrors, message);
      });
    }
    this.setState({
      film: film,
      filmErrors: filmErrors,
      justSaved: false
    }, function() {
      var changesToSave = this.changeFieldArgs().changesFunction.call();
      this.setState({changesToSave: changesToSave});
    });
  },

  changeFieldArgs: function(errors) {
    return {
      thing: "film",
      errorsArray: errors || this.state.filmErrors,
      beforeSave: function(newThing, key, value) {
        if (key == "dealTypeId") {
          if (value <= 4) {
            newThing.grPercentage = "";
            Common.removeFieldError(this.state.filmErrors, "grPercentage")
          } else {
            newThing.grPercentage = "0";
          }
        }
      },
      changesFunction: this.checkForChanges
    }
  },

  render: function() {
    return(
      <div className="film-details component details-component">
        <h1>Film Details</h1>
        { this.renderTopTabs() }
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <div className="row">
            <div className="col-xs-12 col-sm-9">
              <h2>Title</h2>
              <input className={Common.errorClass(this.state.filmErrors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.title || ""} data-field="title" />
              {Common.renderFieldError(this.state.filmErrors, ["Title can't be blank"])}
            </div>
            <div className="col-xs-12 col-sm-3">
              <h2>Type</h2>
              <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="shortFilm" value={this.state.film.shortFilm} disabled={true}>
                <option value={"no"}>Feature</option>
                <option value={"yes"}>Short</option>
              </select>
            </div>
          </div>
          { this.renderTab(this.state.tab) }
          { this.renderButtons() }
        </div>
        <Modal isOpen={this.state.deleteModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={Common.deleteModalStyles}>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this film&#63;</h1>
            Deleting a film will erase ALL of its information and data<br />
            <a className={"red-button"} onClick={this.confirmDelete}>
              Yes
            </a>
            <a className={"orange-button"} onClick={this.handleModalClose}>
              No
            </a>
          </div>
        </Modal>
        <Modal isOpen={this.state.licensorModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={this.licensorModalStyles}>
          <ul className="licensor-modal-list">
            <li onClick={this.clickLicensorButton} data-id={null}>(None)</li>
            {FilmsStore.licensors().map(function(licensor, index) {
              return(
                <li key={index} onClick={this.clickLicensorButton} data-id={licensor.id}>{licensor.name}</li>
              );
            }.bind(this))}
          </ul>
        </Modal>
        <Modal isOpen={this.state.dvdModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={this.dvdModalStyles}>
          <NewThing thing="dvd" initialObject={{featureFilmId: this.state.film.id, dvdTypeId: (this.state.film.id && this.state.dvds.length < 6) ? FilmsStore.dvdTypes()[0].id : 1}} />
        </Modal>
        <Modal isOpen={this.state.quoteModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={this.quoteModalStyles}>
          <NewThing thing="quote" initialObject={{ filmId: this.state.film.id, text: "", author: "", publication: "" }} />
        </Modal>
        <Modal isOpen={this.state.laurelModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={this.laurelModalStyles}>
          <NewThing thing="laurel" initialObject={{ filmId: this.state.film.id, result: "Official Selection", awardName: "", festival: "" }} />
        </Modal>
        <Modal isOpen={ this.state.countriesModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ this.state.countries } property={ "name" } func={ this.clickCountry } />
        </Modal>
        <Modal isOpen={ this.state.languagesModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ this.state.languages } property={ "name" } func={ this.clickLanguage } />
        </Modal>
        <Modal isOpen={ this.state.genresModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ this.state.genres } property={ "name" } func={ this.clickGenre } />
        </Modal>
        <Modal isOpen={ this.state.topicsModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ this.state.topics } property={ "name" } func={ this.clickTopic } />
        </Modal>
        <Modal isOpen={ this.state.relatedFilmsModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ this.state.otherFilms } property={ "title" } func={ this.clickRelatedFilm } />
        </Modal>
      </div>
    );
  },

  renderTopTabs: function() {
    if (this.state.film.shortFilm === "no") {
      return(
        <div className="tabs-row">
          { this.renderTopTab("General") }
          { this.renderTopTab("Contract") }
          { this.renderTopTab("Synopses") }
          { this.renderTopTab("Marketing") }
          { this.renderTopTab("DVDs") }
          { this.renderTopTab("Statements") }
        </div>
      )
    }
  },

  renderTopTab: function(label) {
    return(
      <div className={"tab" + (this.state.tab === label ? " selected" : "")} onClick={this.clickTab}>{label}</div>
    )
  },

  renderTab: function(tab) {
    if (tab === "Contract") {
      return(
        <div>
          <hr />
          <div className="row">
            <div className="col-xs-12 col-sm-5">
              <h2>Licensor</h2>
              <input className={Common.errorClass(this.state.filmErrors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.licensorId ? FilmsStore.findLicensor(this.state.film.licensorId).name : "(None)"} data-field="licensorId" readOnly={true} />
              {Common.renderFieldError(this.state.filmErrors, [])}
            </div>
            <div className="col-sm-1 icons">
              <img src={Images.openModal} onClick={this.clickSelectLicensorButton} />
            </div>
            <div className="col-xs-12 col-sm-3">
              <h2>MG</h2>
              <input className={Common.errorClass(this.state.filmErrors, Common.errors.mg)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.mg || ""} data-field="mg" />
              {Common.renderFieldError(this.state.filmErrors, Common.errors.mg)}
            </div>
            <div className={"col-xs-12 col-sm-3" + (this.state.film.shortFilm === "yes" ? " hidden" : "")}>
              <h2>E & O</h2>
              <input className={Common.errorClass(this.state.filmErrors, Common.errors.eAndO)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.eAndO || ""} data-field="eAndO" />
              {Common.renderFieldError(this.state.filmErrors, Common.errors.eAndO)}
            </div>
          </div>
          {this.renderRoyaltyFields()}
        </div>
      )
    } else if (this.state.tab === "DVDs") {
      return(
        <div>
          <hr />
          <table className={"admin-table"}>
            <thead>
              <tr>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              {this.state.dvds.map(function(dvd, index) {
                return(
                  <tr key={index} onClick={this.redirect.bind(this, "dvds", dvd.id)}>
                    <td className="name-column">
                      {dvd.type}
                    </td>
                  </tr>
                );
              }.bind(this))}
            </tbody>
          </table>
          <a className={'blue-outline-button small' + (this.state.dvds.length === 6 ? ' hidden' : '')} onClick={this.clickAddDVDButton}>Add DVD</a>
        </div>
      )
    } else if (this.state.tab === "Statements") {
      return(
        <div>
          <hr className="smaller-margin" />
          <div className="row checkboxes">
            <div className="col-xs-6">
              <input id="export-reports" type="checkbox" checked={this.state.film.exportReports} onChange={this.changeCheckbox.bind(this, 'exportReports')} /><label htmlFor="export-reports">Export Reports</label>
            </div>
            <div className={"col-xs-6" + (this.state.film.exportReports ? "" : " hidden")}>
              <input id="send-reports" type="checkbox" checked={this.state.film.sendReports} onChange={this.changeCheckbox.bind(this, 'sendReports')} /><label htmlFor="send-reports">Send Reports</label>
            </div>
          </div>
          <hr />
          <table className={"admin-table"}>
            <thead>
              <tr>
                <th>Year</th>
                <th>Quarter</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td></tr>
              {this.state.reports.map(function(report, index) {
                return(
                  <tr key={index} onClick={this.redirect.bind(this, "royalty_reports", report.id)}>
                    <td className="name-column">
                      {report.year}
                    </td>
                    <td>
                      {report.quarter}
                    </td>
                  </tr>
                );
              }.bind(this))}
            </tbody>
          </table>
        </div>
      );
    } else if (this.state.tab === "General") {
      return(
        <div>
          <hr />
          <div className="row">
            <div className="col-xs-6">
              <h2>Director</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.director || "" } data-field="director" />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className="col-xs-2">
              <h2>Label</h2>
              <select onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="labelId" value={ this.state.film.labelId }>
                { FilmsStore.labels().map(function(label, index) {
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
              <ul className="standard-list">
                { this.state.filmCountries.map(function(filmCountry) {
                  return(
                    <li key={ filmCountry.id }>{ filmCountry.country }<div className="x-button" onClick={ this.clickDeleteCountry } data-id={ filmCountry.id }></div></li>
                  );
                }.bind(this)) }
              </ul>
              <a className={ 'blue-outline-button small' } onClick={ this.clickAddCountry }>Add Country</a>
            </div>
            <div className="col-xs-6">
              <h3>Languages:</h3>
              <ul className="standard-list">
                { this.state.filmLanguages.map(function(filmLanguage) {
                  return(
                    <li key={ filmLanguage.id }>{ filmLanguage.language }<div className="x-button" onClick={ this.clickDeleteLanguage } data-id={ filmLanguage.id }></div></li>
                  );
                }.bind(this)) }
              </ul>
              <a className={ 'blue-outline-button small' } onClick={ this.clickAddLanguage }>Add Language</a>
            </div>
          </div>
        </div>
      )
    } else if (this.state.tab === "Marketing") {
      return(
        <div>
          <hr className="smaller-margin" />
          <div className="row checkboxes">
            <div className="col-xs-3">
              <input id="active" type="checkbox" checked={ this.state.film.active || false } onChange={ this.changeCheckbox.bind(this, 'active') } /><label htmlFor="active">Active on Website</label>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-12">
              <h3>Laurels:</h3>
              <ul className="standard-list">
                { this.state.laurels.map(function(laurel) {
                  return(
                    <li key={ laurel.id }>{ laurel.result }{ laurel.awardName ? ` - ${laurel.awardName}` : '' } - { laurel.festival }<div className="x-button" onClick={ this.clickDeleteLaurel } data-id={ laurel.id }></div></li>
                  );
                }.bind(this)) }
              </ul>
              <a className={ 'blue-outline-button small' } onClick={ this.clickAddLaurel }>Add Laurel</a>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-12">
              <h3>Quotes:</h3>
            </div>
            { this.state.quotes.map(function(quote) {
              return(
                <div key={ quote.id } className="col-xs-6 quote-container">
                  { this.renderQuote(quote) }
                </div>
              );
            }.bind(this)) }
          </div>
          <div className="row">
            <div className="col-xs-12">
              <a className={ 'blue-outline-button small' } onClick={ this.clickAddQuote }>Add Quote</a>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-6">
              <h3>Genres:</h3>
              <ul className="standard-list">
                { this.state.filmGenres.map(function(filmGenre) {
                  return(
                    <li key={ filmGenre.id }>{ filmGenre.genre }<div className="x-button" onClick={ this.clickDeleteGenre } data-id={ filmGenre.id }></div></li>
                  );
                }.bind(this)) }
              </ul>
              <a className={ 'blue-outline-button small' } onClick={ this.clickAddGenre }>Add Genre</a>
            </div>
            <div className="col-xs-6">
              <h3>Topics:</h3>
              <ul className="standard-list">
                { this.state.filmTopics.map(function(filmTopic) {
                  return(
                    <li key={ filmTopic.id }>{ filmTopic.topic }<div className="x-button" onClick={ this.clickDeleteTopic } data-id={ filmTopic.id }></div></li>
                  );
                }.bind(this)) }
              </ul>
              <a className={ 'blue-outline-button small' } onClick={ this.clickAddTopic }>Add Topic</a>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-12">
              <h3>Related Films:</h3>
              <ul className="standard-list">
                { this.state.relatedFilms.map(function(relatedFilm) {
                  return(
                    <li key={ relatedFilm.id }>{ relatedFilm.title }<div className="x-button" onClick={ this.clickDeleteRelatedFilm } data-id={ relatedFilm.id }></div></li>
                  );
                }.bind(this)) }
              </ul>
              <a className={ 'blue-outline-button small' } onClick={ this.clickAddRelatedFilm }>Add Related Film</a>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-xs-6">
              <h2>Standalone Site</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.standaloneSite || "" } data-field="standaloneSite" />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className="col-xs-6">
              <h2>Vimeo Trailer Link</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.vimeoTrailer || "" } data-field="vimeoTrailer" />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-6">
              <h2>YouTube Trailer Link</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.youtubeTrailer || "" } data-field="youtubeTrailer" />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className="col-xs-6">
              <h2>ProRes Trailer Link</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.proresTrailer || "" } data-field="proresTrailer" />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-4">
              <h2>Facebook Link</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.facebookLink || "" } data-field="facebookLink" />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className="col-xs-4">
              <h2>Twitter Link</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.twitterLink || "" } data-field="twitterLink" />
              { Common.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className="col-xs-4">
              <h2>Instagram Link</h2>
              <input className={ Common.errorClass(this.state.filmErrors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.instagramLink || "" } data-field="instagramLink" />
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
          <div className="row">
            <div className="col-xs-12">
              <h2>Short Synopsis</h2>
              <textarea rows="4" cols="20" onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.shortSynopsis || "" } data-field="shortSynopsis" />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              <h2>Logline</h2>
              <textarea rows="2" cols="20" onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.logline || "" } data-field="logline" />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              <h2>VOD Synopsis</h2>
              <textarea rows="8" cols="20" onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.vodSynopsis || "" } data-field="vodSynopsis" />
            </div>
          </div>
          <div className="row">
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
      )
    }
  },

  renderRoyaltyFields: function() {
    if (this.state.film.shortFilm === 'no') {
      return(
        <div>
          <div className="row">
            <div className="col-xs-12 col-sm-5">
              <h2>Deal Type</h2>
                <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="dealTypeId" value={this.state.film.dealTypeId}>
                  {FilmsStore.dealTemplates().map(function(dealTemplate, index) {
                    return(
                      <option key={index} value={dealTemplate.id}>{dealTemplate.name}</option>
                    )
                  })}
                </select>
              {Common.renderFieldError(this.state.filmErrors, [])}
            </div>
            <div className={"col-xs-12 col-sm-1" + ((this.state.film.dealTypeId != "5" && this.state.film.dealTypeId != "6") ? " hidden" : "")}>
              <h2>GR %</h2>
              <input className={Common.errorClass(this.state.filmErrors, Common.errors.grPercentage)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.grPercentage || ""} data-field="grPercentage" />
              {Common.renderFieldError(this.state.filmErrors, [])}
            </div>
            <div className={"col-xs-12 col-sm-3" + ((this.state.film.dealTypeId === "5" || this.state.film.dealTypeId === "6") ? "" : " col-sm-offset-1")}>
              <h2>Statements Due</h2>
                <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="daysStatementDue" value={this.state.film.daysStatementDue}>
                  <option value={"30"}>30 Days</option>
                  <option value={"45"}>45 Days</option>
                  <option value={"60"}>60 Days</option>
                </select>
              {Common.renderFieldError([], [])}
            </div>
            <div className="col-xs-12 col-sm-3">
              <h2>Expense Cap</h2>
              <input className={Common.errorClass(this.state.filmErrors, Common.errors.expenseCap)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.expenseCap || ""} data-field="expenseCap" />
              {Common.renderFieldError(this.state.filmErrors, Common.errors.expenseCap)}
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 col-sm-6">
              <h2>Royalty Notes</h2>
              <textarea rows="5" className={Common.errorClass(this.state.filmErrors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.royaltyNotes || ""} data-field="royaltyNotes" />
            </div>
            <div className="col-xs-12 col-sm-3">
              <h2>Sage ID</h2>
              <input className={Common.errorClass([], [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.sageId || ""} data-field="sageId" />
              {Common.renderFieldError([], [])}
            </div>
            <div className="col-xs-12 col-sm-3">
              <h2>DVD Sell Off Period (Months)</h2>
              <input className={Common.errorClass(this.state.filmErrors, Common.errors.sellOffPeriod)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.sellOffPeriod} data-field="sellOffPeriod" />
              {Common.renderFieldError(this.state.filmErrors, Common.errors.sellOffPeriod)}
            </div>
          </div>
          <div className="row">
            <div className="col-xs-3">
              <div className="rights-checkboxes">
                {FilmsStore.rights().slice(0, 8).map(function(right, index) {
                  return(
                    <div className="right" key={index}>
                      <input id={"rights-checkbox-" + right.id} type="checkbox" checked={right.value} onChange={function() { console.log('woo');}} /><label htmlFor={"rights-checkbox-" + right.id}>{right.name}</label>
                    </div>
                  )
                }.bind(this))}
              </div>
            </div>
            <div className="col-xs-3">
              <div className="rights-checkboxes">
                {FilmsStore.rights().slice(8, 16).map(function(right, index) {
                  return(
                    <div className="right" key={index}>
                      <input id={"rights-checkbox-" + right.id} type="checkbox" checked={right.value} onChange={function() { console.log('woo');}} /><label htmlFor={"rights-checkbox-" + right.id}>{right.name}</label>
                    </div>
                  )
                }.bind(this))}
              </div>
            </div>
            <div className="col-xs-12 col-sm-6 percentage-column">
              {FilmsStore.revenuePercentages().map(function(revenuePercentage, index) {
                var properErrorsArray = this.state.percentageErrors[revenuePercentage.id] ? this.state.percentageErrors[revenuePercentage.id] : [];
                return(
                  <div className="revenue-percentage" key={index}>
                    <h2>{FilmsStore.findRevenueStream(revenuePercentage.revenueStreamId).nickname || FilmsStore.findRevenueStream(revenuePercentage.revenueStreamId).name} %</h2>
                    <input className={Common.errorClass(properErrorsArray, Common.errors.value)} onChange={Common.changeField.bind(this, this.changeFieldArgs(properErrorsArray))} value={this.state.percentages[revenuePercentage.id] || ""} data-thing="percentages" data-field={revenuePercentage.id} />
                    {Common.renderFieldError([], [])}
                  </div>
                )
              }.bind(this))}
            </div>
          </div>
          <hr />
          <div className={"row reserve-section" + (this.state.film.reserve ? "" : " no-reserve")}>
            <div className="col-xs-3">
              <input id="returns-reserve" className="checkbox" type="checkbox" checked={this.state.film.reserve} onChange={this.changeCheckbox.bind(this, 'reserve')} /><label className="checkbox" htmlFor="reserve-returns">Reserve Against Returns</label>
            </div>
            <div className="col-xs-2">
              <h2>Reserve %</h2>
              <input className={Common.errorClass(this.state.filmErrors, Common.errors.reservePercentage)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.reservePercentage} data-field="reservePercentage" disabled={!this.state.film.reserve} />
              {Common.renderFieldError(this.state.filmErrors, [])}
            </div>
            <div className="col-xs-2">
              <h2># of Quarters</h2>
              <input className={Common.errorClass(this.state.filmErrors, Common.errors.reserveQuarters)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.reserveQuarters} data-field="reserveQuarters" disabled={!this.state.film.reserve} />
              {Common.renderFieldError(this.state.filmErrors, [])}
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
              {Common.renderFieldError(this.state.filmErrors, [])}
            </div>
          </div>
        </div>
      )
    }
  },

  renderButtons: function() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave }>
          { buttonText }
        </a>
        { this.renderErrorGuide() }
        <a id="delete" className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete }>
          Delete Film
        </a>
      </div>
    )
  },

  percentageErrorsExist: function() {
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
  },

  renderErrorGuide: function() {
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
          Common.errors.autoRenewTerm
        ],
        general: [
          Common.errors.year,
          Common.errors.length
        ]
      }
      var result = [];
      if (this.percentageErrorsExist()) {
        result.push("Contract Tab");
      }
      this.state.filmErrors.forEach(function(error) {
        if (result.indexOf("Contract Tab") === -1) {
          tabs.contract.forEach(function(errorsArray) {
            if (errorsArray.indexOf(error) > -1) {
              result.push("Contract Tab");
            }
          });
        }
        if (result.indexOf("General Tab") === -1) {
          tabs.general.forEach(function(errorsArray) {
            if (errorsArray.indexOf(error) > -1) {
              result.push("General Tab");
            }
          });
        }
      });
      var string = (result.length > 0 ? ("(" + result.join(", ") + ")") : "");
      return(
        <div className="error-guide">
          {"Not saved. There were errors. " + string}
        </div>
      )
    }
  },

  renderQuote: function(quote) {
    var bottomLine = "";
    bottomLine += quote.author ? quote.author : "";
    bottomLine += quote.author && quote.publication ? ", " : "";
    bottomLine += quote.publication ? quote.publication : "";
    return(
      <div className="quote" onClick={ this.clickQuote } data-id={ quote.id }>
        <p data-id={ quote.id }>"{ quote.text }"</p>
        <p data-id={ quote.id }>- { bottomLine }</p>
      </div>
    );
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = FilmDetails;
