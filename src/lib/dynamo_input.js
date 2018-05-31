import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { runDynamoProcessor } from "./actions";
import ValidationHelper, { VALIDATOR_TYPES } from "./utils/validator";
import invariants from "./utils/invariants";
import debug from "debug";
/**
 * Higher order function that recieves Platform specific implementation of Input
 * @param  {Function} Input Input class
 * @return {Function}       Wrapped class
 */
export default (LabelWrapper, Input, DatePicker, Checkbox) => {
	invariants.validComponent(LabelWrapper, "LabelWrapper");
	invariants.validComponent(Input, "Input");
	invariants.validComponent(DatePicker, "DatePicker");
	invariants.validComponent(Checkbox, "Checkbox");
	const log = debug("dynamo-client-components:input");
	class DynamoInput extends Component {
		constructor(props) {
			super(props);
			this.state = {};
			this.setDefault = this.setDefault.bind(this);
			this.valueChanged = this.valueChanged.bind(this);
			this.runValidators = this.runValidators.bind(this);
			this.hasValue = this.hasValue.bind(this);
			this.isLessThanMaxLength = this.isLessThanMaxLength.bind(this);
			this.isGreaterThanMinLength = this.isGreaterThanMinLength.bind(
				this
			);
			this.matchesRegex = this.matchesRegex.bind(this);
			this.runAsyncValidators = this.runAsyncValidators.bind(this);
			this.props.validator.validate = () => {
				return this.runValidators();
			};
		}
		componentDidMount() {
			this._mounted = true;
			setTimeout(() => {
				if (this._mounted) {
					this.setDefault();
				}
			}, 0);
		}
		componentWillReceiveProps(next) {
			if (next.component_uid !== this.props.component_uid) {
				this.setDefault(next);
			}
		}
		componentWillUnmount() {
			this._mounted = false;
		}
		runValidators() {
			return new ValidationHelper(this).run();
		}
		runAsyncValidators(value) {
			this.props.runAsyncValidator(
				this.props.asyncValidators[0],
				value,
				this.props.asyncValidators[0] + this.props.component_uid
			);
		}
		hasValue() {
			return !!this.props.value || "is required";
		}
		isRequired() {
			return (
				this.props.validators &&
				this.props.validators.filter(
					x => x.validatorType == VALIDATOR_TYPES.REQUIRED
				).length > 0
			);
		}
		isLessThanMaxLength(element) {
			return (
				(this.props.value &&
					this.props.value.length <= element.args.max) ||
				element.error ||
				"The maximum number of letters/numbers is " + element.args.max
			);
		}
		isGreaterThanMinLength(element) {
			return (
				(this.props.value &&
					this.props.value.length >= element.args.min) ||
				element.error ||
				"The minimum number of letters/numbers is" + element.args.min
			);
		}
		matchesRegex(element) {
			return (
				new RegExp(element.args.exp).test(this.props.value) ||
				element.error ||
				"Invalid entry"
			);
		}
		valueChanged(value) {
			this.props.valueChanged({ [this.props.name]: value });
			if (this.props.asyncValidators && this.props.asyncValidators.length)
				this.runAsyncValidators(value);

			this.setState({ errors: [] });
		}
		getDateConfig(args) {
			let result = {};
			if (args.config) {
				args = args.config;
				if (args.max) {
					if (args.max == "TODAY") result.maxDate = new Date();
					else result.maxDate = new Date(args.maxConfig.date);
				}
				if (args.min) {
					if (args.min == "TODAY") result.minDate = new Date();
					else result.minDate = new Date(args.minConfig.date);
				}
			}

			return result;
		}
		setDefault(props = this.props) {
			if (!props.value && props.args && props.args.default)
				this.valueChanged(props.args.default);
		}
		render() {
			/*jshint ignore:start */
			let args = this.props.args,
				Result;
			const { type, valueChanged, ...passThrough } = this.props;
			if (
				!args ||
				!args.type ||
				args.type == "text" ||
				args.type == "number" ||
				args.type == "password"
			) {
				Result = Input;
				args = args || { type: "text" };
			}
			if (args.type == "checkbox") Result = Checkbox;

			if (args.type == "date") {
				Result = DatePicker;
				Object.assign(passThrough, this.getDateConfig(args));
			}
			return (
				<LabelWrapper
					value={this.props.label}
					inner={
						<Result
							type={args.type}
							{...passThrough}
							required={this.isRequired()}
							value={this.props.value}
							errors={this.state.errors}
							valueChanged={this.valueChanged}
						/>
					}
				/>
			);
			/*jshint ignore:end */
		}
	}
	DynamoInput.propTypes = {
		valueChanged: PropTypes.func
	};
	return DynamoInput;
};
