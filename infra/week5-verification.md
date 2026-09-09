# Week 5 verification — 7 September 2026

Live status was rechecked on 9 September 2026: the production database was
available with a seven-day retention period and a current point-in-time restore
window; the `event-mgmt` CloudWatch dashboard returned without validation
messages; all five Eventify alarms were `OK`; and no restore-test instance remained.

## Completion

| Task | Result |
| --- | --- |
| Restore automatic backup and verify recovered data | Passed |
| Check restored schema and guest-list application view | Passed |
| Measure and optimize guest-list database queries | Completed; 3 queries reduced to 2 |
| Evaluate guest-list indexing on PostgreSQL | Completed; candidate index did not justify adoption |
| Update database and monitoring documentation | Completed |
| Clean up temporary restore resources | Confirmed: temporary instance and automated backup record removed |

## Backup recovery evidence

Region: us-east-1. Source database: event-mgmt-postgres.
Restored to 2026-09-07T05:20:14Z in the separate private instance
event-mgmt-restore-test-20260907 (db.t4g.micro, existing database subnet/security groups).
Production traffic continued using the source database throughout.

RDS reported the restore completed at 05:38:39 UTC. Verification ran while the
restored instance was taking its initial backup. The isolated ECS task exited
with code 0 and logged VERIFICATION_COMPLETE.

| Table | Source rows | Restored rows | SHA-256 comparison |
| --- | ---: | ---: | --- |
| django_migrations | 29 | 29 | Exact match |
| users_user | 12 | 12 | Exact match |
| events_event | 19 | 19 | Exact match |
| events_guest | 109 | 109 | Exact match |
| events_rsvp | 146 | 146 | Exact match |

The verifier hashed complete rows in primary-key order without logging row data.
There were zero orphan guests in both databases. The restored schema had no
unapplied migrations for the deployed backend image. An authenticated request
to the restored guest-list view returned HTTP 200 and the expected six guests
for the selected event.

Scope: the five listed tables were checked, not every table in PostgreSQL.
The guest view check was an in-process application check, not an ALB traffic
switch or a complete authentication-system recovery drill.
No differences were observed between the selected restore point and the current
source for the checked tables. Future drills must account for writes after the
chosen restore timestamp.

Cleanup was confirmed by listing RDS instances (only the production instance remained)
and checking that the test instance had no automated backup record. The verification
ECS task was stopped with exit code 0. No final snapshot of the temporary clone was retained.

Raw aggregate checksums, execution plans and ECS task identifier are recorded in
[week5-verification-results.json](week5-verification-results.json).

## Guest-list query analysis and change

The real Django guest-list endpoint was measured on an isolated in-memory SQLite
database with 1,000 synthetic guests. Forced authentication excluded authentication
queries. Originally it issued three SQL queries: two identical authorized event
lookups and one guest-list query.

Both guest views now cache the authorized event object for one request using
Django's cached_property. The list endpoint now issues two SQL queries, a reduction
of one query (33%), and still returns all 1,000 guests in name order.
This is a query-count reduction, not a claim of 33% lower response latency.
The cache is attached to the individual view instance, so authorization results
are not shared across requests.

Six backend tests passed, including list/detail query budgets, cross-request
authorization, event scoping, and guest create/update behavior.
The migration consistency check reported no changes.

## PostgreSQL index benchmark

The restored PostgreSQL instance hosted a session-local temporary table containing
100,000 synthetic guests across 100 events. The query retrieved all 1,000 guests
for one event ordered by name, matching the application's unpaginated query shape.
The baseline had event_id and unique (event_id, email) indexes.

EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON), with one warm-up and ten measured
repetitions per condition, produced:

| Condition | Median database execution time |
| --- | ---: |
| Existing index pattern | 3.9955 ms |
| Additional (event_id, name) index | 3.9845 ms |

PostgreSQL selected the existing event index followed by a quicksort in both
conditions. The approximately 0.011 ms difference is not meaningful evidence of
improvement. No additional application index or migration was added.
The useful implemented optimization is removal of the redundant event lookup.

These timings cover a synthetic, warm-cache database query, not HTTP latency or
a production load test. Production held only 109 guests during this audit;
the benchmark does not establish a current production latency problem.
The temporary benchmark table and its indexes disappeared when the connection closed.

## RDS and monitoring configuration

- RDS event-mgmt-postgres is private and available, with seven-day automatic backups.
- The backend ECS service has one running task and receives its RDS connection
  settings through task environment variables and Secrets Manager references.
- ECS Container Insights and CloudWatch container logging are enabled.
- The event-mgmt dashboard is readable using the configured AWS identity.
- All five Eventify alarms were OK during the initial inspection: backend CPU,
  frontend CPU, RDS CPU, RDS free storage, and ALB target 5xx responses.
- The SNS alarm topic currently has no subscriptions. Email notification delivery
  is not configured even though metrics, alarms and the dashboard exist.

## Reproduction

- scripts/measure_guest_queries.py runs the isolated guest API query measurement.
- scripts/verify_restored_database.py performs the database checks and benchmark.
- scripts/aws_verification_task.py launches an isolated ECS task using backend
  revision 5. An existing scripts/verification-task.json prevents duplicate launches.
- The AWS scripts are specific to this test date, account, region and restore
  endpoint. Review these values and archive the previous task record before reuse.
- Run python manage.py test from Back-end for the regression suite.
- Source verification queries use read-only transactions. Benchmark writes occur
  only in a temporary table on the restored instance.

## Deployment and remaining operational items

The query optimization was tested and deployed to ECS through the manual ECR
deployment path. No production database schema change was required.
The pipeline currently reports Source Succeeded, Build Failed, and no completed
Deploy stage. An earlier demonstration recorded a CodeBuild quota issue; the
current failure cause was not re-established in this audit.

Deploy the tested application change through the normal deployment process.
Configure and confirm an SNS subscription if email notifications are required.
These operational items are separate from the completed restore and query analysis.
