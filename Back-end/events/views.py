from rest_framework import permissions, viewsets

from .models import Event
from .serializers import EventSerializer


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Each user only ever sees and manages their own events - scoping
        # the queryset this way also means a PATCH/DELETE on someone
        # else's event ID 404s instead of leaking that the event exists.
        return Event.objects.filter(organizer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)
