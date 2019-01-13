import React, { Component } from "react";
import { connect } from "react-redux";
import withLogger from "./furmly_base";
import { uploadFurmlyFile, getFurmlyFilePreview } from "./actions";
import invariants from "./utils/invariants";
import ValidationHelper from "./utils/validator";
import { getKey } from "./utils/view";
import { withProcess } from "./furmly_process_context";

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

  class FurmlyFileUpload extends Component {
    constructor(props) {
      super(props);
      this.state = {};
      this._previewType = this.getPreviewType.call(this);
      this._supported = this.isSupported();
      this._getPreview = this._getPreview.bind(this);
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
    componentDidMount() {
      this._mounted = true;
      if (this.props.uploadedId && !this.props.preview) {
        this._getPreview(this.props.uploadedId);
      }
      if (this.props.uploadedId !== this.props.value) {
        //update the form incase the preview came with the fileupload
        setTimeout(() => {
          if (this._mounted)
            this.props.valueChanged({
              [this.props.name]: this.props.uploadedId
            });
        }, 0);
      }
    }
    componentWillUnmount() {
      this._mounted = false;
    }
    _getPreview(id) {
      this.props.getPreview(
        id,
        this.props.component_uid,
        this.props.args.fileType,
        this._query
      );
    }

    componentWillReceiveProps(next) {
      if (
        next.uploadedId !== this.props.uploadedId ||
        next.component_uid !== this.props.component_uid ||
        next.uploadedId !== next.value
      ) {
        if (
          next.uploadedId &&
          (!next.preview || next.uploadedId !== this.props.uploadedId)
        )
          this._getPreview(next.uploadedId);
        this.props.valueChanged({
          [this.props.name]: next.uploadedId
        });
      }
    }
    upload(file) {
      this.props.upload(file, this.props.component_uid);
    }
    render() {
      this.props.log("render");
      if (this.props.busy) return <ProgressBar />;
      if (!this._supported)
        return <Text message={"unsupported file upload type"} />;
      return (
        <Uploader
          key={this.props.component_uid}
          title={this.props.label}
          description={this.props.description}
          upload={this.upload}
          component_uid={this.props.component_uid}
          allowed={this.props.args.fileType}
          previewType={this._previewType}
          preview={this.props.preview}
          errors={this.state.errors}
          disabled={this.props.disabled}
        />
      );
    }
  }

  const mapStateToProps = (_, initialProps) => (state, ownProps) => {
    let component_uid = getKey(state, ownProps.component_uid, ownProps);
    let st = state.furmly.view[component_uid] || {};
    return {
      component_uid,
      preview: st.preview,
      busy: st.busy,
      disabled: ownProps.args && ownProps.args.disabled,
      uploadedId: st.uploadedId || ownProps.value
    };
  };
  const mapDispatchToProps = dispatch => {
    return {
      upload: (file, key) => dispatch(uploadFurmlyFile(file, key)),
      getPreview: (id, key, fileType, query) =>
        dispatch(getFurmlyFilePreview(id, key, fileType, query))
    };
  };

  return {
    getComponent: () =>
      withProcess(
        connect(
          mapStateToProps,
          mapDispatchToProps
        )(withLogger(FurmlyFileUpload))
      ),
    mapDispatchToProps,
    mapDispatchToProps,
    FurmlyFileUpload
  };
};
