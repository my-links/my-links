#!/bin/bash

(trap 'kill 0' SIGINT; node ace scheduler:run & pnpm start)

wait -n
exit $?
