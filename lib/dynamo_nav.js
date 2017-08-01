import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchDynamoProcess } from "./actions";

export default (Link, NavigationActions) => {
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
		}

		go() {
			switch (this.props.args.type) {
				case DynamoNav.NAV_TYPE.CLIENT:
					const { navigate } = this.props.navigation;
					return navigate(this.props.args.config.value);

				case DynamoNav.NAV_TYPE.DYNAMO:
					const setParamsAction = NavigationActions.setParams({
						params: { id: this.props.args.config.value },
						key: "Dynamo"
					});
					this.props.dispatch(setParamsAction);
			}
		}
		render() {
			return (
				/*jshint ignore:start */
				<Link text={this.props.args.text} go={() => this.go()} />
				/*jshint ignore:end */
			);
		}
	}
	DynamoNav.NAV_TYPE = { CLIENT: "CLIENT", DYNAMO: "DYNAMO" };
	return connect(null, mapDispatchToState)(DynamoNav);
};
