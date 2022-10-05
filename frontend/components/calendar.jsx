import React from 'react'
import { Common, MONTHS, sendRequest } from 'handy-components'

export default class Calendar extends React.Component {

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
    sendRequest('/api/calendar', {
      data: {
        year: this.state.year,
      }
    }).then((response) => {
      this.setState({
        fetching: false,
        months: response.months
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
        <div className="handy-component">
          <h1>Calendar - { this.state.year }</h1>
          <a className={ "standard-button float-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNext.bind(this) }>&#62;&#62;</a>
          <a className={ "standard-button float-button margin" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickPrev.bind(this) }>&#60;&#60;</a>
          <div className="white-box">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Theatrical</th>
                  <th>DVD</th>
                  <th>TVOD/EST</th>
                  <th>FM+</th>
                  <th>Club</th>
                </tr>
              </thead>
              <tbody>
                { this.state.months.map((month, index) => {
                    return(
                      <tr key={ index }>
                        <td className="monthCell">
                          { MONTHS[index] }
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
                        <td data-test="fm-plus">
                          { this.state.months[index].fmPlusReleases.map((fmPlusRelease, index) => {
                              return(
                                <div key={ index } className={ "film" }>
                                  { fmPlusRelease.title }<br />
                                  { fmPlusRelease.date }
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
        <style jsx>{`
          .margin {
            margin-right: 30px;
          }
          table {
            border: solid 1px gray;
            width: 100%;
          }
          table th {
            font-family: 'TeachableSans-SemiBold';
            padding: 10px 10px;
          }
          th, td {
            border: solid 1px gray;
            text-align: center;
            width: 14.29%;
          }
          table td {
            padding: 20px !important;
            color: #5F5F5F;
          }
          td.monthCell {
            font-family: 'TeachableSans-SemiBold';
          }
          .film.tentative {
            color: red;
            font-style: italic;
          }
          .film:not(:last-of-type) {
            margin-bottom: 15px;
          }
        `}</style>
      </div>
    );
  }
}
