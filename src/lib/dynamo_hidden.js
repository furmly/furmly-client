import React from "react";


export default class DynamoHidden extends React.Component {
	constructor(props) {
		super(props);
	}
	componentDidMount() {
		this.props.valueChanged(this.getValue(this.props));
	}

	getValue(props = this.props) {
		return {
			[props.name]: props.value || (props.args && props.args.default)
		};
	}
	componentWillReceiveProps(next) {
		if (next.value !== this.props.value) {
			props.valueChanged(this.getValue(next));
		}
	}
	render() {
		return null;
	}
}
