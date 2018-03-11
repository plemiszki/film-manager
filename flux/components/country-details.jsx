var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var CountriesStore = require('../stores/countries-store.js');
var ErrorsStore = require('../stores/errors-store.js');

var CountryDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      country: {},
      countrySaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    });
  },

  componentDidMount: function() {
    this.countryListener = CountriesStore.addListener(this.getCountry);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchCountry(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.countriesListener.remove();
    this.errorsListener.remove();
  },

  getCountry: function() {
    this.setState({
      country: Tools.deepCopy(CountriesStore.find(window.location.pathname.split("/")[2])),
      countrySaved: CountriesStore.find(window.location.pathname.split("/")[2]),
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
        ClientActions.updateCountry(this.state.country);
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
      ClientActions.deleteAndGoToSettings('countries', this.state.country.id);
    });
  },

  handleModalClose: function() {
    this.setState({
      deleteModalOpen: false,
      dvdsModalOpen: false,
      shredderModalOpen: false
    });
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.country, this.state.countrySaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "country",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  },

  render: function() {
    return(
      <div id="country-details">
        <div className="component details-component">
          <h1>Country Details</h1>
          <div id="country-profile-box" className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-12">
                <h2>Name</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.name) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.country.name || "" } data-field="name" />
                { Common.renderFieldError(this.state.errors, Common.errors.name) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this country&#63;</h1>
            Deleting a country will erase ALL of its information and data<br />
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
          Delete Country
        </a>
      </div>
    )
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = CountryDetails;
