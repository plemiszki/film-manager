var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var MerchandiseTypesStore = require('../stores/merchandise-types-store.js');
var ErrorsStore = require('../stores/errors-store.js');

var MerchandiseTypeDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      merchandiseType: {},
      merchandiseTypeSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    });
  },

  componentDidMount: function() {
    this.merchandiseTypeListener = MerchandiseTypesStore.addListener(this.getMerchandiseType);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchMerchandiseType(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.merchandiseTypesListener.remove();
    this.errorsListener.remove();
  },

  getMerchandiseType: function() {
    this.setState({
      merchandiseType: Tools.deepCopy(MerchandiseTypesStore.find(window.location.pathname.split("/")[2])),
      merchandiseTypeSaved: MerchandiseTypesStore.find(window.location.pathname.split("/")[2]),
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
        ClientActions.updateMerchandiseType(this.state.merchandiseType);
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
      ClientActions.deleteAndGoToSettings('merchandise_types', this.state.merchandiseType.id);
    });
  },

  handleModalClose: function() {
    this.setState({
      deleteModalOpen: false
    });
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.merchandiseType, this.state.merchandiseTypeSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "merchandiseType",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  },

  render: function() {
    return(
      <div id="merchandise-type-details">
        <div className="component details-component">
          <h1>Merchandise Type Details</h1>
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-12">
                <h2>Name</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.name) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.merchandiseType.name || "" } data-field="name" />
                { Common.renderFieldError(this.state.errors, Common.errors.name) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this merchandise type&#63;</h1>
            Deleting a merchandise type will erase ALL of its information and data<br />
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
          Delete Merchandise Type
        </a>
      </div>
    )
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = MerchandiseTypeDetails;
