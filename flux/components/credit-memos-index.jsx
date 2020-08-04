import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import { sendRequest, fetchEntities } from '../actions/index'
import FM from '../../app/assets/javascripts/me/common.jsx'

const filterModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#FFFFFF',
    margin: 'auto',
    maxWidth: 540,
    height: 250,
    border: 'solid 1px black',
    borderRadius: '6px',
    color: '#5F5F5F',
    padding: '30px'
  }
};

class CreditMemosIndex extends React.Component {

  constructor(props) {
    super(props)
    let job = {
      errors_text: ""
    };
    this.state = {
      fetching: true,
      searchText: '',
      sortBy: 'sentDate',
      creditMemos: [],
      filterModalOpen: false,
      filterStartNumber: '',
      filterEndNumber: '',
      jobModalOpen: !!job.id,
      job: job
    };
  }

  componentDidMount() {
    this.props.fetchEntities({
      directory: 'credit_memos'
    }).then(() => {
      this.setState({
        fetching: false,
        creditMemos: this.props.creditMemos
      });
    });
  }

  redirect(id) {
    window.location.pathname = "credit_memos/" + id;
  }

  clickSeeAll() {
    this.setState({
      fetching: true
    });
    ClientActions.fetchCreditMemos('all');
  }

  openFilterModal() {
    this.setState({
      filterModalOpen: true
    }, () => {
      window.setTimeout(() => {
        $('.filter-modal input.starting-number').val(this.state.filterStartNumber);
        $('.filter-modal input.end-number').val(this.state.filterEndNumber);
      }, 10);
    });
  }

  validateFilterInput() {
    var startNumber = $('.filter-modal input.starting-number').val();
    var endNumber = $('.filter-modal input.end-number').val();
    var startNumberOK = (startNumber === "" || !isNaN(+startNumber));
    var endNumberOK = (endNumber === "" || !isNaN(+endNumber));
    if (startNumberOK && endNumberOK) {
      if (endNumber) {
        if (+endNumber >= +startNumber) {
          this.setState({
            filterStartNumber: startNumber,
            filterEndNumber: endNumber,
            filterModalOpen: false
          });
        } else {
          $('.filter-modal input').addClass('error');
        }
      } else {
        this.setState({
          filterEndNumber: '',
          filterStartNumber: startNumber,
          filterModalOpen: false
        });
      }
    } else {
      if (!startNumberOK) {
        $('.filter-modal input.starting-number').addClass('error');
      }
      if (!endNumberOK) {
        $('.filter-modal input.end-number').addClass('error');
      }
    }
  }

  clearNumberError(e) {
    e.target.classList.remove('error');
  }

  closeModal() {
    this.setState({
      filterModalOpen: false,
    });
  }

  modalCloseAndRefresh() {
    this.setState({
      errorsModalOpen: false
    });
  }

  filterExists() {
    if (this.state.filterStartNumber != "" || this.state.filterEndNumber != "") {
      return " green";
    } else {
      return "";
    }
  }

  clickExport() {
    if (!this.state.fetching) {
      this.setState({
        fetching: true
      });
      let creditMemoIds = this.state.creditMemos.map((creditMemo) => {
        return creditMemo.id;
      });
      this.props.sendRequest({
        url: `/api/credit_memos/export`,
        method: 'get',
        data: { creditMemoIds }
      }).then(() => {
        this.setState({
          job: this.props.job,
          fetching: false,
          jobModalOpen: true
        });
      });
    }
  }

  render() {
    const { filterStartNumber, filterEndNumber } = this.state;
    let filteredCreditMemos = this.state.creditMemos.filterSearchText(this.state.searchText, this.state.sortBy);
    filteredCreditMemos = filteredCreditMemos.filter((creditMemo) => {
      const { number } = creditMemo;
      if (filterStartNumber && filterEndNumber) {
        return (+number >= +filterStartNumber && +number <= +filterEndNumber);
      } else if (filterEndNumber) {
        return (+number <= +filterEndNumber);
      } else if (filterStartNumber) {
        return (+number >= +filterStartNumber);
      } else {
        return true;
      }
    });
    return(
      <div id="credit-memos-index" className="component">
        <h1>Credit Memos</h1>
        <a className={ "orange-button float-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickExport.bind(this) }>Export</a>
        <a className={ "orange-button float-button margin-right" + this.filterExists() + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.openFilterModal.bind(this) }>Filter</a>
        <input className="search-box margin" onChange={ FM.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className="fm-admin-table">
            <thead>
              <tr>
                <th><div className={ FM.sortClass.call(this, "sentDate") } onClick={ FM.clickHeader.bind(this, "sentDate") }>Sent Date</div></th>
                <th><div className={ FM.sortClass.call(this, "number") } onClick={ FM.clickHeader.bind(this, "number") }>Credit Memo Number</div></th>
                <th><div className={ FM.sortClass.call(this, "customerName") } onClick={ FM.clickHeader.bind(this, "customerName") }>DVD Customer</div></th>
                <th><div className={ FM.sortClass.call(this, "returnNumber") } onClick={ FM.clickHeader.bind(this, "returnNumber") }>Return Number</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { _.orderBy(filteredCreditMemos, [FM.commonSort.bind(this)], [['sentDate', 'number'].indexOf(this.state.sortBy) > -1 ? 'desc' : 'asc']).map(function(creditMemo, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, creditMemo.id) }>
                    <td className="indent">
                      { creditMemo.sentDate }
                    </td>
                    <td>
                      { creditMemo.number }
                    </td>
                    <td>
                      { creditMemo.customerName }
                    </td>
                    <td>
                      { creditMemo.returnNumber }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
        { this.renderSeeAllButton() }
        <Modal isOpen={ this.state.filterModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ filterModalStyles }>
          <div className="filter-modal">
            <div className="row">
              <div className="col-xs-6">
                <h2>Starting Number</h2>
                <input className="starting-number" onChange={ this.clearNumberError.bind(this) } />
              </div>
              <div className="col-xs-6">
                <h2>Ending Number</h2>
                <input className="end-number" onChange={ this.clearNumberError.bind(this) } />
              </div>
            </div>
            <div className="row button-row">
              <div className="col-xs-12">
                <a className="orange-button" onClick={ this.validateFilterInput.bind(this) }>Update Filter</a>
              </div>
            </div>
          </div>
        </Modal>
        { FM.jobModal.call(this, this.state.job) }
        { FM.jobErrorsModal.call(this) }
      </div>
    );
  }

  renderSeeAllButton() {
    if (this.state.creditMemos.length === 100) {
      return(
        <div className="text-center">
          <a className={ "orange-button see-all" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickSeeAll.bind(this) }>See All</a>
        </div>
      );
    }
  }

  componentDidUpdate() {
    if (this.state.jobModalOpen) {
      window.setTimeout(() => {
        $.ajax({
          url: '/api/jobs/status',
          method: 'GET',
          data: {
            id: this.state.job.id,
            time: this.state.job.job_id
          },
          success: (response) => {
            let newState = {
              job: response
            };
            if (response.status === 'success') {
              newState.jobModalOpen = false;
            }
            this.setState(newState);
            if (response.status === 'success') {
              window.location.href = response.metadata.url;
            }
          }
        });
      }, 1500)
    }
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntities, sendRequest }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CreditMemosIndex);
