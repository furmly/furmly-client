import React, { PureComponent } from "react";

export default (WebView, Text) => {
  return class FurmlyWebView extends PureComponent {
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
  };
};
