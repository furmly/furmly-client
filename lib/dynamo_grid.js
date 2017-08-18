import React, { Component } from "react";
import { connect } from "react-redux";
import {
	runDynamoProcessor,
	getMoreForGrid,
	filterGrid,
	getSingleItem,
	showMessage
} from "./actions";
//import { NavigationActions } from "react-navigation";

export const GRID_MODES = {
	CRUD: "CRUD"
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
	Container
) => {
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
			getSingleItem: id => dispatch(getSingleItem(id)),
			filterGrid: (id, args, key) => dispatch(filterGrid(id, args, key)),
			showMessage: message => dispatch(showMessage(message))
		};
	};
	const mapStateToProps = (_, initialProps) => state => {
		var result = state.dynamo[initialProps.component_uid];
		return {
			items: result && result.data ? result.data.items : null,
			total: result && result.data ? result.data.total : 0,
			busy: result && !!result.fetchingGrid,
			filter: result ? result.filter : null,
			singleItem: result ? result.singleItem : null,
			fetchingSingleItem: result && result.singleItem,
			commandProcessed:
				state.dynamo[
					initialProps.component_uid +
						DynamoGrid.commandResultViewName()
				],
			processed:
				state.dynamo[
					initialProps.component_uid + DynamoGrid.itemViewName()
				]
		};
	};
	class DynamoGrid extends Component {
		constructor(props) {
			super(props);
			this.state = { validator: {}, showItemView: false, count: 5 };
			this.showItemView = this.showItemView.bind(this);
			this.cancel = this.cancel.bind(this);
			this.showItemView = this.showItemView.bind(this);
			this.isCRUD = this.isCRUD.bind(this);
			this.valueChanged = this.valueChanged.bind(this);
			this.getItemsFromSource = this.getItemsFromSource.bind(this);
			this.done = this.done.bind(this);
			this._filterValidator = {};
			this.filter = this.filter.bind(this);
			this.more = this.more.bind(this);
			this.finished = this.finished.bind(this);
			this.openCommandMenu = this.openCommandMenu.bind(this);
			this.closeCommandView = this.closeCommandView.bind(this);
			this.execCommand = this.execCommand.bind(this);
			if (this.isCRUD()) {
				this.props.args.commands.unshift({
					commandText: "Edit",
					command: { value: "" },
					commandType: "$EDIT"
				});
			}
		}
		componentWillReceiveProps(next) {
			if (next.processed !== this.props.processed) {
				console.log("componentWillReceiveProps fired get items");
				this.getItemsFromSource(null, "filterGrid");
			}

			if (next.commandProcessed !== this.props.commandProcessed) {
				this.props.showMessage(next.commandProcessed.message);
			}

			if (next.singleItem && next.singleItem !== this.props.singleItem) {
				this.showItemView(ITEM_MODES.EDIT, next.singleItem);
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
					JSON.parse(this.props.args.gridArgs || {}),
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
							id = this.props.args.extra.editProcessor;
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
						{
							entityName: JSON.parse(
								this.props.args.gridArgs || {}
							).entityName,
							entity: this.state.form
						},
						this.props.component_uid + DynamoGrid.itemViewName()
					);
					this.setState({ showItemView: false });
				},
				() => {
					console.log("some modal fields are invalid");
				}
			);
		}
		showItemView(mode, args) {
			let template, existingValue;
			if (this.props.args.extra)
				switch (mode) {
					case ITEM_MODES.NEW:
						template = this.props.args.extra.createTemplate.slice();
						break;
					case ITEM_MODES.EDIT:
						template = this.props.args.extra.editTemplate.slice();
						if (this.props.args.extra.fetchSingleItemProcessor) {
							this.props.run();
						}
						existingValue = args;

						break;
				}

			if (!template || !Array.prototype.isPrototypeOf(template)) {
				return console.error(
					"showItemTemplate was called on a grid view in " +
						this.props.args.mode +
						" and it does not have a template. \n" +
						JSON.stringify(this.props, null, " ")
				);
			}

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
					console.log(
						"most recent id:" +
							query._id +
							" name:" +
							this.props.items[this.props.items.length - 1].name
					);
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
					this.props.go(command.config.value, {
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
							JSON.parse(this.props.args.gridArgs || {}),
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
		render() {
			let args = this.props.args,
				header = args.filter
					? <Header filter={() => this.filter()}>
							<Container
								elements={args.filter}
								value={this.state.filter}
								valueChanged={v => this.filterValueChanged(v)}
								name={DynamoGrid.filterViewName()}
								validator={this._filterValidator}
							/>
						</Header>
					: null,
				footer = !this.finished() ? <ProgressBar /> : null;
			return (
				<Layout>
					<List
						canAddOrEdit={this.isCRUD()}
						header={header}
						footer={footer}
						showItemView={(mode, args) =>
							this.showItemView(mode, args)}
						items={this.props.items}
						templateConfig={
							this.props.args.header
								? JSON.parse(this.props.args.header)
								: null
						}
						more={() => this.more()}
						commands={this.props.commands}
						execCommand={(command, item) =>
							this.execCommand(command, item)}
						openCommandMenu={item => this.openCommandMenu(item)}
					/>
					<ItemView
						visibility={
							args.mode == GRID_MODES.CRUD &&
							this.state.showItemView
						}
						done={submitted => this.done(submitted)}
						template={
							<Container
								elements={this.state.itemViewElements}
								value={this.state.existingValue}
								name={DynamoGrid.itemViewName()}
								validator={this.state.validator}
								valueChanged={v => this.valueChanged(v)}
							/>
						}
					/>
					<CommandsView
						visibility={this.state.showCommandsView}
						close={() => this.closeCommandView()}
						commands={this.props.args.commands}
						execCommand={command => this.execCommand(command)}
					/>
				</Layout>
			);
		}
	}

	return connect(mapStateToProps, mapDispatchToProps)(DynamoGrid);
};
