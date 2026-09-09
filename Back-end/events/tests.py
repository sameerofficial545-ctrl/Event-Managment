from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from .models import Event, Guest


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class GuestQueryTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.owner = get_user_model().objects.create_user(username='owner', email='owner@example.invalid')
        cls.other = get_user_model().objects.create_user(username='other', email='other@example.invalid')
        cls.event = Event.objects.create(title='Performance', organizer=cls.owner, start_time=timezone.now())
        cls.other_event = Event.objects.create(title='Private', organizer=cls.other, start_time=timezone.now())
        Guest.objects.bulk_create([
            Guest(event=cls.event, name=f'Guest {i:04}', email=f'g{i}@example.invalid')
            for i in range(100)
        ])
        cls.private_guest = Guest.objects.create(event=cls.other_event, name='Private', email='private@example.invalid')

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(self.owner)

    def test_guest_list_uses_two_queries_and_keeps_name_order(self):
        with self.assertNumQueries(2):
            response = self.client.get(reverse('event-guest-list', args=[self.event.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 100)
        self.assertEqual([g['name'] for g in response.data], sorted(g['name'] for g in response.data))

    def test_guest_detail_uses_two_queries(self):
        guest = self.event.guests.first()
        with self.assertNumQueries(2):
            response = self.client.get(reverse('event-guest-detail', args=[self.event.pk, guest.pk]))
        self.assertEqual(response.status_code, 200)

    def test_event_cache_does_not_cross_requests(self):
        self.assertEqual(self.client.get(reverse('event-guest-list', args=[self.event.pk])).status_code, 200)
        self.assertEqual(self.client.get(reverse('event-guest-list', args=[self.other_event.pk])).status_code, 403)

    def test_guest_cannot_be_retrieved_under_another_event(self):
        response = self.client.get(reverse('event-guest-detail', args=[self.event.pk, self.private_guest.pk]))
        self.assertEqual(response.status_code, 404)

    def test_create_and_update_preserve_event_scoping(self):
        url = reverse('event-guest-list', args=[self.event.pk])
        response = self.client.post(url, {'name':'New', 'email':'new@example.invalid'}, format='json')
        self.assertEqual(response.status_code, 201)
        guest_id = response.data['id']
        response = self.client.patch(reverse('event-guest-detail', args=[self.event.pk, guest_id]), {'name':'Updated'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['event'], self.event.pk)
