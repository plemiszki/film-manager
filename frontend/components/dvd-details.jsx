import React from 'react'
import Modal from 'react-modal'
import { Common, Details, deepCopy, setUpNiceSelect, fetchEntity, createEntity, updateEntity, deleteEntity, OutlineButton, Spinner, GrayedOut, SaveButton, DeleteButton, Button, Table, ModalSelect } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

export default class DvdDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      spinner: true,
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
        spinner: false,
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
      spinner: true,
      justSaved: true
    }, () => {
      updateEntity({
        entityName: 'dvd',
        entity: Details.removeFinanceSymbolsFromEntity({ entity: this.state.dvd, fields: ['price'] })
      }).then((response) => {
        const { dvd } = response;
        this.setState({
          spinner: false,
          dvd,
          dvdSaved: deepCopy(dvd),
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

  selectShort(option) {
    const shortId = option.id;
    this.setState({
      spinner: true,
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
        spinner: false,
        shorts,
        otherShorts
      });
    });
  }

  clickX(option) {
    const dvdShortId = option.id;
    this.setState({
      spinner: true
    });
    deleteEntity({
      directory: 'dvd_shorts',
      id: dvdShortId,
    }).then((response) => {
      const { shorts, otherShorts } = response;
      this.setState({
        spinner: false,
        shorts,
        otherShorts,
      });
    });
  }

  confirmDelete() {
    this.setState({
      spinner: true,
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
    const { spinner, justSaved, changesToSave, shorts, dvd } = this.state;
    return (
      <>
        <div className="handy-component">
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
            <Table
              columns={ [{ header: 'Short Films', name: 'title' }] }
              rows={ shorts }
              clickDelete={ (entity) => this.clickX(entity) }
              urlPrefix="films"
              urlProperty="filmId"
              sortable={ false }
              style={ { marginBottom: 15 } }
            />
            <OutlineButton
              text="Add Short"
              onClick={ () => { this.setState({ shortsModalOpen: true }) } }
              marginBottom
            />
            <hr />
            <div>
              <SaveButton
                justSaved={ justSaved }
                changesToSave={ changesToSave }
                disabled={ spinner }
                onClick={ () => { this.clickSave() } }
              />
              <DeleteButton
                entityName="dvd"
                confirmDelete={ Details.confirmDelete.bind(this, {
                  callback: () => window.location.href = `/films/${dvd.featureFilmId}?tab=dvds`,
                }) }
              />
              <Button
                marginRight
                float
                disabled={ spinner }
                text="Email HTML"
                onClick={ () => { this.getHTML() } }
              />
            </div>
            <GrayedOut visible={ spinner } />
            <Spinner visible={ spinner } />
          </div>
        </div>
        <Modal isOpen={ this.state.shortsModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.otherShorts } property="title" func={ this.selectShort.bind(this) } />
        </Modal>
      </>
    );
  }
}
