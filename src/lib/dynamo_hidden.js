import React from "react";

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
			this.props.valueChanged(props.args.default);
	}
	componentWillReceiveProps(next) {
		this.init(next);
	}
	render() {
		return null;
	}
}
