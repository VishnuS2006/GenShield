#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="${1:?image tag is required}"

if [[ -z "${EC2_HOST:-}" || -z "${EC2_USER:-}" || -z "${DEPLOY_PATH:-}" ]]; then
  echo "EC2_HOST, EC2_USER, and DEPLOY_PATH must be set"
  exit 1
fi

ssh "${EC2_USER}@${EC2_HOST}" "cd ${DEPLOY_PATH} && export IMAGE_TAG=${IMAGE_TAG} && docker compose pull && docker compose up -d"
