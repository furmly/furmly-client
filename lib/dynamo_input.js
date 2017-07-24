import React, { Component } from "react";
import { connect } from "react-redux";
import { runDynamoProcessor } from "./actions";

const VALIDATOR_TYPES = {
	REQUIRED: "REQUIRED",
	MAXLENGTH: "MAXLENGTH",
	MINLENGTH: "MINLENGTH",
	REGEX: "REGEX"
};

/**
 * Higher order function that recieves Platform specific implementation of Input
 * @param  {Function} Input Input class
 * @return {Function}       Wrapped class
 */
export default (LabelWrapper, Input, DatePicker, Checkbox) => {
	const mapStateToProps = (_, initialProps) => state => {
		if (
			initialProps.asyncValidators &&
			initialProps.asyncValidators.length
		) {
			return {
				valid:
					state.dynamo[
						initialProps.asyncValidators[0] + initialProps.uid
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
			this.state = { value: this.props.value };
			this.props.validator.validate = () => {
				return this.runValidators();
			};
			this.runValidators = this.runValidators.bind(this);
			this.hasValue = this.hasValue.bind(this);
			this.isLessThanMaxLength = this.isLessThanMaxLength.bind(this);
			this.isGreaterThanMinLength = this.isGreaterThanMinLength.bind(
				this
			);
			this.matchesRegex = this.matchesRegex.bind(this);
			this.runAsyncValidators = this.runAsyncValidators.bind(this);
		}
		runValidators() {
			return new Promise((resolve, reject) => {
				if (
					(!this.props.validators || !this.props.validators.length) &&
					(!this.props.asyncValidators ||
						!this.props.asyncValidators.length)
				)
					return resolve();

				if (this.props.validators) {
					let result = this.props.validators.reduce(
						(current, element) => {
							// statements
							let valid = current.valid,
								error = "";
							switch (element.validatorType) {
								case VALIDATOR_TYPES.REQUIRED:
									valid = this.hasValue();
									error = "is required";
									break;
								case VALIDATOR_TYPES.MAXLENGTH:
									valid = this.isLessThanMaxLength(element);
									error =
										"the maximum number of letters/numbers is " +
										element.config.max;
									break;
								case VALIDATOR_TYPES.MINLENGTH:
									valid = this.isLessThanMaxLength(element);
									error =
										"the minimum number of letters/numbers is" +
										element.config.min;
									break;
								case VALIDATOR_TYPES.REGEX:
									valid = this.matchesRegex(element);
									error = "invalid entry";
									break;
							}
							if (!valid) {
								return current.errors.push(
									error
								), (current.valid = false), current;
							}
							return current;
						},
						{ errors: [], valid: true }
					);
					if (!result.valid) {
						this.setState(
							Object.assign(this.state, { errors: result.errors })
						);
						return reject();
					}
				}

				if (
					this.props.asyncValidators &&
					this.props.asyncValidators.length &&
					!this.props.valid
				) {
					return reject();
				}

				resolve();
			});
		}
		runAsyncValidators(value) {
			this.props.runAsyncValidator(
				this.props.asyncValidators[0],
				value,
				this.props.uid
			);
		}
		hasValue() {
			return !!this.state.value;
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
				this.state.value &&
				this.state.value.length <= element.config.max
			);
		} 
		isGreaterThanMinLength(element) {
			return (
				this.state.value &&
				this.state.value.length >= element.config.min
			);
		}
		matchesRegex(element) {
			return new RegExp(element.config.regex).test(this.state.value);
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
			if (!args || args.type == "text" || args.type == "number") {
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
							valueChanged={value => this.valueChanged(value)}
						/>
					}
				/>
			);
			/*jshint ignore:end */
		}
	}
	DynamoInput.propTypes = {
		valueChanged: React.PropTypes.func.isRequired
	};
	return DynamoInput;
};
