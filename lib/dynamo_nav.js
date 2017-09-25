import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchDynamoProcess } from "./actions";
import invariants from "./utils/invariants";

export default (Link, NavigationActions) => {

	if (invariants.validComponent(Link, "Link") && !NavigationActions) throw new Error("NavigationActions cannot be null (dynamo_nav)");

	const mapDispatchToState = dispatch => {
		return {
			dispatch
		};
	};

	//{text:"link text",type:"DYNAMO or CLIENT",config:{value:""}}
	class DynamoNav extends Component {
		constructor(props) {
			super(props);
			this.go = this.go.bind(this);
			this.state = { link: this.props.value };
		}

		go() {
			let params = null;
			let link = this.state.link || (this.props.args.config && this.props.args.config.value);
			if (link) {
				if (link.indexOf("|") !== -1) {
					//parameters to pass on.
					let key_value = link.split("|");
					params = key_value.reduce((sum, x) => {
						let sp = x.split("=");
						return (sum[sp[0]] = sp[1]), sum;
					}, {});
				}
				switch (this.props.args.type) {
					case DynamoNav.NAV_TYPE.CLIENT:
						this.props.dispatch(
							NavigationActions.setParams({
								key: link,
								params
							})
						);
						break;

					case DynamoNav.NAV_TYPE.DYNAMO:
						const setParamsAction = NavigationActions.setParams({
							params: { id: link, fetchParams: params },
							key: "Dynamo"
						});
						this.props.dispatch(setParamsAction);
				}
			}
		}
		render() {
			return (
				/*jshint ignore:start */
				<Link text={this.props.args.text} go={this.go} />
				/*jshint ignore:end */
			);
		}
	}
	DynamoNav.NAV_TYPE = { CLIENT: "CLIENT", DYNAMO: "DYNAMO" };
	return connect(null, mapDispatchToState)(DynamoNav);
};
