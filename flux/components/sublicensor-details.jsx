var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var SublicensorsStore = require('../stores/sublicensors-store.js');
var ErrorsStore = require('../stores/errors-store.js');

var SublicensorDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      sublicensor: {},
      sublicensorSaved: {},
      films: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    });
  },

  componentDidMount: function() {
    this.sublicensorListener = SublicensorsStore.addListener(this.getSublicensors);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchSublicensor(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.sublicensorListener.remove();
    this.errorsListener.remove();
  },

  getSublicensors: function() {
    this.setState({
      sublicensor: Tools.deepCopy(SublicensorsStore.find(window.location.pathname.split("/")[2])),
      sublicensorSaved: SublicensorsStore.find(window.location.pathname.split("/")[2]),
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
        ClientActions.updateSublicensor(this.state.sublicensor);
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
      ClientActions.deleteSublicensor(this.state.sublicensor.id);
    });
  },

  handleModalClose: function() {
    this.setState({ deleteModalOpen: false });
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.sublicensor, this.state.sublicensorSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "sublicensor",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  },

  render: function() {
    return(
      <div id="sublicensor-details">
        <div className="component details-component">
          <h1>Sublicensor Details</h1>
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-6">
                <h2>Name</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.name) } onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.sublicensor.name || ""} data-field="name" />
                { Common.renderFieldError(this.state.errors, Common.errors.name) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to delete this sublicensor&#63;</h1>
            Deleting a sublicensor will erase ALL of its information and data<br />
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
        <a className={ "orange-button " + HandyTools.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave }>
          { buttonText }
        </a>
        <a id="delete" className={ "orange-button " + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete }>
          Delete Sublicensor
        </a>
      </div>
    )
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = SublicensorDetails;
