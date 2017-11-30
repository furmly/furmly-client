import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchDynamoProcess, runDynamoProcess } from "./actions";
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
	const mapStateToProps = (_, initialProps) => state => {
		return {
			busy: state.dynamo.busy,
			description: state.dynamo.description,
			instanceId: state.dynamo.instanceId,
			message: state.dynamo.message,
			completed: state.dynamo.completed
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
				this.props.id !== this.props.description._id
			) {
				this.props.fetch(this.props.id, this.props.fetchParams);
			}
		}
		componentWillReceiveProps(next) {
			if (next.completed && next.completed != this.props.completed)
				return this.props.navigation.goBack();

			if (
				(next.id !== this.props.id ||
					next.fetchParams !== this.props.fetchParams) &&
				!this.props.busy
			)
				this.props.fetch(next.id, next.fetchParams);
		}
		submit(form) {
			this.props.runProcess({
				id: this.props.id,
				form,
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
			return <DynamoView submit={this.submit} />;
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
