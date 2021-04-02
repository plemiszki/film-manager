import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import SublicensorsStore from '../stores/sublicensors-store.js'
import ErrorsStore from '../stores/errors-store.js'
import FilmRightsNew from './film-rights-new.jsx'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

const NewRightsModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 613
  }
}

class SublicensorDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      sublicensor: {},
      sublicensorSaved: {},
      films: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      newRightsModalOpen: false,
      rightsSortBy: 'film'
    };
  }

  componentDidMount() {
    this.sublicensorListener = SublicensorsStore.addListener(this.getSublicensors.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchSublicensor(window.location.pathname.split('/')[2]);
  }

  componentWillUnmount() {
    this.sublicensorListener.remove();
    this.errorsListener.remove();
  }

  getSublicensors() {
    this.setState({
      sublicensor: Tools.deepCopy(SublicensorsStore.find(window.location.pathname.split("/")[2])),
      sublicensorSaved: SublicensorsStore.find(window.location.pathname.split("/")[2]),
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
        ClientActions.updateSublicensor(this.state.sublicensor);
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
      ClientActions.deleteSublicensor(this.state.sublicensor.id);
    });
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false,
      newRightsModalOpen: false
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.sublicensor, this.state.sublicensorSaved);
  }

  changeFieldArgs() {
    return {
      thing: "sublicensor",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  clickRightsHeader(property) {
    this.setState({
      rightsSortBy: property
    });
  }

  clickAddRight() {
    this.setState({
      newRightsModalOpen: true
    });
  }

  redirect(directory, id) {
    window.location.pathname = directory + "/" + id;
  }

  render() {
    return(
      <div className="sublicensor-details">
        <div className="component details-component">
          <h1>Sublicensor Details</h1>
          <div className="white-box">
            <div className="row">
              <div className="col-xs-4">
                <h2>Name</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.name) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.sublicensor.name || "" } data-field="name" />
                { Details.renderFieldError(this.state.errors, FM.errors.name) }
              </div>
              <div className="col-xs-4">
                <h2>Contact Name</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.sublicensor.contactName || "" } data-field="contactName" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-4">
                <h2>Email</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.sublicensor.email || "" } data-field="email" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-4">
                <h2>Phone</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.sublicensor.phone || "" } data-field="phone" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>W-8 on File</h2>
                <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="w8" value={ this.state.sublicensor.w8 } >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>
            { this.renderButtons() }
            <hr className="rights-divider" />
            <h3>Sublicensed Rights:</h3>
            <div className="row">
              <div className="col-xs-12">
                <table className="fm-admin-table">
                  <thead>
                    <tr>
                      <th><div className={ this.state.rightsSortBy === 'film' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'film') }>Film</div></th>
                      <th><div className={ this.state.rightsSortBy === 'name' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'name') }>Right</div></th>
                      <th><div className={ this.state.rightsSortBy === 'territory' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'territory') }>Territory</div></th>
                      <th><div className={ this.state.rightsSortBy === 'startDate' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'startDate') }>Start Date</div></th>
                      <th><div className={ this.state.rightsSortBy === 'endDate' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'endDate') }>End Date</div></th>
                      <th><div className={ this.state.rightsSortBy === 'exclusive' ? "sort-header-active" : "sort-header-inactive" } onClick={ this.clickRightsHeader.bind(this, 'exclusive') }>Exclusive</div></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td></td><td></td><td></td><td></td><td></td></tr>
                    { _.orderBy(SublicensorsStore.rights(), this.state.rightsSortBy).map((right, index) => {
                      return(
                        <tr key={ index } onClick={ this.redirect.bind(this, 'sub_rights', right.id) }>
                          <td className="indent">
                            { right.film }
                          </td>
                          <td>
                            { right.name }
                          </td>
                          <td>
                            { right.territory }
                          </td>
                          <td>
                            { right.startDate }
                          </td>
                          <td>
                            { right.endDate }
                          </td>
                          <td>
                            { right.exclusive }
                          </td>
                        </tr>
                      );
                    }) }
                  </tbody>
                </table>
                <a className="blue-outline-button small" onClick={ this.clickAddRight.bind(this) }>Add Rights</a>
              </div>
            </div>
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          </div>
        </div>
        <Modal isOpen={ this.state.newRightsModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ NewRightsModalStyles }>
          <FilmRightsNew sublicensorId={ this.state.sublicensor.id } />
        </Modal>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete entityName="sublicensor" confirmDelete={ this.confirmDelete.bind(this) } closeModal={ Common.closeModals.bind(this) } />
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
        <a className={ "orange-button " + Common.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        <a id="delete" className={ "orange-button " + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
          Delete Sublicensor
        </a>
      </div>
    );
  }

  componentDidUpdate() {
    FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
}

export default SublicensorDetails;
