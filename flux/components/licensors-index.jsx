import React, { Component } from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import LicensorsStore from '../stores/licensors-store.js'
import NewThing from './new-thing.jsx'
import { Common, Details, Index } from 'handy-components'

const ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 234
  }
};

class LicensorsIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      licensors: [],
      modalOpen: false
    };
  }

  componentDidMount() {
    this.licensorsListener = LicensorsStore.addListener(this.getLicensors.bind(this));
    ClientActions.fetchLicensors();
  }

  componentWillUnmount() {
    this.licensorsListener.remove();
  }

  getLicensors() {
    this.setState({
      fetching: false,
      searchText: "",
      licensors: LicensorsStore.all(),
      modalOpen: false
    });
  }

  redirect(id) {
    window.location.pathname = "licensors/" + id;
  }

  clickNew() {
    this.setState({ modalOpen: true });
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  render() {
    return(
      <div id="licensors-index" className="component">
        <h1>Licensors</h1>
        <a className={ "orange-button float-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew.bind(this) }>Add Licensor</a>
        <input className="search-box" onChange={ FM.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={"admin-table"}>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { this.state.licensors.filterSearchText(this.state.searchText).map((licensor, index) => {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, licensor.id) }>
                    <td className="name-column">
                      { licensor.name }
                    </td>
                  </tr>
                );
              }) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="licensor" initialObject={ { name: "" } } />
        </Modal>
      </div>
    );
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default LicensorsIndex;
