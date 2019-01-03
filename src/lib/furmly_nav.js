import React, { Component } from "react";
import { connect } from "react-redux";
import invariants from "./utils/invariants";
import withLogger from "./furmly_base";
import { withNavigation } from "./furmly_navigation_context";
export default Link => {
  invariants.validComponent(Link, "Link");

  class FurmlyNav extends Component {
    constructor(props) {
      super(props);
      this.go = this.go.bind(this);
      this.state = { link: this.props.value };
    }
    static getParams(firstItemIsLink, link) {
      let key_value = link.split("|");
      if (firstItemIsLink) link = key_value.shift();
      let params = key_value.reduce((sum, x) => {
          let sp = x.split("=");
          return (sum[sp[0]] = decodeURIComponent(sp[1])), sum;
        }, {}),
        result = { params };
      if (firstItemIsLink || !key_value.length) result.link = link;
      return result;
    }
    go() {
      let params = null;
      let link =
        this.state.link ||
        (this.props.args.config && this.props.args.config.value);
      if (link) {
        let linkAndParams = FurmlyNav.getParams(true, link);
        if (this.props.args.params) {
          let paramsOnly = FurmlyNav.getParams(false, this.props.args.params);
          Object.assign(linkAndParams.params, paramsOnly.params);
        }

        link = linkAndParams.link;
        params = linkAndParams.params;
        switch (this.props.args.type) {
          case FurmlyNav.NAV_TYPE.CLIENT:
            this.props.furmlyNavigator.navigate({
              key: link,
              params
            });
            break;

          case FurmlyNav.NAV_TYPE.FURMLY:
            this.props.furmlyNavigator.setParams({
              params: { id: link, fetchParams: params },
              key: "Furmly"
            });
        }
      }
    }
    render() {
      this.props.log("render");
      return (
        /*jshint ignore:start */
        <Link
          text={this.props.args.text}
          disabled={this.props.args.disabled}
          go={this.go}
        />
        /*jshint ignore:end */
      );
    }
  }
  FurmlyNav.NAV_TYPE = { CLIENT: "CLIENT", FURMLY: "FURMLY" };

  return {
    getComponent: () => withNavigation(withLogger(FurmlyNav)),
    FurmlyNav,
    mapDispatchToState,
    mapStateToProps
  };
};
