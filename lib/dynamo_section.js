import React, { Component } from "react";
export default (Layout, Header, Container) => {
	class DynamoSection extends Component {
		constructor(props) {
			super(props);
		}
		render() {
			/*jshint ignore:start*/
			//get the container for retrieving
			return (
				<Layout>
					<Header >{this.props.label}</Header>
					<Container
						elements={this.props.args.elements}
						name={this.props.name}
						value={this.props.value}
						valueChanged={this.props.valueChanged}
						validator={this.props.validator}
					/>
				</Layout>
			);
			/*jshint ignore:end*/
		}
	}

	return DynamoSection;
};
