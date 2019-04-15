import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import GenresStore from '../stores/genres-store.js'
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

class GenresIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      genres: [],
      modalOpen: false
    };
  }

  componentDidMount() {
    this.genresListener = GenresStore.addListener(this.getGenres.bind(this));
    ClientActions.fetchGenres();
  }

  componentWillUnmount() {
    this.genresListener.remove();
  }

  getGenres() {
    this.setState({
      fetching: false,
      searchText: "",
      genres: GenresStore.all(),
      modalOpen: false
    });
  }

  redirect(id) {
    window.location.pathname = "genres/" + id;
  }

  clickNew() {
    this.setState({ modalOpen: true });
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  render() {
    return(
      <div id="genres-index" className="component">
        <h1>Genres</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew.bind(this) }>Add Genre</a>
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
              { this.state.genres.filterSearchText(this.state.searchText).map(function(genre, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, genre.id) }>
                    <td className="name-column">
                      { genre.name }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="genre" initialObject={ { name: "" } } />
        </Modal>
      </div>
    );
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default GenresIndex;
