import React, { Component } from "react";
import invariants from "./utils/invariants";

export default (Section, Header, ComponentLocator) => {
	//invariants

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
			this.state = { form: this.props.value, validations: [] };
			this.setValidator = this.setValidator.bind(this);
			this.setValidator();
		}
		setValidator() {
			this.props.validator.validate = () => {
				return Promise.all(
					this.state.validations.map(x => {
						if (x.validate) return x.validate();

						return new Promise((resolve, reject) => {
							resolve();
						});
					})
				);
			};
		}
		onValueChanged() {
			this.state.form = Object.assign(
				{},
				this.state.form || {},
				...Array.prototype.slice.call(arguments)
			);
			this.props.valueChanged({ [this.props.name]: this.state.form });
		}

		render() {
			this.state.validations.length = 0;
			let keys = this.props.value ? Object.keys(this.props.value) : [],
				self = this,
				extraVal = {},
				index = -1,
				notifyExtra = [],
				elements = (this.props.elements||[]).sort((x, y) => {
					return x.order - y.order;
				}).map(x => {
					index++;
					let DynamoComponent = ComponentLocator(x),
						source = self.props.value,
						validator = {},
						value = source ? this.props.value[x.name] : null;
					this.state.validations.push(validator);
					if (
						source &&
						self.props.value[x.name] &&
						keys.indexOf(x.name) !== -1
					)
						keys.splice(keys.indexOf(x.name), 1);
					/*jshint ignore:start*/
					if (!DynamoComponent)
						throw new Error(
							"Unknown component:" + JSON.stringify(x, null, " ")
						);
					if (DynamoComponent.notifyExtra) {
						notifyExtra.push(index);
						return extra =>
							<DynamoComponent
								{...x}
								extra={extra}
								key={x.name}
								value={value}
								validator={validator}
								valueChanged={this.onValueChanged}
							/>;
					}

					return (
						<DynamoComponent
							{...x}
							value={value}
							validator={validator}
							key={x.name}
							valueChanged={this.onValueChanged}
						/>
					);
					/*jshint ignore:end*/
				});

			if (keys.length || notifyExtra.length) {
				if (!notifyExtra.length){
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

			/*jshint ignore:start*/
			return (
				<Section>
					<Header text={this.props.label} />
					{elements}
				</Section>
			);
			/*jshint ignore:end*/
		}
	};
};
