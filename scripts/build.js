let rollup = require("rollup").rollup,
  babel = require("rollup-plugin-babel"),
  resolve = require("rollup-plugin-node-resolve"),
  path = require("path"),
  package = require("../package.json"),
  input = path.resolve(__dirname, "../src/index.js"),
  output = path.resolve(__dirname, "../dist/bundle.js");

rollup({
  input,
  external: Object.keys(package.dependencies).concat(
    "client_config",
    "call_api",
    "uuid/v4"
  ),
  plugins: [
    resolve({ jail: path.resolve(__dirname, "../src") }),
    babel({
      exclude: "node_modules/**"
    })
  ]
})
  .then(function(e) {
    console.log("everything rolled up like a g");
    e.write({
      file: output,
      format: "cjs",
      sourcemap: true,
      exports: "named"
    });
  })
  .catch(e => {
    console.log("failed to roll it up:" + e);
  });
