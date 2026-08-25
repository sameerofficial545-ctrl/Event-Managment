from django.test import TestCase
from django.urls import reverse


class UserTestCase(TestCase):
    def test_user_creation(self):
        response = self.client.post(reverse('register'), {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'Testpass123!',
            'password2': 'Testpass123!',
        })
        self.assertEqual(response.status_code, 201)