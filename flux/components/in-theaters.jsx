import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import InTheatersStore from '../stores/in-theaters-store.js'
import NewThing from './new-thing.jsx'
import ModalSelect from './modal-select.jsx'
import InTheatersIndexItem from './in-theaters-index-item.jsx'
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
    height: 351
  }
};

class InTheatersIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      inTheaters: [],
      comingSoon: [],
      repertory: [],
      modalOpen: false,
      films: []
    };
  }

  componentDidMount() {
    this.Listener = InTheatersStore.addListener(this.getFilms.bind(this));
    ClientActions.fetchInTheatersFilms();
  }

  componentWillUnmount() {
    this.Listener.remove();
  }

  getFilms() {
    this.setState({
      fetching: false,
      inTheaters: InTheatersStore.inTheaters(),
      comingSoon: InTheatersStore.comingSoon(),
      repertory: InTheatersStore.repertory(),
      films: InTheatersStore.films()
    });
  }

  clickXButton(e) {
    var id = e.target.dataset.id;
    this.setState({
      fetching: true
    }, () => {
      ClientActions.deleteInTheatersFilm(id);
    });
  }

  clickNew() {
    this.setState({ modalOpen: true });
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  clickAddComingSoonFilm() {
    this.setState({
      modalOpen: true,
      addSection: 'Coming Soon'
    });
  }

  clickAddInTheatersFilm() {
    this.setState({
      modalOpen: true,
      addSection: 'In Theaters'
    });
  }

  clickAddRepertoryFilm() {
    this.setState({
      modalOpen: true,
      addSection: 'Repertory'
    });
  }

  selectFilm(e) {
    this.setState({
      modalOpen: false,
      fetching: true
    });
    ClientActions.createInTheatersFilm({ filmId: e.target.dataset.id, section: this.state.addSection });
  }

  render() {
    return(
      <div id="in-theaters-index" className="component">
        <h1>In Theaters</h1>
        <div className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className="admin-table no-hover no-highlight in-theaters">
            <thead>
              <tr>
                <th>In Theaters</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { this.state.inTheaters.map((film, index) => {
                return(
                  <InTheatersIndexItem key={ film.id } index={ index } film={ film } section={ 'in theaters' } clickXButton={ this.clickXButton.bind(this) } renderHandle={ this.state.inTheaters.length > 1 } films={ this.state.inTheaters } />
                );
              }) }
            </tbody>
          </table>
          <a className={ 'blue-outline-button small' } onClick={ this.clickAddInTheatersFilm.bind(this) }>Add Film</a>
          <hr />
          <table className="admin-table no-hover no-highlight coming-soon">
            <thead>
              <tr>
                <th>Coming Soon</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { this.state.comingSoon.map((film, index) => {
                return(
                  <InTheatersIndexItem key={ film.id } index={ index } film={ film } section={ 'coming soon' } clickXButton={ this.clickXButton.bind(this) } renderHandle={ this.state.comingSoon.length > 1 } films={ this.state.comingSoon } />
                );
              }) }
            </tbody>
          </table>
          <a className={ 'blue-outline-button small' } onClick={ this.clickAddComingSoonFilm.bind(this) }>Add Film</a>
          <hr />
          <table className="admin-table no-hover no-highlight repertory">
            <thead>
              <tr>
                <th>Repertory</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { this.state.repertory.map((film, index) => {
                return(
                  <InTheatersIndexItem key={ film.id } index={ index } film={ film } section={ 'repertory' } clickXButton={ this.clickXButton.bind(this) } renderHandle={ this.state.repertory.length > 1 } films={ this.state.repertory } />
                );
              }) }
            </tbody>
          </table>
          <a className="blue-outline-button small" onClick={ this.clickAddRepertoryFilm.bind(this) }>Add Film</a>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.films } property={ "title" } func={ this.selectFilm.bind(this) } />
        </Modal>
      </div>
    );
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default InTheatersIndex;
