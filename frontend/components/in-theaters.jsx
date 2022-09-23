import React from 'react'
import Modal from 'react-modal'
import ModalSelect from './modal-select.jsx'
import InTheatersIndexItem from './in-theaters-index-item.jsx'
import { Common, sendRequest, deleteEntity, createEntity } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

export default class InTheatersIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      inTheaters: [],
      comingSoon: [],
      repertory: [],
      filmsModalOpen: false,
      films: []
    };
  }

  componentDidMount() {
    sendRequest('/api/in_theaters').then((response) => {
      const { films, inTheaters, comingSoon, repertory } = response;
      this.setState({
        fetching: false,
        inTheaters,
        comingSoon,
        repertory,
        films
      });
    });
  }

  clickX(e) {
    const id = e.target.dataset.id;
    this.setState({
      fetching: true
    });
    deleteEntity({
      directory: 'in_theaters',
      id,
    }).then((response) => {
      const { films, inTheaters, comingSoon, repertory } = response;
      this.setState({
        fetching: false,
        inTheaters,
        comingSoon,
        repertory,
        films
      });
    });
  }

  clickAddComingSoonFilm() {
    this.setState({
      filmsModalOpen: true,
      addSection: 'Coming Soon'
    });
  }

  clickAddInTheatersFilm() {
    this.setState({
      filmsModalOpen: true,
      addSection: 'In Theaters'
    });
  }

  clickAddRepertoryFilm() {
    this.setState({
      filmsModalOpen: true,
      addSection: 'Repertory'
    });
  }

  selectFilm(option, e) {
    const filmId = e.target.dataset.id;
    this.setState({
      filmsModalOpen: false,
      fetching: true
    });
    createEntity({
      directory: 'in_theaters',
      entityName: 'film',
      entity: {
        filmId,
        section: this.state.addSection
      }
    }).then((response) => {
      const { films, inTheaters, comingSoon, repertory } = response;
      this.setState({
        fetching: false,
        inTheaters,
        comingSoon,
        repertory,
        films
      });
    });
  }

  updateFilms(obj) {
    this.setState(obj);
  }

  render() {
    return(
      <div id="in-theaters-index" className="component">
        <h1>In Theaters</h1>
        <div className="white-box">
          <table className="fm-admin-table no-hover no-highlight in-theaters">
            <thead>
              <tr>
                <th>In Theaters</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { this.state.inTheaters.map((film, index) => {
                return(
                  <InTheatersIndexItem
                    context={ this.props.context }
                    key={ film.id }
                    index={ index }
                    film={ film }
                    section={ 'in theaters' }
                    clickXButton={ this.clickX.bind(this) }
                    renderHandle={ this.state.inTheaters.length > 1 }
                    sectionFilms={ this.state.inTheaters }
                    updateFilms={ this.updateFilms.bind(this) }
                  />
                );
              }) }
            </tbody>
          </table>
          <a className={ 'blue-outline-button small' } onClick={ this.clickAddInTheatersFilm.bind(this) }>Add Film</a>
          <hr />
          <table className="fm-admin-table no-hover no-highlight coming-soon">
            <thead>
              <tr>
                <th>Coming Soon</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { this.state.comingSoon.map((film, index) => {
                return(
                  <InTheatersIndexItem
                    context={ this.props.context }
                    key={ film.id }
                    index={ index }
                    film={ film }
                    section={ 'coming soon' }
                    clickXButton={ this.clickX.bind(this) }
                    renderHandle={ this.state.comingSoon.length > 1 }
                    sectionFilms={ this.state.comingSoon }
                    updateFilms={ this.updateFilms.bind(this) }
                  />
                );
              }) }
            </tbody>
          </table>
          <a className={ 'blue-outline-button small' } onClick={ this.clickAddComingSoonFilm.bind(this) }>Add Film</a>
          <hr />
          <table className="fm-admin-table no-hover no-highlight repertory">
            <thead>
              <tr>
                <th>Repertory</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { this.state.repertory.map((film, index) => {
                return(
                  <InTheatersIndexItem
                    context={ this.props.context }
                    key={ film.id }
                    index={ index }
                    film={ film }
                    section={ 'repertory' }
                    clickXButton={ this.clickX.bind(this) }
                    renderHandle={ this.state.repertory.length > 1 }
                    sectionFilms={ this.state.repertory }
                    updateFilms={ this.updateFilms.bind(this) }
                  />
                );
              }) }
            </tbody>
          </table>
          <a className="blue-outline-button small" onClick={ this.clickAddRepertoryFilm.bind(this) }>Add Film</a>
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
        </div>
        <Modal isOpen={ this.state.filmsModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.films } property="title" func={ this.selectFilm.bind(this) } />
        </Modal>
      </div>
    );
  }
}
