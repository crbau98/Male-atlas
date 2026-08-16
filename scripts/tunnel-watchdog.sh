#!/usr/bin/env bash
# Keeps a cloudflared quick tunnel alive against http://localhost:3000.
# Restarts cloudflared whenever it dies or stops serving, and always
# writes the currently-live public URL to tunnel-url.txt.
set -u

CLOUDFLARED_BIN="$(command -v cloudflared || true)"
if [ -z "$CLOUDFLARED_BIN" ]; then
  CLOUDFLARED_BIN=$(find /home/ubuntu/.npm/_npx -type f -name cloudflared -path "*/bin/*" 2>/dev/null | head -1)
fi
if [ -z "$CLOUDFLARED_BIN" ]; then
  echo "cloudflared binary not found" >&2
  exit 1
fi

OUT_FILE="/workspace/tunnel-url.txt"
LOG_FILE="/tmp/cloudflared-watchdog.log"

while true; do
  RUN_LOG="/tmp/cloudflared-run-$(date +%s).log"
  "$CLOUDFLARED_BIN" tunnel --url http://localhost:3000 > "$RUN_LOG" 2>&1 &
  CF_PID=$!
  echo "$(date -u +%FT%TZ) started cloudflared pid=$CF_PID log=$RUN_LOG" >> "$LOG_FILE"

  URL=""
  for _ in $(seq 1 30); do
    URL=$(grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" "$RUN_LOG" | head -1)
    [ -n "$URL" ] && break
    sleep 1
  done
  if [ -n "$URL" ]; then
    echo "$URL" > "$OUT_FILE"
    echo "$(date -u +%FT%TZ) live at $URL" >> "$LOG_FILE"
  else
    echo "$(date -u +%FT%TZ) failed to obtain URL, retrying" >> "$LOG_FILE"
  fi

  # Give the quick tunnel's DNS record time to propagate before health checks.
  sleep 20
  FAIL_COUNT=0
  while kill -0 "$CF_PID" 2>/dev/null; do
    if [ -n "$URL" ] && ! curl -s -o /dev/null --max-time 10 "$URL"; then
      FAIL_COUNT=$((FAIL_COUNT + 1))
      echo "$(date -u +%FT%TZ) health check failed ($FAIL_COUNT/3) for $URL" >> "$LOG_FILE"
      if [ "$FAIL_COUNT" -ge 3 ]; then
        echo "$(date -u +%FT%TZ) restarting after repeated failures" >> "$LOG_FILE"
        kill "$CF_PID" 2>/dev/null
        break
      fi
    else
      FAIL_COUNT=0
    fi
    sleep 20
  done
  wait "$CF_PID" 2>/dev/null
  echo "$(date -u +%FT%TZ) cloudflared exited, restarting in 2s" >> "$LOG_FILE"
  sleep 2
done
