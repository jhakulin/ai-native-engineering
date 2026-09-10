---
description: Manually authorized source review with deterministic scope, criterion evidence and consumer-scoped reports.
on:
  workflow_call:
    inputs:
      pull_request_number:
        description: Pull request in the calling repository
        type: string
        required: true
      config_path:
        description: Consumer configuration at the trusted dispatched consumer revision
        type: string
        default: review.config.json
    secrets:
      OPENAI_API_KEY:
        description: Consumer-owned credential for the manually authorized review
        required: true
  needs: [resolve, prepare]
  status-comment: false
if: github.event_name == 'workflow_dispatch'
concurrency:
  group: gh-aw-review-change-${{ github.repository }}-pr-${{ inputs.pull_request_number }}
  cancel-in-progress: true
permissions:
  actions: read
  contents: read
  pull-requests: read
engine:
  id: codex
  args:
    - -c
    - "'shell_environment_policy.include_only=[\"PATH\",\"HOME\"]'"
runs-on: ubuntu-24.04
checkout:
  ref: ${{ github.sha }}
  fetch-depth: 0
tools:
  bash: ["cat", "jq", "printf", "mkdir", "mv", "wc", "sed"]
imports:
  - .github/aw/review-change.md
inlined-imports: true
safe-outputs:
  upload-artifact:
    allowed-paths: ["/tmp/gh-aw/review-result.json"]
    retention-days: 7
  report-failure-as-issue: false
  noop: {}
  missing-tool: false
  missing-data: false
pre-agent-steps:
  - name: Download trusted review packet
    uses: actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c
    with:
      name: review-packet-${{ github.run_attempt }}
      path: /tmp/gh-aw/review-input
post-steps:
  - name: Collect bounded partial reviewer output
    id: collect_review
    if: always()
    uses: actions/github-script@3a2844b7e9c422d3c10d287c895573f7108da1b3
    env:
      REVIEW_ENGINE_OUTCOME: ${{ steps.agentic_execution.outcome }}
      REVIEW_SHARED_REPOSITORY: ${{ needs.resolve.outputs.repository }}
      REVIEW_SHARED_SHA: ${{ needs.resolve.outputs.sha }}
    with:
      script: |
        // Load authenticated release code after the engine stops, never consumer code.
        const [owner, repo] = process.env.REVIEW_SHARED_REPOSITORY.split('/');
        const { data } = await github.rest.repos.getContent({
          owner, repo, path: 'scripts/review-runtime.js', ref: process.env.REVIEW_SHARED_SHA
        });
        if (data.type !== 'file' || data.encoding !== 'base64' || data.size > 128 * 1024) {
          throw new Error('Trusted runtime module is not a bounded source file');
        }
        const source = Buffer.from(data.content, 'base64');
        if (source.length !== data.size) throw new Error('Incomplete trusted runtime source');
        const runtime = { exports: {} };
        new Function('module', 'require', source.toString('utf8'))(runtime, require);
        core.setOutput('directory', runtime.exports.collectReviewOutput({
          inputDirectory: '/tmp/gh-aw',
          outputParent: process.env.RUNNER_TEMP,
          execution: process.env.REVIEW_ENGINE_OUTCOME || 'skipped'
        }));
  - name: Retain partial reviewer output independently of model tools
    if: always()
    uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02
    with:
      name: review-raw-${{ github.run_attempt }}
      path: ${{ steps.collect_review.outputs.directory }}
      retention-days: 7
      if-no-files-found: error
jobs:
  resolve:
    name: Resolve authenticated consumer and called release
    if: github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-24.04
    permissions:
      actions: read
    outputs:
      repository: ${{ steps.release.outputs.repository }}
      sha: ${{ steps.release.outputs.sha }}
    steps:
      - name: Resolve the actual reusable workflow identity
        id: release
        uses: actions/github-script@3a2844b7e9c422d3c10d287c895573f7108da1b3
        env:
          REVIEW_PR: ${{ inputs.pull_request_number }}
        with:
          script: |
            if (!/^[1-9][0-9]*$/.test(process.env.REVIEW_PR)) throw new Error('PR number must be a positive decimal integer without leading zeros');
            const { data } = await github.rest.actions.getWorkflowRun({ ...context.repo, run_id: context.runId });
            const matches = (data.referenced_workflows || []).filter(item => /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/\.github\/workflows\/review-change\.lock\.yml@/.test(item.path));
            if (matches.length !== 1 || !/^[a-f0-9]{40}$/.test(matches[0].sha)) throw new Error('Cannot unambiguously establish the called review release');
            core.setOutput('repository', matches[0].path.split('/').slice(0, 2).join('/'));
            core.setOutput('sha', matches[0].sha);
  prepare:
    name: Prepare immutable scope and criterion evidence
    needs: [resolve]
    runs-on: ubuntu-24.04
    permissions:
      actions: read
      contents: read
      pull-requests: read
    outputs:
      packet_id: ${{ steps.packet.outputs.packet_id }}
      head_sha: ${{ steps.packet.outputs.head_sha }}
      base_sha: ${{ steps.packet.outputs.base_sha }}
      policy_digest: ${{ steps.packet.outputs.policy_digest }}
    steps:
      - name: Checkout helper from the actual called release
        uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0
        with:
          repository: ${{ needs.resolve.outputs.repository }}
          ref: ${{ needs.resolve.outputs.sha }}
          persist-credentials: false
      - uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e
        with:
          node-version: '22'
      - name: Install pinned trusted schema validator
        run: npm ci --ignore-scripts --no-audit --no-fund
      - name: Prepare packet and initial incomplete record
        id: packet
        run: node scripts/review-change.js prepare --output "$RUNNER_TEMP/review-prepared"
        env:
          GH_TOKEN: ${{ github.token }}
          REVIEW_REPOSITORY: ${{ github.repository }}
          REVIEW_PR: ${{ inputs.pull_request_number }}
          REVIEW_CONFIG_PATH: ${{ inputs.config_path }}
          REVIEW_POLICY_SHA: ${{ github.sha }}
          REVIEW_SHARED_REPOSITORY: ${{ needs.resolve.outputs.repository }}
          REVIEW_SHARED_SHA: ${{ needs.resolve.outputs.sha }}
      - name: Retain prepared packet or preparation failure
        if: always()
        uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02
        with:
          name: review-packet-${{ github.run_attempt }}
          path: ${{ runner.temp }}/review-prepared/
          retention-days: 7
          if-no-files-found: error
  report:
    name: Validate evidence and publish deterministic report
    needs: [resolve, prepare, agent]
    if: always()
    runs-on: ubuntu-24.04
    permissions:
      actions: read
      contents: read
      pull-requests: read
    steps:
      - name: Initialize explicit failure record
        uses: actions/github-script@3a2844b7e9c422d3c10d287c895573f7108da1b3
        with:
          script: |
            const fs = require('node:fs');
            fs.mkdirSync(process.env.RUNNER_TEMP + '/review-failure', { recursive: true });
            fs.writeFileSync(process.env.RUNNER_TEMP + '/review-failure/failure.json', JSON.stringify({ schema_version: 1, execution_state: 'failed', readiness: 'incomplete', merge_authority: 'human_and_repository_rules', error: 'Trusted report finalization has not completed; inspect job outcomes and retained partial inputs' }, null, 2));
      - name: Checkout clean finalizer from the called release
        if: needs.resolve.result == 'success'
        uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0
        with:
          repository: ${{ needs.resolve.outputs.repository }}
          ref: ${{ needs.resolve.outputs.sha }}
          persist-credentials: false
      - uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e
        with:
          node-version: '22'
      - name: Install pinned trusted schema validator
        if: needs.resolve.result == 'success'
        run: npm ci --ignore-scripts --no-audit --no-fund
      - name: Download original trusted packet
        id: packet
        continue-on-error: true
        uses: actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c
        with:
          name: review-packet-${{ github.run_attempt }}
          path: ${{ runner.temp }}/review-prepared
      - name: Download partial reviewer output
        continue-on-error: true
        uses: actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c
        with:
          name: review-raw-${{ github.run_attempt }}
          path: ${{ runner.temp }}/review-raw
      - name: Validate result against original packet and current PR
        id: finalize
        if: always() && needs.prepare.result == 'success' && steps.packet.outcome == 'success'
        run: node scripts/review-change.js finalize --packet "$RUNNER_TEMP/review-prepared/packet.json" --result "$RUNNER_TEMP/review-raw/result.json" --runtime-log "$RUNNER_TEMP/review-raw/runtime.json" --execution "$REVIEW_EXECUTION" --output "$RUNNER_TEMP/review-final"
        env:
          GH_TOKEN: ${{ github.token }}
          REVIEW_EXECUTION: ${{ needs.agent.result }}
      - name: Select retained report or initialization failure
        id: select_report
        if: always()
        uses: actions/github-script@3a2844b7e9c422d3c10d287c895573f7108da1b3
        with:
          script: |
            const fs = require('node:fs');
            const directory = process.env.RUNNER_TEMP + '/review-final';
            core.setOutput('path', fs.existsSync(directory + '/report.json') || fs.existsSync(directory + '/failure.json') ? directory : process.env.RUNNER_TEMP + '/review-failure');
      - name: Publish validated report or explicit failure record
        if: always()
        uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02
        with:
          name: review-report-pr-${{ inputs.pull_request_number }}-${{ github.run_attempt }}
          path: ${{ steps.select_report.outputs.path }}
          retention-days: 7
          if-no-files-found: error
---

# Prepared source review

The maintainer authorized paid review of PR `${{ inputs.pull_request_number }}`
in `${{ github.repository }}`. The trusted host downloads the exact versioned
packet and result schema to `/tmp/gh-aw/review-input/` before the engine starts.
Read those files using the shared procedure; do not reconstruct the review scope.

Write incremental structured output to `/tmp/gh-aw/review-result.json`.
Trusted orchestration, not the model, owns final validation, readiness and
publication. A final chat message or safe-output call is not a completed report.
