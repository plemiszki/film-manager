var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var SublicensorsStore = require('../stores/sublicensors-store.js');
var ErrorsStore = require('../stores/errors-store.js');
var FilmRightsNew = require('./film-rights-new.jsx');

var SublicensorDetails = React.createClass({

  newRightsModalStyles: {
    overlay: {
      background: 'rgba(0, 0, 0, 0.50)'
    },
    content: {
      background: '#F5F6F7',
      padding: 0,
      margin: 'auto',
      maxWidth: 1000,
      height: 575
    }
  },

  getInitialState: function() {
    return({
      fetching: true,
      sublicensor: {},
      sublicensorSaved: {},
      films: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      newRightsModalOpen: false,
      rightsSortBy: 'film'
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
    this.setState({
      deleteModalOpen: false,
      newRightsModalOpen: false
    });
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

  clickRightsHeader: function(property) {
    this.setState({
      rightsSortBy: property
    });
  },

  clickAddRight: function() {
    this.setState({
      newRightsModalOpen: true
    });
  },

  redirect: function(directory, id) {
    window.location.pathname = directory + "/" + id;
  },

  render: function() {
    return(
      <div className="sublicensor-details">
        <div className="component details-component">
          <h1>Sublicensor Details</h1>
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-4">
                <h2>Name</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.name) } onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.sublicensor.name || ""} data-field="name" />
                { Common.renderFieldError(this.state.errors, Common.errors.name) }
              </div>
              <div className="col-xs-4">
                <h2>Contact Name</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.sublicensor.contactName || ""} data-field="contactName" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-4">
                <h2>Email</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.sublicensor.email || ""} data-field="email" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-4">
                <h2>Phone</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.sublicensor.phone || ""} data-field="phone" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>W-8 on File</h2>
                <select onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="w8" value={this.state.sublicensor.w8} >
                  <option value={ "no" }>No</option>
                  <option value={ "yes" }>Yes</option>
                </select>
              </div>
            </div>
            { this.renderButtons() }
            <hr className="rights-divider" />
            <h3>Sublicensed Rights:</h3>
            <div className="row">
              <div className="col-xs-12">
                <table className={ "admin-table" }>
                  <thead>
                    <tr>
                      <th><div className={ this.state.rightsSortBy === 'film' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'film') }>Film</div></th>
                      <th><div className={ this.state.rightsSortBy === 'name' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'name') }>Right</div></th>
                      <th><div className={ this.state.rightsSortBy === 'territory' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'territory') }>Territory</div></th>
                      <th><div className={ this.state.rightsSortBy === 'startDate' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'startDate') }>Start Date</div></th>
                      <th><div className={ this.state.rightsSortBy === 'endDate' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'endDate') }>End Date</div></th>
                      <th><div className={ this.state.rightsSortBy === 'exclusive' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'exclusive') }>Exclusive</div></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td></td><td></td><td></td><td></td><td></td></tr>
                    { _.orderBy(SublicensorsStore.rights(), this.state.rightsSortBy).map(function(right, index) {
                      return(
                        <tr key={ index } onClick={ this.redirect.bind(this, 'sub_rights', right.id) }>
                          <td className="indent">
                            { right.film }
                          </td>
                          <td>
                            { right.name }
                          </td>
                          <td>
                            { right.territory }
                          </td>
                          <td>
                            { right.startDate }
                          </td>
                          <td>
                            { right.endDate }
                          </td>
                          <td>
                            { right.exclusive }
                          </td>
                        </tr>
                      );
                    }.bind(this)) }
                  </tbody>
                </table>
                <a className={ 'blue-outline-button small' } onClick={ this.clickAddRight }>Add Rights</a>
              </div>
            </div>
          </div>
        </div>
        <Modal isOpen={ this.state.newRightsModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ this.newRightsModalStyles }>
          <FilmRightsNew sublicensorId={ this.state.sublicensor.id } />
        </Modal>
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
