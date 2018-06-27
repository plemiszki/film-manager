var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var DigitalRetailersStore = require('../stores/digital-retailers-store.js');
var ErrorsStore = require('../stores/errors-store.js');

var DigitalRetailerFilmDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      digitalRetailerFilm: {},
      digitalRetailerFilmSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    });
  },

  componentDidMount: function() {
    this.digitalRetailerFilmListener = DigitalRetailersStore.addListener(this.getDigitalRetailerFilm);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchDigitalRetailerFilm(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.digitalRetailerFilmListener.remove();
    this.errorsListener.remove();
  },

  getDigitalRetailerFilm: function() {
    var digitalRetailerFilm = DigitalRetailersStore.findFilm(window.location.pathname.split("/")[2]);
    this.setState({
      digitalRetailerFilm: Tools.deepCopy(digitalRetailerFilm),
      digitalRetailerFilmSaved: digitalRetailerFilm,
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
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, function() {
        ClientActions.updateDigitalRetailerFilm(this.state.digitalRetailerFilm);
      });
    }
  },

  clickDelete: function() {
    this.setState({
      deleteModalOpen: true
    });
  },

  confirmDelete: function() {
    this.setState({
      fetching: true,
      deleteModalOpen: false
    }, function() {
      ClientActions.deleteAndGoToFilm('digital_retailer_films', this.state.digitalRetailerFilm, '?tab=marketing');
    });
  },

  handleModalClose: function() {
    this.setState({
      deleteModalOpen: false
    });
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.digitalRetailerFilm, this.state.digitalRetailerFilmSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: 'digitalRetailerFilm',
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  },

  render: function() {
    return(
      <div id="digital-retailer-film-details">
        <div className="component details-component">
          <h1>Digital Retailer Film Details</h1>
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-4">
                <h2>Company</h2>
                <div className="clearfix">
                  <select className={ Common.errorClass(this.state.errors, Common.errors.digitalRetailerId) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="digitalRetailerId" value={ this.state.digitalRetailerFilm.digitalRetailerId }>
                    { DigitalRetailersStore.all().map(function(digitalRetailer) {
                      return(
                        <option key={ digitalRetailer.id } value={ digitalRetailer.id }>{ digitalRetailer.name }</option>
                      );
                    }) }
                  </select>
                </div>
                { Common.renderFieldError(this.state.errors, Common.errors.digitalRetailerId) }
              </div>
              <div className="col-xs-8">
                <h2>Url</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.url) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.digitalRetailerFilm.url || "" } data-field="url" />
                { Common.renderFieldError(this.state.errors, Common.errors.url) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this digital retailer film&#63;</h1>
            Deleting a digital retailer film will erase ALL of its information and data<br />
            <a className={ "red-button" } onClick={ this.confirmDelete }>
              Yes
            </a>
            <a className={ "orange-button" } onClick={ this.handleModalClose }>
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
        <a className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave }>
          { buttonText }
        </a>
        <a id="delete" className={ "orange-button " + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete }>
          Delete Digital Retailer Film
        </a>
      </div>
    )
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = DigitalRetailerFilmDetails;
