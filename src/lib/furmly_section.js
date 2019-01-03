import React, { PureComponent } from "react";
import invariants from "./utils/invariants";
import withLogger from "./furmly_base";
export default (Layout, Header, Container) => {
  invariants.validComponent(Layout, "Layout");
  invariants.validComponent(Header, "Header");
  invariants.validComponent(Container, "Container");
  class FurmlySection extends PureComponent {
    constructor(props) {
      super(props);
    }
    render() {
      this.props.log("render");
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
            />
          }
        />
      );
      /*jshint ignore:end*/
    }
  }

  return { getComponent: () => withLogger(FurmlySection), FurmlySection };
};
