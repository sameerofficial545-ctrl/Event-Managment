import json
import os
from io import StringIO

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django

django.setup()

from django.core.management import call_command


def handler(event, context):
    event = event or {}
    body = event.get('body')
    if isinstance(body, str):
        try:
            body = json.loads(body)
        except json.JSONDecodeError:
            body = {}
    payload = body if isinstance(body, dict) else event
    hours = max(1, min(float(payload.get('hours', 24)), 168))
    dry_run = bool(payload.get('dry_run', False))
    if os.environ.get('REMINDER_TASK_DEFINITION'):
        import boto3

        command = ['python', 'manage.py', 'send_event_reminders', '--hours', str(hours)]
        if dry_run:
            command.append('--dry-run')
        response = boto3.client('ecs').run_task(
            cluster=os.environ['ECS_CLUSTER'], launchType='FARGATE',
            taskDefinition=os.environ['REMINDER_TASK_DEFINITION'], count=1,
            networkConfiguration={'awsvpcConfiguration': {
                'subnets': os.environ['ECS_SUBNETS'].split(','),
                'securityGroups': [os.environ['ECS_SECURITY_GROUP']],
                'assignPublicIp': 'ENABLED',
            }},
            overrides={'containerOverrides': [{'name': 'backend', 'command': command}]},
        )
        failures = response.get('failures', [])
        if failures:
            raise RuntimeError(f'ECS reminder task failed to launch: {failures}')
        task_arn = response['tasks'][0]['taskArn']
        result = {'ok': True, 'dry_run': dry_run, 'hours': hours, 'task_arn': task_arn}
        return {'statusCode': 202, 'headers': {'content-type': 'application/json'}, 'body': json.dumps(result)}
    output = StringIO()
    args = ['--hours', str(hours)]
    if dry_run:
        args.append('--dry-run')
    call_command('send_event_reminders', *args, stdout=output)
    result = {'ok': True, 'dry_run': dry_run, 'hours': hours, 'result': output.getvalue().strip()}
    return {'statusCode': 200, 'headers': {'content-type': 'application/json'}, 'body': json.dumps(result)}
