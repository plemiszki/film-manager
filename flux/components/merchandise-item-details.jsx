import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import MerchandiseItemsStore from '../stores/merchandise-items-store.js'
import ErrorsStore from '../stores/errors-store.js'
import ModalSelect from './modal-select.jsx'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

class MerchandiseItemDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      merchandiseItem: {},
      merchandiseItemSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    this.merchandiseItemListener = MerchandiseItemsStore.addListener(this.getMerchandiseItem.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchMerchandiseItem(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.merchandiseItemsListener.remove();
    this.errorsListener.remove();
  }

  getMerchandiseItem() {
    this.setState({
      merchandiseItem: Tools.deepCopy(MerchandiseItemsStore.find(window.location.pathname.split("/")[2])),
      merchandiseItemSaved: MerchandiseItemsStore.find(window.location.pathname.split("/")[2]),
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
        ClientActions.updateMerchandiseItem(this.state.merchandiseItem);
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
      ClientActions.deleteAndGoToIndex('merchandise_items', this.state.merchandiseItem.id);
    });
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.merchandiseItem, this.state.merchandiseItemSaved);
  }

  changeFieldArgs() {
    return {
      thing: "merchandiseItem",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  clickSelectFilmButton() {
    this.setState({
      filmsModalOpen: true
    });
  }

  closeModal() {
    this.setState({
      filmsModalOpen: false
    });
  }

  selectFilm(e) {
    var merchandiseItem = this.state.merchandiseItem;
    merchandiseItem.filmId = +e.target.dataset.id;
    this.setState({
      merchandiseItem: merchandiseItem,
      filmsModalOpen: false
    }, () => {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  }

  render() {
    return(
      <div id="merchandiseItem-details">
        <div className="component details-component">
          <h1>Merchandise Details</h1>
          <div className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-6">
                <h2>Name</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.name) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.merchandiseItem.name || "" } data-field="name" />
                { Details.renderFieldError(this.state.errors, FM.errors.name) }
              </div>
              <div className="col-xs-6">
                <h2>Type</h2>
                <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="merchandiseTypeId" value={ this.state.merchandiseItem.merchandiseTypeId }>
                  { MerchandiseItemsStore.types().map((type) => {
                    return(
                      <option key={ type.id } value={ type.id }>{ type.name }</option>
                    );
                  }) }
                </select>
                { Details.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12">
                <h2>Description</h2>
                <input onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.merchandiseItem.description || "" } data-field="description" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-4">
                <h2>Size</h2>
                <input onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.merchandiseItem.size || "" } data-field="size" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-4">
                <h2>Price</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.price) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.merchandiseItem.price || "" } data-field="price" />
                { Details.renderFieldError(this.state.errors, FM.errors.price) }
              </div>
              <div className="col-xs-4">
                <h2>Inventory</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.inventory) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.merchandiseItem.inventory || "" } data-field="inventory" />
                { Details.renderFieldError(this.state.errors, FM.errors.inventory) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-11">
                <h2>Associated Film</h2>
                <input onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.merchandiseItem.filmId ? MerchandiseItemsStore.findFilm(this.state.merchandiseItem.filmId).title : "(None)" } data-field="filmId" readOnly={ true } />
                { Details.renderFieldError(this.state.filmErrors, []) }
              </div>
              <div className="col-xs-1 icons-column">
                <img src={ Images.openModal } onClick={ this.clickSelectFilmButton.bind(this) } />
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.filmsModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ MerchandiseItemsStore.films() } property={ "title" } func={ this.selectFilm.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete entityName="merchandise" confirmDelete={ this.confirmDelete.bind(this) } closeModal={ Common.closeModals.bind(this) } />
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
        <a className={ "orange-button" + Common.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        <a id="delete" className={ "orange-button " + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
          Delete Merchandise
        </a>
      </div>
    );
  }

  componentDidUpdate() {
    FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
}

export default MerchandiseItemDetails;
