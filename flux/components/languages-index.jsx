import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import LanguagesStore from '../stores/languages-store.js'
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
    maxWidth: 800,
    height: 250
  }
};

class LanguagesIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      languages: [],
      modalOpen: false
    };
  }

  componentDidMount() {
    this.languagesListener = LanguagesStore.addListener(this.getLanguages.bind(this));
    ClientActions.fetchLanguages();
  }

  componentWillUnmount() {
    this.languagesListener.remove();
  }

  getLanguages() {
    this.setState({
      fetching: false,
      searchText: "",
      languages: LanguagesStore.all(),
      modalOpen: false
    });
  }

  redirect(id) {
    window.location.pathname = "languages/" + id;
  }

  clickNew() {
    this.setState({ modalOpen: true });
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  render() {
    return(
      <div id="languages-index" className="component">
        <h1>Languages</h1>
        <a className={ "orange-button float-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew.bind(this) }>Add Language</a>
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
              { this.state.languages.filterSearchText(this.state.searchText).map((language, index) => {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, language.id) }>
                    <td className="name-column">
                      { language.name }
                    </td>
                  </tr>
                );
              }) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="language" initialObject={ { name: "" } } />
        </Modal>
      </div>
    );
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default LanguagesIndex;
