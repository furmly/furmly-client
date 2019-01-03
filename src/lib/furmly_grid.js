import React from "react";
import { connect } from "react-redux";
import {
  runFurmlyProcessor,
  getMoreForGrid,
  filterGrid,
  getSingleItemForGrid,
  getFilterTemplate,
  getItemTemplate,
  showMessage
} from "./actions";
import invariants from "./utils/invariants";
import { getKey, copy, getErrorKey } from "./utils/view";
import withLogger from "./furmly_base";
import { withNavigation } from "./furmly_navigation_context";

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
    !CommandResultView
  )
    throw new Error("CommandResultView cannot be null (furmly_grid)");

  const mapDispatchToProps = dispatch => {
    return {
      run: (id, args, key) =>
        dispatch(
          runFurmlyProcessor(id, args, key, {
            disableCache: true,
            disableRetry: true
          })
        ),
      more: (id, args, key) => dispatch(getMoreForGrid(id, args, key)),
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
    let component_uid = getKey(state, ownProps.component_uid, ownProps);
    var result = state.furmly.view[component_uid];
    return {
      component_uid,
      items: result && result.data ? result.data.items : null,
      total: result && result.data ? result.data.total : 0,
      busy: result && !!result.fetchingGrid,
      error: result && !!result.failedToFetchGrid,
      filterTemplate:
        (result && result.filterTemplate) ||
        (ownProps.args && ownProps.args.filter) ||
        null,
      filter: result && result.filter,
      singleItem: result && result.singleItem,
      itemTemplate: result && result.itemTemplate,
      fetchingSingleItem: result && result.fetchingSingleItem,
      fetchingFilterTemplate: result && result.gettingFilterTemplate,
      fetchingItemTemplate: result && result.gettingTemplate,
      itemTemplateError: result && result[getErrorKey("gettingTemplate")],
      filterTemplateError:
        result && result[getErrorKey("gettingFilterTemplate")],
      singleItemError: result && result[getErrorKey("fetchingSingleItem")],
      commandProcessed:
        state.furmly.view[component_uid + FurmlyGrid.commandResultViewName()],
      commandProcessing:
        state.furmly.view[
          component_uid + FurmlyGrid.commandResultViewName() + "-busy"
        ],
      processed: state.furmly.view[component_uid + FurmlyGrid.itemViewName()]
    };
  };
  class FurmlyGrid extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        form: null,
        selectedItems: {},
        validator: {},
        _filterValidator: {},
        showItemView: false,
        count: this.props.args.pageCount || 5,
        showCommandResultView: false
      };
      this.itemValueChanged = this.itemValueChanged.bind(this);
      this.showItemView = this.showItemView.bind(this);
      this.cancel = this.cancel.bind(this);
      this.showItemView = this.showItemView.bind(this);
      this.isCRUD = this.isCRUD.bind(this);
      this.isEDITONLY = this.isEDITONLY.bind(this);
      this.valueChanged = this.valueChanged.bind(this);
      this.getItemsFromSource = this.getItemsFromSource.bind(this);
      this.done = this.done.bind(this);
      this.filter = this.filter.bind(this);
      this.getFilterValue = this.getFilterValue.bind(this);
      this.getItemValue = this.getItemValue.bind(this);
      this.more = this.more.bind(this);
      this.finished = this.finished.bind(this);
      this.openCommandMenu = this.openCommandMenu.bind(this);
      this.closeCommandView = this.closeCommandView.bind(this);
      this.execCommand = this.execCommand.bind(this);
      this.showCommandResult = this.showCommandResult.bind(this);
      this.closeCommandResult = this.closeCommandResult.bind(this);
      this.selectItem = this.selectItem.bind(this);
      this.selectAllItems = this.selectAllItems.bind(this);
      this.unSelectItem = this.unSelectItem.bind(this);
      this.clearSelectedItems = this.clearSelectedItems.bind(this);
      this.fetchFilterTemplate = this.fetchFilterTemplate.bind(this);
      this.getCommands = this.getCommands.bind(this);
    }
    componentDidMount() {
      this._mounted = true;
      this.fetchFilterTemplate();
      this.setupEditCommand();
    }

    componentWillUnmount() {
      this._mounted = false;
    }

    fetchFilterTemplate(props = this.props, other) {
      if (
        !props.filterTemplateError &&
        props.args.filterProcessor &&
        !props.fetchingFilterTemplate &&
        !props.filterTemplate &&
        (!other || (other && props.filterTemplate !== other))
      ) {
        this.props.getFilterTemplate(
          props.args.filterProcessor,
          JSON.parse(props.args.gridArgs || "{}"),
          props.component_uid
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

    setupEditCommand(props = this.props) {
      if (
        (this.isCRUD(props) || this.isEDITONLY(props)) &&
        (!props.args.commands ||
          !props.args.commands.filter(x => this.isEditCommand(x)).length)
      ) {
        let cmd = {
          commandText: "Edit",
          command: { value: "" },
          commandType: "$EDIT",
          commandIcon: "mode-edit"
        };
        if (!props.args.commands) props.args.commands = [];
        props.args.commands.unshift(cmd);
      }
    }
    closeCommandResult() {
      this.setState({
        showCommandResultView: false,
        commandResult: null
      });
    }
    componentWillReceiveProps(next) {
      if (next.args !== this.props.args) {
        this.setupEditCommand(next);
      }
      // item view properties have changed.
      if (next.processed !== this.props.processed) {
        this.getItemsFromSource(null, "filterGrid");
      }

      // command view has been processed.
      if (next.commandProcessed !== this.props.commandProcessed) {
        this.showCommandResult(next);
      }

      // item has fetched data for editing and template has changed.
      // show item view for editing.
      if (
        next.singleItem &&
        next.singleItem !== this.props.singleItem &&
        (next.itemTemplate && next.itemTemplate !== this.props.itemTemplate)
      ) {
        return this.showItemView(
          ITEM_MODES.EDIT,
          next.singleItem,
          true,
          next.itemTemplate
        );
      }

      // item has fetched data for editing
      // and edit template is already available..
      if (
        next.singleItem &&
        next.singleItem !== this.props.singleItem &&
        !next.fetchingItemTemplate
      ) {
        return this.showItemView(ITEM_MODES.EDIT, next.singleItem, true);
      }

      // item template has been fetched successfully and data is already available.
      if (next.itemTemplate && next.itemTemplate !== this.props.itemTemplate) {
        return this.showItemView(
          this.state.mode,
          this.getItemValue() || this.props.singleItem,
          true,
          next.itemTemplate
        );
      }
      // fetch filter template if necessary.
      this.fetchFilterTemplate(next, this.props.filterTemplate);
    }
    isEditCommand(x) {
      return (
        x.commandType == "$EDIT" ||
        (x.commandText && x.commandText.toUpperCase() == "EDIT")
      );
    }

    getCommands() {
      if (!this.props.args.commands) return null;
      const commands = this.props.args.commands.slice();
      let index = 0;
      let editCommand;
      for (index; index < commands.length; index++) {
        if (this.isEditCommand(commands[index])) {
          editCommand = commands.splice(index, 1)[0];
          break;
        }
      }
      return [editCommand, ...commands];
    }
    getItemsFromSource(filter = getFilterValue(), methodName = "run", extra) {
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
    getItemValue() {
      return this.state.form;
    }
    getFilterValue() {
      return (
        (this.props.value && this.props.value[FurmlyGrid.filterViewName()]) ||
        null
      );
    }

    filter() {
      this.state._filterValidator.validate().then(
        () => {
          this.getItemsFromSource(this.getFilterValue(), "filterGrid");
        },
        () => {
          this.props.log("a field in filter is invalid");
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
      this.props.valueChanged({
        [this.props.name]: Object.assign(
          {},
          this.props.value || {},
          value || {}
        )
      });
    }
    done(submitted) {
      if (!submitted) return this.cancel();

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
            return (
              this.props.log(
                "done  was called on a grid view in " +
                  this.props.args.mode +
                  " and it does not have a processor for it. \n" +
                  JSON.stringify(this.props, null, " ")
              ),
              this.cancel()
            );
          }

          this.props.run(
            id,
            Object.assign(JSON.parse(this.props.args.gridArgs || "{}"), {
              entity: this.getItemValue()
            }),
            this.props.component_uid + FurmlyGrid.itemViewName()
          );

          this.cancel();
        },
        () => {
          this.props.log("some modal fields are invalid");
        }
      );
    }
    showItemView(mode, args, skipFetch, _itemTemplate) {
      let template = _itemTemplate,
        gettingItemTemplate = false,
        existingValue;
      if (this.props.args.extra)
        switch (mode) {
          case ITEM_MODES.NEW:
            template =
              _itemTemplate ||
              (
                (this.props.args.extra.createTemplate &&
                  this.props.args.extra.createTemplate.length &&
                  this.props.args.extra.createTemplate) ||
                this.props.itemTemplate ||
                []
              ).slice();
            break;
          case ITEM_MODES.EDIT:
            template =
              _itemTemplate ||
              (
                (this.props.args.extra.editTemplate &&
                  this.props.args.extra.editTemplate.length &&
                  this.props.args.extra.editTemplate) ||
                (this.props.args.extra.createTemplate &&
                  this.props.args.extra.createTemplate.length &&
                  this.props.args.extra.createTemplate) ||
                this.props.itemTemplate ||
                []
              ).slice();
            existingValue = args;
            if (
              this.props.args.extra.fetchSingleItemProcessor &&
              !this.props.fetchingSingleItem &&
              !this.props.singleItemError &&
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
        return this.props.log(
          "showItemTemplate was called on a grid view in " +
            this.props.args.mode +
            " and it does not have a template. \n" +
            JSON.stringify(this.props, null, " ")
        );
      }
      if (
        (!template || !template.length) &&
        !this.props.fetchingItemTemplate &&
        !this.props.itemTemplateError &&
        this.props.args.extra.fetchTemplateProcessor &&
        !skipFetch
      ) {
        gettingItemTemplate = true;
        this.props.getItemTemplate(
          this.props.args.extra.fetchTemplateProcessor,
          args,
          this.props.component_uid
        );
      }
      let update = {
        showItemView: true,
        showCommandsView: false,
        itemViewElements: template,
        mode
      };
      //  if (!gettingItemTemplate)
      update.form = existingValue ? copy(existingValue) : existingValue;
      this.setState(update);
    }

    more() {
      if (!this.finished() && !this.props.busy && !this.props.error) {
        //log("more fired getItemsFromSource");
        let query = {
          count: this.state.count
        };
        if (this.props.items && this.props.items[this.props.items.length - 1]) {
          query._id = this.props.items[this.props.items.length - 1]._id;
          this.props.log("most recent id:" + query._id);
        }

        this.getItemsFromSource(this.getFilterValue(), "more", query);
      }
    }
    finished() {
      return this.props.items && this.props.total == this.props.items.length;
    }
    cancel() {
      this.setState({
        mode: null,
        showItemView: false,
        itemViewElements: null,
        showCommandsView: false,
        form: null
      });
    }

    closeCommandView() {
      this.setState({ showCommandsView: false });
    }
    itemValueChanged(value) {
      this.setState({
        form: Object.assign(
          {},
          this.state.form || {},
          (value && value[FurmlyGrid.itemViewName()]) || {}
        )
      });
    }
    openCommandMenu(item) {
      if (!item) {
        let keys = Object.keys(this.state.selectedItems);
        if (keys.length == 0) {
          this.props.log("trying to open command menu with anything to act on");
          return;
        }
        item = this.state.selectedItems[keys[0]];
      }
      this.setState({ item, showCommandsView: true });
    }
    selectItem(item) {
      const selectedItems = Object.assign({}, this.state.selectedItems);
      selectedItems[item._id] = item;
      this.setState({
        selectedItems
      });
    }
    selectAllItems() {
      this.setState({
        selectedItems: this.props.items.reduce((sum, x) => {
          sum[x._id] = x;
          return sum;
        }, {})
      });
    }
    clearSelectedItems() {
      this.setState({
        selectedItems: {}
      });
    }
    unSelectItem(item) {
      const selectedItems = Object.assign({}, this.state.selectedItems);
      delete selectedItems[item._id];
      this.setState({
        selectedItems
      });
    }

    execCommand(command, item = this.state.item) {
      switch (command.commandType) {
        case "NAV":
          this.props.furmlyNavigator({
            params: {
              id: command.command.value,
              fetchParams: { _id: item._id }
            },
            key: "Furmly"
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
              Object.keys(this.state.selectedItems)
                .map(x => this.state.selectedItems[x])
                .concat(item)
            ),
            this.props.component_uid + FurmlyGrid.commandResultViewName()
          );
          break;
      }

      this.setState({ showCommandsView: false });
    }
    isCRUD(props = this.props) {
      return props.args.mode == GRID_MODES.CRUD;
    }
    isEDITONLY(props = this.props) {
      return props.args.mode == GRID_MODES.EDITONLY;
    }
    render() {
      this.props.log("rendering..");

      let header =
          this.props.filterTemplate && this.props.filterTemplate.length ? (
            <Header filter={() => this.filter()}>
              <Container
                elements={this.props.filterTemplate}
                value={this.getFilterValue()}
                valueChanged={this.valueChanged}
                name={FurmlyGrid.filterViewName()}
                validator={this.state._filterValidator}
              />
            </Header>
          ) : this.props.fetchingFilterTemplate ? (
            <ProgressBar />
          ) : null,
        footer = !this.finished() && this.props.busy ? <ProgressBar /> : null;

      return (
        <Layout
          list={
            <List
              key={"grid_list"}
              title={this.props.label}
              selectedItems={this.state.selectedItems}
              selectItem={this.selectItem}
              selectAllItems={this.selectAllItems}
              clearSelectedItems={this.clearSelectedItems}
              unSelectItem={this.unSelectItem}
              canAddOrEdit={this.isCRUD()}
              header={header}
              footer={footer}
              total={this.props.total}
              showItemView={this.showItemView}
              items={this.props.items}
              templateConfig={
                this.props.args.templateConfig
                  ? JSON.parse(this.props.args.templateConfig)
                  : null
              }
              more={this.more}
              autoFetch={!this.props.args.dontAutoFetchFromSource}
              getCommands={this.getCommands}
              execCommand={this.execCommand}
              openCommandMenu={this.openCommandMenu}
              busy={!this.finished() && this.props.busy}
            />
          }
          itemView={
            <ItemView
              key={"grid_item_view"}
              visibility={
                (this.isCRUD() || this.isEDITONLY()) && this.state.showItemView
              }
              done={this.done}
              busy={
                this.props.fetchingSingleItem || this.props.fetchingItemTemplate
              }
              template={
                <Container
                  elements={this.state.itemViewElements}
                  value={this.getItemValue()}
                  name={FurmlyGrid.itemViewName()}
                  validator={this.state.validator}
                  valueChanged={this.itemValueChanged}
                />
              }
            />
          }
          commandsView={
            <CommandsView
              key={"grid_commands_view"}
              visibility={this.state.showCommandsView}
              close={this.closeCommandView}
              commands={this.props.args.commands}
              execCommand={this.execCommand}
            />
          }
          commandResultView={
            <CommandResultView
              key={"grid_commands_result_view"}
              visibility={this.state.showCommandResultView}
              done={this.closeCommandResult}
              template={
                <Container
                  elements={this.state.commandResult}
                  name={FurmlyGrid.commandResultViewName()}
                  validator={{}}
                />
              }
              title={""}
              busy={this.props.commandProcessing}
            />
          }
        />
      );
    }
  }

  return {
    getComponent: () =>
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(withNavigation(withLogger(FurmlyGrid))),
    FurmlyGrid,
    mapStateToProps,
    mapDispatchToProps
  };
};
