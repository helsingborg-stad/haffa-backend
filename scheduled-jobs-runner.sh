#!/bin/sh
set -eu
    
curl --location "$BASE_URL/api/v1/haffa/graphql" \
--header 'Authorization: api-key $API_KEY' \
--header 'Content-Type: application/json' \
--data '{"query":"mutation RunJobs {\n  jobRun(jobName: \"TASK_DAILY_MAINTENANCE\") {\n    at\n    by\n   message\n  severity\n   type\n  }\n}","variables":{}}'
