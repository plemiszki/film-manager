import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import FormatsStore from '../stores/formats-store.js'
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
    maxWidth: 800,
    height: 250
  }
};

class FormatsIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      formats: [],
      modalOpen: false,
      searchText: ""
    };
  }

  componentDidMount() {
    this.formatsListener = FormatsStore.addListener(this.getFormats.bind(this));
    ClientActions.fetchFormats();
  }

  componentWillUnmount() {
    this.formatsListener.remove();
  }

  getFormats() {
    this.setState({
      fetching: false,
      searchText: "",
      formats: FormatsStore.all(),
      modalOpen: false
    });
  }

  redirect(id) {
    window.location.pathname = "formats/" + id;
  }

  clickNew() {
    this.setState({ modalOpen: true });
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  render() {
    return(
      <div id="formats-index" className="component">
        <h1>Formats</h1>
        <a className={ "orange-button float-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew.bind(this) }>Add Format</a>
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
              { this.state.formats.filterSearchText(this.state.searchText).map(function(format, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, format.id) }>
                    <td className="name-column">
                      { format.name }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="format" initialObject={ { name: "" } } />
        </Modal>
      </div>
    );
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default FormatsIndex;
