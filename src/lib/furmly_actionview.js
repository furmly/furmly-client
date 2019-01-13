import React, { Component } from "react";
import { connect } from "react-redux";
import { runFurmlyProcessor } from "./actions";
import invariants from "./utils/invariants";
import _ from "lodash";
import { getKey } from "./utils/view";
import withLogger from "./furmly_base";
import { withProcess } from "./furmly_process_context";
export default (Layout, ProgressBar, Filter, Container) => {
  invariants.validComponent(Filter, "Filter");
  invariants.validComponent(Container, "Container");
  invariants.validComponent(ProgressBar, "ProgressBar");
  invariants.validComponent(Layout, "Layout");

  const mapDispatchToProps = dispatch => {
    return {
      run: (id, args, key) =>
        dispatch(runFurmlyProcessor(id, args, key, { disableCache: true })),
      showMessage: message => dispatch(showMessage(message))
    };
  };
  const mapStateToProps = (_, initialProps) => (state, ownProps) => {
    var component_uid = getKey(state, ownProps.component_uid, ownProps),
      _actionState = state.furmly.view[component_uid];
    return {
      resultUI: _actionState && (_actionState.ui || _actionState),
      resultData: _actionState && _actionState.data,
      busy: !!state.furmly.view[component_uid + "-busy"],
      component_uid
    };
  };
  const itemViewName = "_item_view";
  const contentViewName = "_content_view";
  class FurmlyActionView extends React.Component {
    constructor(props) {
      super(props);
      this.state = { _filterValidator: {}, validator: {} };
      this.filter = this.filter.bind(this);
      this.valueChanged = this.valueChanged.bind(this);
      this.filterValueChanged = this.filterValueChanged.bind(this);
    }
    componentWillReceiveProps(next) {
      if (!_.isEqual(next.resultData, this.props.resultData)) {
        this.valueChanged({ [contentViewName]: next.resultData });
      }
    }
    filter() {
      this.state._filterValidator.validate().then(
        () => {
          let { [contentViewName]: contentValue, ...rest } =
            this.props.value || {};
          this.props.run(
            this.props.args.action,
            rest,
            this.props.component_uid
          );
        },
        () => {
          this.props.log("a field in filter is invalid");
        }
      );
    }
    filterValueChanged(value) {
      this.valueChanged(value && value[itemViewName]);
    }
    valueChanged(value) {
      this.props.log(`value changed in action view ${value}`);
      this.props.valueChanged({
        [this.props.name]: Object.assign(
          {},
          this.props.value || {},
          value || {}
        )
      });
    }
    render() {
      this.props.log("render");
      if (this.props.busy) return <ProgressBar />;
      let { [contentViewName]: contentValue = {}, ...rest } =
        this.props.value || {};
      return (
        <Layout
          filter={
            <Filter
              actionLabel={this.props.args.commandText}
              filter={this.filter}
            >
              <Container
                elements={this.props.args.elements}
                value={rest}
                name={itemViewName}
                validator={this.state._filterValidator}
                valueChanged={this.filterValueChanged}
              />
            </Filter>
          }
          content={
            <Container
              name={contentViewName}
              elements={this.props.resultUI}
              value={contentValue}
              validator={this.state.validator}
              valueChanged={this.valueChanged}
            />
          }
        />
      );
    }
  }

  return {
    getComponent: () =>
      withProcess(
        connect(
          mapStateToProps,
          mapDispatchToProps
        )(withLogger(FurmlyActionView))
      ),
    FurmlyActionView,
    mapDispatchToProps,
    mapStateToProps
  };
};
