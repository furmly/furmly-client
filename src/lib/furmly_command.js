import React, { Component } from "react";
import { connect } from "react-redux";
import { runFurmlyProcessor, furmlyDownloadUrl } from "./actions";
import invariants from "./utils/invariants";
import withLogger from "./furmly_base";
import debug from "debug";
export default (Link, customDownloadCommand) => {
  invariants.validComponent(Link, "Link");

  const mapDispatchToState = dispatch => {
    return {
      dispatch
    };
  };
  class FurmlyCommand extends Component {
    constructor(props) {
      super(props);
      this.go = this.go.bind(this);
      this.run = this.run.bind(this);
    }
    run() {
      this.props.dispatch(
        runFurmlyProcessor(
          this.props.args.commandProcessor,
          (this.props.args.commandProcessorArgs &&
            JSON.parse(this.props.args.commandProcessorArgs)) ||
            {},
          this.props.component_uid
        )
      );
    }
    go() {
      switch (this.props.args.commandType) {
        case FurmlyCommand.COMMAND_TYPE.DOWNLOAD:
          if (!this.props.args.commandProcessorArgs) {
            throw new Error("Download is not properly setup.");
          }
          let url;
          try {
            let config = JSON.parse(this.props.args.commandProcessorArgs);
            url = furmlyDownloadUrl.replace(":id", config.id);
            if (config.access_token) url += `?_t0=${config.access_token}`;
            if (config.isProcessor)
              url += `${url.indexOf("?") == -1 ? "?" : "&"}_t1=true`;
          } catch (e) {
            throw new Error("Download is not properly setup.");
          }
          this.props.dispatch(customDownloadCommand(this.props.args, url));
          break;
        default:
          this.run();
          break;
      }
    }
    render() {
      return (
        /*jshint ignore:start */
        <Link
          text={this.props.args.commandText}
          icon={this.props.args.commandIcon}
          go={this.go}
        />
        /*jshint ignore:end */
      );
    }
  }
  FurmlyCommand.COMMAND_TYPE = { DEFAULT: "DEFAULT", DOWNLOAD: "DOWNLOAD" };
  return connect(
    null,
    mapDispatchToState
  )(withLogger(FurmlyCommand));
};
