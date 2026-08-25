from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand
from django.utils import timezone

from events.models import RSVP, Event


class Command(BaseCommand):
    """
    Emails a one-time reminder to everyone connected to an event (RSVP'd
    attendees marked "going", plus invited guests) once it's starting
    within the given window. Meant to be run on a schedule - e.g. a cron
    job or Windows Task Scheduler entry every 15-30 minutes:

        python manage.py send_event_reminders

    `Event.reminder_sent` stops the same event being reminded twice
    across repeated runs.
    """

    help = "Send a reminder email for events starting within the next N hours."

    def add_arguments(self, parser):
        parser.add_argument(
            '--hours',
            type=float,
            default=24,
            help='How many hours ahead to look for events to remind about (default: 24).',
        )

    def handle(self, *args, **options):
        now = timezone.now()
        window_end = now + timedelta(hours=options['hours'])

        due_events = Event.objects.filter(
            reminder_sent=False,
            start_time__gte=now,
            start_time__lte=window_end,
        )

        if not due_events.exists():
            self.stdout.write('No events due for a reminder.')
            return

        for event in due_events:
            attendee_emails = event.rsvps.filter(status=RSVP.GOING).exclude(
                user__email=''
            ).values_list('user__email', flat=True)
            guest_emails = event.guests.exclude(email='').values_list('email', flat=True)
            recipients = sorted(set(attendee_emails) | set(guest_emails))

            for email in recipients:
                send_mail(
                    subject=f'Reminder: {event.title} is coming up',
                    message=(
                        f'"{event.title}" starts '
                        f'{event.start_time.strftime("%b %d, %Y at %I:%M %p %Z")}.\n\n'
                        f'Location: {event.location or "Not specified"}\n\n'
                        f'{event.description}'
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=True,
                )

            event.reminder_sent = True
            event.save(update_fields=['reminder_sent'])
            self.stdout.write(
                f'Sent reminder for "{event.title}" to {len(recipients)} recipient(s).'
            )
