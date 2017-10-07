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
			this.state = { value: props.value };
			this.fetchItems = this.fetchItems.bind(this);
			this.onValueChanged = this.onValueChanged.bind(this);
			this.selectFirstItem = this.selectFirstItem.bind(this);
			this.props.validator.validate = () => {
				return this.runValidators();
			};
		}
		hasValue() {
			return !!this.state.value || "is required";
		}
		runValidators() {
			return new ValidationHelper(this).run();
		}
		onValueChanged(value) {
			this.props.valueChanged({ [this.props.name]: value });
			this.setState({ value });
		}
		fetchItems(source, args) {
			this.props.fetch(
				source,
				JSON.parse(args || this.props.args.config.customArgs || "{}"),
				this.props.component_uid || ""
			);
		}
		componentWillReceiveProps(next) {
			if (
				next.args.config.value !== this.props.args.config.value ||
				(next.args.config.customArgs !==
					this.props.args.config.customArgs &&
					!this.props.busy) ||
				next.component_uid !== this.props.component_uid
			) {
				//this.onValueChanged(null);
				this.fetchItems(
					next.args.config.value,
					next.args.config.customArgs
				);
			}

			if (next.items && next.items.length == 1) {
				this.selectFirstItem(next.items[0]._id);
			}
		}

		selectFirstItem(item) {
			setTimeout(() => {
				this.onValueChanged(item);
			}, 0);
		}
		componentDidMount() {
			if (!this.props.items) {
				this.fetchItems(this.props.args.config.value);
			}

			if (this.props.items && this.props.items.length == 1) {
				this.selectFirstItem(this.props.items[0]._id);
			}
		}
		isEmptyOrNull(v) {
			return !v || !v.length;
		}
		render() {
			/*jshint ignore:start*/

			if (this.isEmptyOrNull(this.props.items)) {
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
