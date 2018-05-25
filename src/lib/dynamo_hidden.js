import React from "react";
import { isObjectIdMode, getValueBasedOnMode } from "./utils/view";

export default class DynamoHidden extends React.Component {
	constructor(props) {
		super(props);
		this.init = this.init.bind(this);
	}
	componentDidMount() {
		this.init();
	}
	init(props = this.props) {
		if (
			props.args &&
			props.args.default &&
			props.args.default !== props.value &&
			!props.value
		)
			return this.props.valueChanged({
				[props.name]: getValueBasedOnMode(props, props.args.default)
			});

		if (isObjectIdMode(props) && this.props.value !== props.value) {
			this.props.valueChanged({
				[props.name]: getValueBasedOnMode(props, props.value)
			});
		}
	}
	componentWillReceiveProps(next) {
		this.init(next);
	}

	render() {
		return null;
	}
}
