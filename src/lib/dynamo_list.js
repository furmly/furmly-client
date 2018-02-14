import React, { Component } from "react";
import { connect } from "react-redux";
import ValidatorHelper from "./utils/validator";
import invariants from "./utils/invariants";
import _ from "lodash";
import { runDynamoProcessor, openConfirmation } from "./actions";

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

	const mapStateToProps = (_, initialProps) => (state, ownProps) => {
		return {
			confirmation:
				state.app &&
				state.app.confirmationResult &&
				state.app.confirmationResult[ownProps.component_uid],
			templateCache: state.dynamo.templateCache,
			dataTemplate: state.dynamo[ownProps.component_uid],
			busy: state.dynamo[`${ownProps.component_uid}-busy`]
		};
	};
	const equivalent = function(arr, arr2) {
		if (
			(!arr && !arr2) ||
			(arr && arr.length == 0 && arr2 && arr2.length == 0)
		)
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
				dispatch(runDynamoProcessor(id, args, key)),
			openConfirmation: (id, message, params) =>
				dispatch(openConfirmation(id, message, params))
		};
	};

	class DynamoList extends Component {
		constructor(props) {
			super(props);
			this.state = {
				validator: {},
				items:
					this.props.value ||
					(this.props.args && this.props.args.default) ||
					[],
				modalVisible: false
			};
			this.showModal = this.showModal.bind(this);
			this.closeModal = this.closeModal.bind(this);
			this.valueChanged = this.valueChanged.bind(this);
			this.getItemTemplate = this.getItemTemplate.bind(this);
			this.edit = this.edit.bind(this);
			this.runValidators = this.runValidators.bind(this);
			this.isDisabled = this.isDisabled.bind(this);
			this.getListItemDataTemplate = this.getListItemDataTemplate.bind(
				this
			);
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
				this.state.items.length
			) {
				return (
					this.state.items.splice(next.confirmation.params.index, 1),
					this.props.valueChanged({ [this.props.name]: items })
				);
			}
			if (this.props.component_uid !== next.component_uid) {
				//setTimeout(() => {
				if (this._mounted) {
					let items =
						next.dataTemplate ||
						next.value ||
						(next.args && next.args.default) ||
						[];
					items = items.slice();
					if (
						next.args.listItemDataTemplateProcessor &&
						items.length
					) {
						this.getListItemDataTemplate(items, next);
					}
					this.setState({
						form: null,
						itemTemplate: null,
						items,
						modalVisible: false
					});
					this.props.valueChanged({ [this.props.name]: items });
				}
				return;
				//}, 0);
			}

			if (
				next.dataTemplate &&
				(!equivalent(next.dataTemplate, this.props.dataTemplate) ||
					!equivalent(next.dataTemplate, this.state.items))
			) {
				if (this._mounted) {
					if (Array.prototype.isPrototypeOf(next.dataTemplate))
						this.setState({
							items: next.dataTemplate.slice()
						});
					else {
						this.state.items.splice(
							this.state.items.length - 1,
							1,
							next.dataTemplate
						);
					}
				}
			}
		}
		componentWillUnmount() {
			this._mounted = false;
		}
		componentDidMount() {
			this._mounted = true;
			//if its template is a reference then store it.
			if (this.isTemplateRef()) {
				this.props.templateCache[
					this.props.args.itemTemplate.dynamo_ref
				] = Array.prototype.isPrototypeOf(this.props.args.itemTemplate)
					? this.props.args.itemTemplate
					: this.props.args.itemTemplate.template;
			}
			//if theres a default then update everyone.
			if (this.state.items && this.state.items.length) {
				setTimeout(() => {
					this.props.valueChanged({
						[this.props.name]: this.state.items
					});
				}, 0);
			}
			let equal = equivalent(this.props.dataTemplate, this.state.items);
			//if theres a data template processor then run it.
			if (
				this.props.args.listItemDataTemplateProcessor &&
				this.state.items &&
				this.state.items.length &&
				!equal
			) {
				this.getListItemDataTemplate(this.state.items);
			}

			if (
				this.props.dataTemplate &&
				this.props.dataTemplate.length &&
				equal
			) {
				setTimeout(() => {
					this.setState({
						items: this.props.dataTemplate.slice()
					});
				}, 0);
			}
		}

		getListItemDataTemplate(i, props = this.props) {
			this.props.getListItemDataTemplate(
				props.args.listItemDataTemplateProcessor,
				i,
				props.component_uid
			);
		}
		isTemplateRef() {
			return (
				(this.props.args.itemTemplate &&
					!Array.prototype.isPrototypeOf(
						this.props.args.itemTemplate
					) &&
					this.props.args.itemTemplate.dynamo_ref) ||
				(this.props.args.behavior &&
					this.props.args.behavior.dynamo_ref &&
					this.props.args.itemTemplate)
			);
		}
		runValidators() {
			return new ValidatorHelper(this).run();
		}
		isDisabled() {
			return this.props.args && this.props.args.disabled;
		}
		showModal() {
			if (!this.isDisabled()) this.setState({ modalVisible: true });
		}
		hasValue() {
			return (
				(this.state.items && this.state.items.length) ||
				"Requires atleast one item to have been added to the list"
			);
		}
		isLessThanMaxLength(element) {
			return (
				(this.state.items &&
					this.state.items.length &&
					this.state.items.length <= element.args.max) ||
				(element.error ||
					"The maximum number of items is " + element.args.max)
			);
		}
		isGreaterThanMinLength(element) {
			return (
				(this.state.items &&
					this.state.items.length &&
					this.state.items.length >= element.args.min) ||
				(element.error ||
					"The minimum number of items is " + element.args.min)
			);
		}
		closeModal(result) {
			//he/she clicked ok
			if (result) {
				this.state.validator.validate().then(() => {
					let items = this.state.items || [];

					if (!this.state.edit) items.push(this.state.form);
					else
						items.splice(
							items.indexOf(this.state.edit),
							1,
							this.state.form
						);
					this.props.valueChanged({ [this.props.name]: items });
					this.setState({
						items: Object.assign([], items),
						modalVisible: false,
						edit: null,
						form: null
					});

					if (this.props.args.listItemDataTemplateProcessor)
						this.getListItemDataTemplate(items);
				});
				return;
			}
			//canceled the modal box.

			this.setState({ modalVisible: false, form: null, edit: null });
		}
		valueChanged(v) {
			this.state.form = v && v[DynamoList.modalName()];
		}
		clone(item) {
			return JSON.parse(JSON.stringify(item));
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
				edit: this.state.items[index],
				form: this.state.items[index],
				modalVisible: true
			});
		}
		static modalName() {
			return "_modal_";
		}
		getItemTemplate() {
			if (this.state.itemTemplate) return this.state.itemTemplate;

			if (!this.props.args.itemTemplate) {
				if (
					(!this.props.args.behavior ||
						!this.props.args.behavior.template_ref) &&
					!this.props.args.disabled
				)
					throw new Error("Empty List view item template");

				this.props.args.itemTemplate =
					this.props.templateCache[
						this.props.args.behavior &&
							this.props.args.behavior.template_ref
					] || [];
			}

			let itemTemplate = this.clone(
				this.isTemplateRef()
					? this.props.args.itemTemplate.template
					: this.props.args.itemTemplate
			);

			if (
				this.props.args.behavior &&
				this.props.args.behavior.extension &&
				this.props.args.behavior.extension.length
			)
				this.props.args.behavior.extension.forEach((element, index) => {
					element.key = index;
					itemTemplate.push(this.clone(element));
				});
			//this happens asynchronously;
			setTimeout(() => {
				if (this._mounted)
					this.setState({
						itemTemplate: itemTemplate
					});
			}, 0);

			//this.state.itemTemplate = itemTemplate;
			return itemTemplate;
		}

		render() {
			if (this.props.busy) {
				return <ProgressBar />;
			}
			let template = this.getItemTemplate(),
				disabled = this.isDisabled();

			return (
				/*jshint ignore:start */
				<Layout value={this.props.label}>
					<Button disabled={disabled} click={this.showModal} />
					<List
						items={this.state.items}
						rowClicked={this.edit}
						rowRemoved={this.remove}
						rowTemplate={
							this.props.args.rowTemplate &&
							JSON.parse(this.props.args.rowTemplate)
						}
						disabled={disabled}
					/>
					<ErrorText value={this.state.errors} />
					<Modal
						template={
							<Container
								elements={template}
								value={this.state.edit}
								name={DynamoList.modalName()}
								validator={this.state.validator}
								valueChanged={this.valueChanged}
								navigation={this.props.navigation}
							/>
						}
						visibility={this.state.modalVisible}
						done={this.closeModal}
					/>
				</Layout>
				/*jshint ignore:end */
			);
		}
	}

	return connect(mapStateToProps, mapDispatchToProps)(DynamoList);
};
