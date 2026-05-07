# QualityGate Demo Repository

This repository contains a small vulnerable JavaScript application and a GitHub Actions workflow that runs CodeQL, generates SARIF output, and enforces a Quality Gate using the `narendra486/qualitygate@v1` action.

## Workflow behavior

- Runs on `pull_request`
- Uses CodeQL to analyze JavaScript
- Writes SARIF results to `codeql-results.sarif`
- Executes QualityGate with `severity_threshold: medium`
- Blocks PR when any medium or higher findings are present
- Posts a PR comment with the findings summary

## Usage

```yaml
- uses: narendra486/qualitygate@v1
  with:
    sarif_file: codeql-results.sarif
    severity_threshold: medium
    github_token: ${{ secrets.GITHUB_TOKEN }}
    pr_comment: true
```
