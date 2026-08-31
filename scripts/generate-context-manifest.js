#!/usr/bin/env node
const fs = require("fs");
const { manifestPath, expectedManifest } = require("./context-manifest");
const expected = expectedManifest();
let manifest = expected;
if (fs.existsSync(manifestPath)) {
  try {
    const existing = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (JSON.stringify(existing.files) === JSON.stringify(expected.files) && /^[0-9a-f]{40}$/i.test(existing.generated_from_sha || "")) {
      manifest = { schema_version: expected.schema_version, generated_from_sha: existing.generated_from_sha, files: expected.files };
    }
  } catch {
    // Replace malformed manifests with a deterministic manifest.
  }
}
fs.mkdirSync(require("path").dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(manifestPath);
