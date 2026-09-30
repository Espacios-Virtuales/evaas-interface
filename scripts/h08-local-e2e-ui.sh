#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
for file in src/environments/environment.ts src/environments/environment.development.ts; do
  grep -Fq "apiUrl: 'http://localhost:8091'" "$file" || { echo "Unsafe E2E API URL in $file" >&2; exit 1; }
done
code="$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' --max-time 5 http://127.0.0.1:8091/api/v1/me/instruments/liora/evidence)"
[[ "$code" == 401 ]] || { echo "Local CORE is not ready (HTTP $code)" >&2; exit 1; }
exec npm start -- --host 127.0.0.1 --port 4200 --configuration development
