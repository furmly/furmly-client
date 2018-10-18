import React, { PureComponent } from "react";
import invariants from "./utils/invariants";

export default (WebView, Text) => {
  invariants.validComponent(WebView, "WebView");
  invariants.validComponent(Text, "Text");
  class FurmlyWebView extends PureComponent {
    constructor(props) {
      super(props);
    }
    render() {
      if (this.props.args && this.props.args.url) {
        return <WebView url={this.props.args.url} />;
      } else {
        return <Text>{"Missing url"}</Text>;
      }
    }
  }
  return { getComponent: () => FurmlyWebView, FurmlyWebView };
};
