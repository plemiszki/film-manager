import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import TerritoriesStore from '../stores/territories-store.js'
import NewThing from './new-thing.jsx'

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

class TerritoriesIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      territories: [],
      modalOpen: false
    };
  }

  componentDidMount() {
    this.territoriesListener = TerritoriesStore.addListener(this.getTerritories.bind(this));
    ClientActions.fetchTerritories();
  }

  componentWillUnmount() {
    this.territoriesListener.remove();
  }

  getTerritories() {
    this.setState({
      fetching: false,
      searchText: "",
      territories: TerritoriesStore.all(),
      modalOpen: false
    });
  }

  redirect(id) {
    window.location.pathname = "territories/" + id;
  }

  clickNew() {
    this.setState({ modalOpen: true });
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  render() {
    return(
      <div id="territories-index" className="component">
        <h1>Territories</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew.bind(this) }>Add Territory</a>
        <input className="search-box" onChange={ Common.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={ "admin-table" }>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { this.state.territories.filterSearchText(this.state.searchText).map(function(territory, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, territory.id) }>
                    <td className="name-column">
                      { territory.name }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="territory" initialObject={ { name: "" } } />
        </Modal>
      </div>
    );
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default TerritoriesIndex;
