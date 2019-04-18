import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import DvdsStore from '../stores/dvds-store.js'
import ErrorsStore from '../stores/errors-store.js'

class DvdDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
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
    };
  }

  componentDidMount() {
    this.dvdListener = DvdsStore.addListener(this.getDvd.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchDvd(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.dvdListener.remove();
    this.errorsListener.remove();
  }

  getDvd() {
    this.setState({
      dvd: Tools.deepCopy(DvdsStore.find(window.location.pathname.split("/")[2])),
      dvdSaved: DvdsStore.find(window.location.pathname.split("/")[2]),
      shorts: DvdsStore.shorts(),
      otherShorts: DvdsStore.otherShorts(),
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

  clickAddShort() {
    this.setState({
      shortsModalOpen: true
    });
  }

  clickSave() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, () => {
        ClientActions.updateDvd(this.state.dvd);
      });
    }
  }

  clickAddShortButton() {
    this.setState({
      shortsModalOpen: true
    });
  }

  clickShortButton(event) {
    var shortId = event.target.dataset.id;
    this.setState({
      fetching: true,
      shortsModalOpen: false
    }, () => {
      ClientActions.createDvdShort(this.state.dvd.id, shortId);
    });
  }

  clickXButton(event) {
    var id = event.target.dataset.id;
    this.setState({
      fetching: true
    }, () => {
      ClientActions.deleteDvdShort(this.state.dvd.id, id);
    });
  }

  clickDelete() {
    this.setState({
      deleteModalOpen: true
    });
  }

  getHTML() {
    var textArea = document.createElement('textarea');
    textArea.value = $.trim($('#email').html().replace(/>\s+</g, "><"));
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('HTML copied to clipboard');
  }

  confirmDelete() {
    this.setState({
      fetching: true,
      deleteModalOpen: false
    }, () => {
      ClientActions.deleteDvd(this.state.dvd);
    });
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false,
      shortsModalOpen: false
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.dvd, this.state.dvdSaved);
  }

  changeFieldArgs() {
    return {
      thing: "dvd",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    return(
      <div id="dvd-details">
        <div className="component">
          <h1>DVD Details</h1>
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-6">
                <h2>Title</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvd.title || "" } readOnly={ true } />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-3">
                <h2>DVD Type</h2>
                  <select onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="dvdTypeId" value={ this.state.dvd.dvdTypeId }>
                    { DvdsStore.types().map((type, index) => {
                      return(
                        <option key={ index } value={ type.id }>{ type.name }</option>
                      );
                    }) }
                  </select>
                { Common.renderFieldError(this.state.errors, Common.errors.dvdTypeId) }
              </div>
              <div className="col-xs-3">
                <h2>UPC</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvd.upc || "" } data-field="upc" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-2">
                <h2>PreBook Date</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.preBookDate) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvd.preBookDate || "" } data-field="preBookDate" />
                { Common.renderFieldError(this.state.errors, Common.errors.preBookDate) }
              </div>
              <div className="col-xs-2">
                <h2>Retail Date</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.retailDate) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvd.retailDate || "" } data-field="retailDate" />
                { Common.renderFieldError(this.state.errors, Common.errors.retailDate) }
              </div>
              <div className="col-xs-2">
                <h2>Price</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.price) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvd.price || "" } data-field="price" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Stock</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvd.stock } readOnly={ true } />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2 repressing-column">
                <input id="repressing" className="checkbox" type="checkbox" onChange={ Common.changeCheckBox.bind(this, this.changeFieldArgs()) } checked={ this.state.dvd.repressing || false } data-field="repressing" /><label className="checkbox">Repressing</label>
              </div>
              <div className="col-xs-2">
                <h2>Units Shipped</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvd.unitsShipped } readOnly={ true } />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-1">
                <h2>Discs</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.discs) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvd.discs || "" } data-field="discs" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-5">
                <h2>Sound Configuration</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvd.soundConfig || "" } data-field="soundConfig" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-6">
                <h2>Special Features</h2>
                <textarea rows="5" className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvd.specialFeatures || "" } data-field="specialFeatures" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Short Films</th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td></tr>
                { this.state.shorts.map((short, index) => {
                  return(
                    <tr key={ index }>
                      <td className="name-column">
                        <div onClick={ Common.redirect.bind(this, "films", short.id) }>
                          { short.title }
                        </div>
                        <div className="x-button" onClick={ this.clickXButton.bind(this) } data-id={ short.id }></div>
                      </td>
                    </tr>
                  );
                }) }
              </tbody>
            </table>
            <a className="blue-outline-button small" onClick={ this.clickAddShortButton.bind(this) }>Add Short</a>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to delete this DVD&#63;</h1>
            Deleting a DVD will erase ALL of its information and data<br />
            <a className="red-button" onClick={ this.confirmDelete.bind(this) }>
              Yes
            </a>
            <a className="orange-button" onClick={ this.closeModal.bind(this) }>
              No
            </a>
          </div>
        </Modal>
        <Modal isOpen={ this.state.shortsModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.SelectModalStyles }>
          <ul className="licensor-modal-list">
            { this.state.otherShorts.map((short, index) => {
              return(
                <li key={ index } onClick={ this.clickShortButton.bind(this) } data-id={ short.id }>{ short.title }</li>
              );
            }) }
          </ul>
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
        <a id="delete" className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
          Delete DVD
        </a>
        <a className={ "html orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.getHTML.bind(this) }>
          Email HTML
        </a>
      </div>
    );
  }

  componentDidUpdate() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
}

export default DvdDetails;
