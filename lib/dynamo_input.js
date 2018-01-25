import React, { Component } from "react";
import { connect } from "react-redux";
import { runDynamoProcessor } from "./actions";
import ValidationHelper, { VALIDATOR_TYPES } from "./utils/validator";
import invariants from "./utils/invariants";

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

	const mapStateToProps = (_, initialProps) => (state, ownProps) => {
		if (ownProps.asyncValidators && ownProps.asyncValidators.length) {
			return {
				valid:
					state.dynamo[
						ownProps.asyncValidators[0] + ownProps.component_uid
					]
			};
		}
		return {};
	};
	const mapDispatchToProps = dispatch => {
		return {
			runAsyncValidator: (id, params, key) =>
				dispatch(runDynamoProcessor(id, params, key))
		};
	};
	class DynamoInput extends Component {
		constructor(props) {
			super(props);
			this.valueChanged = this.valueChanged.bind(this);
			this.state = {
				value:
					this.props.value ||
					(this.props.args && this.props.args.default)
			};
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
		componentWillReceiveProps(next) {
			if (next.component_uid !== this.props.component_uid) {
				//		setTimeout(() => {
				this.valueChanged(this.props.value);
				//}, 0);
			}
		}
		runValidators() {
			return new ValidationHelper(this).run();
		}
		runAsyncValidators(value) {
			this.props.runAsyncValidator(
				this.props.asyncValidators[0],
				value,
				this.props.component_uid
			);
		}
		hasValue() {
			return !!this.state.value || "is required";
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
				(this.state.value &&
					this.state.value.length <= element.args.max) ||
				"The maximum number of letters/numbers is " + element.args.max
			);
		}
		isGreaterThanMinLength(element) {
			return (
				(this.state.value &&
					this.state.value.length >= element.args.min) ||
				"The minimum number of letters/numbers is" + element.args.min
			);
		}
		matchesRegex(element) {
			return (
				new RegExp(element.args.exp).test(this.state.value) ||
				"Invalid entry"
			);
		}
		valueChanged(value) {
			this.props.valueChanged({ [this.props.name]: value });
			if (this.props.asyncValidators && this.props.asyncValidators.length)
				this.runAsyncValidators(value);

			this.setState({ value: value, errors: [] });
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

			if (args.type == "date") Result = DatePicker;

			return (
				<LabelWrapper
					value={this.props.label}
					inner={
						<Result
							type={args.type}
							{...passThrough}
							required={this.isRequired()}
							value={this.state.value}
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
		valueChanged: React.PropTypes.func
	};
	return DynamoInput;
};
