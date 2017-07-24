import React, { Component } from "react";

export default (Section, Header, ComponentLocator) => {
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
					this.state.validations.map(x => x.validate())
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
			console.log('testing tins');
			this.state.validations.length = 0;
			let keys = this.props.value ? Object.keys(this.props.value) : [],
				self = this,
				extraVal = {},
				index = -1,
				notifyExtra = [],
				elements = this.props.elements.map(x => {
					index++;
					let DynamoComponent = ComponentLocator[x.elementType],
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
				if (!notifyExtra.length)
					throw new Error(
						"there are extra properties that no component cares about"
					);
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
