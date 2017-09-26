import React, { Component } from "react";
import { connect } from "react-redux";

export default (WebView, Text) => {
	return class DynamoWebView extends Component {
		constructor(props) {
			super(props);
		}
		render() {
			if (props.args.url) {
				return <WebView url={props.args.url} />;
			} else {
				return <Text>{"Missing url"}</Text>;
			}
		}
	};
};
