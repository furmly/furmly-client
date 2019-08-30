import React, { Component } from "react";
import { connect } from "react-redux";
import { runFurmlyProcessor } from "./actions";
import ValidationHelper, { VALIDATOR_TYPES } from "./utils/validator";
import invariants from "./utils/invariants";
import {
  getKey,
  unwrapObjectValue,
  getBusyKey,
  getErrorKey
} from "./utils/view";
import withLogger from "./furmly_base";
import { withProcess } from "./furmly_process_context";
export default (ProgressIndicator, Layout, Container) => {
  if (
    invariants.validComponent(ProgressIndicator, "ProgressIndicator") &&
    invariants.validComponent(Layout, "Layout") &&
    !Container
  )
    throw new Error("Container cannot be null (furmly_select)");

  //map elements in FurmlyView props to elements in store.
  const mapStateToProps = (_, initialProps) => (state, ownProps) => {
    if (ownProps.args.type == "PROCESSOR") {
      let component_uid = getKey(state, ownProps.component_uid, ownProps);
      let st = state.furmly.view[component_uid];
      return {
        items: st,
        busy: !!state.furmly.view[getBusyKey(component_uid)],
        error: !!state.furmly.view[getErrorKey(component_uid)],
        component_uid
      };
    }
    //evaluate stuff in the parent container to retrieve the
  };

  const mapDispatchToProps = dispatch => {
    return {
      fetch: (id, params, key) => {
        dispatch(runFurmlyProcessor(id, params, key));
      }
    };
  };
  const defaultKeyProperty = ["uid", "_id", "id"];
  class FurmlySelect extends Component {
    constructor(props) {
      super(props);
      this.state = {};
      this.fetchItems = this.fetchItems.bind(this);
      this.onValueChanged = this.onValueChanged.bind(this);
      this.selectFirstItem = this.selectFirstItem.bind(this);
      this.getDisplayValue = this.getDisplayValue.bind(this);
      this.getKey = this.getKey.bind(this);
      this.filter = this.filter.bind(this);
      this.getKeyValue = this.getKeyValue.bind(this);
      this.getValueBasedOnMode = this.getValueBasedOnMode.bind(this);
      this.props.validator.validate = () => {
        return this.runValidators();
      };
      this.isValidValue = this.isValidValue.bind(this);
      this.isObjectIdMode = this.isObjectIdMode.bind(this);
    }
    hasValue() {
      return !!this.props.value || "is required";
    }
    runValidators() {
      return new ValidationHelper(this).run();
    }
    onValueChanged(value) {
      if (this._mounted) {
        this.props.valueChanged({
          [this.props.name]: this.getValueBasedOnMode(value)
        });
        if (this.props.displayValueChanged) {
          setTimeout(
            () =>
              this.props.displayValueChanged({
                [this.props.name]: this.getDisplayValue(value)
              }),
            0
          );
        }
      }
    }
    fetchItems(source, args, component_uid) {
      if (this._mounted) {
        if (!source || !component_uid)
          throw new Error("Something is wrong with our configuration");
        this.props.fetch(source, JSON.parse(args || "{}"), component_uid);
      }
    }
    isValidValue(props) {
      const items = props.items;
      const value = unwrapObjectValue(props.value);
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (this.isValidKeyValue(props, items[i], value)) return true;
        }
      }
      return false;
    }
    filter(query, items = this.props.items) {
      const result = [];
      if (items) {
        const queryEx = new RegExp(query, "igm");
        for (let i = 0; i < items.length; i++) {
          if (queryEx.test(items[i].displayLabel)) result.push(items[i]);
        }
      }
      return items;
    }
    getDisplayValue(
      value = this.props.value,
      items = this.props.items,
      props = this.props
    ) {
      value = unwrapObjectValue(value);
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (this.isValidKeyValue(props, items[i], value))
            return items[i].displayLabel;
        }
      }
      return "";
    }

    getValueBasedOnMode(v) {
      return (
        (this.props.args &&
          this.props.args.mode &&
          typeof v !== "object" &&
          this.props.args.mode == "ObjectId" && { $objectID: v }) ||
        v
      );
    }
    componentWillReceiveProps(next) {
      if (
        !next.error &&
        (next.args.config.value !== this.props.args.config.value ||
          (next.args.config.customArgs !== this.props.args.config.customArgs &&
            !next.busy) ||
          next.component_uid !== this.props.component_uid ||
          (next.args.config.value &&
            typeof next.items == "undefined" &&
            !next.busy))
      ) {
        return this.fetchItems(
          next.args.config.value,
          next.args.config.customArgs,
          next.component_uid
        );
      }

      if (next.items && next.items.length == 1 && !next.value) {
        return this.selectFirstItem(this.getKeyValue(next.items[0], next));
      }

      if (
        (next.items && next.value && !this.isValidValue(next)) ||
        (!next.items && !next.busy && !next.error)
      ) {
        return this.onValueChanged(null);
      }
    }

    selectFirstItem(item) {
      setTimeout(() => {
        this.onValueChanged(item);
      }, 0);
    }
    componentWillUnmount() {
      this._mounted = false;
    }
    isObjectIdMode() {
      return this.props.args && this.props.args.mode === "ObjectId";
    }
    getKey(props) {
      const {
        args: {
          config: { keyProperty }
        }
      } = props;
      return (keyProperty && keyProperty.split(",")) || defaultKeyProperty;
    }
    getKeyValue(item, props = this.props) {
      const keys = this.getKey(props);
      let val;
      for (let i = 0; i < keys.length; i++) {
        val = item[keys[i]];
        if (typeof val !== "undefined") break;
      }
      return val;
    }
    isValidKeyValue(props, item, value) {
      const keys = this.getKey(props);
      for (let i = 0; i < keys.length; i++) {
        const val = item[keys[i]];
        if (typeof val !== "undefined" && val == value) return true;
      }
      return false;
    }

    componentDidMount() {
      this._mounted = true;
      if (!this.props.items) {
        this.props.log(
          "fetching items in componentDidMount for current:" + this.props.name
        );
        this.fetchItems(
          this.props.args.config.value,
          this.props.args.config.customArgs,
          this.props.component_uid
        );
      }

      if (
        this.props.items &&
        this.props.items.length == 1 &&
        !this.props.value
      ) {
        return this.selectFirstItem(
          this.getKeyValue(this.props, this.props.items[0])
        );
      }
      if (
        this.isObjectIdMode() &&
        this.props.value &&
        typeof this.props.value !== "object"
      ) {
        //update the form to indicate its an objectId.
        return setTimeout(() => {
          this.onValueChanged(this.props.value);
        }, 0);
      }
    }
    isEmptyOrNull(v) {
      return !v || !v.length;
    }
    render() {
      /*jshint ignore:start*/

      this.props.log("render");
      if (this.isEmptyOrNull(this.props.items)) {
        this.props.log(`${this.props.name} is empty`);
        return <ProgressIndicator />;
      }

      return (
        <Layout
          value={this.props.label}
          inner={
            <Container
              disabled={
                !!this.props.args.disabled ||
                (this.props.items && this.props.items.length == 1)
              }
              errors={this.state.errors}
              label={this.props.label}
              filter={this.filter}
              items={this.props.items}
              displayProperty="displayLabel"
              getKeyValue={this.getKeyValue}
              getKey={this.getKey}
              value={unwrapObjectValue(this.props.value)}
              valueChanged={this.onValueChanged}
            />
          }
        />
      );
      /*jshint ignore:end*/
    }
  }
  FurmlySelect.hasDisplayValue = true;
  return {
    getComponent: () =>
      withProcess(
        connect(
          mapStateToProps,
          mapDispatchToProps
        )(withLogger(FurmlySelect))
      ),
    FurmlySelect,
    mapStateToProps,
    mapDispatchToProps
  };
};
