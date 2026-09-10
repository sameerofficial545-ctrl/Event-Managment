import json
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.management import call_command
from django.test import TestCase, override_settings
from django.utils import timezone

from config.lambda_handler import handler
from events.models import Event, RSVP


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class ReminderTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user('reminder-user', 'reminder@example.invalid')
        self.event = Event.objects.create(
            title='Reminder test', organizer=self.user,
            start_time=timezone.now() + timedelta(hours=2),
        )
        RSVP.objects.create(event=self.event, user=self.user, status=RSVP.GOING)
        mail.outbox.clear()

    def test_dry_run_does_not_send_or_mark_event(self):
        call_command('send_event_reminders', '--hours', '24', '--dry-run')
        self.event.refresh_from_db()
        self.assertFalse(self.event.reminder_sent)
        self.assertEqual(len(mail.outbox), 0)

    def test_lambda_handler_accepts_api_gateway_body(self):
        response = handler({'body': json.dumps({'hours': 6, 'dry_run': True})}, None)
        body = json.loads(response['body'])
        self.assertEqual(response['statusCode'], 200)
        self.assertTrue(body['dry_run'])
        self.assertIn('Would send reminder', body['result'])
