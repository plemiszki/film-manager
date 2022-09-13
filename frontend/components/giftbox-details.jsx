import React from 'react'
import Modal from 'react-modal'
import ModalSelect from './modal-select.jsx'
import { Common, ConfirmDelete, Details, deepCopy, setUpNiceSelect, fetchEntity, createEntity, updateEntity, deleteEntity } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

export default class GiftboxDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      giftbox: {},
      giftboxSaved: {},
      giftboxDvds: [],
      otherDvds: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    fetchEntity({
      entityName: 'giftbox'
    }).then((response) => {
      const { giftbox, giftboxDvds, otherDvds } = response;
      this.setState({
        fetching: false,
        giftbox,
        giftboxSaved: deepCopy(giftbox),
        giftboxDvds,
        otherDvds
      }, () => {
        setUpNiceSelect({ selector: 'select', func: Details.changeDropdownField.bind(this) });
      });
    });
  }

  selectDvd(option, event) {
    const dvdId = event.target.dataset.id;
    this.setState({
      fetching: true,
      dvdsModalOpen: false
    });
    createEntity({
      directory: 'giftbox_dvds',
      entityName: 'giftboxDvd',
      entity: {
        giftboxId: this.state.giftbox.id,
        dvdId
      }
    }).then((response) => {
      const { giftboxDvds, otherDvds } = response;
      this.setState({
        fetching: false,
        giftboxDvds,
        otherDvds
      });
    });
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, function() {
      updateEntity({
        entityName: 'giftbox',
        entity: Details.removeFinanceSymbolsFromEntity({ entity: this.state.giftbox, fields: ['msrp'] })
      }).then((response) => {
        const { giftbox } = response;
        this.setState({
          fetching: false,
          giftbox,
          giftboxSaved: deepCopy(giftbox),
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

  clickX(e) {
    const giftboxDvdId = e.target.dataset.id;
    this.setState({
      fetching: true
    });
    deleteEntity({
      directory: 'giftbox_dvds',
      id: giftboxDvdId,
    }).then((response) => {
      const { giftboxDvds, otherDvds } = response;
      this.setState({
        fetching: false,
        giftboxDvds,
        otherDvds,
      });
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.giftbox, this.state.giftboxSaved);
  }

  changeFieldArgs() {
    return {
      thing: "giftbox",
      changesFunction: this.checkForChanges.bind(this),
    }
  }

  render() {
    const { giftbox } = this.state;
    return(
      <div id="giftbox-details">
        <div className="component details-component">
          <h1>Gift Box Details</h1>
          <div id="giftbox-profile-box" className="white-box">
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'giftbox', property: 'name' }) }
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'giftbox', property: 'upc', columnHeader: 'UPC' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'giftbox', property: 'msrp', columnHeader: 'MSRP' }) }
            </div>
            <div className="row">
              { Details.renderDropDown.bind(this)({ columnWidth: 2, entity: 'giftbox', property: 'onDemand', columnHeader: 'On Demand?', boolean: true }) }
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'giftbox', property: 'sageId', columnHeader: 'Sage ID' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'giftbox', property: 'quantity', readOnly: true, hidden: giftbox.onDemand }) }
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
                { this.state.giftboxDvds.map((giftboxDvd, index) => {
                  return(
                    <tr key={ index }>
                      <td className="name-column">
                        <div onClick={ FM.redirect.bind(this, "giftboxDvds", giftboxDvd.dvdId) }>
                          { giftboxDvd.title }
                        </div>
                        <div className="x-button" onClick={ this.clickX.bind(this) } data-id={ giftboxDvd.id }></div>
                      </td>
                    </tr>
                  );
                }) }
              </tbody>
            </table>
            <a className={ 'blue-outline-button small' } onClick={ Common.changeState.bind(this, 'dvdsModalOpen', true) }>Add DVD</a>
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete
            entityName="giftbox"
            confirmDelete={ Details.clickDelete.bind(this) }
            closeModal={ Common.closeModals.bind(this) }
          />
        </Modal>
        <Modal isOpen={ this.state.dvdsModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.otherDvds } property={ "title" } func={ this.selectDvd.bind(this) } />
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
      </div>
    );
  }
}
