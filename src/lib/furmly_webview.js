import React, { Component } from "react";
import { connect } from "react-redux";
import debug from "debug";
export default (WebView, Text) => {
	const log = debug("furmly-client-components:webview");
	return class FurmlyWebView extends Component {
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
