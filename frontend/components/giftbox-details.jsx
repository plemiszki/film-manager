import React from 'react'
import Modal from 'react-modal'
import { Common, Details, deepCopy, setUpNiceSelect, fetchEntity, createEntity, updateEntity, deleteEntity, BottomButtons, Spinner, GrayedOut, ModalSelect, OutlineButton, Table } from 'handy-components'
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

  selectDvd(option) {
    const dvdId = option.id;
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

  clickX(giftboxDvd) {
    const giftboxDvdId = giftboxDvd.id;
    this.setState({
      fetching: true,
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
    const { giftbox, giftboxDvds, justSaved, changesToSave, fetching } = this.state;
    return (
      <>
        <div className="handy-component">
          <h1>Gift Box Details</h1>
          <div id="giftbox-profile-box" className="white-box">
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'giftbox', property: 'name' }) }
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'giftbox', property: 'upc', columnHeader: 'UPC' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'giftbox', property: 'msrp', columnHeader: 'MSRP' }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'giftbox', property: 'sageId', columnHeader: 'Sage ID' }) }
              { Details.renderSwitch.bind(this)({ columnWidth: 2, entity: 'giftbox', property: 'onDemand', columnHeader: 'On Demand', boolean: true }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'giftbox', property: 'quantity', readOnly: true, hidden: giftbox.onDemand }) }
            </div>
            <BottomButtons
              entityName="giftBox"
              confirmDelete={ Details.confirmDelete.bind(this) }
              justSaved={ justSaved }
              changesToSave={ changesToSave }
              disabled={ fetching }
              clickSave={ () => { this.clickSave() } }
              marginBottom
            />
            <hr />
            <Table
              columns={ [{ header: 'DVDs', name: 'title' }] }
              rows={ giftboxDvds }
              clickDelete={ (entity) => this.clickX(entity) }
              urlPrefix="dvds"
              urlProperty="dvdId"
              sortable={ false }
              marginBottom
            />
            <OutlineButton
              text="Add DVD"
              onClick={ () => { this.setState({ dvdsModalOpen: true }) } }
            />
            <GrayedOut visible={ fetching } />
            <Spinner visible={ fetching } />
          </div>
        </div>
        <Modal isOpen={ this.state.dvdsModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.otherDvds } property={ "title" } func={ this.selectDvd.bind(this) } />
        </Modal>
      </>
    );
  }
}
