from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    EventGuestDetailView,
    EventGuestListCreateView,
    EventRSVPDetailView,
    EventRSVPListCreateView,
    EventViewSet,
)

router = DefaultRouter()
router.register('', EventViewSet, basename='event')

urlpatterns = router.urls + [
    path(
        '<int:event_id>/rsvps/',
        EventRSVPListCreateView.as_view(),
        name='event-rsvp-list',
    ),
    path(
        '<int:event_id>/rsvps/<int:pk>/',
        EventRSVPDetailView.as_view(),
        name='event-rsvp-detail',
    ),
    path(
        '<int:event_id>/guests/',
        EventGuestListCreateView.as_view(),
        name='event-guest-list',
    ),
    path(
        '<int:event_id>/guests/<int:pk>/',
        EventGuestDetailView.as_view(),
        name='event-guest-detail',
    ),
]
