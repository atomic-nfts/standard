const fs = require("fs");
const path = require("path");

const CONTRACTS_PATH = path.resolve(__dirname, "../dist");

for (const filePath of fs.readdirSync(CONTRACTS_PATH)) {
  const absFilePath = CONTRACTS_PATH + "/" + filePath;
  let contractSrc = fs.readFileSync(absFilePath, "utf8");
  contractSrc = contractSrc.replace(
    "Object.defineProperty(exports, '__esModule', { value: true });",
    ""
  );
  contractSrc = contractSrc.replace("exports.handle = handle;", "");
  contractSrc = contractSrc.replace(/^\s*[\r\n]/gm, ""); // Remove blank lines
  fs.writeFileSync(absFilePath, contractSrc);
}
