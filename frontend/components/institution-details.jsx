import React from 'react'
import { Details, deepCopy, fetchEntity, updateEntity, Spinner, GrayedOut, BottomButtons, objectsAreEqual } from 'handy-components'

export default class InstitutionDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      spinner: true,
      errors: [],
      institution: {
        label: "",
      },
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { institution } = response;
      this.setState({
        spinner: false,
        institution,
        institutionSaved: deepCopy(institution),
      });
    });
  }

  clickSave() {
    const { institution } = this.state;
    this.setState({
      spinner: true,
      justSaved: true,
    }, () => {
      updateEntity({
        entityName: 'institution',
        entity: institution,
      }).then((response) => {
        const { institution } = response;
        this.setState({
          spinner: false,
          institution,
          institutionSaved: deepCopy(institution),
          changesToSave: false,
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
    const { institution, institutionSaved } = this.state;
    return !objectsAreEqual(institution, institutionSaved);
  }

  changeFieldArgs() {
    return {
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    const { spinner, justSaved, changesToSave } = this.state;
    return (
      <>
        <div className="handy-component">
          <h1>Educational Institution Details</h1>
          <div className="white-box">
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 12, entity: 'institution', property: 'label' }) }
            </div>
            <BottomButtons
              entityName="institution"
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
      </>
    );
  }
}
