import React, { Component } from "react";
import { connect } from "react-redux";
import invariants from "./utils/invariants";
export default (Page, Container) => {
	invariants.validComponent(Page, "Page");
	invariants.validComponent(Container, "Container");
	//map elements in DynamoView props to elements in store.
	const mapStateToProps = (_, initialProps) => state => {
		//console.log("mapping state to props");
		let description = state.dynamo.description,
			map = { value: state.dynamo.value };
		if (description) {
			let step = state.dynamo.currentStep || 0;
			map.elements = description.steps[step].form.elements;
			if (description.steps[step].mode == "VIEW") map.hideSubmit = true;
			map.title=description.title;
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
					/>
				</Page>
			);
			/*jshint ignore:end*/
		}
	}

	return connect(mapStateToProps)(DynamoView);
};
