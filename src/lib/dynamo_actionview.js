import React, { Component } from "react";
import { connect } from "react-redux";
import { runDynamoProcessor } from "./actions";
import invariants from "./utils/invariants";
import _ from "lodash";
import { getKey } from "./utils/view";

export default (
	Layout,
	ProgressBar,
	Filter,
	FilterContainer,
	ContentContainer
) => {
	invariants.validComponent(Filter, "Filter");
	invariants.validComponent(FilterContainer, "FilterContainer");
	invariants.validComponent(ContentContainer, "ContentContainer");
	invariants.validComponent(ProgressBar, "ProgressBar");
	invariants.validComponent(Layout, "Layout");

	const mapDispatchToProps = dispatch => {
		return {
			run: (id, args, key) =>
				dispatch(
					runDynamoProcessor(id, args, key, { disableCache: true })
				),
			showMessage: message => dispatch(showMessage(message))
		};
	};
	const mapStateToProps = (_, initialProps) => (state, ownProps) => {
		var component_uid = getKey(state, ownProps.component_uid, ownProps),
			_actionState = state.dynamo.view[component_uid];
		return {
			resultUI: _actionState && (_actionState.ui || _actionState),
			resultData: _actionState && _actionState.data,
			busy: !!state.dynamo.view[component_uid + "-busy"],
			component_uid
		};
	};
	const itemViewName = "_item_view";
	const contentViewName = "_content_view";
	class DynamoActionView extends Component {
		constructor(props) {
			super(props);
			this.state = { _filterValidator: {}, validator: {} };
			this.filter = this.filter.bind(this);
			this.valueChanged = this.valueChanged.bind(this);
		}
		componentWillReceiveProps(next) {
			if (!_.isEqual(next.resultData, this.props.resultData)) {
				this.resultValueChanged(next.resultData);
			}
		}
		filter() {
			this.state._filterValidator.validate().then(
				() => {
					this.props.run(
						this.props.args.action,
						this.props.value,
						this.props.component_uid
					);
				},
				() => {
					console.warn("a field in filter is invalid");
				}
			);
		}
		resultValueChanged(value) {
			this.valueChanged(this.props.value, value);
		}
		valueChanged(value, resultValue = this.props.resultData) {
			this.props.valueChanged({
				[this.props.name]: Object.assign(value || {}, resultValue || {})
			});
		}
		render() {
			if (this.props.busy) return <ProgressBar />;
			return (
				<Layout>
					<Filter
						actionLabel={this.props.args.commandText}
						filter={this.filter}
					>
						<FilterContainer
							elements={this.props.args.elements}
							value={
								this.props.value &&
								this.props.value[itemViewName]
							}
							name={itemViewName}
							validator={this.state._filterValidator}
							valueChanged={this.valueChanged}
							navigation={this.props.navigation}
							currentProcess={this.props.currentProcess}
							currentStep={this.props.currentStep}
						/>
					</Filter>
					<ContentContainer
						name={contentViewName}
						elements={this.props.resultUI}
						value={
							this.props.value &&
							this.props.value[contentViewName]
						}
						validator={this.state.validator}
						valueChanged={this.resultValueChanged}
						navigation={this.props.navigation}
						currentProcess={this.props.currentProcess}
						currentStep={this.props.currentStep}
					/>
				</Layout>
			);
		}
	}

	return connect(mapStateToProps, mapDispatchToProps)(DynamoActionView);
};
