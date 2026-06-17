#!/bin/sh
set -eu

actual="$(node dist/index.js)"
expected="Hello, world!"

if [ "$actual" != "$expected" ]; then
  printf 'Expected: %s\nActual: %s\n' "$expected" "$actual"
  exit 1
fi
