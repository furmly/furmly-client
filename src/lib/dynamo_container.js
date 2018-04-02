import React, { Component } from "react";
import invariants from "./utils/invariants";

export default (...args) => {
	//invariants
	let Section = args[0],
		Header = args[1],
		ComponentWrapper,
		ComponentLocator;
	if (args.length == 3) {
		ComponentLocator = args[2];
	} else {
		ComponentWrapper = args[2];
		ComponentLocator = args[3];
	}

	if (
		invariants.validComponent(Section, "Section") &&
		invariants.validComponent(Header, "Header") &&
		!ComponentLocator
	)
		throw new Error("ComponentLocator cannot be null (dynamo_container)");

	return class extends Component {
		constructor(props) {
			super(props);
			this.onValueChanged = this.onValueChanged.bind(this);
			this.state = {
				_validations: (this.props.elements || []).map(x => ({}))
			};
			//this._validations = [];
			this.setValidator = this.setValidator.bind(this);
			this.setValidator();
		}
		componentWillReceiveProps(next) {
			if (
				next.elements &&
				(next.elements !== this.props.elements ||
					next.elements.length !== this.props.elements.length)
			) {
				let _validations = next.elements.map(x => ({}));
				this.setState({ _validations });
			}
		}
		setValidator() {
			this.props.validator.validate = () => {
				return Promise.all(
					this.state._validations.map(x => {
						if (x.validate) return x.validate();

						return new Promise((resolve, reject) => {
							resolve();
						});
					})
				);
			};
		}
		onValueChanged() {
			let form = Object.assign(
				{},
				this.props.value || {},
				...Array.prototype.slice.call(arguments)
			);

			this.props.valueChanged({ [this.props.name]: form });
		}

		render() {
			//this._validations.length = 0;
			let keys = this.props.value ? Object.keys(this.props.value) : [],
				self = this,
				extraVal = {},
				notifyExtra = [],
				elements = (this.props.elements || [])
					.sort((x, y) => {
						return x.order - y.order;
					})
					.map((x, index) => {
						let DynamoComponent = ComponentLocator(x),
							source = self.props.value,
							//validator = {},
							value = source ? this.props.value[x.name] : null;
						//this._validations.push(validator);
						if (
							source &&
							source.hasOwnProperty(x.name) &&
							keys.indexOf(x.name) !== -1
						)
							keys.splice(keys.indexOf(x.name), 1);
						/*jshint ignore:start*/
						if (!DynamoComponent)
							throw new Error(
								"Unknown component:" +
									JSON.stringify(x, null, " ")
							);
						if (DynamoComponent.notifyExtra) {
							notifyExtra.push(index);
							return extra => {
								let component = (
									<DynamoComponent
										{...x}
										extra={extra}
										key={x.name}
										value={value}
										validator={
											this.state._validations[index]
										}
										valueChanged={this.onValueChanged}
										navigation={this.props.navigation}
										currentProcess={
											this.props.currentProcess
										}
										currentStep={this.props.currentStep}
									/>
								);
								if (ComponentWrapper)
									return ComponentWrapper(
										x.elementType,
										x.uid,
										x.name,
										component
									);

								return component;
							};
						}
						let component = (
							<DynamoComponent
								{...x}
								value={value}
								validator={this.state._validations[index]}
								key={x.name}
								valueChanged={this.onValueChanged}
								navigation={this.props.navigation}
								currentProcess={this.props.currentProcess}
								currentStep={this.props.currentStep}
							/>
						);
						return ComponentWrapper
							? ComponentWrapper(
									x.elementType,
									x.uid,
									x.name,
									component
								)
							: component;
						/*jshint ignore:end*/
					});

			if (keys.length || notifyExtra.length) {
				if (!notifyExtra.length) {
					// console.warn(
					// 	"there are extra properties that no component cares about " +
					// 		JSON.stringify(keys, null, " ")
					// );
					// console.warn('shouldnt happen too often');
				}

				keys.forEach(x => {
					extraVal[x] = self.props.value[x];
				});

				notifyExtra.forEach(x => {
					elements[x] = elements[x](Object.assign({}, extraVal));
				});
			}
			if (this.props.label)
				return (
					<Section>
						<Header text={this.props.label} />
						{elements}
					</Section>
				);
			/*jshint ignore:start*/
			return <Section>{elements}</Section>;
			/*jshint ignore:end*/
		}
	};
};
