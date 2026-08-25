from django.contrib.auth.models import Group
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import User
from .permissions import ADMIN_GROUP, ATTENDEE_GROUP


@receiver(post_save, sender=User)
def sync_role_group(sender, instance, **kwargs):
    """Keeps each user in exactly one role group, matching their is_staff flag."""
    target_name = ADMIN_GROUP if instance.is_staff else ATTENDEE_GROUP
    other_name = ATTENDEE_GROUP if instance.is_staff else ADMIN_GROUP

    target_group, _ = Group.objects.get_or_create(name=target_name)
    if not instance.groups.filter(pk=target_group.pk).exists():
        instance.groups.add(target_group)

    other_group = Group.objects.filter(name=other_name).first()
    if other_group and instance.groups.filter(pk=other_group.pk).exists():
        instance.groups.remove(other_group)
