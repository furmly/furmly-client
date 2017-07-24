import React, { Component } from "react";
import { connect } from "react-redux";
import { runDynamoProcessor } from "./actions";
export default (ProgressIndicator, Layout, Container) => {
	//map elements in DynamoView props to elements in store.
	const mapStateToProps = (_, initialProps) => state => {
		if (initialProps.args.type == "PROCESSOR") {
			return {
				items:
					state.dynamo[
						initialProps.args.config.value +
							(initialProps.uid || "")
					]
			};
		}
		//evaluate stuff in the parent container to retrieve the
	};

	const mapDispatchToProps = dispatch => {
		return {
			fetch: (id, params, key) => {
				dispatch(runDynamoProcessor(id, params, key));
			}
		};
	};

	class DynamoSelect extends Component {
		constructor(props) {
			super(props);
			this.onValueChanged = this.onValueChanged.bind(this);
		}
		onValueChanged(value) {
			this.props.valueChanged({ [this.props.name]: value });
		}
		componentDidMount() {
			if (!this.props.items || !this.props.items.length) {
				console.log(
					"\n-----\n" +
						JSON.stringify(this.props, null, " ") +
						"\n-----\n"
				);
				this.props.fetch(
					this.props.args.config.value,
					this.props.args.config.customArgs,
					this.props.uid
				);
			}
		}
		isEmptyOrNull(v) {
			return !v || !v.length;
		}
		render() {
			/*jshint ignore:start*/

			if (this.isEmptyOrNull(this.props.items)) {
				return <ProgressIndicator />;
			}
			return (
				<Layout
					value={this.props.label}
					inner={
						<Container
							items={this.props.items}
							displayProperty="displayLabel"
							keyProperty="_id"
							value={this.props.value}
							valueChanged={this.onValueChanged}
						/>
					}
				/>
			);
			/*jshint ignore:end*/
		}
	}

	return connect(mapStateToProps, mapDispatchToProps)(DynamoSelect);
};
