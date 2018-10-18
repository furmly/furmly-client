import React from "react";
import debug from "debug";
import hoistNonReactStatic from "hoist-non-react-statics";

export default WrappedComponent => {
  class HOCComponent extends React.Component {
    constructor(props) {
      super(props);
      this.log = this.log.bind(this);
    }
    componentWillMount() {
      this.logger = debug(`furmly-client:${WrappedComponent.name}`);
      this.log("componentDidMount");
    }
    componentWillUnmount() {
      this.log("componentWillUnmount");
      this.logger = null;
    }
    log(m) {
      this.logger(`${m}:::${this.props.name || this.props.id || ""}`);
    }
    render() {
      return <WrappedComponent {...this.props} log={this.log} />;
    }
  }
  hoistNonReactStatic(HOCComponent, WrappedComponent);
  return HOCComponent;
};
