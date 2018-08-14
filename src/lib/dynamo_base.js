import React from "react";
export default class FurmlyComponentBase extends React.Component {
	constructor(props, log) {
		super(props);
		this.log = m => {
			log(`${m} for ${this.props.name}`);
		};
	}
	render() {
		return null;
	}
}
