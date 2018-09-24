import React, { Component } from "react";
import withLogger from "./furmly_base";
export default PlatformComponent => {
  return withLogger(
    class FurmlyHTMLViewer extends Component {
      constructor(props) {
        super(props);
      }
      render() {
        return (
          <PlatformComponent
            html={
              this.props.value ||
              (this.props.args && this.props.args.html) ||
              "<h3 style='padding:16px'>Something doesn't add up. Please contact system admin if this happens frequently.</h3>"
            }
            {...this.props}
          />
        );
      }
    }
  );
};
