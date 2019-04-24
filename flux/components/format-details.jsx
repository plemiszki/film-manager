import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import FormatsStore from '../stores/formats-store.js'
import ErrorsStore from '../stores/errors-store.js'

class FormatDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      format: {},
      formatSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    this.formatListener = FormatsStore.addListener(this.getFormat.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchFormat(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.formatsListener.remove();
    this.errorsListener.remove();
  }

  getFormat() {
    this.setState({
      format: Tools.deepCopy(FormatsStore.find(window.location.pathname.split("/")[2])),
      formatSaved: FormatsStore.find(window.location.pathname.split("/")[2]),
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
        ClientActions.updateFormat(this.state.format);
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
      ClientActions.deleteAndGoToSettings('formats', this.state.format.id);
    });
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.format, this.state.formatSaved);
  }

  changeFieldArgs() {
    return {
      thing: "format",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    return(
      <div id="format-details">
        <div className="component details-component">
          <h1>Format Details</h1>
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-12">
                <h2>Name</h2>
                <input className={ FM.errorClass(this.state.errors, FM.errors.name) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.format.name || "" } data-field="name" />
                { FM.renderFieldError(this.state.errors, FM.errors.name) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ FM.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this format&#63;</h1>
            Deleting a format will erase ALL of its information and data<br />
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
          Delete Format
        </a>
      </div>
    )
  }

  componentDidUpdate() {
    FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
}

export default FormatDetails;
