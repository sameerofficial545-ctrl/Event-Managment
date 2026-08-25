from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField('email address', unique=True)


class UserSession(models.Model):
    """
    One row per issued JWT access token. Lets us actually revoke a
    token on logout (a bare JWT stays valid until it expires, however
    it's dropped, so `is_active` is the switch a real logout flips) and
    see who's currently signed in.
    """

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions')
    token = models.TextField()
    login_time = models.DateTimeField(auto_now_add=True)
    expiry_time = models.DateTimeField()
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-login_time']

    def __str__(self):
        return f'{self.user} ({"active" if self.is_active else "revoked"})'
