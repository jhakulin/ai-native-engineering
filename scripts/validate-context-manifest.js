#!/usr/bin/env node
const { validateManifest } = require("./context-manifest");
const errors = validateManifest();
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log("Context manifest validation passed.");
