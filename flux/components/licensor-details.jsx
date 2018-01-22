var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var LicensorsStore = require('../stores/licensors-store.js');
var ErrorsStore = require('../stores/errors-store.js');

var LicensorDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      licensor: {},
      licensorSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    });
  },

  componentDidMount: function() {
    this.licensorListener = LicensorsStore.addListener(this.getLicensor);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchLicensor(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.licensorListener.remove();
    this.errorsListener.remove();
  },

  getLicensor: function() {
    this.setState({
      licensor: Tools.deepCopy(LicensorsStore.find(window.location.pathname.split("/")[2])),
      licensorSaved: LicensorsStore.find(window.location.pathname.split("/")[2]),
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
        ClientActions.updateLicensor(this.state.licensor);
      });
    }
  },

  redirect: function(id) {
    window.location.pathname = "films/" + id;
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
      ClientActions.deleteLicensor(this.state.licensor.id);
    });
  },

  handleModalClose: function() {
    this.setState({deleteModalOpen: false});
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.licensor, this.state.licensorSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "licensor",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  },

  render: function() {
    return(
      <div id="licensor-profile" className={this.props.new ? "admin-modal" : ""}>
        <div className="component">
          <h1>Licensor Details</h1>
          <div id="licensor-profile-box" className="white-box">
            {HandyTools.renderSpinner(this.state.fetching)}
            {HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5)}
            <div className="row">
              <div className="col-xs-12 col-sm-6">
                <h2>Name</h2>
                <input className={Common.errorClass(this.state.errors, ["Name can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.licensor.name || ""} data-field="name" />
                {Common.renderFieldError(this.state.errors, ["Name can't be blank"])}
              </div>
              <div className="col-xs-12 col-sm-6">
                <h2>Royalty Emails</h2>
                <input className={Common.errorClass(this.state.errors, Common.errors.email)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.licensor.email || ""} data-field="email" />
                {Common.renderFieldError(this.state.errors, Common.errors.email)}
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12 col-sm-12">
                <h2>Address</h2>
                <textarea rows="5" cols="20" onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.licensor.address || ""} data-field="address" />
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12 col-sm-12">
                <table className={"admin-table"}>
                  <thead>
                    <tr>
                      <th>Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td></td></tr>
                    {LicensorsStore.films().map(function(film, index) {
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
            {this.renderButtons()}
          </div>
        </div>
        <Modal isOpen={this.state.deleteModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={Common.deleteModalStyles}>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this licensor&#63;</h1>
            Deleting a licensor will erase ALL of its information and data<br />
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
        <a className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave }>
          { buttonText }
        </a>
        <a id="delete" className={ "orange-button " + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete }>
          Delete Licensor
        </a>
      </div>
    )
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = LicensorDetails;
