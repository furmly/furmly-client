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
			let value =
				props.value && typeof props.value == "object"
					? props.value.$objectID
					: props.value;
			this.state = {
				pickerValue: value,
				items: this.getPickerItemsById(value),
				containerValidator: {}
			};
			this.selectFirstItem = this.selectFirstItem.bind(this);
			this.respondToPickerValueChanged = this.respondToPickerValueChanged.bind(
				this
			);
			this.oneOption = this.oneOption.bind(this);
			this.props.validator.validate = () => {
				return this.runValidators();
			};
			this.getValueBasedOnMode = this.getValueBasedOnMode.bind(this);
			this.isObjectIdMode = this.isObjectIdMode.bind(this);
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
				this.respondToPickerValueChanged(next.value, next.items);
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
				this.selectFirstItem(next.items);
			}
		}
		fetchItems(source, args, component_uid) {
			let _args = this._onContainerValueChanged.call(
				this,
				this._currentValue
			);
			_args.shift();
			this.props.getItems(
				source,
				Object.assign(
					JSON.parse(args || this.props.args.processorArgs || "{}"),
					{
						_args
					}
				),
				component_uid || this.props.component_uid
			);
		}
		componentWillUnmount() {
			this._mounted = false;
		}
		componentDidMount() {
			this._mounted = true;
			if (this.props.args.processor) {
				this.fetchItems(this.props.args.processor);
			}

			if (this.props.items && this.props.items.length == 1) {
				return setTimeout(() => {
					this.selectFirstItem();
				}, 0);
			}

			if (
				this.isObjectIdMode() &&
				this.props.value &&
				typeof this.props.value !== "object"
			) {
				return setTimeout(() => {
					this.props.valueChanged({
						[this.props.name]: this.getValueBasedOnMode(
							this.props.value
						)
					});
				});
			}
		}

		isObjectIdMode() {
			return this.props.args && this.props.args.mode === "ObjectId";
		}
		oneOption() {
			return this.props.items && this.props.items.length == 1;
		}
		selectFirstItem(items = this.props.items) {
			this.onPickerValueChanged(items[0].id, items);
		}
		getPickerValue(value = this.state.pickerValue) {
			return {
				[this.props.name]: this.getValueBasedOnMode(value)
			};
		}
		getPickerItemsById(v, items = this.props.items) {
			if (v && items && items.length) {
				let r = items.filter(x => x.id == v);
				return (r.length && r[0].elements) || [];
			}

			return [];
		}
		onContainerValueChanged(value, pickerValue) {
			this.props.valueChanged.apply(
				this,
				this._onContainerValueChanged.call(this, value, pickerValue)
			);
		}

		_onContainerValueChanged(value, pickerValue) {
			let superCancel =
				this._currentValue &&
				Object.keys(this._currentValue).reduce((sum, x) => {
					return (sum[x] = undefined), sum;
				}, {});
			this._currentValue = value;
			pickerValue = pickerValue || this.getPickerValue();
			if (this.props.args.path) {
				let _p = [pickerValue];
				if (superCancel) _p.push(superCancel);
				if (value) _p.push(value);
				return _p;
			}
			//path is not defined so unpack the properties and send.
			let result = [
				pickerValue,
				...Object.keys((value && value._no_path) || {}).map(x => {
					return { [x]: value._no_path[x] };
				})
			];

			if (superCancel) {
				result.splice(1, 0, superCancel);
			}
			return result;
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
		respondToPickerValueChanged(v, items = this.props.items) {
			let _items = this.getPickerItemsById(v, items),
				pickerValue = null;
			if (items && items.length && items.filter(x => x.id == v).length) {
				//set the picker value.
				this.onContainerValueChanged(null, this.getPickerValue(v));
				pickerValue = v;
			}
			if (this._mounted) {
				this.setState({
					pickerValue,
					items: _items
				});
			}
		}
		onPickerValueChanged(v, items = this.props.items) {
			this.respondToPickerValueChanged(
				v,
				(Array.prototype.isPrototypeOf(items) && items) || undefined
			);
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
							navigation={this.props.navigation}
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
