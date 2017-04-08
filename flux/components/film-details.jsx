var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var FilmsStore = require('../stores/films-store.js');
var FilmErrorsStore = require('../stores/film-errors-store.js');

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

  getInitialState: function() {
    return({
      fetching: true,
      film: {},
      filmSaved: {},
      filmErrors: [],
      percentages: {},
      percentagesSaved: {},
      percentageErrors: {},
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      licensorModalOpen: false
    });
  },

  componentDidMount: function() {
    this.filmListener = FilmsStore.addListener(this.getFilm);
    this.errorsListener = FilmErrorsStore.addListener(this.getErrors);
    ClientActions.fetchFilm(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.filmListener.remove();
    this.errorsListener.remove();
  },

  getFilm: function() {
    this.setState({
      film: Tools.deepCopy(FilmsStore.find(window.location.pathname.split("/")[2])),
      filmSaved: FilmsStore.find(window.location.pathname.split("/")[2]),
      percentages: Tools.deepCopy(FilmsStore.percentages()),
      percentagesSaved: FilmsStore.percentages(),
      fetching: false
    }, function() {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  },

  getErrors: function() {
    this.setState({
      filmErrors: FilmErrorsStore.filmErrors(),
      percentageErrors: FilmErrorsStore.percentageErrors(),
      fetching: false
    });
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
      licensorModalOpen: false
    });
  },

  checkForChanges: function() {
    if (Tools.objectsAreEqual(this.state.film, this.state.filmSaved) == false) {
      return true;
    } else {
      return !Tools.objectsAreEqual(this.state.percentages, this.state.percentagesSaved);
    }
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
      <div className="component">
        <h1>Film Details</h1>
        <div className="white-box">
          {Common.renderSpinner(this.state.fetching)}
          {Common.renderGrayedOut(this.state.fetching)}
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
          <div className="row">
            <div className="col-xs-12 col-sm-5">
              <h2>Licensor</h2>
              <input className={Common.errorClass(this.state.filmErrors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.licensorId ? FilmsStore.findLicensor(this.state.film.licensorId).name : "(None)"} data-field="licensorId" readOnly={true} />
              {Common.renderFieldError(this.state.filmErrors, [])}
            </div>
            <div className="col-sm-4 icons">
              <img src={Images.openModal} onClick={this.clickSelectLicensorButton} />
            </div>
            <div className="col-xs-12 col-sm-3">
              <h2>MG</h2>
              <input className={Common.errorClass(this.state.filmErrors, Common.errors.mg)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.mg || ""} data-field="mg" />
              {Common.renderFieldError(this.state.filmErrors, Common.errors.mg)}
            </div>
          </div>
          {this.renderRoyaltyFields()}
          {this.renderButtons()}
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
      </div>
    );
  },

  renderRoyaltyFields: function() {
    if (this.state.film.shortFilm === 'no') {
      return(
        <div>
          <hr />
          <div className="row">
            <div className="col-xs-12 col-sm-6">
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
            <div className="col-xs-12 col-sm-2">
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
              <h2>E & O</h2>
              <input className={Common.errorClass(this.state.filmErrors, Common.errors.eAndO)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.eAndO || ""} data-field="eAndO" />
              {Common.renderFieldError(this.state.filmErrors, Common.errors.eAndO)}
            </div>
            <div className="col-xs-12 col-sm-3">
              <h2>Sage ID</h2>
              <input className={Common.errorClass([], [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.sageId || ""} data-field="sageId" />
              {Common.renderFieldError([], [])}
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 col-sm-6">
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
        <a className={"orange-button " + Common.renderDisabledButtonClass(this.state.fetching) + Common.renderInactiveButtonClass(this.state.changesToSave)} onClick={this.clickSave}>
          {buttonText}
        </a>
        <a id="delete" className={"orange-button " + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.clickDelete}>
          Delete Film
        </a>
      </div>
    )
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = FilmDetails;
