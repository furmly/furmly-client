import components from "./lib";
const defaultMap = {
	INPUT: components.dynamo_input,
	VIEW: components.dynamo_view,
	CONTAINER: components.dynamo_container,
	PROCESS: components.dynamo_process,
	SECTION: components.dynamo_section,
	SELECT: components.dynamo_select,
	SELECTSET: components.dynamo_selectset,
	LIST: components.dynamo_list,
	HIDDEN: components.dynamo_hidden,
	NAV: components.dynamo_nav,
	IMAGE: components.dynamo_image,
	GRID: components.dynamo_grid,
	FILEUPLOAD: components.dynamo_fileupload,
	ACTIONVIEW: components.dynamo_actionview,
	HTMLVIEW: components.dynamo_htmlview,
	LABEL: components.dynamo_label,
	WEBVIEW: components.dynamo_webview,
	MESSENGER: components.dynamo_messenger,
	COMMAND: components.dynamo_command,
	recipes: {},
	_defaultMap: {},
	cook: function(name, recipe, customName) {
		if (name && recipe) {
			if (!Array.prototype.isPrototypeOf(recipe)) {
				throw new Error("Recipe must be an array");
			}
			if (!this._defaultMap[name])
				throw new Error("Cannot find any recipe for that element");
			if (name == customName) {
				throw new Error("Cusom name will override default recipe");
			}

			let cooked = this._defaultMap[name].apply(null, recipe);
			if (customName) this[customName] = cooked;
			return cooked;
		}

		if (!this._cooked) {
			this._cooked = true;
			Object.keys(this.recipes).forEach(recipe => {
				this._defaultMap[recipe] = this[recipe];
				this[recipe] = this[recipe].apply(null, this.recipes[recipe]);
			});
		}
		return this;
	}
};
export default defaultMap;
