import React, { Component } from "react";
import { connect } from "react-redux";
import { runDynamoProcessor } from "./actions";
import invariants from "./utils/invariants";

export default (Layout, ProgressBar, FilterContainer, MainContainer) => {
	invariants.validComponent(FilterContainer, "FilterContainer");
	invariants.validComponent(MainContainer, "MainContainer");
	invariants.validComponent(ProgressBar, "ProgressBar");
	invariants.validComponent(Layout, "Layout");

	const mapDispatchToProps = dispatch => {
		return {
			run: (id, args, key) => dispatch(runDynamoProcessor(id, args, key)),
			showMessage: message => dispatch(showMessage(message))
		};
	};
	const mapStateToProps = (_, initialProps) => state => {
		var _actionState = state.dynamo[initialProps.component_uid];
		return {
			result: _actionState && _actionState.data,
			busy: _actionState && !!_actionState.busy
		};
	};
	class DynamoGrid extends Component {
		constructor(props) {
			super(props);
			this.state = { validator: {} };
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
        doNothing(){
        	
        }
		render() {
			if (this.props.busy) return <ProgressBar />;
			return (
				<Layout>
					<FilterContainer
						elements={this.props.args.elements}
						value={this.state.existingValue}
						name={DynamoGrid.itemViewName()}
						validator={this.state.validator}
						valueChanged={this.valueChanged}
					/>
					<MainContainer elements={this.props.result} valueChanged={this.noNothing} />
				</Layout>
			);
		}
	}

	return connect(mapStateToProps, mapDispatchToProps)(DynamoGrid);
};
