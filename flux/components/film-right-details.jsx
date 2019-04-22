import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import FilmRightsStore from '../stores/film-rights-store.js'
import ErrorsStore from '../stores/errors-store.js'

class FilmRightDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      filmRight: {},
      filmRightSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    this.filmRightListener = FilmRightsStore.addListener(this.getFilmRight.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchFilmRight(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.filmRightsListener.remove();
    this.errorsListener.remove();
  }

  getFilmRight() {
    this.setState({
      filmRight: Tools.deepCopy(FilmRightsStore.filmRight()),
      filmRightSaved: FilmRightsStore.filmRight(),
      territories: FilmRightsStore.territories(),
      rights: FilmRightsStore.rights(),
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
        ClientActions.updateFilmRight(this.state.filmRight);
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
      ClientActions.deleteFilmRight(this.state.filmRight.id);
    });
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.filmRight, this.state.filmRightSaved);
  }

  changeFieldArgs() {
    return {
      thing: 'filmRight',
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    return(
      <div id="filmRight-details">
        <div className="component details-component">
          <h1>Right Details</h1>
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              { this.renderDeleteError() }
              <div className="col-xs-3 select-scroll">
                <h2>Right</h2>
                <select onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="rightId" value={ this.state.filmRight.rightId }>
                  { FilmRightsStore.rights().map((right, index) => {
                    return(
                      <option key={ index } value={ right.id }>{ right.name }</option>
                    );
                  }) }
                </select>
                { Common.renderDropdownFieldError(this.state.errors, Common.errors.rightId) }
              </div>
              <div className="col-xs-3 select-scroll">
                <h2>Territory</h2>
                <select onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="territoryId" value={ this.state.filmRight.territoryId }>
                  { FilmRightsStore.territories().map((territory, index) => {
                    return(
                      <option key={ index } value={ territory.id }>{ territory.name }</option>
                    );
                  }) }
                </select>
                { Common.renderDropdownFieldError(this.state.errors, Common.errors.territoryId) }
              </div>
              <div className="col-xs-2">
                <h2>Start Date</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.startDate) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.filmRight.startDate || "" } data-field="startDate" />
                { Common.renderFieldError(this.state.errors, Common.errors.startDate) }
              </div>
              <div className="col-xs-2">
                <h2>End Date</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.endDate) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.filmRight.endDate || "" } data-field="endDate" />
                { Common.renderFieldError(this.state.errors, Common.errors.endDate) }
              </div>
              <div className="col-xs-2">
                <h2>Exclusive</h2>
                <select onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="exclusive" value={ this.state.filmRight.exclusive }>
                  <option value={ "Yes" }>Yes</option>
                  <option value={ "No" }>No</option>
                </select>
                { Common.renderFieldError([], []) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this right&#63;</h1>
            Deleting a right will erase ALL of its information and data<br />
            <a className={ "red-button" } onClick={ this.confirmDelete.bind(this) }>
              Yes
            </a>
            <a className={ "orange-button" } onClick={ this.closeModal.bind(this) }>
              No
            </a>
          </div>
        </Modal>
      </div>
    );
  }

  renderDeleteError() {
    if (this.state.errors.indexOf('Right has been sublicensed') > -1) {
      return (
        <div className="col-xs-12">
          <p className="yesFieldError">You cannot delete this right because it has been sublicensed</p>
        </div>
      );
    }
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
        <a id="delete" className={ "orange-button " + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
          Delete Right
        </a>
      </div>
    )
  }

  componentDidUpdate() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
}

module.exports = FilmRightDetails;
