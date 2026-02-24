#!/bin/sh
set -e
node bin/console.js migration:run --force
exec node bin/server.js
