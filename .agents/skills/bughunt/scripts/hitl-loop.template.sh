#!/usr/bin/env bash
# Template for a human-in-the-loop debugging loop — last resort when a human
# must physically perform the trigger (click a button, plug in a device).
# Copy this file, fill in the two variables below, then run it and read the
# log after; don't watch the terminal live.
set -euo pipefail

# The exact manual action the human should take this iteration.
ACTION_PROMPT="Describe the manual step here, e.g. 'Click Submit on the checkout form.'"

# The automated check that captures the symptom right after the action.
# Runs through `eval`, so keep it to a trusted, self-contained command.
CHECK_CMD="echo 'replace with the command that captures the symptom'"

LOG_FILE="${LOG_FILE:-hitl-loop.log}"
MAX_ITER="${1:-10}"

: > "$LOG_FILE"

for i in $(seq 1 "$MAX_ITER"); do
  echo "--- iteration $i/$MAX_ITER ---"
  echo "$ACTION_PROMPT"
  read -r -p "Press Enter once done (or type 'stop' to end early): " reply
  if [ "$reply" = "stop" ]; then
    break
  fi

  {
    echo "=== iteration $i ==="
    eval "$CHECK_CMD"
    echo "exit code: $?"
  } >> "$LOG_FILE" 2>&1 || true

  echo "captured to $LOG_FILE"
done

echo "done — read $LOG_FILE for every captured result"
