#!/usr/bin/env sh

set -e

size_bytes="$(docker image inspect my-links-my-links:latest --format '{{.Size}}')"
awk "BEGIN { printf \"Docker image weight: %.3f Mo\n\", ${size_bytes}/1024/1024 }"
