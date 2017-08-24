import React, { Component } from "react";
import { connect } from "react-redux";
import { uploadDynamoFile, getDynamoFilePreview } from "./actions";
import invariants from "./utils/invariants";
import ValidationHelper from "./utils/validator";
/**
 * This component should render a file uploader
 * @param  {Class} Uploader Component responsible for uploading the file
 * @param  {Array} previews Array of component definitions with an id property
 * @return {Class}          Configured component.
 */
export default (Uploader, ProgressBar, Text, previews = []) => {
	invariants.validComponent(Uploader, "Uploader");
	invariants.validComponent(ProgressBar, "ProgressBar");
	invariants.validComponent(Text, "Text");

	class DynamoFileUpload extends Component {
		constructor(props) {
			super(props);
			this.state = {};
			this._previewType = this.getPreviewType.call(this);
			this._supported = this.isSupported();
			this._query = this.getPreviewQuery();
			this.props.validator.validate = () => {
				return this.runValidators();
			};
			this.upload = this.upload.bind(this);
		}
		runValidators() {
			return new ValidationHelper(this).run();
		}
		hasValue() {
			return !!this.props.uploadedId || "is required";
		}
		getPreviewQuery() {
			return Uploader.getPreviewQuery(this.props.args.fileType);
		}
		getPreviewType() {
			for (var i = 0; i < previews.length; i++) {
				if (previews[i].id.test(this.props.args.fileType)) {
					return previews[i];
				}
			}
		}
		isSupported() {
			return Uploader.supports(this.props.args.fileType);
		}

		componentWillReceiveProps(next) {
			if (next.uploadedId !== this.props.uploadedId) {
				this.props.getPreview(
					next.uploadedId,
					this.props.component_uid,
					this.props.args.fileType,
					this._query
				);
				this.props.valueChanged({
					[this.props.name]: this.props.uploadedId
				});
			}
		}
		upload(file) {
			this.props.upload(file, this.props.component_uid);
		}
		render() {
			if (this.props.busy) return <ProgressBar />;
			if (!this._supported)
				return <Text message={"unsupported file upload type"} />;
			return (
				<Uploader
					title={this.props.label}
					description={this.props.description}
					upload={this.upload}
					allowed={this.props.args.fileType}
					previewType={this._previewType}
					preview={this.props.preview}
					errors={this.state.errors}
				/>
			);
		}
	}

	const mapStateToProps = (_, initialProps) => state => {
		let st = state.dynamo[initialProps.component_uid] || {};
		return {
			preview: st.preview,
			busy: st.busy,
			uploadedId: st.uploadedId
		};
	};
	const mapDispatchToProps = dispatch => {
		return {
			upload: (file, key) => dispatch(uploadDynamoFile(file, key)),
			getPreview: (id, key, fileType, query) =>
				dispatch(getDynamoFilePreview(id, key, fileType, query))
		};
	};

	return connect(mapStateToProps, mapDispatchToProps)(DynamoFileUpload);
};
