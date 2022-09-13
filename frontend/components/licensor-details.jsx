import React from 'react'
import Modal from 'react-modal'
import { Common, ConfirmDelete, Details, deepCopy, fetchEntity, updateEntity } from 'handy-components'

export default class LicensorDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      licensor: {},
      licensorSaved: {},
      films: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { licensor, films } = response;
      this.setState({
        fetching: false,
        licensor,
        licensorSaved: deepCopy(licensor),
        films
      });
    });
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, () => {
      updateEntity({
        entityName: 'licensor',
        entity: this.state.licensor
      }).then((response) => {
        const { licensor } = response;
        this.setState({
          fetching: false,
          licensor,
          licensorSaved: deepCopy(licensor),
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

  redirect(id) {
    window.location.pathname = "films/" + id;
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.licensor, this.state.licensorSaved);
  }

  changeFieldArgs() {
    return {
      changesFunction: this.checkForChanges.bind(this),
    }
  }

  render() {
    return(
      <div className="licensor-details">
        <div className="component">
          <h1>Licensor Details</h1>
          <div className="white-box">
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'licensor', property: 'name' }) }
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'licensor', property: 'email', columnHeader: 'Royalty Emails' }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ type: 'textbox', columnWidth: 12, entity: 'licensor', property: 'address', rows: 5 }) }
            </div>
            <div className="row">
              <div className="col-xs-12">
                <table className="fm-admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td></td></tr>
                    { this.state.films.map((film, index) => {
                      return(
                        <tr key={ index } onClick={ this.redirect.bind(this, film.id) }>
                          <td className="name-column">
                            { film.title }
                          </td>
                        </tr>
                      );
                    }) }
                  </tbody>
                </table>
              </div>
            </div>
            { this.renderButtons() }
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete
            entityName="licensor"
            confirmDelete={ Details.clickDelete.bind(this) }
            closeModal={ Common.closeModals.bind(this) }
          />
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
