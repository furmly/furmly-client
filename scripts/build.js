let rollup = require("rollup").rollup,
	babel = require("rollup-plugin-babel"),
	resolve = require("rollup-plugin-node-resolve"),
	path = require("path"),
	fs = require("fs"),
	input = path.resolve(__dirname, "../src/index.js"),
	output = path.resolve(__dirname, "../dist/bundle.js");

rollup({
	input,
	plugins: [
		resolve({ modulesOnly: true }),
		babel({
			exclude: "node_modules/**"
		})
	]
})
	.then(function(e) {
		console.log("everything rolled up successfully");
		//console.log(e);
		e.write({
			file: output,
			format: "cjs"
		});
	})
	.catch(e => {
		console.log("failed to roll it up " + e);
	});
