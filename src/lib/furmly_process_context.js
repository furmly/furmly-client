import React from "react";

const ProcessContext = React.createContext({});
export const withProcessProvider = WrappedComponent => {
  class ProcessProvider extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
    }
    componentWillReceiveProps(next) {
      if (
        next.id !== this.props.id ||
        next.currentStep !== this.props.currentStep
      ) {
        this.setup(next);
      }
    }
    componentWillMount() {
      this.setup();
    }
    setup(props = this.props) {
      this.setState({
        currentProcess: props.id,
        currentStep: props.currentStep
      });
    }
    render() {
      return (
        <ProcessContext.Provider value={this.state}>
          <WrappedComponent {...this.props} />
        </ProcessContext.Provider>
      );
    }
  }
  return ProcessProvider;
};

export const withProcess = WrappedComponent => {
  class ProcessConsumer extends React.Component {
    render() {
      return (
        <ProcessContext.Consumer>
          {processContext => (
            <WrappedComponent
              {...this.props}
              currentProcess={processContext.currentStep}
              currentStep={processContext.currentProcess}
            />
          )}
        </ProcessContext.Consumer>
      );
    }
  }
  return ProcessConsumer;
};
