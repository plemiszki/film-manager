import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import DigitalRetailerStore from '../stores/digital-retailers-store.js'
import ErrorsStore from '../stores/errors-store.js'

class DigitalRetailerDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      digitalRetailer: {},
      digitalRetailerSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    this.digitalRetailerListener = DigitalRetailerStore.addListener(this.getDigitalRetailer.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchDigitalRetailer(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.digitalRetailersListener.remove();
    this.errorsListener.remove();
  }

  getDigitalRetailer() {
    this.setState({
      digitalRetailer: Tools.deepCopy(DigitalRetailerStore.find(window.location.pathname.split("/")[2])),
      digitalRetailerSaved: DigitalRetailerStore.find(window.location.pathname.split("/")[2]),
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
      }, function() {
        ClientActions.updateDigitalRetailer(this.state.digitalRetailer);
      });
    }
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
      ClientActions.deleteAndGoToSettings('digital_retailers', this.state.digitalRetailer.id);
    });
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.digitalRetailer, this.state.digitalRetailerSaved);
  }

  changeFieldArgs() {
    return {
      thing: "digitalRetailer",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    return(
      <div id="digital-retailer-details">
        <div className="component details-component">
          <h1>Digital Retailer Details</h1>
          <div id="digitalRetailer-profile-box" className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-12">
                <h2>Name</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.name) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.digitalRetailer.name || "" } data-field="name" />
                { Common.renderFieldError(this.state.errors, Common.errors.name) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this digital retailer&#63;</h1>
            Deleting a digital retailer will erase ALL of its information and data<br />
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
          Delete Digital Retailer
        </a>
      </div>
    );
  }

  componentDidUpdate() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
}

export default DigitalRetailerDetails;
