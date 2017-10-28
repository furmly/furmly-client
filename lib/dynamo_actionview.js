import React, { Component } from "react";
import { connect } from "react-redux";
import { runDynamoProcessorAndParseUI } from "./actions";
import invariants from "./utils/invariants";

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
				dispatch(runDynamoProcessorAndParseUI(id, args, key)),
			showMessage: message => dispatch(showMessage(message))
		};
	};
	const mapStateToProps = (_, initialProps) => state => {
		var _actionState = state.dynamo[initialProps.component_uid];
		return {
			resultUI: _actionState && (_actionState.ui || _actionState),
			resultData: _actionState && _actionState.data,
			busy: !!state.dynamo[initialProps.component_uid + "-busy"]
		};
	};
	class DynamoActionView extends Component {
		constructor(props) {
			super(props);
			this.state = {};
			this._filterValidator = {};
			this.filter = this.filter.bind(this);
			this.valueChanged = this.valueChanged.bind(this);
		}

		filter() {
			this._filterValidator.validate().then(
				() => {
					this.props.run(
						this.props.args.action,
						this.state.form,
						this.props.component_uid
					);
				},
				() => {
					console.warn("a field in filter is invalid");
				}
			);
		}
		static itemViewName() {
			return "_itemView_";
		}
		valueChanged(value) {
			this.state.form = value
				? value[DynamoActionView.itemViewName()]
				: null;
		}
		doNothing() {}
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
							value={this.state.existingValue}
							name={DynamoActionView.itemViewName()}
							validator={this._filterValidator}
							valueChanged={this.valueChanged}
						/>
					</Filter>
					<ContentContainer
						elements={this.props.resultUI}
						value={this.props.resultData}
						validator={{}}
						valueChanged={this.doNothing}
					/>
				</Layout>
			);
		}
	}

	return connect(mapStateToProps, mapDispatchToProps)(DynamoActionView);
};
