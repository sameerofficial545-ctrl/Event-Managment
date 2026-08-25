from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import RSVP, Event, Guest
from .serializers import EventSerializer, GuestSerializer, RSVPSerializer


class IsOrganizerOrReadOnly(permissions.BasePermission):
    """Anyone authenticated can read; only the event's organizer can write."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.organizer_id == request.user.id


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrganizerOrReadOnly]
    queryset = Event.objects.all().select_related('organizer')

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)


class EventRSVPListCreateView(generics.ListCreateAPIView):
    """
    Nested under /api/events/<event_id>/rsvps/.

    GET: the event's organizer sees every RSVP; anyone else sees only
    their own (0 or 1 - never someone else's response).
    POST: RSVPs (or changes your existing RSVP) as the current user -
    an upsert, so re-submitting just updates your status instead of
    erroring on the one-per-user constraint.
    """

    serializer_class = RSVPSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_event(self):
        return get_object_or_404(Event, pk=self.kwargs['event_id'])

    def get_queryset(self):
        event = self.get_event()
        if event.organizer_id == self.request.user.id:
            return event.rsvps.all()
        return event.rsvps.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        event = self.get_event()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        status_value = serializer.validated_data.get('status', RSVP.GOING)

        rsvp, created = RSVP.objects.update_or_create(
            event=event,
            user=request.user,
            defaults={'status': status_value},
        )
        output = self.get_serializer(rsvp)
        return Response(
            output.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class EventRSVPDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Nested under /api/events/<event_id>/rsvps/<pk>/.

    Scoped to the requesting user's own RSVP only - you can check,
    change, or cancel your own response, but not anyone else's (the
    organizer views everyone else's via the list endpoint instead).
    """

    serializer_class = RSVPSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RSVP.objects.filter(event_id=self.kwargs['event_id'], user=self.request.user)


class EventGuestListCreateView(generics.ListCreateAPIView):
    """
    Nested under /api/events/<event_id>/guests/.

    The guest list is the organizer's private invite planning list, so
    only the event's organizer may view or add to it.
    """

    serializer_class = GuestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_event(self):
        event = get_object_or_404(Event, pk=self.kwargs['event_id'])
        if event.organizer_id != self.request.user.id:
            raise PermissionDenied("Only the event's organizer can manage its guest list.")
        return event

    def get_queryset(self):
        return self.get_event().guests.all()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['event'] = self.get_event()
        return context

    def perform_create(self, serializer):
        serializer.save(event=self.get_event())


class EventGuestDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Nested under /api/events/<event_id>/guests/<pk>/, organizer-only."""

    serializer_class = GuestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_event(self):
        event = get_object_or_404(Event, pk=self.kwargs['event_id'])
        if event.organizer_id != self.request.user.id:
            raise PermissionDenied("Only the event's organizer can manage its guest list.")
        return event

    def get_queryset(self):
        return Guest.objects.filter(event=self.get_event())

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['event'] = self.get_event()
        return context
