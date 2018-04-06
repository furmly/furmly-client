import React, { Component } from "react";
import { connect } from "react-redux";
import invariants from "./utils/invariants";
import { valueChanged } from "./actions";
import debug from "debug";
export default (Page, Container) => {
	invariants.validComponent(Page, "Page");
	invariants.validComponent(Container, "Container");
	//map elements in DynamoView props to elements in store.
	const log = debug("dynamo-client-components:view");
	const mapStateToProps = (_, initialProps) => (state, ownProps) => {
		//log("mapping state to props");
		let _state = state.dynamo.view[ownProps.currentProcess],
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
	const mapDispatchToProps = dispatch => {
		return {
			valueChanged: args => dispatch(valueChanged(args))
		};
	};

	class DynamoView extends Component {
		constructor(props) {
			super(props);
			this.onValueChanged = this.onValueChanged.bind(this);
			this.submit = this.submit.bind(this);
			//pass reference to validate func
			this.state = {
				validator: {}
			};
		}

		onValueChanged(form) {
			//this.state.form = form.dynamo_view;
			this.props.valueChanged({
				form: form.dynamo_view,
				id: this.props.currentProcess,
				step: this.props.currentStep
			});
		}
		submit() {
			this.state.validator
				.validate()
				.then(
					() => {
						log(
							"currentStep:" + (this.props.currentStep || "0")
						);
						this.props.submit(this.props.value);
					},
					() => {
						log("the form is invalid");
					}
				)
				.catch(er => {
					log("an error occurred while validating form ");
					log(er);
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

	return connect(mapStateToProps, mapDispatchToProps)(DynamoView);
};
