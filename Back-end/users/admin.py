from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User, UserSession

admin.site.register(User, UserAdmin)


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_active', 'login_time', 'last_activity', 'expiry_time']
    list_filter = ['is_active']
    search_fields = ['user__username', 'user__email']
