import React from "react";
import {
  Button,
  Details,
  sendRequest,
  Spinner,
  GrayedOut,
} from "handy-components";

export default class FilmRightsChangeDates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spinner: false,
      obj: {
        startDate: "",
        endDate: "",
      },
      errors: [],
    };
  }

  clickChange() {
    this.setState({
      spinner: true,
    });
    const { startDate, endDate } = this.state.obj;
    const { filmId } = this.props;
    sendRequest("/api/film_rights/change_dates", {
      method: "PATCH",
      data: {
        startDate,
        endDate,
        filmId,
      },
    }).then(
      (response) => {
        const { filmRights } = response;
        this.props.updateChangedDates(filmRights);
      },
      (response) => {
        const { errors } = response;
        this.setState({
          spinner: false,
          errors,
        });
      },
    );
  }

  changeFieldArgs() {
    return {};
  }

  render() {
    const { spinner, obj } = this.state;
    return (
      <div className="handy-component admin-modal">
        <div className="white-box">
          <div className="row">
            {Details.renderField.bind(this)({
              columnWidth: 6,
              entity: "obj",
              property: "startDate",
            })}
            {Details.renderField.bind(this)({
              columnWidth: 6,
              entity: "obj",
              property: "endDate",
            })}
          </div>
          <Button
            text="Change All Dates"
            onClick={() => {
              this.clickChange();
            }}
            disabled={spinner || (obj.startDate === "" && obj.endDate === "")}
          />
          <Spinner visible={spinner} />
          <GrayedOut visible={spinner} />
        </div>
      </div>
    );
  }
}
