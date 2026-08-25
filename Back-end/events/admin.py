from django.contrib import admin

from .models import RSVP, Event, Guest


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'organizer', 'start_time', 'end_time']
    list_filter = ['organizer']
    search_fields = ['title', 'location']


@admin.register(RSVP)
class RSVPAdmin(admin.ModelAdmin):
    list_display = ['event', 'user', 'status', 'updated_at']
    list_filter = ['status']
    search_fields = ['event__title', 'user__username']


@admin.register(Guest)
class GuestAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'event', 'status', 'updated_at']
    list_filter = ['status']
    search_fields = ['name', 'email', 'event__title']
