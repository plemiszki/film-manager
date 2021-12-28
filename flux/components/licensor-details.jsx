import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import { fetchEntity, createEntity, updateEntity, deleteEntity } from '../actions/index'
import FM from '../../app/assets/javascripts/me/common.jsx'

class LicensorDetails extends React.Component {

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
    this.props.fetchEntity({
      id: window.location.pathname.split('/')[2],
      directory: window.location.pathname.split('/')[1],
      entityName: 'licensor'
    }, 'licensor').then(() => {
      const { licensor, films } = this.props;
      this.setState({
        fetching: false,
        licensor,
        licensorSaved: HandyTools.deepCopy(licensor),
        films
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
        entityName: 'licensor',
        entity: this.state.licensor
      }).then(() => {
        const { licensor } = this.props;
        this.setState({
          fetching: false,
          licensor,
          licensorSaved: HandyTools.deepCopy(licensor),
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

  redirect(id) {
    window.location.pathname = "films/" + id;
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.licensor, this.state.licensorSaved);
  }

  changeFieldArgs() {
    return {
      thing: "licensor",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this),
      allErrors: FM.errors
    }
  }

  render() {
    return(
      <div id="licensor-profile">
        <div className="component">
          <h1>Licensor Details</h1>
          <div id="licensor-profile-box" className="white-box">
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'licensor', property: 'name' }) }
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'licensor', property: 'email', columnHeader: 'Royalty Emails' }) }
            </div>
            <div className="row">
              <div className="col-xs-12 col-sm-12">
                <h2>Address</h2>
                <textarea rows="5" cols="20" onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.licensor.address || "" } data-field="address" />
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12 col-sm-12">
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

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntity, createEntity, updateEntity, deleteEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LicensorDetails);
