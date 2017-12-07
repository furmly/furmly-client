import React, { Component } from "react";
import { connect } from "react-redux";
import ValidatorHelper from "./utils/validator";
import invariants from "./utils/invariants";
import { runDynamoProcessor } from "./actions";

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
			templateCache: state.dynamo.templateCache,
			dataTemplate: state.dynamo[ownProps.component_uid],
			busy: state.dynamo[`${ownProps.component_uid}-busy`]
		};
	};

	const mapDispatchToProps = dispatch => {
		return {
			getListItemDataTemplate: (id, args, key) =>
				dispatch(runDynamoProcessor(id, args, key))
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
			this.getListItemDataTemplate = this.getListItemDataTemplate.bind(
				this
			);
			this.props.validator.validate = () => {
				return this.runValidators();
			};
		}
		componentWillReceiveProps(next) {
			if (this.props.component_uid !== next.component_uid) {
				return setTimeout(() => {
					this.setState({
						form: null,
						itemTemplate: null,
						items:
							next.dataTemplate ||
							this.props.dataTemplate ||
							this.props.value ||
							[],
						modalVisible: false
					});
				}, 0);
			}
			if (next.dataTemplate) {
				setTimeout(() => {
					if (Array.prototype.isPrototypeOf(next.dataTemplate))
						this.setState({
							items: next.dataTemplate
						});
					else {
						this.state.items.splice(
							this.state.items.length - 1,
							1,
							next.dataTemplate
						);
					}
				}, 0);
			}
		}
		componentDidMount() {
			if (this.isTemplateRef()) {
				this.props.templateCache[
					this.props.args.itemTemplate.dynamo_ref
				] = this.props.args.itemTemplate.template;
			}
			if (
				this.props.args.listItemDataTemplateProcessor &&
				this.state.items &&
				this.state.items.length
			) {
				this.getListItemDataTemplate(this.state.items);
			}
		}

		getListItemDataTemplate(i) {
			this.props.getListItemDataTemplate(
				this.props.args.listItemDataTemplateProcessor,
				i,
				this.props.component_uid
			);
		}
		isTemplateRef() {
			return (
				this.props.args.itemTemplate &&
				!Array.prototype.isPrototypeOf(this.props.args.itemTemplate) &&
				this.props.args.itemTemplate.dynamo_ref
			);
		}
		runValidators() {
			return new ValidatorHelper(this).run();
		}
		showModal() {
			this.setState({ modalVisible: true });
		}
		hasValue() {
			return (
				(this.state.items && this.state.items.length) ||
				"requires atleast one item to have been added to the list"
			);
		}
		isLessThanMaxLength(element) {
			return (
				(this.state.items &&
					this.state.items.length &&
					this.state.items.length <= element.args.max) ||
				"the maximum number of items is " + element.args.max
			);
		}
		isGreaterThanMinLength(element) {
			return (
				(this.state.items &&
					this.state.items.length &&
					this.state.items.length >= element.args.min) ||
				"the minimum number of items is" + element.args.min
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
					!this.props.args.behavior ||
					!this.props.args.behavior.template_ref
				)
					throw new Error("Empty List view item template");
				this.props.args.itemTemplate = this.props.templateCache[
					this.props.args.behavior.template_ref
				];
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
			let template = this.getItemTemplate();
			return (
				/*jshint ignore:start */
				<Layout value={this.props.label}>
					<Button click={this.showModal} />
					<List
						items={this.state.items}
						rowClicked={this.edit}
						rowTemplate={
							this.props.args.rowTemplate &&
							JSON.parse(this.props.args.rowTemplate)
						}
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
