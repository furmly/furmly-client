import React, { Component } from "react";
import { connect } from "react-redux";
import { runDynamoProcessor, dynamoDownloadUrl } from "./actions";
import invariants from "./utils/invariants";

export default (Link, customDownloadCommand) => {
	invariants.validComponent(Link, "Link");

	const mapDispatchToState = dispatch => {
		return {
			dispatch
		};
	};
	class DynamoCommand extends Component {
		constructor(props) {
			super(props);
			this.go = this.go.bind(this);
			this.run = this.run.bind(this);
		}
		run() {
			this.props.dispatch(
				runDynamoProcessor(
					this.props.args.commmandProcessor,
					JSON.parse(this.props.args.commandProcessorArgs || {}),
					this.props.component_uid
				)
			);
		}
		go() {
			switch (this.props.args.type) {
				case DynamoCommand.COMMAND_TYPE.DOWNLOAD:
					if (!this.props.args.commandProcessorArgs) {
						throw new Error("Download is not properly setup.");
					}
					let url;
					try {
						url = dynamoDownloadUrl.replace(
							":id",
							JSON.parse(this.props.args.commandProcessorArgs).id
						);
					} catch (e) {
						throw new Error("Download is not properly setup.");
					}
					customDownloadCommand(this.props.args, url);
					break;
				default:
					run();
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
	DynamoCommand.COMMAND_TYPE = { DEFAULT: "DEFAULT", DOWNLOAD: "DOWNLOAD" };
	return connect(null, mapDispatchToState)(DynamoCommand);
};
