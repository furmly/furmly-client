export default function(string, ...rest) {
	var str = string.toString();
	if (rest.length) {
		var t = typeof rest[0];
		var key;
		var args = "string" === t || "number" === t ? rest : rest[0];

		for (key in args) {
			str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
		}
	}

	return str;
}
