#!/usr/bin/env bash
set -e

echo "⏳ Waiting for Postgres…"
python - <<'PY'
import os, sys, time
import psycopg2
for i in range(60):
    try:
        psycopg2.connect(
            dbname=os.environ["POSTGRES_DB"],
            user=os.environ["POSTGRES_USER"],
            password=os.environ["POSTGRES_PASSWORD"],
            host=os.environ["POSTGRES_HOST"],
            port=os.environ.get("POSTGRES_PORT", "5432"),
            connect_timeout=2,
        ).close()
        print("✅ Postgres ready")
        sys.exit(0)
    except Exception:
        time.sleep(1)
print("❌ Postgres not ready after 60s")
sys.exit(1)
PY

echo "🔄 Running migrations…"
python manage.py migrate --noinput

echo "🚀 Starting: $*"
exec "$@"