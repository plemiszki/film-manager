var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var DvdsStore = require('../stores/dvds-store.js');
var ErrorsStore = require('../stores/errors-store.js');

var DvdDetails = React.createClass({

  shortsModalStyles: {
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
      dvd: {
        stock: "",
        unitsShipped: ""
      },
      dvdSaved: {},
      films: [],
      shorts: [],
      otherShorts: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      shortsModalOpen: false
    });
  },

  componentDidMount: function() {
    this.dvdListener = DvdsStore.addListener(this.getDvd);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchDvd(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.dvdListener.remove();
    this.errorsListener.remove();
  },

  getDvd: function() {
    this.setState({
      dvd: Tools.deepCopy(DvdsStore.find(window.location.pathname.split("/")[2])),
      dvdSaved: DvdsStore.find(window.location.pathname.split("/")[2]),
      shorts: DvdsStore.shorts(),
      otherShorts: DvdsStore.otherShorts(),
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

  clickAddShort: function() {
    this.setState({
      shortsModalOpen: true
    });
  },

  clickSave: function() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, function() {
        ClientActions.updateDvd(this.state.dvd);
      });
    }
  },

  clickAddShortButton: function() {
    this.setState({
      shortsModalOpen: true
    });
  },

  clickShortButton: function(event) {
    var shortId = event.target.dataset.id;
    this.setState({
      fetching: true,
      shortsModalOpen: false
    }, function() {
      ClientActions.createDvdShort(this.state.dvd.id, shortId);
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
      ClientActions.deleteDvd(this.state.dvd);
    });
  },

  handleModalClose: function() {
    this.setState({
      deleteModalOpen: false,
      shortsModalOpen: false
    });
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.dvd, this.state.dvdSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "dvd",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  },

  render: function() {
    return(
      <div id="dvd-details">
        <div className="component">
          <h1>DVD Details</h1>
          <div className="white-box">
            {Common.renderSpinner(this.state.fetching)}
            {Common.renderGrayedOut(this.state.fetching)}
            <div className="row">
              <div className="col-xs-6">
                <h2>Title</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvd.title || ""} readOnly={true} />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-6">
                <h2>DVD Type</h2>
                  <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="dvdTypeId" value={this.state.dvd.dvdTypeId}>
                    {DvdsStore.types().map(function(type, index) {
                      return(
                        <option key={index} value={type.id}>{type.name}</option>
                      )
                    })}
                  </select>
                {Common.renderFieldError(this.state.errors, Common.errors.dvdTypeId)}
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3">
                <h2>UPC</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvd.upc || ""} data-field="upc" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-2">
                <h2>Price</h2>
                <input className={Common.errorClass(this.state.errors, Common.errors.price)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvd.price || ""} data-field="price" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-1">
                <h2>Discs</h2>
                <input className={Common.errorClass(this.state.errors, Common.errors.discs)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvd.discs || ""} data-field="discs" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-2">
                <h2>Stock</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvd.stock} readOnly={true} />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-2 repressing-column">
                <input id="repressing" className="checkbox" type="checkbox" onChange={Common.changeCheckBox.bind(this, this.changeFieldArgs())} checked={this.state.dvd.repressing || false} data-field="repressing" /><label className="checkbox">Repressing</label>
              </div>
              <div className="col-xs-2">
                <h2>Units Shipped</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvd.unitsShipped} readOnly={true} />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
            </div>
            <div className="row">
              <div className="col-xs-6">
                <h2>Sound Configuration</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvd.soundConfig || ""} data-field="soundConfig" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-6">
                <h2>Special Features</h2>
                <textarea rows="5" className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvd.specialFeatures || ""} data-field="specialFeatures" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
            </div>
            <table className={"admin-table"}>
              <thead>
                <tr>
                  <th>Short Films</th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td></tr>
                {this.state.shorts.map(function(short, index) {
                  return(
                    <tr key={index} onClick={Common.redirect.bind(this, "films", short.id)}>
                      <td className="name-column">
                        {short.title}
                      </td>
                    </tr>
                  );
                }.bind(this))}
              </tbody>
            </table>
            <a className={'blue-outline-button small'} onClick={this.clickAddShortButton}>Add Short</a>
            {this.renderButtons()}
          </div>
        </div>
        <Modal isOpen={this.state.deleteModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={Common.deleteModalStyles}>
          <div className="confirm-delete">
            <h1>Are you sure you want to delete this DVD&#63;</h1>
            Deleting a DVD will erase ALL of its information and data<br />
            <a className={"red-button"} onClick={this.confirmDelete}>
              Yes
            </a>
            <a className={"orange-button"} onClick={this.handleModalClose}>
              No
            </a>
          </div>
        </Modal>
        <Modal isOpen={this.state.shortsModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={this.shortsModalStyles}>
          <ul className="licensor-modal-list">
            {this.state.otherShorts.map(function(short, index) {
              return(
                <li key={index} onClick={this.clickShortButton} data-id={short.id}>{short.title}</li>
              );
            }.bind(this))}
          </ul>
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
          Delete DVD
        </a>
      </div>
    )
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = DvdDetails;
