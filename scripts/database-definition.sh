#!/usr/bin/env bash
set -euo pipefail

# USERS TABLE
aws dynamodb create-table \
  --table-name Users-local \
  --attribute-definitions AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
  --endpoint-url http://0.0.0.0:8000 \
  --no-cli-pager
