import React from "react";
import debug from "debug";
import hoistNonReactStatic from "hoist-non-react-statics";

export default WrappedComponent => {
  class HOCComponent extends React.Component {
    constructor(props) {
      super(props);
      this.log = this.log.bind(this);
    }
    componentDidMount() {
      this.logger = debug(`furmly-client:${this._constructor.name}`);
      this.props.log("componentDidMount");
    }
    componentWillUnmount() {
      this.props.log("componentWillUnmount");
      this.logger = null;
    }
    log(m) {
      this.logger(`${m}:::${this.props.name}`);
    }
    render() {
      this.props.log("render");
      return <WrappedComponent {...this.props} log={this.log} />;
    }
  }
  hoistNonReactStatic(HOCComponent, WrappedComponent);
  return HOCComponent;
};
