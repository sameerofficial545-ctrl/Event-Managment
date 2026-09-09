import os, sys, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "Back-end"))
os.environ["DJANGO_SETTINGS_MODULE"] = "config.settings"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ.pop("DB_HOST", None)
import django
django.setup()
from django.conf import settings
settings.ALLOWED_HOSTS.append("testserver")
settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.db import connection
from django.test.utils import CaptureQueriesContext
from django.utils import timezone
from rest_framework.test import APIClient
from events.models import Event, Guest
call_command("migrate", verbosity=0)
user=get_user_model().objects.create_user(username="benchmark",email="benchmark@example.invalid")
event=Event.objects.create(title="Benchmark",start_time=timezone.now(),organizer=user)
Guest.objects.bulk_create([Guest(event=event,name=f"Guest {i:04}",email=f"guest{i}@example.invalid") for i in range(1000)])
client=APIClient()
client.force_authenticate(user)
with CaptureQueriesContext(connection) as capture:
    response=client.get(f"/api/events/{event.pk}/guests/")
assert response.status_code==200 and len(response.data)==1000
print(json.dumps({"guest_count":len(response.data),"query_count":len(capture),"queries":[q["sql"] for q in capture]},indent=2))
