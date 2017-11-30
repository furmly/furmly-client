import React, { Component } from "react";
import { connect } from "react-redux";

export default (WebView, Text) => {
	return class DynamoWebView extends Component {
		constructor(props) {
			super(props);
		}
		render() {
			if (this.props.args &&  this.props.args.url) {
				return <WebView url={this.props.args.url} />;
			} else {
				return <Text>{"Missing url"}</Text>;
			}
		}
	};
};
