var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var GiftboxesStore = require('../stores/giftboxes-store.js');
var ErrorsStore = require('../stores/errors-store.js');
import ModalSelect from './modal-select.jsx';

var GiftboxDetails = React.createClass({

  dvdsModalStyles: {
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
      giftbox: {},
      giftboxSaved: {},
      dvds: [],
      otherDvds: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    });
  },

  componentDidMount: function() {
    this.giftboxListener = GiftboxesStore.addListener(this.getGiftbox);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchGiftbox(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.giftboxListener.remove();
    this.errorsListener.remove();
  },

  getGiftbox: function() {
    this.setState({
      giftbox: Tools.deepCopy(GiftboxesStore.find(window.location.pathname.split("/")[2])),
      giftboxSaved: GiftboxesStore.find(window.location.pathname.split("/")[2]),
      dvds: GiftboxesStore.dvds(),
      otherDvds: GiftboxesStore.otherDvds(),
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

  clickAddDvdButton: function() {
    this.setState({
      dvdsModalOpen: true
    });
  },

  clickDvdButton: function(event) {
    var dvdId = event.target.dataset.id;
    this.setState({
      fetching: true,
      dvdsModalOpen: false
    }, function() {
      ClientActions.createGiftboxDvd(this.state.giftbox.id, dvdId);
    });
  },

  clickSave: function() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, function() {
        ClientActions.updateGiftbox(this.state.giftbox);
      });
    }
  },

  clickXButton: function(event) {
    var id = event.target.dataset.id;
    this.setState({
      fetching: true
    }, function() {
      ClientActions.deleteGiftboxDvd(this.state.giftbox.id, id);
    });
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
      ClientActions.deleteGiftbox(this.state.giftbox.id);
    });
  },

  handleModalClose: function() {
    this.setState({
      deleteModalOpen: false,
      dvdsModalOpen: false
    });
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.giftbox, this.state.giftboxSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "giftbox",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  },

  render: function() {
    return(
      <div id="giftbox-details">
        <div className="component details-component">
          <h1>Gift Box Details</h1>
          <div id="giftbox-profile-box" className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-6">
                <h2>Name</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.name) } onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.giftbox.name || ""} data-field="name" />
                { Common.renderFieldError(this.state.errors, Common.errors.name) }
              </div>
              <div className="col-xs-4">
                <h2>UPC</h2>
                <input className={Common.errorClass(this.state.errors, Common.errors.upc)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.giftbox.upc || ""} data-field="upc" />
                { Common.renderFieldError(this.state.errors, Common.errors.upc) }
              </div>
              <div className="col-xs-2">
                <h2>MSRP</h2>
                <input className={Common.errorClass(this.state.errors, Common.errors.msrp)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.giftbox.msrp || ""} data-field="msrp" />
                {Common.renderFieldError(this.state.errors, Common.errors.msrp)}
              </div>
            </div>
            <div className="row">
              <div className="col-xs-6">
                <h2>Type</h2>
                <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="onDemand" value={this.state.giftbox.onDemand} >
                  <option value={"no"}>Prepackaged</option>
                  <option value={"yes"}>Assemble on Demand</option>
                </select>
              </div>
              <div className={"col-xs-3" + (this.state.giftbox.onDemand === "yes" ? " hidden" : "")} >
                <h2>Quantity</h2>
                <input value={this.state.giftbox.quantity === undefined ? "" : this.state.giftbox.quantity} readOnly={true} />
                {Common.renderFieldError([], [])}
              </div>
              <div className="col-xs-3">
                <h2>Sage ID</h2>
                <input onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.giftbox.sageId || ""} data-field="sageId" />
                {Common.renderFieldError([], [])}
              </div>
            </div>
            {this.renderButtons()}
            <hr />
            <table className={"admin-table"}>
              <thead>
                <tr>
                  <th>DVDs</th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td></tr>
                {this.state.dvds.map(function(dvd, index) {
                  return(
                    <tr key={index}>
                      <td className="name-column">
                        <div onClick={Common.redirect.bind(this, "dvds", dvd.id)}>
                          {dvd.title}
                        </div>
                        <div className="x-button" onClick={this.clickXButton} data-id={dvd.id}></div>
                      </td>
                    </tr>
                  );
                }.bind(this))}
              </tbody>
            </table>
            <a className={'blue-outline-button small'} onClick={this.clickAddDvdButton}>Add DVD</a>
          </div>
        </div>
        <Modal isOpen={this.state.deleteModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={Common.deleteModalStyles}>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this Gift Box&#63;</h1>
            Deleting a gift box will erase ALL of its information and data<br />
            <a className={"red-button"} onClick={this.confirmDelete}>
              Yes
            </a>
            <a className={"orange-button"} onClick={this.handleModalClose}>
              No
            </a>
          </div>
        </Modal>
        <Modal isOpen={this.state.dvdsModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={Common.selectModalStyles}>
          <ModalSelect options={this.state.otherDvds} property={"title"} func={this.clickDvdButton} />
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
        <a className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching || this.state.changesToSave == false) } onClick={ this.clickSave }>
          { buttonText }
        </a>
        <a id="delete" className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete }>
          Delete Gift Box
        </a>
      </div>
    )
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = GiftboxDetails;
