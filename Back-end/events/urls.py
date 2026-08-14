from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import EventRSVPDetailView, EventRSVPListCreateView, EventViewSet

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
]
