import React, { Component } from "react";
import invariants from "./utils/invariants";
import debug from "debug";
export default (Layout, Header, Container) => {
	invariants.validComponent(Layout, "Layout");
	invariants.validComponent(Header, "Header");
	invariants.validComponent(Container, "Container");
	const log = debug("furmly-client-components:session");
	class FurmlySection extends Component {
		constructor(props) {
			super(props);
		}
		render() {
			/*jshint ignore:start*/
			//get the container for retrieving
			return (
				<Layout>
					<Header description={this.props.description}>
						{this.props.label}
					</Header>
					<Container
						elements={this.props.args.elements}
						name={this.props.name}
						value={this.props.value}
						valueChanged={this.props.valueChanged}
						validator={this.props.validator}
						navigation={this.props.navigation}
						currentProcess={this.props.currentProcess}
						currentStep={this.props.currentStep}
					/>
				</Layout>
			);
			/*jshint ignore:end*/
		}
	}

	return FurmlySection;
};
