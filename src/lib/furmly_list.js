import React, { Component } from "react";
import { connect } from "react-redux";
import ValidatorHelper from "./utils/validator";
import invariants from "./utils/invariants";
import _ from "lodash";
import {
  runFurmlyProcessor,
  openConfirmation,
  clearElementData
} from "./actions";
import { getKey, copy, isArr } from "./utils/view";
import withLogger from "./furmly_base";
import { withTemplateCache } from "./furmly_template_cache_context";
import { withProcess } from "./furmly_process_context";

export default (
  Layout,
  Button,
  List,
  Modal,
  ErrorText,
  ProgressBar,
  Container
) => {
  invariants.validComponent(Layout, "Layout");
  invariants.validComponent(Button, "Button");
  invariants.validComponent(List, "List");
  invariants.validComponent(Modal, "Modal");
  invariants.validComponent(ErrorText, "ErrorText");
  invariants.validComponent(Container, "Container");

  const EDIT = "EDIT",
    NEW = "NEW";
  const mapStateToProps = (_, initialProps) => (state, ownProps) => {
    let component_uid = getKey(state, ownProps.component_uid, ownProps);

    return {
      confirmation:
        state.app &&
        state.app.confirmationResult &&
        state.app.confirmationResult[component_uid],
      dataTemplate: state.furmly.view[component_uid],
      component_uid,
      busy: state.furmly.view[`${component_uid}-busy`],
      items: ownProps.value
    };
  };
  const equivalent = function(arr, arr2) {
    if ((!arr && !arr2) || (arr && arr.length == 0 && arr2 && arr2.length == 0))
      return true;

    if ((arr && !arr2) || (arr2 && !arr) || arr.length !== arr2.length)
      return false;

    return _.isEqualWith(arr, arr2, (objValue, otherValue) => {
      if (objValue === arr || otherValue === arr2) return;
      if (typeof otherValue == "string") {
        return !!_.findKey(objValue, function(v) {
          return v == otherValue;
        });
      }
      let r = _.isMatch(objValue, otherValue);
      return r;
    });
  };
  const mapDispatchToProps = dispatch => {
    return {
      getListItemDataTemplate: (id, args, key) =>
        dispatch(runFurmlyProcessor(id, args, key)),
      openConfirmation: (id, message, params) =>
        dispatch(openConfirmation(id, message, params)),
      clearElementData: key => dispatch(clearElementData(key))
    };
  };

  class FurmlyList extends Component {
    constructor(props) {
      super(props);
      this.state = {
        validator: {},
        modalVisible: false
      };
      this.showModal = this.showModal.bind(this);
      this.closeModal = this.closeModal.bind(this);
      this.valueChanged = this.valueChanged.bind(this);
      this.getItemTemplate = this.getItemTemplate.bind(this);
      this.edit = this.edit.bind(this);
      this.runValidators = this.runValidators.bind(this);
      this.isDisabled = this.isDisabled.bind(this);
      this.displayValueChanged = this.displayValueChanged.bind(this);
      this.getListItemDataTemplate = this.getListItemDataTemplate.bind(this);
      this.props.validator.validate = () => {
        return this.runValidators();
      };
      this.remove = this.remove.bind(this);
    }

    componentWillReceiveProps(next) {
      if (
        next.confirmation !== this.props.confirmation &&
        next.confirmation &&
        next.confirmation.params &&
        typeof next.confirmation.params.index !== "undefined" &&
        this.props.items &&
        this.props.items.length
      ) {
        let items = (this.props.items || []).slice();
        return (
          items.splice(next.confirmation.params.index, 1),
          this.props.valueChanged({
            [this.props.name]: items
          })
        );
      }
      if (this.props.component_uid !== next.component_uid) {
        if (this._mounted) {
          this.getItemTemplate();
          if (
            (!next.dataTemplate || next.dataTemplate.length) &&
            !next.items &&
            next.args &&
            next.args.default &&
            next.args.default.length
          ) {
            this.props.valueChanged({
              [this.props.name]: next.args.default.slice()
            });
          }
          this.setState({
            edit: null,
            modalVisible: false
          });
        }
      }
      if (
        next.args.listItemDataTemplateProcessor &&
        next.items &&
        next.items.length &&
        next.items !== next.dataTemplate &&
        next.dataTemplate == this.props.dataTemplate &&
        !next.busy
      ) {
        this.getListItemDataTemplate(next.items, next);
      }

      if (
        next.dataTemplate &&
        next.dataTemplate !== this.props.dataTemplate &&
        !next.busy
      ) {
        if (this._mounted) {
          this.props.valueChanged({
            [this.props.name]: next.dataTemplate
          });
          return;
        }
      }
    }
    componentWillUnmount() {
      this._mounted = false;
      //need to cleanup the namespace.
      this.props.clearElementData(this.props.component_uid);
    }

    componentDidMount() {
      this._mounted = true;
      //if its template is a reference then store it.
      const ref = this.isTag();
      if (ref && !this.props.templateCache.get(ref)) {
        this.props.templateCache.add(
          ref,
          Array.prototype.isPrototypeOf(this.props.args.itemTemplate)
            ? this.props.args.itemTemplate
            : this.props.args.itemTemplate.template
        );
      }

      let equal = equivalent(this.props.dataTemplate, this.props.items);
      //if theres a data template processor then run it.
      if (
        this.props.args.listItemDataTemplateProcessor &&
        this.props.items &&
        this.props.items.length &&
        !equal
      ) {
        this.getListItemDataTemplate(this.props.items);
      }

      if (this.props.dataTemplate && this.props.dataTemplate.length && equal) {
        setTimeout(() => {
          this.props.valueChanged({
            [this.props.name]: this.props.dataTemplate
          });
        }, 0);
      }

      if (
        (!this.props.dataTemplate || !this.props.dataTemplate.length) &&
        !this.props.items &&
        this.props.args &&
        this.props.args.default &&
        this.props.args.default.length
      ) {
        setTimeout(() => {
          this.props.valueChanged({
            [this.props.name]: this.props.args.default.slice()
          });
        });
      }

      this.getItemTemplate();
    }

    getListItemDataTemplate(i, props = this.props) {
      this.props.getListItemDataTemplate(
        props.args.listItemDataTemplateProcessor,
        i,
        props.component_uid
      );
    }
    isTag() {
      const { itemTemplate, behavior } = this.props.args;
      return (
        itemTemplate &&
        ((!isArr(itemTemplate) &&
          itemTemplate.template &&
          itemTemplate.furmly_ref) ||
          (isArr(itemTemplate) && behavior && behavior.furmly_ref))
      );
    }
    isTemplateRef() {
      const { itemTemplate, behavior } = this.props.args;
      return (
        (itemTemplate && itemTemplate.template_ref) ||
        (behavior && behavior.template_ref)
      );
    }
    runValidators() {
      return new ValidatorHelper(this).run();
    }
    isDisabled() {
      return this.props.args && this.props.args.disabled;
    }
    showModal() {
      if (!this.isDisabled()) this.setState({ modalVisible: true, mode: NEW });
    }
    hasValue() {
      return (
        (this.props.items && this.props.items.length) ||
        "Requires atleast one item to have been added to the list"
      );
    }
    isLessThanMaxLength(element) {
      const { items } = this.props;
      return (
        (items && items.length && items.length <= element.args.max) ||
        (element.error || "The maximum number of items is " + element.args.max)
      );
    }
    isGreaterThanMinLength(element) {
      const { items } = this.props;
      return (
        (items && items.length && items.length >= element.args.min) ||
        (element.error || "The minimum number of items is " + element.args.min)
      );
    }
    closeModal(result) {
      //he/she clicked ok
      if (result) {
        this.state.validator
          .validate()
          .then(() => {
            let items = (this.props.items || []).slice();

            if (this.state.mode == NEW) {
              items.push(this.state.edit);
            } else {
              items.splice(this.state.existing, 1, this.state.edit);
            }
            this.props.valueChanged({ [this.props.name]: items });
            this.setState({
              modalVisible: false,
              edit: null,
              existing: null
            });
          })
          .catch(er => {
            this.props.log(er);
          });
        return;
      }
      //canceled the modal box.

      this.setState({ modalVisible: false, edit: null });
    }
    valueChanged(v) {
      this.setState({ edit: v && v[FurmlyList.modalName()] });
    }
    displayValueChanged(v) {
      const value = v && v[FurmlyList.modalName()];
      if (value) {
        const { edit } = this.state;
        let ex = { ...edit };
        Object.keys(value).forEach(x => {
          Object.defineProperty(ex, x + "_display", {
            value: value[x],
            enumerable: false
          });
        });
        this.setState({ edit: ex });
      }
    }
    remove(index) {
      this.props.openConfirmation(
        this.props.component_uid,
        "Are you sure you want to remove that item ?",
        { index }
      );
    }
    edit(index) {
      this.setState({
        edit: copy(this.props.items[index]),
        existing: index,
        mode: EDIT,
        modalVisible: true
      });
    }
    static modalName() {
      return "_modal_";
    }

    getItemTemplate() {
      if (this.state.itemTemplate) return;

      const { behavior, itemTemplate, disabled } = this.props.args;

      if (
        !this.isTag() &&
        !this.isTemplateRef() &&
        !isArr(itemTemplate) &&
        !disabled
      )
        throw new Error("Empty List view item template");

      let _itemTemplate = isArr(itemTemplate)
        ? copy(itemTemplate)
        : this.isTag()
        ? copy(itemTemplate.template)
        : this.isTemplateRef()
        ? this.props.templateCache.get(
            (behavior && behavior.template_ref) || itemTemplate.template_ref
          )
        : [];

      (
        (behavior && behavior.extension) ||
        (itemTemplate && itemTemplate.extension) ||
        []
      ).forEach((element, index) => {
        element.key = index;
        _itemTemplate.push(copy(element));
      });

      //this happens asynchronously;

      setTimeout(() => {
        if (this._mounted)
          this.setState({
            itemTemplate: _itemTemplate
          });
      }, 0);
    }

    render() {
      this.props.log("render");
      if (this.props.busy) {
        return <ProgressBar />;
      }
      let disabled = this.isDisabled();

      return (
        /*jshint ignore:start */
        <Layout
          value={this.props.label}
          description={this.props.description}
          addButton={<Button disabled={disabled} click={this.showModal} />}
          list={
            <List
              items={this.props.items}
              rowClicked={this.edit}
              rowRemoved={this.remove}
              rowTemplate={
                this.props.args.rowTemplate &&
                JSON.parse(this.props.args.rowTemplate)
              }
              disabled={disabled}
            />
          }
          errorText={<ErrorText value={this.state.errors} />}
          modal={
            <Modal
              template={
                <Container
                  elements={this.state.itemTemplate}
                  value={this.state.edit}
                  name={FurmlyList.modalName()}
                  validator={this.state.validator}
                  valueChanged={this.valueChanged}
                  displayValueChanged={this.displayValueChanged}
                />
              }
              visibility={this.state.modalVisible}
              done={this.closeModal}
            />
          }
        />
        /*jshint ignore:end */
      );
    }
  }

  return {
    getComponent: () =>
      withProcess(
        connect(
          mapStateToProps,
          mapDispatchToProps
        )(withLogger(withTemplateCache(FurmlyList)))
      ),
    mapStateToProps,
    mapDispatchToProps,
    FurmlyList
  };
};
