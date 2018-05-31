import React from "react";
import invariants from "./utils/invariants";
import { unwrapObjectValue } from "./utils/view";
import { connect } from "react-redux";
import { runDynamoProcessor } from "./actions";
import ValidationHelper, { VALIDATOR_TYPES } from "./utils/validator";
import { getKey } from "./utils/view";
import debug from "debug";
import _ from "lodash";
import DynamoBase from "./dynamo_base";

export default (Layout, Picker, ProgressBar, Container) => {
	//map elements in DynamoView props to elements in store.
	invariants.validComponent(Layout, "Layout");
	invariants.validComponent(Picker, "Picker");
	invariants.validComponent(Container, "Container");
	const log = debug("dynamo-client-components:selectset");
	const noPath = "selectset_no_path";
	const noItems = [];
	const mapDispatchToProps = dispatch => {
		return {
			getItems: (id, args, key, extra) =>
				dispatch(runDynamoProcessor(id, args, key, extra))
		};
	};
	const mapStateToProps = (_, initialProps) => (state, ownProps) => {
		let component_uid = getKey(state, ownProps.component_uid, ownProps),
			items = state.dynamo.view[component_uid] || ownProps.args.items;
		return {
			busy: !!state.dynamo.view[`${ownProps.component_uid}-busy`],
			items,
			contentItems: getPickerItemsById(ownProps.value, items),
			component_uid
		};
	};
	const getPickerItemsById = function(v, items) {
		if (v && items && items.length) {
			let z = unwrapObjectValue(v);
			let r = items.filter(x => x.id == z);
			return (r.length && r[0].elements) || noItems;
		}

		return noItems;
	};
	class DynamoSelectSet extends DynamoBase {
		constructor(props) {
			super(props, log);
			this.retryFetch = this.retryFetch.bind(this);
			this.onPickerValueChanged = this.onPickerValueChanged.bind(this);
			this.onContainerValueChanged = this.onContainerValueChanged.bind(
				this
			);
			this.getPickerValue = this.getPickerValue.bind(this);
			this.getContainerValue = this.getContainerValue.bind(this);
			let containerValues = (props.contentItems || [])
				.reduce((sum, x) => {
					if (this.props.extra.hasOwnProperty(x.name))
						sum[x.name] = this.props.extra[x.name];
					return sum;
				}, {});
			this.state = {
				containerValues,
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
			return !!this.props.value || "is required";
		}
		runValidators() {
			return Promise.all([
				new ValidationHelper(this).run(),
				this.state.containerValidator.validate()
			]);
		}

		componentWillReceiveProps(next) {
			if (
				(next.args.processor !== this.props.args.processor ||
					(next.component_uid !== this.props.component_uid &&
						next.args.processor) ||
					typeof next.items == "undefined") &&
				!next.busy
			)
				this.fetchItems(
					next.args.processor,
					next.args.processorArgs,
					next.component_uid
				);

			if (next.items && next.items.length == 1 && !next.value) {
				return this.selectFirstItem(next.items);
			}
		}

		retryFetch() {
			this.log(`retrying fetch`);
			this.fetchItems(
				this.props.args.processor,
				this.props.args.processorArgs,
				this.props.component_uid,
				{ retry: true }
			);
		}

		fetchItems(source, args, component_uid) {
			let _args = this._onContainerValueChanged.call(
				this,
				this.state.containerValues
			);
			_args.shift();
			this.log(`fetching items`);
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
			if (
				this.props.args.processor &&
				typeof this.props.items == "undefined"
			) {
				this.fetchItems(this.props.args.processor);
			}

			if (
				this.props.items &&
				this.props.items.length == 1 &&
				!this.props.value
			) {
				return setTimeout(() => {
					this.selectFirstItem();
				}, 0);
			}

			if (
				this.isObjectIdMode() &&
				this.props.value &&
				typeof this.props.value !== "object"
			) {
				//update the form to indicate its an objectId.
				return setTimeout(() => {
					this.onPickerValueChanged(this.props.value);
				}, 0);
			}
		}

		isObjectIdMode() {
			return this.props.args && this.props.args.mode === "ObjectId";
		}
		oneOption() {
			return this.props.items && this.props.items.length == 1;
		}
		getCurrentContainerValue() {
			return (
				(this.props.args.path &&
					this.props.extra[this.props.args.path]) ||
				this.state.containerValues
			);
		}
		selectFirstItem(items = this.props.items) {
			this.onPickerValueChanged(items[0].id);
		}
		getPickerValue(value = this.props.value) {
			return {
				[this.props.name]: this.getValueBasedOnMode(value)
			};
		}

		onContainerValueChanged(value, pickerValue) {
			this.props.valueChanged.apply(
				this,
				this._onContainerValueChanged.call(this, value, pickerValue)
			);
		}
		_shouldComponentUpdateComparer(x, y, a, b, key) {
			if (a == b) return true;
			if (key == "extra") {
				if (y.contentItems && y.contentItems.length)
					return _.isEqual(a[y.args.path], b[y.args.path]);

				return true;
			}
		}
		//potentially expensive.
		shouldComponentUpdate(nextProps, nextState) {
			if (
				(nextProps.args.path ||
					(!nextProps.args.path && !nextProps.contentItems.length)) &&
				_.isEqual(this.state.errors, nextState.errors) &&
				_.isEqualWith(
					this.props,
					nextProps,
					this._shouldComponentUpdateComparer.bind(
						this,
						this.props,
						nextProps
					)
				)
			) {
				return false;
			}

			return true;
		}
		_onContainerValueChanged(value, pickerValue) {
			pickerValue = pickerValue || this.getPickerValue();
			if (this.props.args.path) {
				let _p = [pickerValue];
				//push this to unset previous value
				if (!value) _p.push({ [this.props.args.path]: undefined });
				else _p.push(value);
				return _p;
			}

			let superCancel =
				this.state.containerValues &&
				Object.keys(this.state.containerValues).reduce((sum, x) => {
					return (sum[x] = undefined), sum;
				}, {});

			//path is not defined so unpack the properties and send.
			let result = [
				pickerValue,
				...Object.keys((value && value[noPath]) || {}).map(x => {
					return { [x]: value[noPath][x] };
				})
			];

			if (superCancel && Object.keys(superCancel).length > 0) {
				//insert this to remove previous values.
				result.splice(1, 0, superCancel);
			}
			setTimeout(() => {
				if (this._mounted) {
					this.setState({
						containerValues: (value && value[noPath]) || null
					});
				}
			});
			this.log(`container values changed ${JSON.stringify(result)}`);
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
		respondToPickerValueChanged(v) {
			this.onContainerValueChanged(null, this.getPickerValue(v));
		}
		onPickerValueChanged(v) {
			this.onContainerValueChanged(
				this.getCurrentContainerValue(),
				this.getPickerValue(v)
			);
		}
		getContainerValue() {
			return this.props.args.path
				? this.props.extra ? this.props.extra[this.props.args.path] : {}
				: this.props.extra;
		}
		isEmptyOrNull(v) {
			return !v || !v.length;
		}
		render() {
			this.log(`rendering called`);
			/*jshint ignore:start*/
			if (this.props.busy) {
				this.log(`${this.props.name} is busy`);
				return <ProgressBar onClick={this.props.retryFetch} />;
			}

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
							value={unwrapObjectValue(this.props.value)}
							valueChanged={this.respondToPickerValueChanged}
							currentProcess={this.props.currentProcess}
							currentStep={this.props.currentStep}
						/>
					}
					extraElements={
						<Container
							name={this.props.args.path || noPath}
							value={this.getContainerValue()}
							valueChanged={this.onContainerValueChanged}
							elements={this.props.contentItems}
							validator={this.state.containerValidator}
							navigation={this.props.navigation}
							currentProcess={this.props.currentProcess}
							currentStep={this.props.currentStep}
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
