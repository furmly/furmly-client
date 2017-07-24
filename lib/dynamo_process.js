import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchDynamoProcess, runDynamoProcess } from "./actions";

/**
 * Higher order function that recieves Platform specific implementation of Input
 * @param  {Function} Input Input class
 * @return {Function}       Wrapped class
 */
export default (ProgressBar, TextView, ComponentLocator) => {
	//map elements in DynamoInput props to elements in store.
	const mapStateToProps = (_, initialProps) => state => {
		return {
			busy: state.dynamo.busy,
			description: state.dynamo.description,
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
		}
		componentDidMount() {
			if (!this.props.description) {
				this.props.fetch(this.props.id, this.props.fetchParams);
			}
		}
		render() {
			console.log("rendering process...");
			/*jshint ignore:start */
			if (this.props.busy || typeof this.props.busy == "undefined") {
				return <ProgressBar title="Please wait..." />;
			}
			if (this.props.completed) {
				return <TextView text={this.props.message} />;
			}
			if (!this.props.description) {
				return (
					<TextView text="Sorry we couldnt load that process...please wait a few minutes and retry." />
				);
			}
			const DynamoView = ComponentLocator.VIEW;
			return (
				<DynamoView
					submit={form =>
						this.props.runProcess({ id: this.props.id, form })}
				/>
			);
			/*jshint ignore:end */
		}
	}
	DynamoProcess.propTypes = {
		id: React.PropTypes.string.isRequired,
		fetchParams: React.PropTypes.string,
		description: React.PropTypes.object
	};
	return connect(mapStateToProps, mapDispatchToProps)(DynamoProcess);
};
