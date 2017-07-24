import React, { Component } from "react";
import { connect } from "react-redux";
import { valueChanged } from "./actions";
export default (Page, Container) => {
	//map elements in DynamoView props to elements in store.
	const mapStateToProps = (_, initialProps) => state => {
		console.log("mapping state to props");
		let description = state.dynamo.description,
			map = { value: state.dynamo.value };
		if (description) {
			map.elements =
				description.steps[state.dynamo.currentStep || 0].form.elements;
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
		onValueChanged(form) {
			this.state.form = form.dynamo_view;
		}
		submit() {
			this.state.validator
				.validate()
				.then(
					() => {
						this.props.submit(this.state.form);
					},
					() => {
						console.log("the form is invalid");
					}
				)
				.catch(er => {
					console.log("an error occurred while validating form");
				});
		}
		render() {
			/*jshint ignore:start*/
			let validator = {
				validate: this.validate
			};
			return (
				<Page submit={this.submit}>
					<Container
						elements={this.props.elements}
						name="dynamo_view"
						value={this.props.value}
						valueChanged={this.onValueChanged}
						validator={this.state.validator}
					/>
				</Page>
			);
			/*jshint ignore:end*/
		}
	}

	return connect(mapStateToProps)(DynamoView);
};
