import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import LicensorsStore from '../stores/licensors-store.js'
import ErrorsStore from '../stores/errors-store.js'

class LicensorDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      licensor: {},
      licensorSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    this.licensorListener = LicensorsStore.addListener(this.getLicensor.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchLicensor(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.licensorListener.remove();
    this.errorsListener.remove();
  }

  getLicensor() {
    this.setState({
      licensor: Tools.deepCopy(LicensorsStore.find(window.location.pathname.split("/")[2])),
      licensorSaved: LicensorsStore.find(window.location.pathname.split("/")[2]),
      fetching: false
    }, () => {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  }

  getErrors() {
    this.setState({
      errors: ErrorsStore.all(),
      fetching: false
    });
  }

  clickSave() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, () => {
        ClientActions.updateLicensor(this.state.licensor);
      });
    }
  }

  redirect(id) {
    window.location.pathname = "films/" + id;
  }

  clickDelete() {
    this.setState({
      deleteModalOpen: true
    });
  }

  confirmDelete() {
    this.setState({
      fetching: true,
      deleteModalOpen: false
    }, () => {
      ClientActions.deleteLicensor(this.state.licensor.id);
    });
  }

  closeModal() {
    this.setState({ deleteModalOpen: false });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.licensor, this.state.licensorSaved);
  }

  changeFieldArgs() {
    return {
      thing: "licensor",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    return(
      <div id="licensor-profile">
        <div className="component">
          <h1>Licensor Details</h1>
          <div id="licensor-profile-box" className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-12 col-sm-6">
                <h2>Name</h2>
                <input className={ Common.errorClass(this.state.errors, ["Name can't be blank"]) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.licensor.name || "" } data-field="name" />
                { Common.renderFieldError(this.state.errors, ["Name can't be blank"]) }
              </div>
              <div className="col-xs-12 col-sm-6">
                <h2>Royalty Emails</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.email) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.licensor.email || "" } data-field="email" />
                { Common.renderFieldError(this.state.errors, Common.errors.email) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12 col-sm-12">
                <h2>Address</h2>
                <textarea rows="5" cols="20" onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.licensor.address || "" } data-field="address" />
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12 col-sm-12">
                <table className={ "admin-table" }>
                  <thead>
                    <tr>
                      <th>Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td></td></tr>
                    { LicensorsStore.films().map((film, index) => {
                      return(
                        <tr key={ index } onClick={ this.redirect.bind(this, film.id) }>
                          <td className="name-column">
                            { film.title }
                          </td>
                        </tr>
                      );
                    }) }
                  </tbody>
                </table>
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this licensor&#63;</h1>
            Deleting a licensor will erase ALL of its information and data<br />
            <a className={ "red-button" } onClick={ this.confirmDelete.bind(this) }>
              Yes
            </a>
            <a className={ "orange-button" } onClick={ this.closeModal.bind(this) }>
              No
            </a>
          </div>
        </Modal>
      </div>
    );
  }

  renderButtons() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        <a id="delete" className={ "orange-button " + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
          Delete Licensor
        </a>
      </div>
    )
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default LicensorDetails;
