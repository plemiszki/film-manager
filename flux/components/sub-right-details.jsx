import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import SubRightsStore from '../stores/sub-rights-store.js'
import ErrorsStore from '../stores/errors-store.js'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

class SubRightDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      subRight: {},
      subRightSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    this.subRightListener = SubRightsStore.addListener(this.getSubRight.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchSubRight(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.subRightsListener.remove();
    this.errorsListener.remove();
  }

  getSubRight() {
    this.setState({
      subRight: Tools.deepCopy(SubRightsStore.subRight()),
      subRightSaved: SubRightsStore.subRight(),
      territories: SubRightsStore.territories(),
      rights: SubRightsStore.rights(),
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
        ClientActions.updateSubRight(this.state.subRight);
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
      ClientActions.deleteSubRight(this.state.subRight.id);
    });
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.subRight, this.state.subRightSaved);
  }

  changeFieldArgs() {
    return {
      thing: "subRight",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    return(
      <div id="subRight-details">
        <div className="component details-component">
          <h1>Sublicensed Right Details</h1>
          <div className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-6 select-scroll">
                <h2>Film</h2>
                <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="filmId" value={ this.state.subRight.filmId }>
                  { SubRightsStore.films().map((film, index) => {
                    return(
                      <option key={ index } value={ film.id }>{ film.title }</option>
                    );
                  }) }
                </select>
                { FM.renderDropdownFieldError(this.state.errors, FM.errors.filmId) }
              </div>
              <div className="col-xs-3 select-scroll">
                <h2>Right</h2>
                <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="rightId" value={ this.state.subRight.rightId }>
                  { SubRightsStore.rights().map((right, index) => {
                    return(
                      <option key={ index } value={ right.id }>{ right.name }</option>
                    );
                  }) }
                </select>
                { FM.renderDropdownFieldError(this.state.errors, FM.errors.rightId) }
              </div>
              <div className="col-xs-3 select-scroll">
                <h2>Territory</h2>
                <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="territoryId" value={ this.state.subRight.territoryId }>
                  { SubRightsStore.territories().map((territory, index) => {
                    return(
                      <option key={ index } value={ territory.id }>{ territory.name }</option>
                    );
                  }) }
                </select>
                { FM.renderDropdownFieldError(this.state.errors, FM.errors.territoryId) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-2">
                <h2>Start Date</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.startDate) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.subRight.startDate || "" } data-field="startDate" />
                { Details.renderFieldError(this.state.errors, FM.errors.startDate) }
              </div>
              <div className="col-xs-2">
                <h2>End Date</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.endDate) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.subRight.endDate || "" } data-field="endDate" />
                { Details.renderFieldError(this.state.errors, FM.errors.endDate) }
              </div>
              <div className="col-xs-2">
                <h2>Exclusive</h2>
                <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="exclusive" value={ this.state.subRight.exclusive }>
                  <option value={ "Yes" }>Yes</option>
                  <option value={ "No" }>No</option>
                </select>
                { Details.renderFieldError([], []) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete entityName="right" confirmDelete={ this.confirmDelete.bind(this) } closeModal={ Common.closeModals.bind(this) } />
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
          Delete Right
        </a>
      </div>
    );
  }

  componentDidUpdate() {
    FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
}

export default SubRightDetails;
