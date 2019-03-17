var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var MerchandiseItemsStore = require('../stores/merchandise-items-store.js');
var ErrorsStore = require('../stores/errors-store.js');
import ModalSelect from './modal-select.jsx';

var MerchandiseItemDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      merchandiseItem: {},
      merchandiseItemSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    });
  },

  componentDidMount: function() {
    this.merchandiseItemListener = MerchandiseItemsStore.addListener(this.getMerchandiseItem);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchMerchandiseItem(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.merchandiseItemsListener.remove();
    this.errorsListener.remove();
  },

  getMerchandiseItem: function() {
    this.setState({
      merchandiseItem: Tools.deepCopy(MerchandiseItemsStore.find(window.location.pathname.split("/")[2])),
      merchandiseItemSaved: MerchandiseItemsStore.find(window.location.pathname.split("/")[2]),
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
        ClientActions.updateMerchandiseItem(this.state.merchandiseItem);
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
      ClientActions.deleteAndGoToIndex('merchandise_items', this.state.merchandiseItem.id);
    });
  },

  handleModalClose: function() {
    this.setState({
      deleteModalOpen: false
    });
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.merchandiseItem, this.state.merchandiseItemSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "merchandiseItem",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  },

  clickSelectFilmButton: function() {
    this.setState({
      filmsModalOpen: true
    });
  },

  closeModal: function() {
    this.setState({
      filmsModalOpen: false
    });
  },

  selectFilm: function(e) {
    var merchandiseItem = this.state.merchandiseItem;
    merchandiseItem.filmId = +e.target.dataset.id;
    this.setState({
      merchandiseItem: merchandiseItem,
      filmsModalOpen: false
    }, function() {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  },

  render: function() {
    return(
      <div id="merchandiseItem-details">
        <div className="component details-component">
          <h1>Merchandise Details</h1>
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-6">
                <h2>Name</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.name) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.merchandiseItem.name || "" } data-field="name" />
                { Common.renderFieldError(this.state.errors, Common.errors.name) }
              </div>
              <div className="col-xs-6">
                <h2>Type</h2>
                <select onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="merchandiseTypeId" value={ this.state.merchandiseItem.merchandiseTypeId }>
                  { MerchandiseItemsStore.types().map(function(type) {
                    return(
                      <option key={ type.id } value={ type.id }>{ type.name }</option>
                    );
                  }) }
                </select>
                { Common.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12">
                <h2>Description</h2>
                <input onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.merchandiseItem.description || "" } data-field="description" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-4">
                <h2>Size</h2>
                <input onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.merchandiseItem.size || "" } data-field="size" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-4">
                <h2>Price</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.price) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.merchandiseItem.price || "" } data-field="price" />
                { Common.renderFieldError(this.state.errors, Common.errors.price) }
              </div>
              <div className="col-xs-4">
                <h2>Inventory</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.inventory) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.merchandiseItem.inventory || "" } data-field="inventory" />
                { Common.renderFieldError(this.state.errors, Common.errors.inventory) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-11">
                <h2>Associated Film</h2>
                <input onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.merchandiseItem.filmId ? MerchandiseItemsStore.findFilm(this.state.merchandiseItem.filmId).title : "(None)" } data-field="filmId" readOnly={ true } />
                { Common.renderFieldError(this.state.filmErrors, []) }
              </div>
              <div className="col-xs-1 icons-column">
                <img src={ Images.openModal } onClick={ this.clickSelectFilmButton } />
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.filmsModalOpen } onRequestClose={ this.closeModal } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ MerchandiseItemsStore.films() } property={ "title" } func={ this.selectFilm } />
        </Modal>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this merchandise&#63;</h1>
            Deleting merchandise will erase ALL of its information and data<br />
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
        <a className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave }>
          { buttonText }
        </a>
        <a id="delete" className={ "orange-button " + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete }>
          Delete Merchandise
        </a>
      </div>
    );
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = MerchandiseItemDetails;
