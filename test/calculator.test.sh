#!/bin/sh
set -eu

assert_success() {
  expression="$1"
  expected="$2"

  actual="$(node dist/index.js "$expression")"

  if [ "$actual" != "$expected" ]; then
    printf 'Expression: %s\nExpected: %s\nActual: %s\n' "$expression" "$expected" "$actual"
    exit 1
  fi
}

assert_failure() {
  expression="$1"
  stderr_file="$(mktemp)"

  if node dist/index.js "$expression" 2>"$stderr_file"; then
    printf 'Expected expression to fail: %s\n' "$expression"
    rm -f "$stderr_file"
    exit 1
  fi

  if ! grep -q '^Error:' "$stderr_file"; then
    printf 'Expected stderr to start with Error: for expression: %s\n' "$expression"
    printf 'Actual stderr:\n'
    cat "$stderr_file"
    rm -f "$stderr_file"
    exit 1
  fi

  rm -f "$stderr_file"
}

assert_no_input_failure() {
  stderr_file="$(mktemp)"

  if node dist/index.js 2>"$stderr_file"; then
    printf 'Expected no input to fail\n'
    rm -f "$stderr_file"
    exit 1
  fi

  if ! grep -q '^Error:' "$stderr_file"; then
    printf 'Expected stderr to start with Error: for no input\n'
    printf 'Actual stderr:\n'
    cat "$stderr_file"
    rm -f "$stderr_file"
    exit 1
  fi

  rm -f "$stderr_file"
}

assert_success '1 + 2 * 3' '7'
assert_success '(10 - 3) / 2' '3.5'
assert_success '-4 + 1.5' '-2.5'
assert_success '0.1 + 0.2' '0.3'

assert_failure '1 / 0'
assert_failure '1 +'
assert_no_input_failure
