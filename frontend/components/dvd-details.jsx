import React from 'react'
import Modal from 'react-modal'
import ModalSelect from './modal-select.jsx'
import { Common, ConfirmDelete, Details, deepCopy, setUpNiceSelect, fetchEntity, createEntity, updateEntity, deleteEntity } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

export default class DvdDetails extends React.Component {

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
      dvdTypes: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      shortsModalOpen: false
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { dvd, shorts, otherShorts, dvdTypes } = response;
      this.setState({
        fetching: false,
        dvd,
        dvdSaved: deepCopy(dvd),
        shorts,
        otherShorts,
        dvdTypes
      }, () => {
        setUpNiceSelect({ selector: 'select', func: Details.changeDropdownField.bind(this) });
      });
    });
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, () => {
      updateEntity({
        entityName: 'dvd',
        entity: Details.removeFinanceSymbolsFromEntity({ entity: this.state.dvd, fields: ['price'] })
      }).then((response) => {
        const { dvd } = response;
        this.setState({
          fetching: false,
          dvd,
          dvdSaved: deepCopy(dvd),
          changesToSave: false
        });
      }, (response) => {
        this.setState({
          fetching: false,
          errors: response.errors
        });
      });
    });
  }

  selectShort(option, event) {
    const shortId = event.target.dataset.id;
    this.setState({
      fetching: true,
      shortsModalOpen: false
    });
    createEntity({
      directory: 'dvd_shorts',
      entityName: 'dvdShort',
      entity: {
        dvdId: this.state.dvd.id,
        shortId
      }
    }).then((response) => {
      const { shorts, otherShorts } = response;
      this.setState({
        fetching: false,
        shorts,
        otherShorts
      });
    });
  }

  clickX(e) {
    const dvdShortId = e.target.dataset.id;
    this.setState({
      fetching: true
    });
    deleteEntity({
      directory: 'dvd_shorts',
      id: dvdShortId,
    }).then((response) => {
      const { shorts, otherShorts } = response;
      this.setState({
        fetching: false,
        shorts,
        otherShorts,
      });
    });
  }

  confirmDelete() {
    this.setState({
      fetching: true,
      deleteModalOpen: false
    });
    deleteEntity({
      directory: 'dvds',
      id: this.state.dvd.id,
    }).then((response) => {
      const dvd = response;
      window.location.pathname = `/films/${dvd.feature_film_id}`;
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

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.dvd, this.state.dvdSaved);
  }

  changeFieldArgs() {
    return {
      thing: "dvd",
      changesFunction: this.checkForChanges.bind(this),
    }
  }

  render() {
    return(
      <div id="dvd-details">
        <div className="component">
          <h1>DVD Details</h1>
          <div className="white-box">
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'dvd', property: 'title', readOnly: true }) }
              { Details.renderDropDown.bind(this)({ columnWidth: 3, entity: 'dvd', property: 'dvdTypeId', columnHeader: 'DVD Type', options: this.state.dvdTypes, optionDisplayProperty: 'name' }) }
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'dvd', property: 'upc', columnHeader: 'UPC' }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'dvd', property: 'preBookDate' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'dvd', property: 'retailDate' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'dvd', property: 'price' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'dvd', property: 'unitsShipped', readOnly: true }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'dvd', property: 'stock', readOnly: true }) }
              { Details.renderSwitch.bind(this)({ columnWidth: 2, entity: 'dvd', property: 'repressing' }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 1, entity: 'dvd', property: 'discs' }) }
              { Details.renderField.bind(this)({ columnWidth: 5, entity: 'dvd', property: 'soundConfig', columnHeader: 'Sound Configuration' }) }
              { Details.renderField.bind(this)({ type: 'textbox', columnWidth: 6, entity: 'dvd', property: 'specialFeatures', rows: 5 }) }
            </div>
            <table className="fm-admin-table">
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
                        <div onClick={ FM.redirect.bind(this, "films", short.filmId) }>
                          { short.title }
                        </div>
                        <div className="x-button" onClick={ this.clickX.bind(this) } data-id={ short.id }></div>
                      </td>
                    </tr>
                  );
                }) }
              </tbody>
            </table>
            <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'shortsModalOpen', true) }>Add Short</a>
            { this.renderButtons() }
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete
            entityName="dvd"
            confirmDelete={ this.confirmDelete.bind(this) }
            closeModal={ Common.closeModals.bind(this) }
          />
        </Modal>
        <Modal isOpen={ this.state.shortsModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.otherShorts } property={ "title" } func={ this.selectShort.bind(this) } />
        </Modal>
      </div>
    );
  }

  renderButtons() {
    return(
      <div>
        <a className={ "btn blue-button standard-width" + Common.renderDisabledButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
          { Details.saveButtonText.call(this) }
        </a>
        <a className={ "btn delete-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Common.changeState.bind(this, 'deleteModalOpen', true) }>
          Delete
        </a>
        <a className={ "html orange-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ this.getHTML.bind(this) }>
          Email HTML
        </a>
      </div>
    );
  }
}
