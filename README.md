# Scrapbox Duplicator

Automatically duplicates pages from a source Scrapbox project to a destination
project, filtering by `[public]` / `[private]` tags.

## How it works

1. Export pages from the source project (via Scrapbox API or a pre-exported JSON
   file from S3)
2. Filter pages: include pages with `[public]`, exclude pages with `[private]`
3. Import the filtered pages into the destination project

## Setup

1. Fork this repository
2. Set the required environment variables (as GitHub Actions secrets/variables)

### Required variables

| Variable                      | Type     | Description                                     |
| ----------------------------- | -------- | ----------------------------------------------- |
| `SID`                         | secret   | Scrapbox session ID                             |
| `SOURCE_PROJECT_NAME`         | variable | Source project name                             |
| `DESTINATION_PROJECT_NAME`    | variable | Destination project name                        |
| `SHOULD_DUPLICATE_BY_DEFAULT` | variable | `True` to duplicate pages without explicit tags |

### S3 source mode (optional)

Instead of calling the Scrapbox API directly, pages can be read from a JSON file
exported to S3 (e.g. via
[scrapbox-export-s3](https://github.com/mu373/scrapbox-export-s3)).

| Variable           | Type     | Description                                        |
| ------------------ | -------- | -------------------------------------------------- |
| `AWS_ROLE_ARN`     | variable | IAM role ARN for OIDC authentication               |
| `S3_BUCKET`        | variable | S3 bucket name                                     |
| `S3_PREFIX`        | variable | S3 key prefix (e.g. `scrapbox-exports/projects`)   |
| `EXPORT_JSON_PATH` | env      | Path to the downloaded JSON file (set in workflow) |
