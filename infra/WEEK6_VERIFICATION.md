# Eventify Week 6: Serverless Reminders and Tracing

Verified in AWS account `088167543385`, region `us-east-1`, on 10 September 2026.

## Architecture

```text
EventBridge Scheduler (hourly) ─┐
                               ├─> Lambda ─> ECS Fargate one-off task ─> RDS / email
API Gateway POST /reminders ───┘

Browser/API ─> ALB ─> Django ECS container ─UDP 2000─> X-Ray daemon ─> AWS X-Ray
```

Lambda acts as the small event-driven controller. The existing Django reminder command runs as a one-off Fargate task so it can reuse the production database, secrets, network, and email configuration. The API route uses `AWS_IAM` authorization and is not public.

## Daily task evidence

### Monday — Lambda and API Gateway

- Lambda function: `event-mgmt-reminders`
- Runtime packaging: container image in ECR
- Configuration: 512 MB memory, 120-second timeout, X-Ray active
- API Gateway route: `POST /reminders`
- API endpoint: `https://sakcexd476.execute-api.us-east-1.amazonaws.com/reminders`
- Authorization: `AWS_IAM`; an unsigned request was tested and correctly returned HTTP 403.

### Tuesday — Event-driven reminder schedule

- EventBridge Scheduler: `event-mgmt-lambda-reminders`
- State: `ENABLED`
- Schedule: `rate(1 hour)`
- Input: `{"hours":24}`
- Retry policy: two retries, maximum event age 3,600 seconds
- The older direct ECS schedule `event-mgmt-hourly-reminders` is `DISABLED`, preventing duplicate executions.

### Wednesday — X-Ray request tracing

- Django uses `aws-xray-sdk==2.15.0` and the X-Ray middleware.
- ECS task revision `event-mgmt-backend:7` runs a non-essential `xray-daemon` sidecar.
- ECS task role has `AWSXRayDaemonWriteAccess`.
- The live backend and X-Ray containers were both running; Django was `HEALTHY`.
- X-Ray successfully received segments for `event-mgmt-backend` and `event-mgmt-reminders`.
- Verified request traces:
  - `POST /api/events/` — trace `1-6aa23e93-741c9c0520ea63874524be48`
  - `GET /api/events/1/guests/` — trace `1-6aa23e93-185c4cdc46c128d342112152`
- These requests were deliberately unsigned, so HTTP 401 was expected. This proves the event-creation and guest-list paths are traced without changing production data.

### Thursday — Lambda testing and optimization

- A `--dry-run` option was added to the reminder command, allowing safe production verification without sending email or updating reminder flags.
- Direct Lambda dry-run returned Lambda HTTP 200 and application HTTP 202.
- Lambda launched ECS task `28ea5cfa87cb40f1a29cc4aa7167a83f`.
- The backend container exited with code `0`; its log reported `No events due for a reminder.`
- Observed Lambda duration was approximately 2.1–2.2 seconds, far below its 120-second timeout and 60-second alarm threshold.
- `hours` is validated and limited to 1–168. Scheduler retry behavior is explicitly bounded.
- No reserved concurrency is configured because the account concurrency quota is 10 and Lambda requires at least 10 unreserved executions. On-demand Lambda scaling remains enabled within the account quota.
- The deployed backend image passed all 8 Django tests.

### Friday — Documentation and monitoring

- CloudFormation templates:
  - `infra/week4-stack.yaml` — Django X-Ray sidecar, IAM permission, and disabled legacy reminder schedule
  - `infra/week6-serverless.yaml` — Lambda, API Gateway, Scheduler, IAM, logs, and alarms
- Both templates pass `cfn-lint`.
- CloudWatch log groups:
  - `/aws/lambda/event-mgmt-reminders`
  - `/ecs/event-mgmt-backend`
- CloudWatch alarms:
  - `event-mgmt-lambda-errors` — state `OK`, threshold 1 error in 5 minutes
  - `event-mgmt-lambda-duration` — state `OK`, threshold 60 seconds average in 5 minutes
- Existing CloudWatch dashboard: `event-mgmt`

## How to show this in the AWS Console

1. Open **Lambda > Functions > event-mgmt-reminders**. Show Configuration, Monitor, and the X-Ray tracing setting.
2. Open **API Gateway > event-mgmt-reminders > Routes**. Show `POST /reminders` and `AWS_IAM` authorization.
3. Open **EventBridge > Scheduler > Schedules > event-mgmt-lambda-reminders**. Show Enabled, hourly frequency, target, and retries.
4. Open **ECS > Clusters > event-mgmt-cluster > Services > event-mgmt-backend**. Show 1/1 running and task definition revision 7; open the task to show `backend` and `xray-daemon`.
5. Open **CloudWatch > X-Ray traces**. Search for service `event-mgmt-backend`, then open the two trace IDs listed above.
6. Open **CloudWatch > Alarms**. Show both Lambda alarms in `OK` state.
7. Open **CloudWatch > Dashboards > event-mgmt** and **Logs Insights** to show monitoring and logs.

## Maintenance note

AWS has announced end of support for the X-Ray SDKs and daemon on 25 February 2027. This implementation satisfies the internship X-Ray task; a future production improvement is migration to AWS Distro for OpenTelemetry.
