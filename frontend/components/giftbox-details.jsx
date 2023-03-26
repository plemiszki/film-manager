import React from 'react'
import { Common, Details, deepCopy, setUpNiceSelect, fetchEntity, createEntity, updateEntity, deleteEntity, BottomButtons, Spinner, GrayedOut, ModalSelect, OutlineButton, Table } from 'handy-components'

export default class GiftboxDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      spinner: true,
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
        spinner: false,
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
      spinner: true,
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
        spinner: false,
        giftboxDvds,
        otherDvds
      });
    });
  }

  clickSave() {
    this.setState({
      spinner: true,
      justSaved: true
    }, function() {
      updateEntity({
        entityName: 'giftbox',
        entity: Details.removeFinanceSymbolsFromEntity({ entity: this.state.giftbox, fields: ['msrp'] })
      }).then((response) => {
        const { giftbox } = response;
        this.setState({
          spinner: false,
          giftbox,
          giftboxSaved: deepCopy(giftbox),
          changesToSave: false
        });
      }, (response) => {
        this.setState({
          spinner: false,
          errors: response.errors
        });
      });
    });
  }

  clickX(giftboxDvd) {
    const giftboxDvdId = giftboxDvd.id;
    this.setState({
      spinner: true,
    });
    deleteEntity({
      directory: 'giftbox_dvds',
      id: giftboxDvdId,
    }).then((response) => {
      const { giftboxDvds, otherDvds } = response;
      this.setState({
        spinner: false,
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
    const { giftbox, giftboxDvds, justSaved, changesToSave, spinner } = this.state;
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
              disabled={ spinner }
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
            <GrayedOut visible={ spinner } />
            <Spinner visible={ spinner } />
          </div>
        </div>
        <ModalSelect
          isOpen={ this.state.dvdsModalOpen }
          options={ this.state.otherDvds }
          property={ "title" }
          func={ this.selectDvd.bind(this) }
          onRequestClose={ Common.closeModals.bind(this) }
        />
      </>
    );
  }
}
