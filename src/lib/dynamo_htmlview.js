import React, { Component } from "react";

export default PlatformComponent => {
	return class DynamoHTMLViewer extends Component {
		constructor(props) {
			super(props);
		}
		render() {
			return (
				<PlatformComponent
					html={
						this.props.value ||
						(this.props.args && this.props.args.html) ||
						"<h3 style='padding:16px'>Something doesnt add up. Please contact system admin if this happens frequently.</h3>"
					}
					{...this.props}
				/>
			);
		}
	};
};
