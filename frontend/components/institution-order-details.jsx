import React from 'react'
import { deepCopy, Details, setUpNiceSelect, fetchEntity, updateEntity, GrayedOut, Spinner, BottomButtons, Table, OutlineButton, ModalSelect, Common, createEntity, deleteEntity } from 'handy-components'

export default class InstitutionOrderDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      spinner: true,
      institutionOrder: {},
      institutionOrderSaved: {},
      institutions: [],
      orderFilms: [],
      films: [],
      orderFormats: [],
      formats: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { institutionOrder, institutions, institutionOrderFilms, films, institutionOrderFormats, formats } = response;
      this.setState({
        institutionOrder,
        institutionOrderSaved: deepCopy(institutionOrder),
        institutions,
        orderFilms: institutionOrderFilms,
        orderFormats: institutionOrderFormats,
        films,
        formats,
        spinner: false,
      }, () => {
        setUpNiceSelect({ selector: 'select', func: Details.changeDropdownField.bind(this) });
      });
    });
  }

  clickSave() {
    this.setState({
      spinner: true,
      justSaved: true,
    }, () => {
      const { institutionOrder } = this.state;
      updateEntity({
        entityName: 'institutionOrder',
        entity: institutionOrder,
      }).then((response) => {
        const { institutionOrder } = response;
        this.setState({
          spinner: false,
          changesToSave: false,
          institutionOrder,
          institutionOrderSaved: deepCopy(institutionOrder),
        });
      }, (response) => {
        const { errors } = response;
        this.setState({
          spinner: false,
          errors,
        });
      });
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.institutionOrder, this.state.institutionOrderSaved);
  }

  changeFieldArgs() {
    return {
      thing: "institutionOrder",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  selectFilm(option) {
    const { institutionOrder } = this.state;
    this.setState({
      spinner: true,
      selectFilmModalOpen: false,
    });
    createEntity({
      directory: 'institution_order_films',
      entityName: 'institutionOrderFilm',
      entity: {
        institutionOrderId: institutionOrder.id,
        filmId: option.id,
      },
    }).then((response) => {
      const { institutionOrderFilms, films } = response;
      this.setState({
        spinner: false,
        films,
        orderFilms: institutionOrderFilms,
      });
    });
  }

  deleteFilm(id) {
    this.setState({
      spinner: true,
    });
    deleteEntity({
      directory: 'institution_order_films',
      id,
    }).then((response) => {
      const { institutionOrderFilms, films } = response;
      this.setState({
        spinner: false,
        films,
        orderFilms: institutionOrderFilms,
      });
    });
  }

  selectFormat(option) {
    const { institutionOrder } = this.state;
    this.setState({
      spinner: true,
      selectFormatModalOpen: false,
    });
    createEntity({
      directory: 'institution_order_formats',
      entityName: 'institutionOrderFormat',
      entity: {
        institutionOrderId: institutionOrder.id,
        formatId: option.id,
      },
    }).then((response) => {
      const { institutionOrderFormats, formats } = response;
      this.setState({
        spinner: false,
        formats,
        orderFormats: institutionOrderFormats,
      });
    });
  }

  deleteFormat(id) {
    // this.setState({
    //   spinner: true,
    // });
    // deleteEntity({
    //   directory: 'institution_order_films',
    //   id,
    // }).then((response) => {
    //   const { institutionOrderFilms, films } = response;
    //   this.setState({
    //     spinner: false,
    //     films,
    //     orderFilms: institutionOrderFilms,
    //   });
    // });
  }

  render() {
    const { spinner, justSaved, changesToSave, institutions, orderFilms, films, selectFilmModalOpen, orderFormats, formats, selectFormatModalOpen } = this.state;
    return (
      <>
        <div>
          <div className="handy-component details-component">
            <h1>Educational Order Details</h1>
            <div className="white-box">
              <div className="row">
                { Details.renderDropDown.bind(this)({
                  columnWidth: 3,
                  entity: 'institutionOrder',
                  property: 'institutionId',
                  options: institutions,
                  optionDisplayProperty: 'label',
                  columnHeader: 'Customer',
                }) }
                { Details.renderField.bind(this)({ columnWidth: 3, entity: 'institutionOrder', property: 'number', columnHeader: 'Order Number' }) }
                { Details.renderField.bind(this)({ columnWidth: 3, entity: 'institutionOrder', property: 'orderDate' }) }
              </div>
              <hr />
              <div className="address-block">
                <p className="section-header">Billing Address</p>
                <div className="row">
                  { Details.renderField.bind(this)({ columnWidth: 4, entity: 'institutionOrder', property: 'billingName', columnHeader: 'Name' }) }
                  { Details.renderField.bind(this)({ columnWidth: 4, entity: 'institutionOrder', property: 'billingAddress1', columnHeader: 'Address 1' }) }
                  { Details.renderField.bind(this)({ columnWidth: 4, entity: 'institutionOrder', property: 'billingAddress2', columnHeader: 'Address 2' }) }
                </div>
              </div>
              <div className="row">
                { Details.renderField.bind(this)({ columnWidth: 3, entity: 'institutionOrder', property: 'billingCity', columnHeader: 'City' }) }
                { Details.renderField.bind(this)({ columnWidth: 1, entity: 'institutionOrder', property: 'billingState', columnHeader: 'State' }) }
                { Details.renderField.bind(this)({ columnWidth: 2, entity: 'institutionOrder', property: 'billingZip', columnHeader: 'Zip' }) }
                { Details.renderField.bind(this)({ columnWidth: 2, entity: 'institutionOrder', property: 'billingCountry', columnHeader: 'Country' }) }
              </div>
              <hr />
              <div className="address-block">
                <p className="section-header">Shipping Address</p>
                <div className="row">
                  { Details.renderField.bind(this)({ columnWidth: 4, entity: 'institutionOrder', property: 'shippingName', columnHeader: 'Name' }) }
                  { Details.renderField.bind(this)({ columnWidth: 4, entity: 'institutionOrder', property: 'shippingAddress1', columnHeader: 'Address 1' }) }
                  { Details.renderField.bind(this)({ columnWidth: 4, entity: 'institutionOrder', property: 'shippingAddress2', columnHeader: 'Address 2' }) }
                </div>
              </div>
              <div className="row">
                { Details.renderField.bind(this)({ columnWidth: 3, entity: 'institutionOrder', property: 'shippingCity', columnHeader: 'City' }) }
                { Details.renderField.bind(this)({ columnWidth: 1, entity: 'institutionOrder', property: 'shippingState', columnHeader: 'State' }) }
                { Details.renderField.bind(this)({ columnWidth: 2, entity: 'institutionOrder', property: 'shippingZip', columnHeader: 'Zip' }) }
                { Details.renderField.bind(this)({ columnWidth: 2, entity: 'institutionOrder', property: 'shippingCountry', columnHeader: 'Country' }) }
              </div>
              <hr />
              <div className="row">
                { Details.renderDropDown.bind(this)({
                  columnWidth: 2,
                  entity: 'institutionOrder',
                  property: 'licensedRights',
                  type: 'dropdown',
                  options: [
                    { value: "disc_only", label: "Disc Only" },
                    { value: "ppr", label: "PPR" },
                    { value: "drl", label: "DRL" },
                    { value: "ppr_and_drl", label: "PPR and DRL" },
                  ],
                  optionDisplayProperty: 'label',
                }) }
                { Details.renderField.bind(this)({ columnWidth: 2, entity: 'institutionOrder', property: 'price' }) }
                { Details.renderField.bind(this)({ columnWidth: 2, entity: 'institutionOrder', property: 'shippingFee' }) }
              </div>
              <hr />
              <Table
                rows={ orderFilms }
                links={ false }
                alphabetize
                columns={[
                  { name: 'filmTitle', header: 'Title' },
                ]}
                clickDelete={ false ? null : film => this.deleteFilm(film.id) } // TODO: read-only if invoice sent
                sortable={ false }
                style={ { marginBottom: 15 } }
              />
              <OutlineButton
                text="Add Film"
                onClick={ () => this.setState({ selectFilmModalOpen: true }) }
                marginBottom
              />
              <hr />
              <Table
                rows={ orderFormats }
                links={ false }
                alphabetize
                columns={[
                  { name: 'formatName', header: 'Format' },
                ]}
                clickDelete={ false ? null : format => this.deleteFormat(format.id) } // TODO: read-only if invoice sent
                sortable={ false }
                style={ { marginBottom: 15 } }
              />
              <OutlineButton
                text="Add Format"
                onClick={ () => this.setState({ selectFormatModalOpen: true }) }
                marginBottom
              />
              <hr />
              <div className="row">
                { Details.renderField.bind(this)({ columnWidth: 3, entity: 'institutionOrder', property: 'materialsSent' }) }
                { Details.renderField.bind(this)({ columnWidth: 4, entity: 'institutionOrder', property: 'trackingNumber' }) }
              </div>
              <hr />
              <div className="row">
                { Details.renderField.bind(this)({ type: 'textbox', columnWidth: 12, entity: 'institutionOrder', property: 'notes', rows: 5 }) }
              </div>
              <BottomButtons
                entityName="institutionOrder"
                confirmDelete={ Details.confirmDelete.bind(this) }
                justSaved={ justSaved }
                changesToSave={ changesToSave }
                disabled={ spinner }
                clickSave={ () => { this.clickSave() } }
              />
              <GrayedOut visible={ spinner } />
              <Spinner visible={ spinner } />
            </div>
          </div>
        </div>
        <ModalSelect
          isOpen={ selectFilmModalOpen }
          options={ films }
          property="title"
          func={ this.selectFilm.bind(this) }
          onClose={ Common.closeModals.bind(this) }
        />
        <ModalSelect
          isOpen={ selectFormatModalOpen }
          options={ formats }
          property="name"
          func={ this.selectFormat.bind(this) }
          onClose={ Common.closeModals.bind(this) }
        />
      </>
    );
  }
}
