import os, json, hashlib, statistics
import psycopg2
SOURCE = os.environ["DB_HOST"]
RESTORE = "event-mgmt-restore-test-20260907.cib48kc6u9rm.us-east-1.rds.amazonaws.com"
assert SOURCE != RESTORE and RESTORE.startswith("event-mgmt-restore-test-")
def connect(host):
    return psycopg2.connect(host=host, dbname=os.environ["DB_NAME"], user=os.environ["DB_USER"], password=os.environ["DB_PASSWORD"], sslmode="require", connect_timeout=20)
def fingerprint(host):
    result = {}
    with connect(host) as conn:
        conn.set_session(readonly=True)
        with conn.cursor() as cur:
            for table in ["django_migrations", "users_user", "events_event", "events_guest", "events_rsvp"]:
                cur.execute('SELECT row_to_json(t)::text FROM "' + table + '" t ORDER BY id')
                digest = hashlib.sha256()
                count = 0
                for row in cur:
                    digest.update(row[0].encode())
                    digest.update(b"\n")
                    count += 1
                result[table] = {"rows":count, "sha256":digest.hexdigest()}
            cur.execute("SELECT count(*) FROM events_guest g LEFT JOIN events_event e ON g.event_id=e.id WHERE e.id IS NULL")
            result["orphan_guests"] = cur.fetchone()[0]
    return result
source, restored = fingerprint(SOURCE), fingerprint(RESTORE)
print("RESTORE_RESULT " + json.dumps({"source":source,"restored":restored,"exact_match":source==restored}), flush=True)
with connect(RESTORE) as conn:
    with conn.cursor() as cur:
        cur.execute("CREATE TEMP TABLE guest_benchmark (id bigint, event_id bigint, name varchar(150), email varchar(254), status varchar(12), notes varchar(255), created_at timestamptz, updated_at timestamptz)")
        cur.execute("INSERT INTO guest_benchmark SELECT n, (n-1)/1000+1, 'Guest '||lpad((100000-n)::text,6,'0'), 'guest'||n||'@example.invalid', 'invited', '', now(), now() FROM generate_series(1,100000) n")
        cur.execute("CREATE INDEX bench_event ON guest_benchmark(event_id)")
        cur.execute("CREATE UNIQUE INDEX bench_email ON guest_benchmark(event_id,email)")
        cur.execute("ANALYZE guest_benchmark")
        query = "SELECT * FROM guest_benchmark WHERE event_id=42 ORDER BY name"
        def measure():
            plans=[]
            for _ in range(11):
                cur.execute("EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) "+query)
                plans.append(cur.fetchone()[0][0])
            return {"median_execution_ms":statistics.median(p["Execution Time"] for p in plans[1:]),"plan":plans[-1]}
        before=measure()
        cur.execute("CREATE INDEX bench_event_name ON guest_benchmark(event_id,name)")
        cur.execute("ANALYZE guest_benchmark")
        after=measure()
        print("BENCHMARK_RESULT "+json.dumps({"rows":100000,"guests_per_event":1000,"repetitions":10,"before":before,"after":after}),flush=True)
os.environ["DB_HOST"] = RESTORE
os.environ["DJANGO_SETTINGS_MODULE"] = "config.settings"
import django
django.setup()
from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from events.models import Event
from events.views import EventGuestListCreateView
from rest_framework.test import APIRequestFactory, force_authenticate
executor = MigrationExecutor(connection)
assert not executor.migration_plan(executor.loader.graph.leaf_nodes()), "Restored schema has unapplied migrations"
event = Event.objects.select_related("organizer").first()
api_result = {"schema_current":True, "guest_api":"no event available"}
if event:
    request = APIRequestFactory().get("/api/events/%s/guests/" % event.pk)
    force_authenticate(request, event.organizer)
    response = EventGuestListCreateView.as_view()(request, event_id=event.pk)
    assert response.status_code == 200
    assert len(response.data) == event.guests.count()
    api_result["guest_api"] = {"status":response.status_code,"rows":len(response.data)}
print("RESTORED_APP_RESULT "+json.dumps(api_result),flush=True)
assert source == restored, "Restore differs from current source; investigate changes since restore point"
print("VERIFICATION_COMPLETE",flush=True)
