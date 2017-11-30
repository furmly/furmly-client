import React, { Component } from "react";
import { connect } from "react-redux";
import {
	runDynamoProcessor,
	getMoreForGrid,
	filterGrid,
	getSingleItemForGrid,
	getFilterTemplate,
	getItemTemplate,
	showMessage
} from "./actions";
import invariants from "./utils/invariants";

export const GRID_MODES = {
	CRUD: "CRUD",
	EDITONLY: "EDITONLY"
};
export const ITEM_MODES = {
	NEW: "NEW",
	EDIT: "EDIT"
};

export default (
	Layout,
	List,
	ItemView,
	Header,
	ProgressBar,
	CommandsView,
	NavigationActions,
	CommandResultView,
	Container
) => {
	if (
		invariants.validComponent(Layout, "Layout") &&
		invariants.validComponent(Header, "Header") &&
		invariants.validComponent(List, "List") &&
		invariants.validComponent(ItemView, "ItemView") &&
		invariants.validComponent(ProgressBar, "ProgressBar") &&
		invariants.validComponent(CommandsView, "CommandsView") &&
		invariants.validComponent(Container, "Container") &&
		invariants.validComponent(CommandResultView, "CommandResultView") &&
		!NavigationActions
	)
		throw new Error("NavigationActions cannot be null (dynamo_grid)");

	const mapDispatchToProps = dispatch => {
		return {
			run: (id, args, key) => dispatch(runDynamoProcessor(id, args, key)),
			more: (id, args, key) => dispatch(getMoreForGrid(id, args, key)),
			go: value =>
				dispatch(
					NavigationActions.setParams({
						params: { id: value },
						key: "Dynamo"
					})
				),
			getSingleItem: (id, args, key) =>
				dispatch(getSingleItemForGrid(id, args, key)),
			getItemTemplate: (id, args, key) =>
				dispatch(getItemTemplate(id, args, key)),
			getFilterTemplate: (id, args, key) =>
				dispatch(getFilterTemplate(id, args, key)),
			filterGrid: (id, args, key) => dispatch(filterGrid(id, args, key)),
			showMessage: message => dispatch(showMessage(message))
		};
	};
	const mapStateToProps = (_, initialProps) => (state, ownProps) => {
		var result = state.dynamo[ownProps.component_uid];
		return {
			items: result && result.data ? result.data.items : null,
			total: result && result.data ? result.data.total : 0,
			busy: result && !!result.fetchingGrid,
			filterTemplate:
				result &&
				(result.filterTemplate ||
					(initialProps.args && initialProps.args.filter) ||
					null),
			filter: result && result.filter,
			singleItem: result && result.singleItem,
			itemTemplate: result && result.itemTemplate,
			fetchingSingleItem: result && result.fetchingSingleItem,
			fetchingFilterTemplate: result && result.gettingFilterTemplate,
			fetchingItemTemplate: result && result.gettingItemTemplate,
			commandProcessed:
				state.dynamo[
					ownProps.component_uid + DynamoGrid.commandResultViewName()
				],
			commandProcessing:
				state.dynamo[
					ownProps.component_uid +
						DynamoGrid.commandResultViewName() +
						"-busy"
				],
			processed:
				state.dynamo[ownProps.component_uid + DynamoGrid.itemViewName()]
		};
	};
	class DynamoGrid extends Component {
		constructor(props) {
			super(props);
			this.state = {
				validator: {},
				showItemView: false,
				count: this.props.args.pageCount || 5,
				showCommandResult: false
			};
			this.showItemView = this.showItemView.bind(this);
			this.cancel = this.cancel.bind(this);
			this.showItemView = this.showItemView.bind(this);
			this.isCRUD = this.isCRUD.bind(this);
			this.isEDITONLY = this.isEDITONLY.bind(this);
			this.valueChanged = this.valueChanged.bind(this);
			this.getItemsFromSource = this.getItemsFromSource.bind(this);
			this.done = this.done.bind(this);
			this._filterValidator = {};
			this.filter = this.filter.bind(this);
			this.filterValueChanged = this.filterValueChanged.bind(this);
			this.more = this.more.bind(this);
			this.finished = this.finished.bind(this);
			this.openCommandMenu = this.openCommandMenu.bind(this);
			this.closeCommandView = this.closeCommandView.bind(this);
			this.execCommand = this.execCommand.bind(this);
			this.showCommandResult = this.showCommandResult.bind(this);
			this.closeCommandResult = this.closeCommandResult.bind(this);
			if (
				((this.isCRUD() || this.isEDITONLY()) &&
					!this.props.args.commands) ||
				(this.props.args.commands &&
					!this.props.args.commands.filter(
						x => x.commandType == "$EDIT"
					).length)
			) {
				let cmd = {
					commandText: "Edit",
					command: { value: "" },
					commandType: "$EDIT",
					commandIcon: "mode-edit"
				};
				if (!this.props.args.commands) this.props.args.commands = [];
				this.props.args.commands.unshift(cmd);
			}
		}
		componentDidMount() {
			if (
				this.props.args.filterProcessor &&
				!this.props.fetchingFilterTemplate
			) {
				this.props.getFilterTemplate(
					this.props.args.filterProcessor,
					JSON.parse(this.props.args.gridArgs || "{}"),
					this.props.component_uid
				);
			}
		}
		showCommandResult(props = this.props) {
			this.setState({
				showCommandsView: false,
				showCommandResultView: true,
				commandResult: props.commandProcessed
			});
		}
		closeCommandResult() {
			this.setState({
				showCommandResultView: false,
				result: null
			});
		}
		componentWillReceiveProps(next) {
			if (next.processed !== this.props.processed) {
				console.log("componentWillReceiveProps fired get items");
				this.getItemsFromSource(null, "filterGrid");
			}

			if (next.commandProcessed !== this.props.commandProcessed) {
				this.showCommandResult(next.commandProcessed);
			}

			if (next.singleItem && next.singleItem !== this.props.singleItem) {
				setTimeout(() => {
					this.showItemView(ITEM_MODES.EDIT, next.singleItem, true);
				}, 0);
			}

			if (
				next.itemTemplate &&
				next.itemTemplate !== this.props.itemTemplate
			) {
				setTimeout(() => {
					this.showItemView(
						this.state.mode,
						this.state.existingValue,
						true
					);
				}, 100);
			}
		}
		getItemsFromSource(
			filter = this.props.filter,
			methodName = "run",
			extra
		) {
			this.props[methodName](
				this.props.args.source,
				Object.assign(
					{},
					JSON.parse(this.props.args.gridArgs || "{}"),
					{ count: this.state.count, full: true },
					filter ? { query: filter } : {},
					extra || {}
				),
				this.props.component_uid
			);
		}

		filter() {
			this._filterValidator.validate().then(
				() => {
					this.getItemsFromSource(this.state.filter, "filterGrid");
				},
				() => {
					console.warn("a field in filter is invalid");
				}
			);
		}
		static itemViewName() {
			return "_itemView_";
		}
		static filterViewName() {
			return "_filterView_";
		}
		static commandResultViewName() {
			return "_commandResultView_";
		}
		valueChanged(value) {
			this.state.form = value ? value[DynamoGrid.itemViewName()] : null;
		}
		done(submitted) {
			if (!submitted)
				return this.setState({ showItemView: false, form: null });

			this.state.validator.validate().then(
				() => {
					let id;
					switch (this.state.mode) {
						case ITEM_MODES.NEW:
							id = this.props.args.extra.createProcessor;
							break;
						case ITEM_MODES.EDIT:
							id =
								this.props.args.extra.editProcessor ||
								this.props.args.extra.createProcessor;
							break;
					}
					if (!id) {
						return console.error(
							"done  was called on a grid view in " +
								this.props.args.mode +
								" and it does not have a processor for it. \n" +
								JSON.stringify(this.props, null, " ")
						);
					}

					this.props.run(
						id,
						Object.assign(
							JSON.parse(this.props.args.gridArgs || "{}"),
							{
								entity: this.state.form
							}
						),
						this.props.component_uid + DynamoGrid.itemViewName()
					);
					//this.setState({ showItemView: false });
					this.cancel();
				},
				() => {
					console.log("some modal fields are invalid");
				}
			);
		}
		showItemView(mode, args, skipFetch) {
			let template, existingValue;
			if (this.props.args.extra)
				switch (mode) {
					case ITEM_MODES.NEW:
						template = ((this.props.args.extra.createTemplate &&
							this.props.args.extra.createTemplate.length &&
							this.props.args.extra.createTemplate) ||
							this.props.itemTemplate ||
							[])
							.slice();
						break;
					case ITEM_MODES.EDIT:
						template = ((this.props.args.extra.editTemplate &&
							this.props.args.extra.editTemplate.length &&
							this.props.args.extra.editTemplate) ||
							(this.props.args.extra.createTemplate &&
								this.props.args.extra.createTemplate.length &&
								this.props.args.extra.createTemplate) ||
							this.props.itemTemplate ||
							[])
							.slice();
						existingValue = args;
						if (
							this.props.args.extra.fetchSingleItemProcessor &&
							!this.props.fetchingSingleItem &&
							!skipFetch
						) {
							template = [];
							existingValue = null;
							this.props.getSingleItem(
								this.props.args.extra.fetchSingleItemProcessor,
								args,
								this.props.component_uid
							);
						}

						break;
				}

			if (
				(!template || !Array.prototype.isPrototypeOf(template)) &&
				!this.props.args.extra.fetchTemplateProcessor
			) {
				return console.error(
					"showItemTemplate was called on a grid view in " +
						this.props.args.mode +
						" and it does not have a template. \n" +
						JSON.stringify(this.props, null, " ")
				);
			}
			if (
				(!template || !template.length) &&
				!this.props.fetchingItemTemplate &&
				this.props.args.extra.fetchTemplateProcessor &&
				!skipFetch
			)
				this.props.getItemTemplate(
					this.props.args.extra.fetchTemplateProcessor,
					args,
					this.props.component_uid
				);

			this.setState({
				showItemView: true,
				mode: mode,
				showCommandsView: false,
				itemViewElements: template,
				existingValue: existingValue
			});
		}
		more() {
			if (!this.finished() && !this.props.busy) {
				//console.log("more fired getItemsFromSource");
				let query = {
					count: this.state.count
				};
				if (
					this.props.items &&
					this.props.items[this.props.items.length - 1]
				) {
					query._id = this.props.items[
						this.props.items.length - 1
					]._id;
					console.log("most recent id:" + query._id);
				}

				this.getItemsFromSource(null, "more", query);
			}
		}
		finished() {
			return (
				this.props.items && this.props.total == this.props.items.length
			);
		}
		cancel() {
			this.setState({
				mode: null,
				showItemView: false,
				itemViewElements: null,
				showCommandsView: false,
				existingValue: null
			});
		}
		filterValueChanged(value) {
			this.state.filter = value
				? value[DynamoGrid.filterViewName()]
				: null;
		}
		closeCommandView() {
			this.setState({ showCommandsView: false });
		}
		openCommandMenu(item) {
			this.setState({ item: item, showCommandsView: true });
		}
		execCommand(command, item = this.state.item) {
			switch (command.commandType) {
				case "NAV":
					this.props.go(command.command.value, {
						fetchParams: { _id: item._id }
					});
					break;
				case "$EDIT":
					this.showItemView(ITEM_MODES.EDIT, item);
					break;
				case "PROCESSOR":
					this.props.run(
						command.command.value,
						Object.assign(
							{},
							JSON.parse(this.props.args.gridArgs || "{}"),
							item
						),
						this.props.component_uid +
							DynamoGrid.commandResultViewName()
					);
					break;
			}
		}
		isCRUD() {
			return this.props.args.mode == GRID_MODES.CRUD;
		}
		isEDITONLY() {
			return this.props.args.mode == GRID_MODES.EDITONLY;
		}
		render() {
			let args = this.props.args,
				header = this.props.filterTemplate ? (
					<Header filter={() => this.filter()}>
						<Container
							elements={this.props.filterTemplate}
							value={this.state.filter}
							valueChanged={this.filterValueChanged}
							name={DynamoGrid.filterViewName()}
							validator={this._filterValidator}
						/>
					</Header>
				) : this.props.fetchingFilterTemplate ? (
					<ProgressBar />
				) : null,
				footer =
					!this.finished() && this.props.busy ? (
						<ProgressBar />
					) : null;

			return (
				<Layout>
					<List
						title={this.props.label}
						canAddOrEdit={this.isCRUD()}
						header={header}
						footer={footer}
						total={this.props.total}
						showItemView={this.showItemView}
						items={this.props.items}
						templateConfig={
							this.props.args.templateConfig ? (
								JSON.parse(this.props.args.templateConfig)
							) : null
						}
						more={this.more}
						commands={this.props.args.commands}
						execCommand={this.execCommand}
						openCommandMenu={this.openCommandMenu}
					/>
					<ItemView
						visibility={
							(this.isCRUD() || this.isEDITONLY()) &&
							this.state.showItemView
						}
						done={this.done}
						busy={this.props.fetchingSingleItem}
						template={
							<Container
								elements={this.state.itemViewElements}
								value={this.state.existingValue}
								name={DynamoGrid.itemViewName()}
								validator={this.state.validator}
								valueChanged={this.valueChanged}
							/>
						}
					/>
					<CommandsView
						visibility={this.state.showCommandsView}
						close={this.closeCommandView}
						commands={this.props.args.commands}
						execCommand={this.execCommand}
					/>
					<CommandResultView
						visibility={this.state.showCommandResultView}
						done={this.closeCommandResult}
						template={
							<Container
								elements={this.state.commandResult}
								name={DynamoGrid.commandResultViewName()}
								validator={{}}
							/>
						}
						busy={this.props.commandProcessing}
					/>
				</Layout>
			);
		}
	}

	return connect(mapStateToProps, mapDispatchToProps)(DynamoGrid);
};
