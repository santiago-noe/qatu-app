#!/bin/sh
set -e
NEXT_INTERNAL_PORT="${NEXT_INTERNAL_PORT:-3001}"
./node_modules/.bin/next start -p "$NEXT_INTERNAL_PORT" &
exec node gateway.js
