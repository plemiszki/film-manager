import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import SublicensorsStore from '../stores/sublicensors-store.js'
import NewThing from './new-thing.jsx'
import { Common, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

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

class SublicensorsIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      sublicensors: [],
      modalOpen: false
    };
  }

  componentDidMount() {
    this.sublicensorsListener = SublicensorsStore.addListener(this.getSublicensors.bind(this));
    ClientActions.fetchSublicensors();
  }

  componentWillUnmount() {
    this.sublicensorsListener.remove();
  }

  getSublicensors() {
    this.setState({
      fetching: false,
      searchText: "",
      sublicensors: SublicensorsStore.all(),
      modalOpen: false
    });
  }

  redirect(id) {
    window.location.pathname = "sublicensors/" + id;
  }

  clickNew() {
    this.setState({ modalOpen: true });
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  render() {
    return(
      <div id="sublicensors-index" className="component">
        <h1>Sublicensors</h1>
        <a className={ "orange-button float-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew.bind(this) }>Add Sublicensor</a>
        <input className="search-box" onChange={ FM.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={ "admin-table" }>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { this.state.sublicensors.filterSearchText(this.state.searchText).map(function(sublicensor, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, sublicensor.id) }>
                    <td className="name-column">
                      { sublicensor.name }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="sublicensor" initialObject={ { name: "", discount: 0, consignment: false, invoicesEmail: "", sageId: "", paymentTerms: "", address2: "" } } />
        </Modal>
      </div>
    );
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default SublicensorsIndex;
