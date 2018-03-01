import React, { Component } from "react";
import { connect } from "react-redux";
import { runDynamoProcessor } from "./actions";
import ValidationHelper, { VALIDATOR_TYPES } from "./utils/validator";
import invariants from "./utils/invariants";
export default (ProgressIndicator, Layout, Container) => {
	if (
		invariants.validComponent(ProgressIndicator, "ProgressIndicator") &&
		invariants.validComponent(Layout, "Layout") &&
		!Container
	)
		throw new Error("Container cannot be null (dynamo_select)");

	//map elements in DynamoView props to elements in store.
	const mapStateToProps = (_, initialProps) => (state, ownProps) => {
		if (ownProps.args.type == "PROCESSOR") {
			let st = state.dynamo[ownProps.component_uid];
			return {
				items: st,
				busy: !!state.dynamo[`${ownProps.component_uid}-busy`]
			};
		}
		//evaluate stuff in the parent container to retrieve the
	};

	const mapDispatchToProps = dispatch => {
		return {
			fetch: (id, params, key) => {
				dispatch(runDynamoProcessor(id, params, key));
			}
		};
	};

	class DynamoSelect extends Component {
		constructor(props) {
			super(props);

			this.fetchItems = this.fetchItems.bind(this);
			this.onValueChanged = this.onValueChanged.bind(this);
			this.selectFirstItem = this.selectFirstItem.bind(this);
			this.props.validator.validate = () => {
				return this.runValidators();
			};
			this.isValidValue = this.isValidValue.bind(this);
			this.state = {
				value:
					props.value && typeof props.value == "object"
						? props.value.$objectID
						: props.value || props.args.default
			};
			this.isObjectIdMode = this.isObjectIdMode.bind(this);
		}
		hasValue() {
			return !!this.state.value || "is required";
		}
		runValidators() {
			return new ValidationHelper(this).run();
		}
		onValueChanged(value) {
			if (this._mounted) {
				let obid = this.isObjectIdMode(),
					updateValue =
						(obid &&
							value &&
							typeof value == "object" &&
							value.$objectID) ||
						value;
				this.props.valueChanged({
					[this.props.name]:
						(obid &&
						typeof value !== "object" && {
							$objectID: value
						}) ||
						value
				});
				if (this.state.value !== updateValue) {
					console.log("onValueChanged value:" + updateValue);
					this.setState({
						value: updateValue
					});
				}
			}
		}
		fetchItems(source, args, component_uid) {
			if (this._mounted)
				this.props.fetch(
					source,
					JSON.parse(
						args || this.props.args.config.customArgs || "{}"
					),
					component_uid || this.props.component_uid || ""
				);
		}
		isValidValue(items = this.props.items, value = this.props.value) {
			return (
				items &&
				items.length &&
				items.filter(x => x._id == value).length
			);
		}

		componentWillReceiveProps(next) {
			if (
				next.args.config.value !== this.props.args.config.value ||
				(next.args.config.customArgs !==
					this.props.args.config.customArgs &&
					!this.props.busy) ||
				next.component_uid !== this.props.component_uid ||
				(next.args.config.value &&
					typeof next.items == "undefined" &&
					!next.busy)
			) {
				return this.fetchItems(
					next.args.config.value,
					next.args.config.customArgs,
					next.component_uid
				);
			}

			if (next.items && next.items.length == 1) {
				return this.selectFirstItem(next.items[0]._id);
			}

			if (
				(next.items &&
					next.value &&
					!this.isValidValue(next.items, next.value)) ||
				!next.items
			) {
				return this.onValueChanged(null);
			}

			if (
				(next.items &&
					next.value &&
					this.isValidValue(next.items, next.value)) ||
				(this.props.items &&
					this.isValidValue(this.props.items, next.value))
			) {
				return this.onValueChanged(next.value);
			}
		}

		selectFirstItem(item) {
			setTimeout(() => {
				this.onValueChanged(item);
			}, 0);
		}
		componentWillUnmount() {
			this._mounted = false;
		}
		isObjectIdMode() {
			return this.props.args && this.props.args.mode === "ObjectId";
		}
		componentDidMount() {
			this._mounted = true;
			if (!this.props.items) {
				console.log(
					"fetching items in componentDidMount for current:" +
						this.props.name
				);
				this.fetchItems(this.props.args.config.value);
			}

			if (this.props.items && this.props.items.length == 1) {
				return this.selectFirstItem(this.props.items[0]._id);
			}
			if (this.isObjectIdMode() && this.props.value)
				return setTimeout(() => {
					this.onValueChanged(this.props.value);
				});
		}
		isEmptyOrNull(v) {
			return !v || !v.length;
		}
		render() {
			/*jshint ignore:start*/

			if (this.isEmptyOrNull(this.props.items)) {
				//console.log("items is null or undefined");
				//console.log(this.props);
				return <ProgressIndicator />;
			}
			return (
				<Layout
					value={this.props.label}
					inner={
						<Container
							disabled={
								!!this.props.args.disabled ||
								(this.props.items &&
									this.props.items.length == 1)
							}
							errors={this.state.errors}
							label={this.props.label}
							items={this.props.items}
							displayProperty="displayLabel"
							keyProperty="_id"
							value={this.state.value}
							valueChanged={this.onValueChanged}
						/>
					}
				/>
			);
			/*jshint ignore:end*/
		}
	}

	return connect(mapStateToProps, mapDispatchToProps)(DynamoSelect);
};
