# Infrastructure & CI/CD — Event Management Platform

Week 4: containerize the app and get it onto ECS Fargate via a
CodePipeline/CodeBuild pipeline, fronted by a GitHub Actions CI gate and
backed by automatic + manual rollback.

## Current AWS status (verified 9 September 2026)

The application is deployed in us-east-1 using stack event-mgmt-week4 and
the consolidated template infra/week4-stack.yaml. RDS event-mgmt-postgres
is available and connected to the running ECS backend. Seven-day backups,
Container Insights, five alarms, and the event-mgmt dashboard are configured.
The SNS alarm topic currently has no subscriptions.

See [Week 5 verification](week5-verification.md) for restore-test evidence,
guest-query measurements, and the exact deployment status of the latest changes.

## What's here

```
Back-end/Dockerfile           Backend image (Python 3.12-slim + gunicorn)
Back-end/.dockerignore
Front-end/Dockerfile          Frontend image (multi-stage: vite build -> nginx)
Front-end/nginx.conf          SPA fallback + /healthz
Front-end/.dockerignore
docker-compose.yml            Local 3-container stack (db + backend + frontend)

.github/workflows/ci.yml      GitHub Actions: test + lint + docker build on every push/PR
.github/workflows/rollback.yml GitHub Actions: manual rollback of an ECS service (workflow_dispatch)

infra/ecs/*.json               Fargate task & service definitions (backend + frontend)
infra/codebuild/*.yml          CodeBuild buildspecs (test -> build -> push -> imagedefinitions.json)
infra/pipeline/pipeline.yaml   CloudFormation: ECR repos, CodeBuild projects, CodePipeline
```

## CI/CD pipeline overview

Two pipelines, each doing a different job:

1. **GitHub Actions (`.github/workflows/ci.yml`)** — fast feedback, runs
   entirely on GitHub's runners, no AWS access needed. Triggers
   automatically on every push and pull request to `main`:
   - `backend-test`: `python manage.py test` (Django's test runner, sqlite
     in-memory, no external DB needed).
   - `frontend-build`: `oxlint` then `vite build`.
   - `docker-build`: builds both Dockerfiles, so a broken Dockerfile fails
     CI before it ever reaches CodeBuild.
   This is meant to be wired up as a required check on branch protection
   for `main`, so nothing merges without passing.

2. **AWS CodePipeline (`infra/pipeline/pipeline.yaml`)** — the actual
   deploy. Source stage uses a `CodeStarSourceConnection` action against
   the `sameerofficial545-ctrl/Event-Managment` GitHub repo; CodePipeline
   provisions the underlying EventBridge rule/webhook itself when the
   pipeline is created, so **every push to `main` triggers a pipeline
   execution automatically** — no polling, no separate webhook resource to
   maintain. From there: CodeBuild re-runs backend tests / frontend lint,
   builds+pushes both Docker images to ECR, then an ECS deploy action
   updates each Fargate service to the new image.

Both CodeBuild projects use `Cache: LOCAL` (`LOCAL_DOCKER_LAYER_CACHE` +
`LOCAL_SOURCE_CACHE`) so repeat builds reuse Docker layers and the git
checkout instead of starting cold every time.

## Rollback

Two layers, for two different failure modes:

- **Automatic — ECS deployment circuit breaker.** Both
  `infra/ecs/backend-service.json` and `frontend-service.json` set
  `deploymentConfiguration.deploymentCircuitBreaker: { enable: true,
  rollback: true }`. If a new deployment's tasks fail to reach a healthy
  state (crash loop, failed container health check), ECS stops the
  rollout and automatically redeploys the last known-good task
  definition. No human involvement needed — this is the main defense
  against a bad deploy.
- **Manual — `.github/workflows/rollback.yml`.** Covers the case the
  circuit breaker can't: a deployment that *passes* health checks but is
  functionally broken (e.g. a bad migration, wrong env var). Trigger it
  from the Actions tab (`workflow_dispatch`), pick `backend` or
  `frontend`, optionally give an explicit task definition revision
  (defaults to "one before the service's current revision"). It updates
  the ECS service to that task definition and waits for it to stabilize.
  Needs `AWS_DEPLOY_ROLE_ARN` and `AWS_REGION` configured as repo/
  environment secrets (OIDC role with `ecs:UpdateService` /
  `ecs:DescribeServices` on the cluster) — not set up yet, see
  Prerequisites below.

## What's actually been verified (locally, with Docker)

- Both Dockerfiles build cleanly and run as non-root.
- `docker compose up` brings up Postgres + backend + frontend together;
  Django migrates real tables into Postgres (not sqlite), registers a user
  through the full HTTP path, and issues a JWT with the correct RBAC role.
- Backend `/healthz/` and frontend `/healthz` respond correctly from
  *inside* the container (this matters - nginx's `listen 80` only binds
  IPv4, so a naive `wget http://localhost/...` health check fails over
  `::1`; the task definitions use `127.0.0.1` explicitly for exactly this
  reason - caught by actually running it, not by reading the config).
- `infra/pipeline/pipeline.yaml` passes `cfn-lint` clean; all JSON/YAML
  and workflow YAML files here parse without error.
- Every command `.github/workflows/ci.yml` runs was executed locally and
  passes as of this writing: `python manage.py test` (1 test, OK),
  `oxlint` (0 errors, 2 pre-existing fast-refresh warnings), `vite build`,
  and both `docker build`s. The workflow itself hasn't been observed
  running on GitHub's runners yet — that only happens once this is pushed.

## Deployment status and configuration

The earlier prerequisite-only instructions in this section are superseded:
the VPC configuration, ECS services, ALB, RDS, Secrets Manager integration,
GitHub connection, and pipeline now exist. Use infra/week4-stack.yaml as
the current consolidated infrastructure definition. Files under infra/ecs
and infra/pipeline are earlier standalone examples and contain placeholders.

The backend receives DB_HOST, DB_NAME and DB_PORT through its task environment,
and DB_USER / DB_PASSWORD through Secrets Manager references. Do not copy secret
values into documentation.

At the latest inspection, the pipeline reported Source Succeeded, Build Failed,
and no successful Deploy stage. An earlier demonstration recorded a CodeBuild
quota issue; inspect the current failure before retrying. The guest-query change
described in week5-verification.md was deployed manually through ECR and ECS.

### Testing the trigger and rollback, once AWS is live

- **Automatic deploy trigger:** push any commit to `main` and watch
  CodePipeline → `event-mgmt-pipeline` start a new execution within a few
  seconds, with no manual "Release change" click needed. If it doesn't
  fire, the GitHub connection from step 1 is the first thing to check —
  it can end up in a `PENDING` (unauthorized) state.
- **Automatic rollback:** register a deliberately broken task definition
  revision (e.g. a bad `image` tag) and `aws ecs update-service` to it;
  the circuit breaker should detect the failed tasks and revert the
  service to the previous revision on its own — watch it in the ECS
  console's "Deployments" tab for the service.
- **Manual rollback:** run `.github/workflows/rollback.yml` from the
  Actions tab against a known-good revision and confirm
  `aws ecs describe-services` shows the service back on that revision
  and stable.

## Local development

```bash
docker compose up --build
# frontend: http://localhost:8080
# backend:  http://localhost:8000/api
```
