import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchFurmlyProcess } from "./actions";
import invariants from "./utils/invariants";
import debug from "debug";
export default (Link, NavigationActions) => {
	if (invariants.validComponent(Link, "Link") && !NavigationActions)
		throw new Error("NavigationActions cannot be null (furmly_nav)");
	const log = debug("furmly-client-components:nav");
	const mapDispatchToState = dispatch => {
		return {
			dispatch
		};
	};

	const mapStateToProps = (_, initialProps) => state => {
		return {
			context:
				state &&
				state.furmly.view &&
				state.furmly.view.navigationContext
		};
	};

	//{text:"link text",type:"FURMLY or CLIENT",config:{value:""}}
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
					let paramsOnly = FurmlyNav.getParams(
						false,
						this.props.args.params
					);
					Object.assign(linkAndParams.params, paramsOnly.params);
				}

				link = linkAndParams.link;
				params = linkAndParams.params;
				switch (this.props.args.type) {
					case FurmlyNav.NAV_TYPE.CLIENT:
						//this.props.dispatch(
						NavigationActions.navigate(
							{
								key: link,
								params
							},
							this.props.context,
							this.props.navigation
						);
						//);
						break;

					case FurmlyNav.NAV_TYPE.FURMLY:
						//const setParamsAction =
						NavigationActions.setParams(
							{
								params: { id: link, fetchParams: params },
								key: "Furmly"
							},
							this.props.context,
							this.props.navigation
						);
					//this.props.dispatch(setParamsAction);
				}
			}
		}
		render() {
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
	return connect(mapStateToProps, mapDispatchToState)(FurmlyNav);
};
