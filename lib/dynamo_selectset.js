import React, { Component } from "react";
export default (Layout, Picker, Container) => {
	//map elements in DynamoView props to elements in store.

	class DynamoSelectSet extends Component {
		constructor(props) {
			super(props);
			this.onPickerValueChanged = this.onPickerValueChanged.bind(this);
			this.onContainerValueChanged = this.onContainerValueChanged.bind(
				this
			);
			this.getPickerValue = this.getPickerValue.bind(this);
			this.getPickerItemsById = this.getPickerItemsById.bind(this);
			this.state = {
				pickerValue: this.props.value,
				items: this.getPickerItemsById(this.props.value)
			};
		}
		getPickerValue() {
			return { [this.props.name]: this.state.pickerValue };
		}
		getPickerItemsById(v) {
			if (v)
				return (
					this.props.args.items.filter(x => x.id == v)[0].elements ||
					[]
				);
			return [];
		}
		onContainerValueChanged(value) {
			if (this.props.args.path) {
				this.props.valueChanged(this.getPickerValue(), value);
				return;
			}
			//path is not defined so unpack the properties and send.
			this.props.valueChanged(
				this.getPickerValue(),
				...Object.keys(value._no_path).map(x => {
					return { [x]: value._no_path[x] };
				})
			);
		}
		onPickerValueChanged(v) {
			//set the picker value.
			this.props.valueChanged({ [this.props.name]: v });
			//change the items rendered by the container.
			this.setState({
				items: this.getPickerItemsById(v),
				pickerValue: v
			});
		}
		isEmptyOrNull(v) {
			return !v || !v.length;
		}
		static noPath() {
			return "_no_path";
		}
		render() {
			/*jshint ignore:start*/
			let initialElementsData = this.props.args.path
				? this.props.extra ? this.props.extra[this.props.args.path] : {}
				: this.props.extra;
			return (
				<Layout
					value={this.props.label}
					inner={
						<Picker
							items={this.props.args.items}
							displayProperty="displayLabel"
							keyProperty="id"
							value={this.state.pickerValue}
							valueChanged={this.onPickerValueChanged}
						/>
					}
					extraElements={
						<Container
							name={
								this.props.args.path || DynamoSelectSet.noPath()
							}
							value={initialElementsData}
							valueChanged={this.onContainerValueChanged}
							elements={this.state.items}
							validator={{}}
						/>
					}
				/>
			);
			/*jshint ignore:end*/
		}
	}

	DynamoSelectSet.notifyExtra = true;
	return DynamoSelectSet;
};
