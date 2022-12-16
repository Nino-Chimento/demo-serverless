#!/usr/bin/env bash
set -euo pipefail

# MIGRATED USER
aws dynamodb put-item \
  --table-name Users-local  \
  --item \
    '{
      "userId": {
        "S": "C000532591"
      },
      "creationDate": {
        "N": "1638379205357"
      },
      "customerId": {
        "S": "585774842"
      },
      "migrated": {
        "BOOL": true
      }
    }' \
  --endpoint-url http://0.0.0.0:8000 \
  --no-cli-pager

echo "Data created"
