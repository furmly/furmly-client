import React, { Component } from "react";
import { connect } from "react-redux";
import invariants from "./utils/invariants";
import { valueChanged } from "./actions";
import withLogger from "./furmly_base";
export default (Page, Warning, Container) => {
  invariants.validComponent(Page, "Page");
  invariants.validComponent(Warning, "Warning");
  invariants.validComponent(Container, "Container");

  const mapStateToProps = (_, initialProps) => (state, ownProps) => {
    //log("mapping state to props");
    let _state = state.furmly.view[ownProps.currentProcess],
      description = _state && _state.description,
      map = {
        value: (_state && _state[ownProps.currentStep]) || null
      };

    if (description && description.steps[ownProps.currentStep]) {
      map.elements = description.steps[ownProps.currentStep].form.elements;
      if (description.steps[ownProps.currentStep].mode == "VIEW")
        map.hideSubmit = true;
      map.title = description.title;
      map.processDescription = description.description;
    }
    return map;
  };
  const mapDispatchToProps = dispatch => {
    return {
      valueChanged: args => dispatch(valueChanged(args))
    };
  };

  class FurmlyView extends Component {
    constructor(props) {
      super(props);
      this.onValueChanged = this.onValueChanged.bind(this);
      this.submit = this.submit.bind(this);
      //pass reference to validate func
      this.state = {
        validator: {}
      };
    }

    onValueChanged(form) {
      //this.state.form = form.furmly_view;
      this.props.valueChanged({
        form: form.furmly_view,
        id: this.props.currentProcess,
        step: this.props.currentStep
      });
    }
    submit() {
      this.state.validator
        .validate()
        .then(
          () => {
            this.props.log("currentStep:" + (this.props.currentStep || "0"));
            this.props.submit(this.props.value);
          },
          () => {
            this.props.log("the form is invalid");
          }
        )
        .catch(er => {
          this.props.log("an error occurred while validating form ");
          this.props.log(er);
        });
    }
    render() {
      this.props.log("render");
      if (!this.props.elements || !this.props.elements.length)
        return (
          <Page hideSubmit={true}>
            <Warning message="Oops you are not supposed to be here. Something may be broken. Please navigate home/login" />
          </Page>
        );
      /*jshint ignore:start*/
      return (
        <Page
          submit={this.submit}
          hideSubmit={this.props.hideSubmit}
          processDescription={this.props.processDescription}
        >
          <Container
            label={this.props.title}
            elements={this.props.elements}
            name="furmly_view"
            value={this.props.value}
            valueChanged={this.onValueChanged}
            validator={this.state.validator}
          />
        </Page>
      );
      /*jshint ignore:end*/
    }
  }

  return {
    getComponent: () =>
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(withLogger(FurmlyView)),
    mapStateToProps,
    mapDispatchToProps,
    FurmlyView
  };
};
