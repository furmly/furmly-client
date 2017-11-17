import React, { Component } from "react";

export default PlatformComponent => {
	return class DynamoHTMLViewer extends Component {
		constructor(props) {
			super(props);
		}
		render() {
			return (
				<PlatformComponent
					html={this.props.value || this.props.args.html}
					{...this.props}
				/>
			);
		}
	};
};
