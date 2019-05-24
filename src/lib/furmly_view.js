import React, { Component } from "react";
import { connect } from "react-redux";
import config from "client_config";
import invariants from "./utils/invariants";
import { valueChanged } from "./actions";
import withLogger from "./furmly_base";
import { withProcess } from "./furmly_process_context";
export default (Page, Warning, Container) => {
  invariants.validComponent(Page, "Page");
  invariants.validComponent(Warning, "Warning");
  invariants.validComponent(Container, "Container");

  const mapStateToProps = (_, initialProps) => (state, ownProps) => {
    let _state = state.furmly.view[ownProps.currentProcess];
    let description = _state && _state.description;
    let map = {
      value: (_state && _state[ownProps.currentStep]) || null
    };
    let currentStep =
      config.uiOnDemand && config.disableBackwardNavigation
        ? 0
        : ownProps.currentStep;

    if (description && description.steps[currentStep]) {
      map.elements = description.steps[currentStep].form.elements;
      if (description.steps[currentStep].mode == "VIEW") {
        map.hideSubmit = true;
      }

      map.title = description.title;
      map.processDescription = description.description;
      map.commandLabel = description.steps[currentStep].commandLabel;
      map.uid = description.uid;
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

      return (
        <Page
          submit={this.submit}
          hideSubmit={this.props.hideSubmit}
          processDescription={this.props.processDescription}
          commandLabel={this.props.commandLabel}
          uid={this.props.uid}
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
    }
  }

  return {
    getComponent: () =>
      withProcess(
        connect(
          mapStateToProps,
          mapDispatchToProps
        )(withLogger(FurmlyView))
      ),
    mapStateToProps,
    mapDispatchToProps,
    FurmlyView
  };
};
