from django.db import migrations

ADMIN_GROUP = 'Admin'
ATTENDEE_GROUP = 'Attendee'


def create_role_groups(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    User = apps.get_model('users', 'User')

    admin_group, _ = Group.objects.get_or_create(name=ADMIN_GROUP)
    attendee_group, _ = Group.objects.get_or_create(name=ATTENDEE_GROUP)

    for user in User.objects.all():
        group = admin_group if user.is_staff else attendee_group
        user.groups.add(group)


def remove_role_groups(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Group.objects.filter(name__in=[ADMIN_GROUP, ATTENDEE_GROUP]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0001_initial'),
        ('users', '0002_usersession'),
    ]

    operations = [
        migrations.RunPython(create_role_groups, remove_role_groups),
    ]
