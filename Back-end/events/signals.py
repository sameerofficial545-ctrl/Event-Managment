from django.conf import settings
from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import RSVP, Guest

RSVP_STATUS_LABELS = {
    RSVP.GOING: 'going',
    RSVP.MAYBE: 'a maybe',
    RSVP.NOT_GOING: 'not going',
}


@receiver(post_save, sender=RSVP)
def notify_rsvp_saved(sender, instance, created, **kwargs):
    """Confirms an attendee's own RSVP by email as soon as they submit it."""
    if not instance.user.email:
        return

    event = instance.event
    label = RSVP_STATUS_LABELS.get(instance.status, instance.status)
    send_mail(
        subject=f'RSVP confirmed: {event.title}',
        message=(
            f"Hi {instance.user.first_name or instance.user.username},\n\n"
            f"You're marked as {label} for \"{event.title}\" "
            f'on {event.start_time.strftime("%b %d, %Y at %I:%M %p %Z")}.\n\n'
            f'Location: {event.location or "Not specified"}\n\n'
            "You can change your response any time from the event's page."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[instance.user.email],
        fail_silently=True,
    )


@receiver(post_save, sender=Guest)
def notify_guest_invited(sender, instance, created, **kwargs):
    """Emails a newly added guest an invite as soon as the organizer adds them."""
    if not created:
        return

    event = instance.event
    send_mail(
        subject=f"You're invited: {event.title}",
        message=(
            f'Hi {instance.name},\n\n'
            f'{event.organizer.first_name or event.organizer.username} has invited you to '
            f'"{event.title}" on {event.start_time.strftime("%b %d, %Y at %I:%M %p %Z")}.\n\n'
            f'Location: {event.location or "Not specified"}\n\n'
            f'{event.description}'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[instance.email],
        fail_silently=True,
    )
