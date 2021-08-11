import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import nodePolyfills from "rollup-plugin-node-polyfills";

export default [
  {
    input: "src/collection/index.js",
    output: {
      file: "dist/collection.js",
      format: "cjs",
    },
    plugins: [resolve({ preferBuiltins: false }), commonjs(), nodePolyfills()],
  },
  {
    input: "src/nft/index.js",
    output: {
      file: "dist/nft.js",
      format: "cjs",
    },
    plugins: [resolve({ preferBuiltins: false }), commonjs(), nodePolyfills()],
  },
  {
    input: "src/vault/index.js",
    output: {
      file: "dist/valut.js",
      format: "cjs",
    },
    plugins: [resolve({ preferBuiltins: false }), commonjs(), nodePolyfills()],
  },
];
