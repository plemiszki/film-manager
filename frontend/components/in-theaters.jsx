import React from 'react'
import Modal from 'react-modal'
import InTheatersIndexItem from './in-theaters-index-item.jsx'
import { Common, sendRequest, deleteEntity, createEntity, OutlineButton, Spinner, GrayedOut, ModalSelect } from 'handy-components'
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

  selectFilm(option) {
    const filmId = option.id;
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
    const { fetching, inTheaters, films, filmsModalOpen } = this.state;
    return (
      <>
        <div className="handy-component">
          <h1>In Theaters</h1>
          <div className="white-box">
            <table className="no-hover no-highlight in-theaters">
              <thead>
                <tr>
                  <th>In Theaters</th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td></tr>
                { inTheaters.map((film, index) => {
                  return(
                    <InTheatersIndexItem
                      context={ this.props.context }
                      key={ film.id }
                      index={ index }
                      film={ film }
                      section={ 'in theaters' }
                      clickXButton={ this.clickX.bind(this) }
                      renderHandle={ inTheaters.length > 1 }
                      sectionFilms={ inTheaters }
                      updateFilms={ this.updateFilms.bind(this) }
                    />
                  );
                }) }
              </tbody>
            </table>
            <OutlineButton
              text="Add Film"
              onClick={ () => this.clickAddInTheatersFilm() }
            />
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
            <OutlineButton
              text="Add Film"
              onClick={ () => this.clickAddComingSoonFilm() }
            />
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
            <OutlineButton
              text="Add Film"
              onClick={ () => this.clickAddRepertoryFilm() }
            />
            <Spinner visible={ fetching } />
            <GrayedOut visible={ fetching } />
          </div>
          <Modal isOpen={ filmsModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
            <ModalSelect options={ films } property="title" func={ this.selectFilm.bind(this) } />
          </Modal>
        </div>
        <style jsx>{`
          hr {
            margin-top: 30px;
          }
          table {
            width: 100%;
            user-select: none;
            margin-bottom: 11px;
          }
          thead {
            border-bottom: solid 1px #dadee2;
          }
          th {
            font-family: 'TeachableSans-SemiBold';
            color: black;
            padding-bottom: 20px;
          }
          th:first-of-type {
            padding-left: 10px;
          }
          tr:first-child td {
            padding-top: 10px;
          }
        `}</style>
      </>
    );
  }
}
