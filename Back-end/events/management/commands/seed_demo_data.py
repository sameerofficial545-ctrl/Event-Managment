from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from events.models import Event, Guest, RSVP


EVENTS = [
    ('Design Forward Summit', 5, 10, 'HITEX Exhibition Center, Hyderabad', 'A full-day gathering for product designers, researchers, and creative technologists exploring the future of human-centered design.'),
    ('Indie Music Under the Stars', 8, 18, 'Shilparamam Amphitheatre, Hyderabad', 'An open-air evening of emerging artists, acoustic sets, food pop-ups, and a relaxed festival atmosphere.'),
    ('AI Builders Meetup', 12, 17, 'T-Hub, Raidurg', 'Practical demos, lightning talks, and networking for people building useful products with artificial intelligence.'),
    ('Sunday Farmers Market', 15, 8, 'KBR Park Entrance, Hyderabad', 'Meet local growers and discover seasonal produce, artisan bread, handmade goods, and sustainable living workshops.'),
    ('Startup Pitch Night', 19, 18, 'WE Hub, Jubilee Hills', 'Early-stage founders pitch bold ideas to mentors, investors, and a supportive community of entrepreneurs.'),
    ('Photography City Walk', 23, 6, 'Charminar, Hyderabad', 'A guided golden-hour photo walk through historic streets, markets, architecture, and everyday city stories.'),
    ('Frontend Engineering Lab', 28, 10, 'Microsoft Campus, Gachibowli', 'Hands-on sessions covering accessible interfaces, performance, animation, and modern React architecture.'),
    ('Wellness and Yoga Morning', 32, 7, 'Botanical Garden, Kondapur', 'A restorative outdoor session with guided yoga, breathwork, sound meditation, and a healthy community breakfast.'),
    ('Food Founders Festival', 38, 12, 'Necklace Road, Hyderabad', 'Taste inventive menus and meet the chefs, bakers, and founders shaping the city’s independent food scene.'),
    ('Community Tech Hackathon', 45, 9, 'IIIT Hyderabad', 'Teams spend a weekend prototyping digital solutions for education, accessibility, climate, and public services.'),
    ('Book Lovers Social', 52, 16, 'Lamakaan, Banjara Hills', 'Bring a favorite book, join friendly themed conversations, and exchange recommendations with fellow readers.'),
    ('Sustainable Living Expo', 61, 10, 'N Convention, Madhapur', 'Discover practical climate solutions, responsible brands, electric mobility, and low-waste lifestyle ideas.'),
    ('Career Connect 2026', 70, 9, 'Novotel HICC, Hyderabad', 'Connect with hiring teams, attend resume clinics, and hear candid career stories from industry leaders.'),
    ('Monsoon Marathon', 82, 5, 'People’s Plaza, Hyderabad', 'A scenic community run with 5K, 10K, and half-marathon routes for runners of every experience level.'),
    ('Digital Art Showcase', 95, 11, 'State Gallery of Art, Hyderabad', 'An immersive exhibition of motion design, generative art, interactive installations, and digital storytelling.'),
    ('Winter Charity Gala', 120, 19, 'Taj Krishna, Hyderabad', 'An elegant evening of music, stories, and fundraising in support of education programs for local children.'),
    ('Product Leadership Roundtable', -18, 17, 'T-Hub, Raidurg', 'A focused conversation for product leaders on strategy, team culture, discovery, and sustainable growth.'),
    ('Spring Cultural Carnival', -42, 11, 'Shilparamam, Hyderabad', 'A joyful celebration featuring regional dance, crafts, storytelling, food, and family-friendly performances.'),
]

PEOPLE = [
    ('aisha_khan', 'Aisha', 'Khan'), ('arjun_reddy', 'Arjun', 'Reddy'),
    ('meera_rao', 'Meera', 'Rao'), ('rohan_mehta', 'Rohan', 'Mehta'),
    ('sana_ali', 'Sana', 'Ali'), ('vikram_singh', 'Vikram', 'Singh'),
    ('neha_sharma', 'Neha', 'Sharma'), ('kabir_jain', 'Kabir', 'Jain'),
]


class Command(BaseCommand):
    help = 'Create a rich, repeatable demonstration dataset for Eventify.'

    def handle(self, *args, **options):
        User = get_user_model()
        users = []
        for username, first_name, last_name in PEOPLE:
            user, _ = User.objects.update_or_create(
                username=username,
                defaults={'email': f'{username}@example.com', 'first_name': first_name, 'last_name': last_name},
            )
            if not user.has_usable_password():
                user.set_unusable_password()
                user.save(update_fields=['password'])
            users.append(user)

        existing_organizer = User.objects.filter(is_superuser=True).first() or User.objects.exclude(username__in=[p[0] for p in PEOPLE]).first()
        organizer = existing_organizer or users[0]
        now = timezone.now().replace(minute=0, second=0, microsecond=0)
        guest_names = [('Priya Nair', 'priya.nair'), ('Aditya Bose', 'aditya.bose'), ('Ishita Das', 'ishita.das'), ('Rahul Verma', 'rahul.verma'), ('Zoya Patel', 'zoya.patel'), ('Dev Kapoor', 'dev.kapoor')]

        for index, (title, offset, hour, location, description) in enumerate(EVENTS):
            start = (now + timedelta(days=offset)).replace(hour=hour)
            event, _ = Event.objects.update_or_create(
                title=title,
                defaults={'description': description, 'location': location, 'start_time': start, 'end_time': start + timedelta(hours=3), 'organizer': organizer},
            )
            for user_index, user in enumerate(users):
                status = [RSVP.GOING, RSVP.GOING, RSVP.MAYBE, RSVP.NOT_GOING][(index + user_index) % 4]
                RSVP.objects.update_or_create(event=event, user=user, defaults={'status': status})
            for guest_index, (name, email_name) in enumerate(guest_names):
                status = [Guest.CONFIRMED, Guest.INVITED, Guest.CONFIRMED, Guest.DECLINED][(index + guest_index) % 4]
                Guest.objects.update_or_create(
                    event=event, email=f'{email_name}+event{index + 1}@example.com',
                    defaults={'name': name, 'status': status, 'notes': 'Demo guest for portfolio presentation'},
                )

        self.stdout.write(self.style.SUCCESS(
            f'Demo data ready: {len(EVENTS)} events, {len(users)} attendees, '
            f'{len(EVENTS) * len(users)} RSVPs, and {len(EVENTS) * len(guest_names)} guests.'
        ))
