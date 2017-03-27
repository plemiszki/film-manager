var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var FilmsStore = require('../stores/films-store.js');
var ErrorsStore = require('../stores/errors-store.js');

var FilmDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      film: {},
      filmSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    });
  },

  componentDidMount: function() {
    this.filmListener = FilmsStore.addListener(this.getFilm);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
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
      fetching: false
    }, function() {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  },

  getErrors: function() {
    this.setState({
      errors: ErrorsStore.all(),
      fetching: false
    });
  },

  clickSave: function() {
    this.setState({
      fetching: true
    }, function() {
      ClientActions.updateFilm(this.state.film);
    });
  },

  clickDelete: function() {
    this.setState({
      deleteModalOpen: true
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
    this.setState({deleteModalOpen: false});
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.film, this.state.filmSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "film",
      errorsArray: this.state.errors,
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
              <input className={Common.errorClass(this.state.errors, ["Title can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.title || ""} data-field="title" />
              {Common.renderFieldError(this.state.errors, ["Title can't be blank"])}
            </div>
            <div className="col-xs-12 col-sm-3">
              <h2>Type</h2>
              <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="shortFilm" value={this.state.film.shortFilm}>
                <option value={"no"}>Feature</option>
                <option value={"yes"}>Short</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 col-sm-4">
              <h2>Licensor</h2>
                <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="licensorId" value={this.state.film.licensorId}>
                  <option value={""}>(None)</option>
                </select>
              {Common.renderFieldError(this.state.errors, [])}
            </div>
            <div className="col-xs-12 col-sm-4">
              <h2>Deal Type</h2>
                <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="dealTypeId" value={this.state.film.dealTypeId}>
                  <option value={"1"}>Template A</option>
                  <option value={"2"}>Template B</option>
                  <option value={"3"}>Template C</option>
                  <option value={"4"}>Template D</option>
                </select>
              {Common.renderFieldError(this.state.errors, [])}
            </div>
            <div className="col-xs-12 col-sm-4">
              <h2>Statements Due</h2>
                <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="daysStatementDue" value={this.state.film.daysStatementDue}>
                  <option value={"30"}>30 Days</option>
                  <option value={"45"}>45 Days</option>
                  <option value={"60"}>60 Days</option>
                </select>
              {Common.renderFieldError(this.state.errors, [])}
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 col-sm-3">
              <h2>GR %</h2>
              <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.grPercentage || ""} data-field="grPercentage" />
              {Common.renderFieldError(this.state.errors, [])}
            </div>
            <div className="col-xs-12 col-sm-3">
              <h2>Expense Cap</h2>
              <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.expenseCap || ""} data-field="expenseCap" />
              {Common.renderFieldError(this.state.errors, [])}
            </div>
            <div className="col-xs-12 col-sm-3">
              <h2>MG</h2>
              <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.mg || ""} data-field="mg" />
              {Common.renderFieldError(this.state.errors, [])}
            </div>
            <div className="col-xs-12 col-sm-3">
              <h2>E & O</h2>
              <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.eAndO || ""} data-field="eAndO" />
              {Common.renderFieldError(this.state.errors, [])}
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 col-sm-3">
              <h2>Sage Id</h2>
              <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.sageId || ""} data-field="sageId" />
              {Common.renderFieldError(this.state.errors, [])}
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 col-sm-12">
              <h2>Royalty Notes</h2>
              <textarea rows="5" className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.film.royaltyNotes || ""} data-field="royaltyNotes" />
            </div>
          </div>
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
      </div>
    );
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
