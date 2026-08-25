from rest_framework import permissions

ADMIN_GROUP = 'Admin'
ATTENDEE_GROUP = 'Attendee'


def is_admin(user):
    """True for staff accounts or anyone in the Admin group."""
    return bool(user and user.is_authenticated and (user.is_staff or user.groups.filter(name=ADMIN_GROUP).exists()))


def get_role(user):
    return ADMIN_GROUP if is_admin(user) else ATTENDEE_GROUP


class IsAdminRole(permissions.BasePermission):
    """Allows access only to users with the Admin role (staff or Admin group)."""

    def has_permission(self, request, view):
        return is_admin(request.user)
