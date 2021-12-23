import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import HandyTools from 'handy-tools'
import { sendRequest } from '../actions/index'
import { Common } from 'handy-components'

class Calendar extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      year: (new Date).getFullYear(),
      months: []
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    this.props.sendRequest({
      url: '/api/calendar',
      data: {
        year: this.state.year,
      }
    }).then(() => {
      this.setState({
        fetching: false,
        months: this.props.months
      });
    });
  }

  clickNext() {
    this.setState({
      year: this.state.year + 1,
      fetching: true,
    }, () => {
      this.fetchData();
    });
  }

  clickPrev() {
    this.setState({
      year: this.state.year - 1,
      fetching: true,
    }, () => {
      this.fetchData();
    });
  }

  render() {
    return(
      <div className="calendar">
        <div className="component">
          <div className="clearfix">
            <h1>Calendar - { this.state.year }</h1>
            <a className={ "orange-button float-button small margin" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNext.bind(this) }>&#62;&#62;</a>
            <a className={ "orange-button float-button small" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickPrev.bind(this) }>&#60;&#60;</a>
          </div>
          <div className="white-box">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Theatrical Releases</th>
                  <th>DVD Releases</th>
                  <th>TVOD/EST Releases</th>
                  <th>SVOD Releases</th>
                  <th>Club Release</th>
                </tr>
              </thead>
              <tbody>
                { this.state.months.map((month, index) => {
                    return(
                      <tr key={ index }>
                        <td className="monthCell">
                          { HandyTools.MONTHS[index] }
                        </td>
                        <td data-test="theatrical">
                          { this.state.months[index].theatricalReleases.map((theatricalRelease, index) => {
                              return(
                                <div key={ index } className={ "film" + (theatricalRelease.tentative ? ' tentative' : '') }>
                                  { theatricalRelease.title }<br />
                                { theatricalRelease.date }
                                </div>
                              );
                            })
                          }
                        </td>
                        <td data-test="dvd">
                          { this.state.months[index].dvdReleases.map((dvdRelease, index) => {
                              return(
                                <div key={ index } className="film">
                                  { dvdRelease.title }<br />
                                  { dvdRelease.date }
                                </div>
                              );
                            })
                          }
                        </td>
                        <td data-test="tvod">
                          { this.state.months[index].tvodReleases.map((tvodRelease, index) => {
                              return(
                                <div key={ index } className={ "film" + (tvodRelease.tentative ? ' tentative' : '') }>
                                  { tvodRelease.title }<br />
                                  { tvodRelease.date }
                                </div>
                              );
                            })
                          }
                        </td>
                        <td data-test="svod">
                          { this.state.months[index].svodReleases.map((svodRelease, index) => {
                              return(
                                <div key={ index } className={ "film" + (svodRelease.tentative ? ' tentative' : '') }>
                                  { svodRelease.title }<br />
                                  { svodRelease.date }
                                </div>
                              );
                            })
                          }
                        </td>
                        <td data-test="club">
                          { this.state.months[index].clubReleases.map((clubRelease, index) => {
                              return(
                                <div key={ index } className={ "film" }>
                                  { clubRelease }
                                </div>
                              );
                            })
                          }
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ sendRequest }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Calendar);
