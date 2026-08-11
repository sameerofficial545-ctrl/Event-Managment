from django.contrib import admin

from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'organizer', 'start_time', 'end_time']
    list_filter = ['organizer']
    search_fields = ['title', 'location']
