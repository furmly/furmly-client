import React, { Component } from "react";
import invariants from "./utils/invariants";
import { connect } from "react-redux";
import { runDynamoProcessor } from "./actions";
import ValidationHelper, { VALIDATOR_TYPES } from "./utils/validator";
export default (Layout, Picker, ProgressBar, Container) => {
	//map elements in DynamoView props to elements in store.
	invariants.validComponent(Layout, "Layout");
	invariants.validComponent(Picker, "Picker");
	invariants.validComponent(Container, "Container");

	const mapDispatchToProps = dispatch => {
		return {
			getItems: (id, args, key) =>
				dispatch(runDynamoProcessor(id, args, key, { returnsUI: true }))
		};
	};
	const mapStateToProps = (_, initialProps) => (state, ownProps) => {
		return {
			busy: state.dynamo[`${ownProps.component_uid}-busy`],
			items: state.dynamo[ownProps.component_uid] || ownProps.args.items
		};
	};

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
				items: this.getPickerItemsById(this.props.value),
				containerValidator: {}
			};
			this.selectFirstItem = this.selectFirstItem.bind(this);
			this.oneOption = this.oneOption.bind(this);
			this.props.validator.validate = () => {
				return this.runValidators();
			};
		}
		hasValue() {
			return !!this.state.pickerValue || "is required";
		}
		runValidators() {
			return Promise.all([
				new ValidationHelper(this).run(),
				this.state.containerValidator.validate()
			]);
		}
		componentWillReceiveProps(next) {
			if (
				(next.value && next.value !== this.state.pickerValue) ||
				(next.items &&
					next.items.length &&
					(!this.props.items || !this.props.items.length)) ||
				next.component_uid !== this.props.component_uid
			) {
				setTimeout(() => {
					this.onPickerValueChanged(next.value);
				}, 0);
			}

			if (
				next.args.processor !== this.props.args.processor ||
				(next.component_uid !== this.props.component_uid &&
					next.args.processor)
			)
				this.fetchItems(
					next.args.processor,
					next.args.processorArgs,
					next.component_uid
				);

			if (next.items && next.items.length == 1) {
				this.selectFirstItem();
			}
		}
		fetchItems(source, args, component_uid) {
			this.props.getItems(
				source,
				JSON.parse(args || this.props.args.processorArgs || "{}"),
				component_uid || this.props.component_uid
			);
		}
		componentDidMount() {
			if (this.props.args.processor) {
				this.fetchItems(this.props.args.processor);
			}

			if (this.props.items && this.props.items.length == 1) {
				this.selectFirstItem();
			}
		}
		oneOption() {
			return this.props.items && this.props.items.length == 1;
		}
		selectFirstItem(items) {
			setTimeout(() => {
				this.onPickerValueChanged(this.props.items[0].id);
			}, 0);
		}
		getPickerValue() {
			return { [this.props.name]: this.state.pickerValue };
		}
		getPickerItemsById(v) {
			if (v && this.props.items && this.props.items.length) {
				let r = this.props.items.filter(x => x.id == v);
				return (r.length && r[0].elements) || [];
			}

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
			let items = this.getPickerItemsById(v),
				pickerValue = null;
			if (
				this.props.items.length &&
				this.props.items.filter(x => x.id == v).length
			) {
				//set the picker value.
				this.props.valueChanged({ [this.props.name]: v });
				pickerValue = v;
			}
			this.setState({
				pickerValue,
				items
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
			if (this.props.busy) {
				return <ProgressBar />;
			}

			let initialElementsData = this.props.args.path
				? this.props.extra ? this.props.extra[this.props.args.path] : {}
				: this.props.extra;
			return (
				<Layout
					value={this.props.label}
					inner={
						<Picker
							label={this.props.label}
							disabled={
								!!this.props.args.disabled || this.oneOption()
							}
							items={this.props.items}
							errors={this.state.errors}
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
							validator={this.state.containerValidator}
						/>
					}
				/>
			);
			/*jshint ignore:end*/
		}
	}

	DynamoSelectSet.notifyExtra = true;
	return connect(mapStateToProps, mapDispatchToProps)(DynamoSelectSet);
};
