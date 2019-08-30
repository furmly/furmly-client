import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import PropTypes from "prop-types";
import {
  fetchFurmlyProcess,
  runFurmlyProcess,
  clean,
  clearNavigationStack
} from "./actions";

import invariants from "./utils/invariants";
import withLogger from "./furmly_base";
import { withTemplateCacheProvider } from "./furmly_template_cache_context";
import { withNavigation } from "./furmly_navigation_context";
import { withProcessProvider } from "./furmly_process_context";
/**
 * Higher order function that recieves Platform specific implementation of Input
 * @param  {Function} Input Input class
 * @return {Function}       Wrapped class
 */
export default (ProgressBar, TextView, FurmlyView, Layout) => {
  invariants.validComponent(ProgressBar, "ProgressBar");
  invariants.validComponent(TextView, "TextView");
  invariants.validComponent(FurmlyView, "FurmlyView");

  //map elements in FurmlyInput props to elements in store.
  const mapStateToProps = (_, initialProps) => (state, ownProps) => {
    let _state = state.furmly.view[`${ownProps.id}`];
    let SESSION_EXPIRED = state.furmly.SESSION_EXPIRED;

    console.log(state);
    return {
      busy: state.furmly.view[`${ownProps.id}-busy`],
      description: _state && _state.description,
      instanceId: _state && _state.instanceId,
      message: state.furmly.messaging,
      completed: _state && _state.completed,
      SESSION_EXPIRED
    };
  };

  const mapDispatchToProps = dispatch => {
    return {
      fetch: (id, params) => {
        dispatch(fetchFurmlyProcess(id, params));
      },
      clean: () => dispatch(clean()),
      clearStack: () => dispatch(clearNavigationStack()),
      runProcess: info => {
        dispatch(runFurmlyProcess(info));
      }
    };
  };

  const componentNames = {
    view: "view",
    text: "text",
    busy: "busy"
  };
  const componentNamesArr = Object.keys(componentNames);
  const instances = [];
  class FurmlyProcess extends Component {
    constructor(props) {
      super(props);
      this.state = {};
      this.submit = this.submit.bind(this);
      this.getCurrentComponent = this.getCurrentComponent.bind(this);
      this.getCurrentComponentName = this.getCurrentComponentName.bind(this);
      this.clean = this.clean.bind(this);
    }

    componentDidMount() {
      FurmlyProcess.instances.push(this);
      if (
        !this.props.description ||
        (this.props.id !== this.props.description._id &&
          this.props.id !== this.props.description.uid)
      ) {
        this.props.fetch(this.props.id, this.props.fetchParams);
      }
    }
    componentWillUnmount() {
      FurmlyProcess.instances.pop();
    }
    componentWillReceiveProps(next) {
      if (next.completed && next.completed != this.props.completed) {
        this.props.clearStack();
        return this.props.processCompleted(next.props, this.props);
      }

      if (
        next.SESSION_EXPIRED &&
        next.SESSION_EXPIRED !== this.props.SESSION_EXPIRED
      ) {
        return this.props.sessionExpired();
      }

      if (
        next.message &&
        next.message.message &&
        next.message !== this.props.message &&
        next.message.message !== this.props.message.message
      ) {
        return this.props.showMessage(next.message);
      }

      if (
        ((next.id !== this.props.id ||
          !_.isEqual(next.fetchParams, this.props.fetchParams)) &&
          !next.busy &&
          !next.description) ||
        (next.id == this.props.id &&
          !_.isEqual(next.fetchParams, this.props.fetchParams) &&
          !next.busy) ||
        (!next.description && typeof next.busy == "undefined" && next.id)
      ) {
        this.props.log("fetching...");
        this.props.fetch(next.id, next.fetchParams);
      }
    }
    submit(form) {
      this.props.runProcess({
        id: this.props.id,
        form,
        currentStep: this.props.currentStep,
        instanceId: this.props.instanceId
      });
    }
    getCurrentComponentName() {
      if (
        this.props.busy ||
        (typeof this.props.busy == "undefined" && !this.props.description) ||
        this.props.completed
      ) {
        return componentNames.busy;
      }
      if (!this.props.description) {
        return componentNames.text;
      }
      return componentNames.view;
    }
    getCurrentComponent(name) {
      switch (name) {
        case componentNames.view:
          return <FurmlyView submit={this.submit} />;
        case componentNames.text:
          return (
            <TextView text="Sorry we couldnt load that process...please wait a few minutes and retry." />
          );
        case componentNames.busy:
          return <ProgressBar title="Please wait..." />;
      }
    }
    clean() {
      this.props.clean();
    }
    render() {
      this.props.log("render");

      if (Layout)
        return (
          <Layout
            componentNames={componentNamesArr}
            getCurrentComponent={this.getCurrentComponent}
            getCurrentComponentName={this.getCurrentComponentName}
          />
        );

      return this.getCurrentComponent(this.getCurrentComponentName());
    }
  }

  Object.defineProperties(FurmlyProcess, {
    instances: {
      enumerable: true,
      get: function() {
        return instances;
      }
    },
    clean: {
      enumerable: true,
      value: function() {
        if (instances.length) {
          instances[0].clean();
        }
      }
    }
  });
  FurmlyProcess.propTypes = {
    id: PropTypes.string.isRequired,
    fetchParams: PropTypes.object,
    description: PropTypes.object
  };

  return {
    getComponent: () => {
      const ProcessComponent = withLogger(
        withNavigation(
          withTemplateCacheProvider(withProcessProvider(FurmlyProcess))
        )
      );
      const ConnectedProcessComponent = connect(
        mapStateToProps,
        mapDispatchToProps,
        null,
        {
          forwardRef: true
        }
      )(ProcessComponent);
      return ConnectedProcessComponent;
    },
    FurmlyProcess,
    mapStateToProps,
    mapDispatchToProps
  };
};
