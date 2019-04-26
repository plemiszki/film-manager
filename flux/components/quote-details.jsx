import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import QuotesStore from '../stores/quotes-store.js'
import ErrorsStore from '../stores/errors-store.js'
import { Common, Details, Index } from 'handy-components'

class QuoteDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      quote: {},
      quoteSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    this.quoteListener = QuotesStore.addListener(this.getQuote.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchQuote(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.quotesListener.remove();
    this.errorsListener.remove();
  }

  getQuote() {
    this.setState({
      quote: Tools.deepCopy(QuotesStore.find(window.location.pathname.split("/")[2])),
      quoteSaved: QuotesStore.find(window.location.pathname.split("/")[2]),
      fetching: false
    }, () => {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  }

  getErrors() {
    this.setState({
      errors: ErrorsStore.all(),
      fetching: false
    });
  }

  clickSave() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, () => {
        ClientActions.updateQuote(this.state.quote);
      });
    }
  }

  clickDelete() {
    this.setState({
      deleteModalOpen: true
    });
  }

  confirmDelete() {
    this.setState({
      fetching: true,
      deleteModalOpen: false
    }, () => {
      ClientActions.deleteAndGoToFilm('quotes', this.state.quote);
    });
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.quote, this.state.quoteSaved);
  }

  changeFieldArgs() {
    return {
      thing: "quote",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    return(
      <div id="quote-details">
        <div className="component details-component">
          <h1>Quote Details</h1>
          <div className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-12">
                <h2>Text</h2>
                <textarea rows="5" cols="20" className={ Details.errorClass(this.state.errors, FM.errors.text) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.quote.text || "" } data-field="text" />
                { Details.renderFieldError(this.state.errors, FM.errors.text) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-6">
                <h2>Author</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.quote.author || "" } data-field="author" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-6">
                <h2>Publication</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.quote.publication || "" } data-field="publication" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ FM.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this quote&#63;</h1>
            Deleting a quote will erase ALL of its information and data<br />
            <a className={ "red-button" } onClick={ this.confirmDelete.bind(this) }>
              Yes
            </a>
            <a className={ "orange-button" } onClick={ this.closeModal.bind(this) }>
              No
            </a>
          </div>
        </Modal>
      </div>
    );
  }

  renderButtons() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={ "orange-button" + Common.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        <a id="delete" className={ "orange-button " + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
          Delete Quote
        </a>
      </div>
    )
  }

  componentDidUpdate() {
    FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
}

export default QuoteDetails;
