import React, { Component } from "react";
import withLogger from "./furmly_base";
export default PlatformComponent => {
  class FurmlyHTMLViewer extends Component {
    constructor(props) {
      super(props);
    }
    render() {
      this.props.log("render");
      const { args, value } = this.props;
      return (
        <PlatformComponent
          html={
            value ||
            (args && args.html) ||
            "<h3 style='padding:16px'>Something doesn't add up. Please contact system admin if this happens frequently.</h3>"
          }
          {...this.props}
          printOnLoad={args && args.printOnLoad}
          canPrint={args && args.canPrint}
        />
      );
    }
  }
  return {
    getComponent: () => withLogger(FurmlyHTMLViewer),
    FurmlyHTMLViewer
  };
};
