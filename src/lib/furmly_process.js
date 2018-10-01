import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchFurmlyProcess, runFurmlyProcess } from "./actions";
import _ from "lodash";
import PropTypes from "prop-types";
import invariants from "./utils/invariants";
import withLogger from "./furmly_base";
/**
 * Higher order function that recieves Platform specific implementation of Input
 * @param  {Function} Input Input class
 * @return {Function}       Wrapped class
 */
export default (ProgressBar, TextView, FurmlyView) => {
  invariants.validComponent(ProgressBar, "ProgressBar");
  invariants.validComponent(TextView, "TextView");
  invariants.validComponent(FurmlyView, "FurmlyView");

  //map elements in FurmlyInput props to elements in store.
  const mapStateToProps = (_, initialProps) => (state, ownProps) => {
    let _state = state.furmly.view[`${ownProps.id}`];
    return {
      busy: !!state.furmly.view[`${ownProps.id}-busy`],
      description: _state && _state.description,
      instanceId: _state && _state.instanceId,
      message: state.furmly.view.message,
      completed: _state && _state.completed
    };
  };

  const mapDispatchToProps = dispatch => {
    return {
      fetch: (id, params) => {
        dispatch(fetchFurmlyProcess(id, params));
      },
      runProcess: info => {
        dispatch(runFurmlyProcess(info));
      }
    };
  };

  class FurmlyProcess extends Component {
    constructor(props) {
      super(props);
      this.state = {};
      this.submit = this.submit.bind(this);
    }
    componentDidMount() {
      if (
        !this.props.description ||
        (this.props.id !== this.props.description._id &&
          this.props.id !== this.props.description.uid)
      ) {
        this.props.fetch(this.props.id, this.props.fetchParams);
      }
    }
    componentWillReceiveProps(next) {
      if (next.completed && next.completed != this.props.completed)
        return this.props.navigation.goBack();

      if (
        ((next.id !== this.props.id ||
          !_.isEqual(next.fetchParams, this.props.fetchParams)) &&
          !next.busy &&
          !next.description) ||
        (next.id == this.props.id &&
          !_.isEqual(next.fetchParams, this.props.fetchParams) &&
          !next.busy)
      )
        this.props.fetch(next.id, next.fetchParams);
    }
    submit(form) {
      this.props.runProcess({
        id: this.props.id,
        form,
        currentStep: this.props.currentStep,
        instanceId: this.props.instanceId
      });
    }
    render() {
      /*jshint ignore:start */
      if (this.props.busy || typeof this.props.busy == "undefined") {
        return <ProgressBar title="Please wait..." />;
      }
      if (!this.props.description) {
        return (
          <TextView text="Sorry we couldnt load that process...please wait a few minutes and retry." />
        );
      }
      return (
        <FurmlyView
          currentStep={this.props.currentStep || 0}
          currentProcess={this.props.id}
          navigation={this.props.navigation}
          submit={this.submit}
        />
      );

      /*jshint ignore:end */
    }
  }

  FurmlyProcess.propTypes = {
    id: PropTypes.string.isRequired,
    fetchParams: PropTypes.object,
    description: PropTypes.object
  };
  return {
    getComponent: () =>
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(withLogger(FurmlyProcess)),
    FurmlyProcess,
    mapStateToProps,
    mapDispatchToProps
  };
};