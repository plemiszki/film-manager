import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ModalSelect from './modal-select.jsx'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import { fetchEntity, createEntity, updateEntity, deleteEntity } from '../actions/index'
import FM from '../../app/assets/javascripts/me/common.jsx'

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
      dvdTypes: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      shortsModalOpen: false
    };
  }

  componentDidMount() {
    this.props.fetchEntity({
      id: window.location.pathname.split('/')[2],
      directory: window.location.pathname.split('/')[1],
      entityName: 'dvd'
    }, 'dvd').then(() => {
      const { dvd, shorts, otherShorts, dvdTypes } = this.props;
      this.setState({
        fetching: false,
        dvd,
        dvdSaved: HandyTools.deepCopy(dvd),
        shorts,
        otherShorts,
        dvdTypes
      }, () => {
        HandyTools.setUpNiceSelect({ selector: 'select', func: Details.changeDropdownField.bind(this) });
      });
    });
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, function() {
      this.props.updateEntity({
        id: window.location.pathname.split("/")[2],
        directory: window.location.pathname.split("/")[1],
        entityName: 'dvd',
        entity: Details.removeFinanceSymbolsFromEntity({ entity: this.state.dvd, fields: ['price'] })
      }).then(() => {
        const { dvd } = this.props;
        this.setState({
          fetching: false,
          dvd,
          dvdSaved: HandyTools.deepCopy(dvd),
          changesToSave: false
        });
      }, () => {
        this.setState({
          fetching: false,
          errors: this.props.errors
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
    this.props.createEntity({
      directory: 'dvd_shorts',
      entityName: 'dvdShort',
      entity: {
        dvdId: this.state.dvd.id,
        shortId
      }
    }).then(() => {
      const { shorts, otherShorts } = this.props;
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
    this.props.deleteEntity({
      directory: 'dvd_shorts',
      id: dvdShortId,
    }).then(() => {
      const { shorts, otherShorts } = this.props;
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
    this.props.deleteEntity({
      directory: 'dvds',
      id: this.state.dvd.id,
    }).then(() => {
      window.location.pathname = `/films/${this.state.dvd.featureFilmId}`;
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
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this),
      allErrors: FM.errors
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
              <div className="col-xs-6">
                <h2>Special Features</h2>
                <textarea rows="5" className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvd.specialFeatures || "" } data-field="specialFeatures" />
              </div>
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

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntity, createEntity, updateEntity, deleteEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DvdDetails);
