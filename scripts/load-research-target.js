#!/usr/bin/env node
const { loadTarget } = require("./research-lib");

const targetName = process.argv[2] || process.env.RESEARCH_TARGET || "agent-skills";
try {
  const target = loadTarget(targetName);
  console.log(JSON.stringify(target, null, 2));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
