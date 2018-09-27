import React, { Component } from "react";
import invariants from "./utils/invariants";
import withLogger from "./furmly_base";
export default (Layout, Header, Container) => {
  invariants.validComponent(Layout, "Layout");
  invariants.validComponent(Header, "Header");
  invariants.validComponent(Container, "Container");
  class FurmlySection extends Component {
    constructor(props) {
      super(props);
    }
    render() {
      /*jshint ignore:start*/
      //get the container for retrieving
      return (
        <Layout
          header={
            <Header description={this.props.description}>
              {this.props.label}
            </Header>
          }
          content={
            <Container
              elements={this.props.args.elements}
              name={this.props.name}
              value={this.props.value}
              valueChanged={this.props.valueChanged}
              validator={this.props.validator}
              navigation={this.props.navigation}
              currentProcess={this.props.currentProcess}
              currentStep={this.props.currentStep}
            />
          }
        />
      );
      /*jshint ignore:end*/
    }
  }

  return { getComponent: () => withLogger(FurmlySection), FurmlySection };
};
