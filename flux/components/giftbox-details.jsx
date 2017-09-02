var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var GiftboxesStore = require('../stores/giftboxes-store.js');
var ErrorsStore = require('../stores/errors-store.js');

var GiftboxDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      giftbox: {},
      giftboxSaved: {},
      films: [],
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
        ClientActions.updateGiftbox(this.state.giftbox);
      });
    }
  },

  redirect: function(id) {
    window.location.pathname = "giftboxes/" + id;
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
      ClientActions.deleteGiftbox(this.state.giftbox.id);
    });
  },

  handleModalClose: function() {
    this.setState({deleteModalOpen: false});
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
        <div className="component">
          <h1>Gift Box Details</h1>
          <div id="giftbox-profile-box" className="white-box">
            {Common.renderSpinner(this.state.fetching)}
            {Common.renderGrayedOut(this.state.fetching)}
            <div className="row">
              <div className="col-xs-6">
                <h2>Name</h2>
                <input className={Common.errorClass(this.state.errors, Common.errors.name)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.giftbox.name || ""} data-field="name" />
                {Common.renderFieldError(this.state.errors, Common.errors.name)}
              </div>
              <div className="col-xs-4">
                <h2>UPC</h2>
                <input className={Common.errorClass(this.state.errors, Common.errors.upc)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.giftbox.upc || ""} data-field="upc" />
                {Common.renderFieldError(this.state.errors, Common.errors.upc)}
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
                {this.state.films.map(function(film, index) {
                  return(
                    <tr key={index} onClick={this.redirect.bind(this, film.id)}>
                      <td className="name-column">
                        {film.title}
                      </td>
                    </tr>
                  );
                }.bind(this))}
              </tbody>
            </table>
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
