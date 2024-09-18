#!/bin/bash

(trap 'kill 0' SIGINT; node ace scheduler:run & pnpm run dev)

wait -n
exit $?
