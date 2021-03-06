import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import GiftboxesStore from '../stores/giftboxes-store.js'
import ErrorsStore from '../stores/errors-store.js'
import ModalSelect from './modal-select.jsx'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

const dvdsModalStyles = {
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
}

class GiftboxDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      giftbox: {},
      giftboxSaved: {},
      dvds: [],
      otherDvds: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    this.giftboxListener = GiftboxesStore.addListener(this.getGiftbox.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchGiftbox(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.giftboxListener.remove();
    this.errorsListener.remove();
  }

  getGiftbox() {
    this.setState({
      giftbox: Tools.deepCopy(GiftboxesStore.find(window.location.pathname.split("/")[2])),
      giftboxSaved: GiftboxesStore.find(window.location.pathname.split("/")[2]),
      dvds: GiftboxesStore.dvds(),
      otherDvds: GiftboxesStore.otherDvds(),
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

  clickAddDvdButton() {
    this.setState({
      dvdsModalOpen: true
    });
  }

  selectDvd(event) {
    var dvdId = event.target.dataset.id;
    this.setState({
      fetching: true,
      dvdsModalOpen: false
    }, () => {
      ClientActions.createGiftboxDvd(this.state.giftbox.id, dvdId);
    });
  }

  clickSave() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, () => {
        ClientActions.updateGiftbox(this.state.giftbox);
      });
    }
  }

  clickXButton(event) {
    var id = event.target.dataset.id;
    this.setState({
      fetching: true
    }, () => {
      ClientActions.deleteGiftboxDvd(this.state.giftbox.id, id);
    });
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
      ClientActions.deleteGiftbox(this.state.giftbox.id);
    });
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false,
      dvdsModalOpen: false
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.giftbox, this.state.giftboxSaved);
  }

  changeFieldArgs() {
    return {
      thing: "giftbox",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    return(
      <div id="giftbox-details">
        <div className="component details-component">
          <h1>Gift Box Details</h1>
          <div id="giftbox-profile-box" className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-6">
                <h2>Name</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.name) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.giftbox.name || "" } data-field="name" />
                { Details.renderFieldError(this.state.errors, FM.errors.name) }
              </div>
              <div className="col-xs-4">
                <h2>UPC</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.upc) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.giftbox.upc || "" } data-field="upc" />
                { Details.renderFieldError(this.state.errors, FM.errors.upc) }
              </div>
              <div className="col-xs-2">
                <h2>MSRP</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.msrp) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.giftbox.msrp || "" } data-field="msrp" />
                { Details.renderFieldError(this.state.errors, FM.errors.msrp) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-6">
                <h2>Type</h2>
                <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="onDemand" value={ this.state.giftbox.onDemand } >
                  <option value={ "no" }>Prepackaged</option>
                  <option value={ "yes" }>Assemble on Demand</option>
                </select>
              </div>
              <div className={ "col-xs-3" + (this.state.giftbox.onDemand === "yes" ? " hidden" : "") } >
                <h2>Quantity</h2>
                <input value={ this.state.giftbox.quantity === undefined ? "" : this.state.giftbox.quantity } readOnly={ true } data-field="quantity" />
                { Details.renderFieldError([], []) }
              </div>
              <div className="col-xs-3">
                <h2>Sage ID</h2>
                <input onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.giftbox.sageId || "" } data-field="sageId" />
                { Details.renderFieldError([], []) }
              </div>
            </div>
            { this.renderButtons() }
            <hr />
            <table className="fm-admin-table">
              <thead>
                <tr>
                  <th>DVDs</th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td></tr>
                { this.state.dvds.map((dvd, index) => {
                  return(
                    <tr key={ index }>
                      <td className="name-column">
                        <div onClick={ FM.redirect.bind(this, "dvds", dvd.id) }>
                          { dvd.title }
                        </div>
                        <div className="x-button" onClick={ this.clickXButton.bind(this) } data-id={ dvd.id }></div>
                      </td>
                    </tr>
                  );
                }) }
              </tbody>
            </table>
            <a className={ 'blue-outline-button small' } onClick={ this.clickAddDvdButton.bind(this) }>Add DVD</a>
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete entityName="giftBox" confirmDelete={ this.confirmDelete.bind(this) } closeModal={ Common.closeModals.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.dvdsModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.otherDvds } property={ "title" } func={ this.selectDvd.bind(this) } />
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
        <a className={ "orange-button" + Common.renderInactiveButtonClass(this.state.fetching || this.state.changesToSave == false) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        <a id="delete" className={ "orange-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
          Delete Gift Box
        </a>
      </div>
    );
  }

  componentDidUpdate() {
    FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
}

export default GiftboxDetails;
