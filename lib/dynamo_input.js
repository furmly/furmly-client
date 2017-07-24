import React, { Component } from "react";

/**
 * Higher order function that recieves Platform specific implementation of Input
 * @param  {Function} Input Input class
 * @return {Function}       Wrapped class
 */
export default (LabelWrapper, Input, DatePicker, Checkbox) => {
	class DynamoInput extends Component {
		constructor(props) {
			super(props);
			this.valueChanged = this.valueChanged.bind(this);
			this.state = { value: this.props.value };
			this.props.validator.validate = () => {
				return new Promise((resolve, reject) => {
					if (
						this.state.value ||
						!this.props.validators ||
						!this.props.validators.length ||
						this.props.validators.filter(
							x => x.validatorType == "REQUIRED"
						).length === 0
					)
						return resolve();

					reject();
				});
			};
		}
		valueChanged(value) {
			this.props.valueChanged({ [this.props.name]: value });
			this.setState({ value: value });
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
							value={this.state.value}
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
