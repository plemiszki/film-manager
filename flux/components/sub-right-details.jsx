var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var SubRightsStore = require('../stores/sub-rights-store.js');
var ErrorsStore = require('../stores/errors-store.js');

var SubRightDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      subRight: {},
      subRightSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    });
  },

  componentDidMount: function() {
    this.subRightListener = SubRightsStore.addListener(this.getSubRight);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchSubRight(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.subRightsListener.remove();
    this.errorsListener.remove();
  },

  getSubRight: function() {
    this.setState({
      subRight: Tools.deepCopy(SubRightsStore.subRight()),
      subRightSaved: SubRightsStore.subRight(),
      territories: SubRightsStore.territories(),
      rights: SubRightsStore.rights(),
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
        ClientActions.updateSubRight(this.state.subRight);
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
      ClientActions.deleteSubRight(this.state.subRight.id);
    });
  },

  handleModalClose: function() {
    this.setState({
      deleteModalOpen: false
    });
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.subRight, this.state.subRightSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "subRight",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  },

  render: function() {
    return(
      <div id="subRight-details">
        <div className="component details-component">
          <h1>Sublicensed Right Details</h1>
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-3 select-scroll">
                <h2>Right</h2>
                <select onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="rightId" value={ this.state.subRight.rightId }>
                  { SubRightsStore.rights().map(function(right, index) {
                    return(
                      <option key={ index } value={ right.id }>{ right.name }</option>
                    );
                  }) }
                </select>
                { Common.renderDropdownFieldError(this.state.errors, Common.errors.rightId) }
              </div>
              <div className="col-xs-3 select-scroll">
                <h2>Territory</h2>
                <select onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="territoryId" value={ this.state.subRight.territoryId }>
                  { SubRightsStore.territories().map(function(territory, index) {
                    return(
                      <option key={ index } value={ territory.id }>{ territory.name }</option>
                    );
                  }) }
                </select>
                { Common.renderDropdownFieldError(this.state.errors, Common.errors.territoryId) }
              </div>
              <div className="col-xs-2">
                <h2>Start Date</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.startDate) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.subRight.startDate || "" } data-field="startDate" />
                { Common.renderFieldError(this.state.errors, Common.errors.startDate) }
              </div>
              <div className="col-xs-2">
                <h2>End Date</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.endDate) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.subRight.endDate || "" } data-field="endDate" />
                { Common.renderFieldError(this.state.errors, Common.errors.endDate) }
              </div>
              <div className="col-xs-2">
                <h2>Exclusive</h2>
                <select onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="exclusive" value={ this.state.subRight.exclusive }>
                  <option value={ "Yes" }>Yes</option>
                  <option value={ "No" }>No</option>
                </select>
                { Common.renderFieldError([], []) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this right&#63;</h1>
            Deleting a right will erase ALL of its information and data<br />
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
          Delete Right
        </a>
      </div>
    )
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = SubRightDetails;
