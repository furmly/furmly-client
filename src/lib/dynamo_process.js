import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchDynamoProcess, runDynamoProcess } from "./actions";
import _ from "lodash";
import invariants from "./utils/invariants";

/**
 * Higher order function that recieves Platform specific implementation of Input
 * @param  {Function} Input Input class
 * @return {Function}       Wrapped class
 */
export default (ProgressBar, TextView, DynamoView) => {
	invariants.validComponent(ProgressBar, "ProgressBar");
	invariants.validComponent(TextView, "TextView");
	invariants.validComponent(DynamoView, "DynamoView");

	//map elements in DynamoInput props to elements in store.
	const mapStateToProps = (_, initialProps) => (state, ownProps) => {
		let _state = state.dynamo.view[`${ownProps.id}`];
		return {
			busy: !!state.dynamo.view[`${ownProps.id}-busy`],
			description: _state && _state.description,
			instanceId: _state && _state.instanceId,
			message: state.dynamo.view.message,
			completed: _state && _state.completed
		};
	};

	const mapDispatchToProps = dispatch => {
		return {
			fetch: (id, params) => {
				dispatch(fetchDynamoProcess(id, params));
			},
			runProcess: info => {
				dispatch(runDynamoProcess(info));
			}
		};
	};

	class DynamoProcess extends Component {
		constructor(props) {
			super(props);
			this.submit = this.submit.bind(this);
		}
		componentDidMount() {
			if (
				!this.props.description ||
				(this.props.id !== this.props.description._id &&
					this.props.id !== this.props.description.uid)
			) {
				this.props.fetch(this.props.id, this.props.fetchParams);
			}
		}
		componentWillReceiveProps(next) {
			if (next.completed && next.completed != this.props.completed)
				return this.props.navigation.goBack();

			if (
				((next.id !== this.props.id ||
					!_.isEqual(next.fetchParams, this.props.fetchParams)) &&
					!next.busy &&
					!next.description) ||
				(next.id == this.props.id &&
					!_.isEqual(next.fetchParams, this.props.fetchParams) &&
					!next.busy)
			)
				this.props.fetch(next.id, next.fetchParams);
		}
		submit(form) {
			this.props.runProcess({
				id: this.props.id,
				form,
				currentStep: this.props.currentStep,
				instanceId: this.props.instanceId
			});
		}
		render() {
			/*jshint ignore:start */
			if (this.props.busy || typeof this.props.busy == "undefined") {
				return <ProgressBar title="Please wait..." />;
			}
			if (!this.props.description) {
				return (
					<TextView text="Sorry we couldnt load that process...please wait a few minutes and retry." />
				);
			}
			return (
				<DynamoView
					currentStep={this.props.currentStep || 0}
					currentProcess={this.props.id}
					navigation={this.props.navigation}
					submit={this.submit}
				/>
			);
			/*jshint ignore:end */
		}
	}
	// DynamoProcess.propTypes = {
	// 	id: React.PropTypes.string.isRequired,
	// 	fetchParams: React.PropTypes.object,
	// 	description: React.PropTypes.object
	// };
	return connect(mapStateToProps, mapDispatchToProps)(DynamoProcess);
};
