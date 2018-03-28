import React, { Component } from "react";
import { connect } from "react-redux";
import invariants from "./utils/invariants";
export default (Page, Container) => {
	invariants.validComponent(Page, "Page");
	invariants.validComponent(Container, "Container");
	//map elements in DynamoView props to elements in store.
	const mapStateToProps = (_, initialProps) => (state, ownProps) => {
		//console.log("mapping state to props");
		let _state = state.dynamo[ownProps.currentProcess],
			description = _state && _state.description,
			map = {
				value: (_state && _state[ownProps.currentStep]) || null
			};

		if (description && description.steps[ownProps.currentStep]) {
			map.elements =
				description.steps[ownProps.currentStep].form.elements;
			if (description.steps[ownProps.currentStep].mode == "VIEW")
				map.hideSubmit = true;
			map.title = description.title;
		}
		return map;
	};

	class DynamoView extends Component {
		constructor(props) {
			super(props);
			this.onValueChanged = this.onValueChanged.bind(this);
			this.submit = this.submit.bind(this);
			//pass reference to validate func
			this.state = {
				form: this.props.value,
				validator: {}
			};
		}
		componentWillReceiveProps(next) {
			if (next.value !== this.props.value) {
				this.setState({ form: next.value });
			}
		}
		onValueChanged(form) {
			this.state.form = form.dynamo_view;
		}
		submit() {
			this.state.validator
				.validate()
				.then(
					() => {
						console.log(
							"currentStep:" + (this.props.currentStep || "0")
						);
						this.props.submit(this.state.form);
					},
					() => {
						console.warn("the form is invalid");
					}
				)
				.catch(er => {
					console.log("an error occurred while validating form ");
					console.error(er);
				});
		}
		render() {
			/*jshint ignore:start*/
			return (
				<Page submit={this.submit} hideSubmit={this.props.hideSubmit}>
					<Container
						label={this.props.title}
						elements={this.props.elements}
						name="dynamo_view"
						value={this.props.value}
						valueChanged={this.onValueChanged}
						validator={this.state.validator}
						navigation={this.props.navigation}
						currentStep={this.props.currentStep}
						currentProcess={this.props.currentProcess}
					/>
				</Page>
			);
			/*jshint ignore:end*/
		}
	}

	return connect(mapStateToProps)(DynamoView);
};
